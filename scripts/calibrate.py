"""
Temperature scaling calibration for Fasol Doctor.

Run when ECE > 0.10 on the validation set after training.
Learns a single scalar T that divides logits before softmax,
making confidence scores more trustworthy — critical for the
escalation feature (low-confidence predictions → human review).

Usage:
    python scripts/calibrate.py \
        --checkpoint runs/stage2/best.pt \
        --data data/stage2/val

Writes the calibrated model to the same directory as the checkpoint:
    runs/stage2/best_calibrated.pt
    runs/stage2/fasol_doctor.onnx  (re-exported with calibration baked in)
"""

import argparse
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

try:
    import timm
except ImportError:
    raise SystemExit("timm not installed")


IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def val_transforms():
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])


def compute_ece(logits: np.ndarray, labels: np.ndarray, n_bins: int = 15) -> float:
    probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
    confidences = probs.max(axis=1)
    predictions = probs.argmax(axis=1)
    correct = (predictions == labels)
    bins = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    for lo, hi in zip(bins[:-1], bins[1:]):
        mask = (confidences >= lo) & (confidences < hi)
        if mask.sum() == 0:
            continue
        ece += mask.sum() * abs(correct[mask].mean() - confidences[mask].mean())
    return float(ece / len(labels))


class TemperatureScaler(nn.Module):
    """Wraps a trained model and divides logits by a learnable T."""

    def __init__(self, model: nn.Module):
        super().__init__()
        self.model = model
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)

    def forward(self, x):
        return self.model(x) / self.temperature

    def calibrate(self, val_loader, device, max_iter: int = 50):
        self.model.eval()
        nll_criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.LBFGS([self.temperature], lr=0.01, max_iter=max_iter)

        # Collect all logits from the base model first (no grad needed)
        all_logits, all_labels = [], []
        with torch.no_grad():
            for imgs, labels in val_loader:
                all_logits.append(self.model(imgs.to(device)).cpu())
                all_labels.append(labels)
        all_logits = torch.cat(all_logits).to(device)
        all_labels = torch.cat(all_labels).to(device)

        def closure():
            optimizer.zero_grad()
            loss = nll_criterion(all_logits / self.temperature, all_labels)
            loss.backward()
            return loss

        optimizer.step(closure)
        return self.temperature.item()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--data", required=True, help="Path to val split")
    args = parser.parse_args()

    ckpt_path = Path(args.checkpoint)
    out_dir = ckpt_path.parent

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load checkpoint
    ckpt = torch.load(ckpt_path, map_location="cpu")
    model_name = ckpt["args"]["model"]
    classes = ckpt["classes"]
    print(f"Model: {model_name} | Classes: {classes}")

    model = timm.create_model(model_name, pretrained=False, num_classes=len(classes))
    model.load_state_dict(ckpt["model_state"])
    model = model.to(device)

    # Val loader
    val_ds = datasets.ImageFolder(args.data, transform=val_transforms())
    val_loader = DataLoader(val_ds, batch_size=64, shuffle=False, num_workers=4)

    # Pre-calibration ECE
    model.eval()
    all_logits, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in val_loader:
            all_logits.append(model(imgs.to(device)).cpu().numpy())
            all_labels.append(labels.numpy())
    logits_np = np.concatenate(all_logits)
    labels_np = np.concatenate(all_labels)
    ece_before = compute_ece(logits_np, labels_np)
    print(f"\nECE before calibration: {ece_before:.4f}")

    # Calibrate
    scaler = TemperatureScaler(model).to(device)
    T = scaler.calibrate(val_loader, device)
    print(f"Optimal temperature:    {T:.4f}")

    # Post-calibration ECE
    calibrated_logits = logits_np / T
    ece_after = compute_ece(calibrated_logits, labels_np)
    print(f"ECE after calibration:  {ece_after:.4f}", end="")
    if ece_after < 0.10:
        print("  ← OK")
    else:
        print("  ← still above 0.10; check class distributions")

    # Save calibrated checkpoint
    cal_ckpt_path = out_dir / "best_calibrated.pt"
    torch.save({
        **ckpt,
        "temperature": T,
        "ece_before": ece_before,
        "ece_after": ece_after,
    }, cal_ckpt_path)
    print(f"\nCalibrated checkpoint: {cal_ckpt_path}")

    # Re-export ONNX with temperature baked in
    try:
        import onnx
        import onnxruntime

        scaler.eval()
        dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
        onnx_path = out_dir / "fasol_doctor.onnx"
        torch.onnx.export(
            scaler,
            dummy,
            str(onnx_path),
            input_names=["image"],
            output_names=["logits"],
            dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
            opset_version=17,
        )
        print(f"ONNX re-exported:      {onnx_path}")
        print(f"Size: {onnx_path.stat().st_size / 1e6:.2f} MB")
    except ImportError:
        print("[WARN] onnx/onnxruntime not installed — ONNX not re-exported")


if __name__ == "__main__":
    main()
