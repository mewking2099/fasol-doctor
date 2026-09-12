import * as ort from 'onnxruntime-web'
import type { DiseaseClass, InferenceResult } from '../types'

const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]
const CONFIDENCE_THRESHOLD = 0.60
const INPUT_SIZE = 224

// Single-threaded WASM — no SharedArrayBuffer needed, works without COEP
ort.env.wasm.numThreads = 1

let session: ort.InferenceSession | null = null
let classes: DiseaseClass[] = []

export async function loadModel(): Promise<void> {
  const res = await fetch('/model/classes.json')
  classes = await res.json()

  session = await ort.InferenceSession.create('/model/fasol_doctor.onnx', {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  })
}

export async function runInference(
  source: HTMLImageElement | HTMLCanvasElement | ImageData,
): Promise<InferenceResult> {
  if (!session || classes.length === 0) throw new Error('Model not loaded')

  const canvas = document.createElement('canvas')
  canvas.width = INPUT_SIZE
  canvas.height = INPUT_SIZE
  const ctx = canvas.getContext('2d')!

  if (source instanceof ImageData) {
    ctx.putImageData(source, 0, 0)
  } else {
    ctx.drawImage(source, 0, 0, INPUT_SIZE, INPUT_SIZE)
  }

  const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE)
  const channelSize = INPUT_SIZE * INPUT_SIZE
  const tensor = new Float32Array(3 * channelSize)

  for (let i = 0; i < channelSize; i++) {
    tensor[0 * channelSize + i] = (data[i * 4] / 255 - MEAN[0]) / STD[0]
    tensor[1 * channelSize + i] = (data[i * 4 + 1] / 255 - MEAN[1]) / STD[1]
    tensor[2 * channelSize + i] = (data[i * 4 + 2] / 255 - MEAN[2]) / STD[2]
  }

  const input = new ort.Tensor('float32', tensor, [1, 3, INPUT_SIZE, INPUT_SIZE])
  const outputs = await session.run({ image: input })
  const logits = outputs['logits'].data as Float32Array

  const maxLogit = Math.max(...Array.from(logits))
  const exps = Array.from(logits).map(l => Math.exp(l - maxLogit))
  const sum = exps.reduce((a, b) => a + b, 0)
  const probs = exps.map(e => e / sum)

  let topIdx = 0
  probs.forEach((p, i) => { if (p > probs[topIdx]) topIdx = i })

  const allProbs = Object.fromEntries(
    classes.map((cls, i) => [cls, probs[i]])
  ) as Record<DiseaseClass, number>

  return {
    topClass: classes[topIdx],
    confidence: probs[topIdx],
    allProbs,
    isUnclear: probs[topIdx] < CONFIDENCE_THRESHOLD,
  }
}
