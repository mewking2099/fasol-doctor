export interface ScanRecord {
  id: string
  thumbnail: string
  disease: string | null
  timestamp: number
}

const KEY = 'fasol_scans'
const MAX = 50

export function getScans(): ScanRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveScan(record: Omit<ScanRecord, 'id'>): void {
  const all = getScans()
  all.unshift({ ...record, id: `scan_${Date.now()}` })
  if (all.length > MAX) all.length = MAX
  localStorage.setItem(KEY, JSON.stringify(all))
}

export async function makeThumbnail(src: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const S = 240
      const canvas = document.createElement('canvas')
      canvas.width = S
      canvas.height = S
      const ctx = canvas.getContext('2d')!
      const scale = Math.max(S / img.naturalWidth, S / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => resolve('')
    img.src = src
  })
}
