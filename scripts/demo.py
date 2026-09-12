"""
Fasol Doctor — inference demo.
Run on any rice leaf image to get a disease prediction.

Usage:
    python scripts/demo.py path/to/image.jpg
    python scripts/demo.py path/to/folder/          # runs on all images in folder
    python scripts/demo.py                           # uses sample images from runs/stage1/test_samples/
"""

import sys
import json
from pathlib import Path

import numpy as np

try:
    from PIL import Image
except ImportError:
    raise SystemExit("pip install pillow")

try:
    import onnxruntime as ort
except ImportError:
    raise SystemExit("pip install onnxruntime")

MODEL_PATH   = Path("runs/stage1/fasol_doctor.onnx")
CLASSES_PATH = Path("runs/stage1/classes.json")

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

CONFIDENCE_THRESHOLD = 0.60   # below this → "unclear, consult an expert"

DISEASE_ADVICE = {
    "bacterial_leaf_blight": "Bacterial Leaf Blight detected. Apply copper-based bactericide. Remove infected leaves.",
    "brown_spot":            "Brown Spot detected. Improve soil nutrition (potassium). Apply mancozeb fungicide.",
    "leaf_blast":            "Leaf Blast detected. Apply tricyclazole fungicide immediately. Avoid excess nitrogen.",
    "tungro":                "Tungro Virus detected. No cure — remove infected plants to prevent spread. Control leafhopper vectors.",
    "healthy":               "Leaf appears healthy. No action needed.",
    "not_rice_leaf":         "This does not appear to be a rice leaf. Please photograph a rice plant leaf.",
}


def preprocess(image_path: Path) -> np.ndarray:
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)[np.newaxis]   # CHW → NCHW
    return arr


def predict(session, classes, image_path: Path) -> dict:
    arr    = preprocess(image_path)
    logits = session.run(["logits"], {"image": arr})[0][0]
    probs  = np.exp(logits) / np.exp(logits).sum()   # softmax
    top_idx  = int(probs.argmax())
    top_prob = float(probs[top_idx])

    return {
        "file":       image_path.name,
        "prediction": classes[top_idx] if top_prob >= CONFIDENCE_THRESHOLD else "unclear",
        "confidence": top_prob,
        "class":      classes[top_idx],
        "probs":      {c: float(p) for c, p in zip(classes, probs)},
    }


def format_result(result: dict) -> str:
    lines = [
        f"\n{'─'*50}",
        f"  File:       {result['file']}",
        f"  Prediction: {result['prediction'].upper()}",
        f"  Confidence: {result['confidence']*100:.1f}%",
    ]
    if result["prediction"] != "unclear":
        lines.append(f"  Advice:     {DISEASE_ADVICE.get(result['class'], '')}")
    else:
        lines.append( "  Advice:     Confidence too low. Try a clearer photo of the leaf.")
    lines.append(f"\n  All class probabilities:")
    for cls, prob in sorted(result["probs"].items(), key=lambda x: -x[1]):
        bar = "█" * int(prob * 30)
        lines.append(f"    {cls:30s} {prob*100:5.1f}%  {bar}")
    return "\n".join(lines)


def main():
    if not MODEL_PATH.exists():
        raise SystemExit(f"Model not found: {MODEL_PATH}\nRun from the fasol-doctor project root.")
    if not CLASSES_PATH.exists():
        raise SystemExit(f"classes.json not found: {CLASSES_PATH}")

    with open(CLASSES_PATH) as f:
        classes = json.load(f)

    session = ort.InferenceSession(str(MODEL_PATH))
    print(f"Model loaded: {MODEL_PATH}  ({MODEL_PATH.stat().st_size/1e6:.1f} MB)")
    print(f"Classes: {classes}")

    # Collect target images
    targets = []
    if len(sys.argv) > 1:
        p = Path(sys.argv[1])
        if p.is_dir():
            exts = {".jpg", ".jpeg", ".png", ".webp"}
            targets = [f for f in p.rglob("*") if f.suffix.lower() in exts]
        elif p.is_file():
            targets = [p]
        else:
            raise SystemExit(f"Not found: {p}")
    else:
        # Look for any images in the project
        sample_dirs = [
            Path("runs/stage1/test_samples"),
            Path("data/stage1/val"),
        ]
        exts = {".jpg", ".jpeg", ".png", ".webp"}
        for d in sample_dirs:
            if d.exists():
                all_imgs = list(d.rglob("*"))
                all_imgs = [f for f in all_imgs if f.suffix.lower() in exts]
                if all_imgs:
                    # Pick 2 from each class
                    from collections import defaultdict
                    by_class = defaultdict(list)
                    for img in all_imgs:
                        by_class[img.parent.name].append(img)
                    for cls_imgs in by_class.values():
                        targets.extend(cls_imgs[:2])
                    break

    if not targets:
        print("\nNo images found.")
        print("Usage: python scripts/demo.py path/to/image.jpg")
        print("       python scripts/demo.py path/to/folder/")
        return

    print(f"\nRunning inference on {len(targets)} image(s)...\n")
    for img_path in sorted(targets)[:20]:   # cap at 20
        try:
            result = predict(session, classes, img_path)
            print(format_result(result))
        except Exception as e:
            print(f"  ERROR on {img_path.name}: {e}")


if __name__ == "__main__":
    main()
