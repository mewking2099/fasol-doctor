"""
Two-stage fine-tuner for Fasol Doctor.

Stage 1: train from ImageNet pretrained weights on public rice disease datasets.
Stage 2: fine-tune from Stage 1 checkpoint on field photos + public datasets.

Best checkpoint is selected by macro-F1 on the validation set (not top-1 accuracy),
because class imbalance makes accuracy an unreliable signal.

After training, ECE is reported. If ECE > 0.10, run calibrate.py.
On Stage 2 completion, the model is exported to ONNX automatically.
"""

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms

try:
    import timm
except ImportError:
    raise SystemExit("timm not installed — pip install timm")

try:
    from sklearn.metrics import f1_score
except ImportError:
    raise SystemExit("scikit-learn not installed — pip install scikit-learn")


# ── Constants ────────────────────────────────────────────────────────────────

IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
NUM_CLASSES = 6


# ── Transforms ───────────────────────────────────────────────────────────────

def train_transforms():
    return transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.RandomRotation(20),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])


def val_transforms():
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])


# ── Dataset helpers ───────────────────────────────────────────────────────────

def make_loader(split_dir: Path, batch_size: int, is_train: bool) -> DataLoader:
    tf = train_transforms() if is_train else val_transforms()
    ds = datasets.ImageFolder(str(split_dir), transform=tf)

    if is_train:
        # WeightedRandomSampler so every class gets equal expected draw per epoch
        class_counts = np.bincount([label for _, label in ds.samples])
        weights = 1.0 / class_counts[np.array([label for _, label in ds.samples])]
        sampler = WeightedRandomSampler(weights, num_samples=len(weights), replacement=True)
        return DataLoader(ds, batch_size=batch_size, sampler=sampler,
                          num_workers=4, pin_memory=True)
    else:
        return DataLoader(ds, batch_size=batch_size, shuffle=False,
                          num_workers=4, pin_memory=True)


# ── ECE ───────────────────────────────────────────────────────────────────────

def compute_ece(logits: np.ndarray, labels: np.ndarray, n_bins: int = 15) -> float:
    """Expected Calibration Error — target < 0.10."""
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
        bin_conf = confidences[mask].mean()
        bin_acc = correct[mask].mean()
        ece += mask.sum() * abs(bin_acc - bin_conf)
    return float(ece / len(labels))


# ── Validation pass ───────────────────────────────────────────────────────────

def validate(model, loader, device):
    model.eval()
    all_logits, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in loader:
            imgs = imgs.to(device)
            logits = model(imgs).cpu()
            all_logits.append(logits.numpy())
            all_labels.append(labels.numpy())
    logits = np.concatenate(all_logits)
    labels = np.concatenate(all_labels)
    preds = logits.argmax(axis=1)
    macro_f1 = f1_score(labels, preds, average="macro", zero_division=0)
    ece = compute_ece(logits, labels)
    return macro_f1, ece, logits, labels


# ── ONNX export ───────────────────────────────────────────────────────────────

def export_onnx(model, out_dir: Path, classes: list[str]):
    try:
        import onnx
        import onnxruntime
    except ImportError:
        print("[WARN] onnx/onnxruntime not installed — skipping ONNX export")
        return

    model.eval()
    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    onnx_path = out_dir / "fasol_doctor.onnx"

    torch.onnx.export(
        model,
        dummy,
        str(onnx_path),
        input_names=["image"],
        output_names=["logits"],
        dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )

    # Verify round-trip
    sess = onnxruntime.InferenceSession(str(onnx_path))
    out = sess.run(["logits"], {"image": dummy.numpy()})
    print(f"[OK] ONNX export verified — output shape: {list(out[0].shape)}")
    print(f"     Saved: {onnx_path}")
    print(f"     Size:  {onnx_path.stat().st_size / 1e6:.2f} MB")

    # Save classes.json alongside
    classes_path = out_dir / "classes.json"
    with open(classes_path, "w") as f:
        json.dump(classes, f, indent=2)
    print(f"     classes.json: {classes_path}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to data split (contains train/ val/ test/)")
    parser.add_argument("--out", required=True, help="Run output directory")
    parser.add_argument("--model", default="mobilenetv3_large_100",
                        choices=["mobilenetv3_large_100", "efficientnet_b0"])
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--batch", type=int, default=64)
    parser.add_argument("--init", default=None,
                        help="Checkpoint to fine-tune from (Stage 2)")
    parser.add_argument("--export-onnx", action="store_true",
                        help="Export ONNX after training (auto-set for stage2)")
    args = parser.parse_args()

    data_root = Path(args.data)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nDevice: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    # ── Data ──────────────────────────────────────────────────────────────────
    train_loader = make_loader(data_root / "train", args.batch, is_train=True)
    val_loader = make_loader(data_root / "val", args.batch, is_train=False)

    classes = train_loader.dataset.classes
    print(f"Classes ({len(classes)}): {classes}")
    class_counts = np.bincount([label for _, label in train_loader.dataset.samples])
    for cls, cnt in zip(classes, class_counts):
        print(f"  {cls}: {cnt}")

    # ── Model ─────────────────────────────────────────────────────────────────
    pretrained = (args.init is None)  # ImageNet pretrained for Stage 1; load checkpoint for Stage 2
    model = timm.create_model(args.model, pretrained=pretrained, num_classes=NUM_CLASSES)

    if args.init:
        ckpt = torch.load(args.init, map_location="cpu")
        model.load_state_dict(ckpt["model_state"])
        print(f"Loaded checkpoint: {args.init}")

    model = model.to(device)

    # ── Optimizer + scheduler ─────────────────────────────────────────────────
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    loss_fn = nn.CrossEntropyLoss(label_smoothing=0.05)

    # ── Training loop ─────────────────────────────────────────────────────────
    best_f1 = 0.0
    best_epoch = 0

    print(f"\nTraining {args.model} for {args.epochs} epochs …\n")
    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        t0 = time.time()

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(imgs)
            loss = loss_fn(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        scheduler.step()
        train_loss = running_loss / len(train_loader)

        macro_f1, ece, _, _ = validate(model, val_loader, device)
        elapsed = time.time() - t0

        marker = " ← best" if macro_f1 > best_f1 else ""
        print(f"Epoch {epoch:02d}/{args.epochs} | loss {train_loss:.4f} | "
              f"val F1 {macro_f1:.4f} | ECE {ece:.4f} | {elapsed:.0f}s{marker}")

        if macro_f1 > best_f1:
            best_f1 = macro_f1
            best_epoch = epoch
            torch.save({
                "epoch": epoch,
                "model_state": model.state_dict(),
                "macro_f1": macro_f1,
                "ece": ece,
                "classes": classes,
                "args": vars(args),
            }, out_dir / "best.pt")

    print(f"\nBest: epoch {best_epoch}, macro-F1 {best_f1:.4f}")

    # ── Final eval on val with best checkpoint ────────────────────────────────
    ckpt = torch.load(out_dir / "best.pt", map_location=device)
    model.load_state_dict(ckpt["model_state"])
    macro_f1, ece, logits, labels = validate(model, val_loader, device)

    print(f"\nFinal val macro-F1: {macro_f1:.4f}")
    print(f"Final val ECE:      {ece:.4f}", end="")
    if ece > 0.10:
        print("  ← ABOVE THRESHOLD. Run: python scripts/calibrate.py "
              f"--checkpoint {out_dir}/best.pt --data {data_root}/val")
    else:
        print("  ← calibration OK")

    # ── ONNX export (Stage 2 auto, or explicit flag) ───────────────────────────
    is_stage2 = "stage2" in str(args.data) or args.init is not None
    if is_stage2 or args.export_onnx:
        print("\nExporting ONNX …")
        export_onnx(model, out_dir, list(classes))

    print(f"\nRun artifacts saved to: {out_dir}/")


if __name__ == "__main__":
    main()
