"""
INT8 quantisation of fasol_doctor.onnx using ONNX Runtime.
Reduces model from ~16 MB to ~4 MB with minimal accuracy loss.
Runs on CPU — no GPU needed.

Usage:
    python scripts/quantise.py \
        --model runs/stage1/fasol_doctor.onnx \
        --data data/stage1/val \
        --out runs/stage1/fasol_doctor_int8.onnx
"""

import argparse
import os
from pathlib import Path

import numpy as np


def load_calibration_data(val_dir: Path, n_samples: int = 200):
    """Load a sample of val images as numpy arrays for calibration."""
    try:
        from PIL import Image
    except ImportError:
        raise SystemExit("pillow not installed — pip install pillow")

    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    images = []
    exts = {'.jpg', '.jpeg', '.png', '.webp'}

    all_files = []
    for cls_dir in val_dir.iterdir():
        if not cls_dir.is_dir():
            continue
        all_files.extend([f for f in cls_dir.iterdir() if f.suffix.lower() in exts])

    rng = np.random.default_rng(42)
    rng.shuffle(all_files)
    selected = all_files[:n_samples]

    for path in selected:
        img = Image.open(path).convert('RGB').resize((224, 224))
        arr = np.array(img, dtype=np.float32) / 255.0
        arr = (arr - mean) / std
        arr = arr.transpose(2, 0, 1)          # HWC → CHW
        images.append(arr[np.newaxis, ...])   # add batch dim

    print(f"Calibration samples: {len(images)}")
    return images


def quantise(model_path: Path, val_dir: Path, out_path: Path):
    try:
        from onnxruntime.quantization import (
            quantize_static,
            CalibrationDataReader,
            QuantFormat,
            QuantType,
        )
    except ImportError:
        raise SystemExit(
            "onnxruntime-tools not installed — pip install onnxruntime"
        )

    class ImageCalibrationReader(CalibrationDataReader):
        def __init__(self, images):
            self.images = images
            self.idx = 0

        def get_next(self):
            if self.idx >= len(self.images):
                return None
            batch = self.images[self.idx]
            self.idx += 1
            return {"image": batch}

        def rewind(self):
            self.idx = 0

    out_path.parent.mkdir(parents=True, exist_ok=True)

    # onnxruntime quantize_static needs a preprocessed model path
    # Use the original model path directly
    print(f"Input:  {model_path}  ({model_path.stat().st_size / 1e6:.1f} MB)")

    images = load_calibration_data(val_dir)
    reader = ImageCalibrationReader(images)

    quantize_static(
        model_input=str(model_path),
        model_output=str(out_path),
        calibration_data_reader=reader,
        quant_format=QuantFormat.QDQ,
        per_channel=False,
        weight_type=QuantType.QInt8,
        activation_type=QuantType.QInt8,
    )

    in_mb  = model_path.stat().st_size / 1e6
    out_mb = out_path.stat().st_size / 1e6
    print(f"Output: {out_path}  ({out_mb:.1f} MB)")
    print(f"Reduction: {in_mb:.1f} MB → {out_mb:.1f} MB  ({(1 - out_mb/in_mb)*100:.0f}% smaller)")

    # Quick accuracy check — compare top-1 predictions on calibration images
    import onnxruntime as ort
    sess_fp32 = ort.InferenceSession(str(model_path))
    sess_int8 = ort.InferenceSession(str(out_path))

    match = 0
    for img in images:
        pred_fp32 = sess_fp32.run(["logits"], {"image": img})[0].argmax()
        pred_int8 = sess_int8.run(["logits"], {"image": img})[0].argmax()
        if pred_fp32 == pred_int8:
            match += 1

    agreement = match / len(images) * 100
    print(f"FP32 vs INT8 top-1 agreement: {agreement:.1f}%  (should be >95%)")
    if agreement < 95:
        print("WARNING: agreement below 95% — check calibration data quality")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="runs/stage1/fasol_doctor.onnx")
    parser.add_argument("--data",  default="data/stage1/val",
                        help="Val split directory for calibration")
    parser.add_argument("--out",   default="runs/stage1/fasol_doctor_int8.onnx")
    args = parser.parse_args()

    model_path = Path(args.model)
    val_dir    = Path(args.data)
    out_path   = Path(args.out)

    if not model_path.exists():
        raise SystemExit(f"Model not found: {model_path}")

    print("\nFasol Doctor — INT8 Quantisation")
    print("=" * 40)
    quantise(model_path, val_dir, out_path)
    print("\nDone. Hand over fasol_doctor_int8.onnx to the Android developer.")
    print("Preprocessing stays the same: size=224, mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]")


if __name__ == "__main__":
    main()
