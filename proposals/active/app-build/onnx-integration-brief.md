# Fasol Doctor — ONNX Model Integration Brief
**For: App developer**
**From: ML pipeline team**
**Date: 2026-09-12**

---

## What you have

The zip file (`fasol_doctor_demo.zip`) contains:

```
fasol_doctor_demo.zip
  fasol_doctor.onnx          ← the trained model (16 MB, FP32)
  classes.json               ← class label list, order matters
  test_samples/
    bacterial_leaf_blight/   ← 2 sample images per class for testing
    brown_spot/
    leaf_blast/
    tungro/
    healthy/
    not_rice_leaf/
```

**`classes.json`** contains exactly:
```json
["bacterial_leaf_blight", "brown_spot", "leaf_blast", "not_rice_leaf", "healthy", "tungro"]
```
> The order in this file is the ground truth for mapping model output indices to class names. Do not hardcode this order — always read it from `classes.json`. It can change between model versions.

---

## What the model does

This is a **6-class image classifier** for rice crop disease detection. Given a photo of a rice plant leaf, it returns a probability score for each of these 6 classes:

| Class | Meaning | Severity |
|---|---|---|
| `leaf_blast` | Leaf Blast fungal disease | High |
| `bacterial_leaf_blight` | Bacterial Leaf Blight | High |
| `brown_spot` | Brown Spot fungal disease | Medium |
| `tungro` | Tungro Virus (no cure) | Critical |
| `healthy` | No disease detected | None |
| `not_rice_leaf` | Photo is not a rice leaf | N/A |

The model was trained on 11,639 images (4 datasets including RiceLeafBD, which has 1,560 real Bangladeshi field photographs). Architecture: **MobileNetV3-Large** via the `timm` library, ONNX FP32 export.

Validation metrics on the held-out dataset: macro-F1 = **0.9916**, ECE = **0.0433**.

> ⚠️ These metrics are on public dataset distribution. Real-field performance will be assessed in Stage 2 once field photos from Bangladesh are collected and the model is fine-tuned. For now, treat this as a strong foundation, not a production-calibrated classifier.

---

## Model input spec (critical — must match exactly)

```
Input tensor name:  "image"
Input shape:        [1, 3, 224, 224]   (NCHW format: batch=1, channels=3, height=224, width=224)
Input dtype:        float32
Value range:        normalised — NOT raw 0-255 pixels

Preprocessing steps (in order):
  1. Resize image to 224 × 224 pixels
  2. Convert to RGB (drop alpha channel if present)
  3. Divide each pixel value by 255.0   → range [0.0, 1.0]
  4. Subtract ImageNet mean:  [0.485, 0.456, 0.406]  (per channel: R, G, B)
  5. Divide by ImageNet std:  [0.229, 0.224, 0.225]  (per channel: R, G, B)
  6. Transpose from HWC → CHW format   (height × width × channels → channels × height × width)
  7. Add batch dimension: shape becomes [1, 3, 224, 224]
```

**If you get the preprocessing wrong, the model will produce garbage output even with a perfect photo.** The mean/std values are standard ImageNet normalisation — do not change them.

---

## Model output spec

```
Output tensor name: "logits"
Output shape:       [1, 6]   (batch=1, 6 class scores)
Output dtype:       float32
Output values:      raw logits (NOT probabilities — apply softmax yourself)
```

To convert logits to probabilities:
```
softmax(x)[i] = exp(x[i]) / sum(exp(x[j]) for all j)
```

The index of the highest probability value maps to the predicted class via `classes.json`.

**Confidence threshold: 0.60**

If `max(probabilities) < 0.60`, the model is not confident enough to show a diagnosis. In this case, show the "unclear result" state and prompt the user to retake the photo with better lighting/framing. Do not show a disease name.

---

## How to run it in the web app (ONNX Runtime Web)

The app is **React 18 + Vite + TypeScript + Tailwind + Capacitor 6**. Inference runs entirely in the browser/WebView using ONNX Runtime Web (WebAssembly backend). No server call is needed for diagnosis — this is the core offline-first design.

### Step 1 — Install

```bash
npm install onnxruntime-web
```

### Step 2 — Place model files

Copy from the zip into the app's public directory so Vite serves them as static assets:

```
app/
  public/
    model/
      fasol_doctor.onnx      ← copy here
      classes.json           ← copy here
```

> Vite copies `public/` verbatim into the build output. Capacitor then bundles the full `dist/` into the APK. The model will be available at runtime as `/model/fasol_doctor.onnx` (relative to the web root).

### Step 3 — Write the inference module

Create `app/src/lib/inference.ts`:

```typescript
import * as ort from 'onnxruntime-web';

// ImageNet normalisation constants
const MEAN = [0.485, 0.456, 0.406];
const STD  = [0.229, 0.224, 0.225];

const CONFIDENCE_THRESHOLD = 0.60;

// Load once at app startup — not on every inference call
let session: ort.InferenceSession | null = null;
let classes: string[] = [];

export async function loadModel(): Promise<void> {
  // Load class labels first — order determines output mapping
  const classRes = await fetch('/model/classes.json');
  classes = await classRes.json();

  // Load the ONNX model
  session = await ort.InferenceSession.create('/model/fasol_doctor.onnx', {
    executionProviders: ['wasm'],   // WebAssembly — works offline, no GPU needed
    graphOptimizationLevel: 'all',
  });
}

export interface InferenceResult {
  topClass: string;          // e.g. "leaf_blast"
  confidence: number;        // 0.0–1.0
  allProbs: Record<string, number>;  // all 6 class probabilities
  isUnclear: boolean;        // true if confidence < threshold
}

export async function runInference(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<InferenceResult> {
  if (!session || classes.length === 0) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  // --- Preprocessing ---
  // 1. Draw image onto a 224×224 canvas
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageElement, 0, 0, 224, 224);

  // 2. Read raw pixel data (RGBA, 0–255, HWC layout)
  const imageData = ctx.getImageData(0, 0, 224, 224);
  const { data } = imageData;  // Uint8ClampedArray, length = 224 * 224 * 4

  // 3. Build Float32Array in CHW format with normalisation
  //    Shape: [1, 3, 224, 224]  → 1 * 3 * 224 * 224 = 150528 values
  const tensor = new Float32Array(3 * 224 * 224);
  const channelSize = 224 * 224;

  for (let i = 0; i < channelSize; i++) {
    const r = data[i * 4]     / 255.0;
    const g = data[i * 4 + 1] / 255.0;
    const b = data[i * 4 + 2] / 255.0;
    // Alpha (data[i * 4 + 3]) is ignored — model is RGB only

    tensor[0 * channelSize + i] = (r - MEAN[0]) / STD[0];  // R channel
    tensor[1 * channelSize + i] = (g - MEAN[1]) / STD[1];  // G channel
    tensor[2 * channelSize + i] = (b - MEAN[2]) / STD[2];  // B channel
  }

  // 4. Wrap in ONNX tensor — input name must be "image" (matches model's input node)
  const inputTensor = new ort.Tensor('float32', tensor, [1, 3, 224, 224]);

  // --- Run inference ---
  const outputs = await session.run({ image: inputTensor });

  // Output node is named "logits" — shape [1, 6]
  const logits = outputs['logits'].data as Float32Array;  // 6 raw scores

  // --- Postprocessing: softmax ---
  const maxLogit = Math.max(...Array.from(logits));       // numerical stability
  const exps = Array.from(logits).map(l => Math.exp(l - maxLogit));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(e => e / sumExp);

  // Build result object
  const allProbs: Record<string, number> = {};
  let topClass = classes[0];
  let topProb = probs[0];

  probs.forEach((prob, idx) => {
    allProbs[classes[idx]] = prob;
    if (prob > topProb) {
      topProb = prob;
      topClass = classes[idx];
    }
  });

  return {
    topClass,
    confidence: topProb,
    allProbs,
    isUnclear: topProb < CONFIDENCE_THRESHOLD,
  };
}
```

### Step 4 — Write the React hook

Create `app/src/hooks/useInference.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { loadModel, runInference, InferenceResult } from '../lib/inference';

type Status = 'idle' | 'loading-model' | 'ready' | 'running' | 'done' | 'error';

export function useInference() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load model once when the hook first mounts (app startup)
  useEffect(() => {
    setStatus('loading-model');
    loadModel()
      .then(() => setStatus('ready'))
      .catch(err => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  const analyse = useCallback(async (imageEl: HTMLImageElement | HTMLCanvasElement) => {
    if (status !== 'ready' && status !== 'done') return;
    setStatus('running');
    setResult(null);
    try {
      const r = await runInference(imageEl);
      setResult(r);
      setStatus('done');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, [status]);

  return { status, result, error, analyse };
}
```

### Step 5 — Call it from the camera flow

After the user captures or selects a photo, create an `<img>` element from the image data and pass it to `analyse()`.

Using **Capacitor Camera plugin**:

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useInference } from '../hooks/useInference';

function CaptureScreen() {
  const { status, result, analyse } = useInference();

  async function handleCapture() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,  // get base64 data URL
      source: CameraSource.Camera,
      quality: 90,
      width: 1024,               // capture at reasonable resolution
      height: 1024,
      correctOrientation: true,
    });

    // Load into an <img> element so runInference can draw it to canvas
    const img = new Image();
    img.src = photo.dataUrl!;
    img.onload = () => analyse(img);  // fire inference once loaded
  }

  // result.isUnclear → show "Unclear" state + ask to retake
  // result.topClass === 'not_rice_leaf' → show "not a rice leaf" message + retake
  // otherwise → pass result.allProbs to the candidates screen (S5)
}
```

---

## How inference connects to the screen flow

The app has a defined screen flow. Inference sits between the camera guide (CG) and the candidates screen (S5):

```
S4 (Symptom select)
    ↓ user taps symptom tile
CG (Camera guide — real-time quality prompts)
    ↓ user captures photo
F1r (Photo review — retake or use)
    ↓ user taps "use"
[inference runs here — show common.wait spinner]
    ↓ result
    ├── isUnclear → show "unclear" card + offer retake or "ask expert" escape
    ├── topClass === 'not_rice_leaf' → show "not a rice leaf" + return to CG
    └── confident result → route to S5 (candidates screen)
                               pass: top 2-3 classes sorted by probability
```

**S5 candidates screen** receives an array like:
```typescript
[
  { class: 'leaf_blast',            confidence: 0.84 },
  { class: 'bacterial_leaf_blight', confidence: 0.10 },
]
```
It shows each as a card the user can tap to confirm. S6 (confirmation gate) shows a reference photo and asks "does your plant look like this?" — that yes/no is the confirmation step, not a second inference.

---

## Performance expectations

| Device | Expected inference time |
|---|---|
| Samsung Galaxy A13 (2021, mid-range) | ~1.5–3 seconds |
| Samsung Galaxy A53 (2022) | ~0.8–1.5 seconds |
| High-end (Pixel 8, S24) | ~300–600 ms |

The model loads once at app startup. Subsequent calls reuse the same session. **Do not reload the model on every photo.**

If inference is slower than 3 seconds on target devices, consider:
1. Running `analyse()` in a Web Worker to keep the UI responsive
2. Reducing input resolution (but stay at 224×224 — changing this breaks accuracy)
3. Switching the ONNX model to a quantized INT8 version (4-6 MB, planned for Stage 2)

---

## Testing the integration

Use the `test_samples/` folder from the zip. For each class folder, load one image and verify that:

1. `result.topClass` matches the folder name
2. `result.confidence > 0.60` for all test images
3. `result.allProbs` sums to ~1.0

Quick Node.js smoke test (run before wiring into the UI):

```typescript
// test-inference.ts — run with: npx ts-node test-inference.ts
import { loadModel, runInference } from './app/src/lib/inference';
// Note: this won't run in Node directly due to DOM/canvas deps;
// use a browser-based test or jest with jsdom + canvas mock.
// Easier: open the app in dev mode and call window.testInference() from browser console.
```

The simplest integration test: load `test_samples/leaf_blast/` image in the app and confirm it returns `leaf_blast` with confidence > 0.60.

---

## Files to place, summary

```
From the zip:
  fasol_doctor.onnx   →   app/public/model/fasol_doctor.onnx
  classes.json        →   app/public/model/classes.json
  test_samples/       →   keep locally for testing, do not bundle in app

Create new:
  app/src/lib/inference.ts         (model loader + runInference function)
  app/src/hooks/useInference.ts    (React hook wrapping the above)
```

---

## What NOT to do

- **Do not call an external API for inference.** The whole point is offline-first. Every diagnosis must work with no network.
- **Do not change the preprocessing constants** (mean/std/input size). Changing them will silently break accuracy — the model was trained with exactly these values.
- **Do not hardcode class names.** Always read from `classes.json`. The order of classes can change between Stage 1 and Stage 2 model versions.
- **Do not load the model on every photo.** Load once at startup, reuse the session.
- **Do not skip the confidence threshold check.** Showing a wrong disease name at 45% confidence is worse than showing "unclear".

---

## Questions?

The ML pipeline and PRD are in:
- `software-projects/fasol-doctor/` — model scripts, training results
- `software-projects/fasol-doctor/raw/` — full product PRD (SoT v1.2)
- `software-projects/fasol-doctor/proposals/active/app-build/plan.md` — full app build plan

Stage 2 model (fine-tuned on real Bangladeshi field photos) will be a drop-in replacement: same input spec, same output spec, same `classes.json` format. When it is ready, you replace the `.onnx` file and rebuild — no code changes needed.
