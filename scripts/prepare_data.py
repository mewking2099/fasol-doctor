"""
Prepare train/val/test splits for Fasol Doctor.

Stage 1: public datasets only
Stage 2: public datasets + field photos (lower ratio of field photos to avoid overfitting)

Usage:
    python scripts/prepare_data.py \
        --datasets raw_datasets/riceleafbd raw_datasets/sethy raw_datasets/riceyleaf \
        --out data/

    # With field photos (Stage 2):
    python scripts/prepare_data.py \
        --datasets raw_datasets/riceleafbd raw_datasets/sethy raw_datasets/riceyleaf \
        --out data/ \
        --field /path/to/field_photos

Class name normalisation map — each dataset uses different folder names for the same disease.
"""

import argparse
import hashlib
import shutil
import random
from pathlib import Path
from collections import defaultdict

# Canonical class names used throughout the pipeline
CLASSES = [
    "bacterial_leaf_blight",
    "brown_spot",
    "leaf_blast",
    "tungro",
    "healthy",
    "not_rice_leaf",
]

# Maps folder names found in source datasets → canonical class name.
# Extend this when adding new datasets.
NAME_MAP = {
    # bacterial_leaf_blight
    "bacterial_leaf_blight": "bacterial_leaf_blight",
    "bacterialblight": "bacterial_leaf_blight",
    "bacterial blight": "bacterial_leaf_blight",
    "bacterial_blight": "bacterial_leaf_blight",
    "bb": "bacterial_leaf_blight",
    # brown_spot
    "brown_spot": "brown_spot",
    "brownspot": "brown_spot",
    "brown spot": "brown_spot",
    "bs": "brown_spot",
    # leaf_blast
    "leaf_blast": "leaf_blast",
    "leafblast": "leaf_blast",
    "blast": "leaf_blast",
    "rice_blast": "leaf_blast",
    "neck blast": "leaf_blast",
    # tungro
    "tungro": "tungro",
    "rice_tungro": "tungro",
    # healthy
    "healthy": "healthy",
    "normal": "healthy",
    "none": "healthy",
    # not_rice_leaf
    "not_rice_leaf": "not_rice_leaf",
    "other": "not_rice_leaf",
    "background": "not_rice_leaf",
}

VALID_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

SPLIT_RATIOS = (0.70, 0.15, 0.15)  # train / val / test


def file_md5(path: Path) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def collect_images(root: Path) -> dict[str, list[Path]]:
    """Walk a dataset root, map folder names → canonical class, return {class: [paths]}."""
    by_class: dict[str, list[Path]] = defaultdict(list)
    for item in root.rglob("*"):
        if item.suffix.lower() not in VALID_EXTS:
            continue
        folder = item.parent.name.lower().strip()
        canonical = NAME_MAP.get(folder)
        if canonical is None:
            # Try partial match
            for key, val in NAME_MAP.items():
                if key in folder or folder in key:
                    canonical = val
                    break
        if canonical is None:
            print(f"  [SKIP] Unknown class folder '{item.parent.name}' in {root.name}")
            continue
        by_class[canonical].append(item)
    return by_class


def deduplicate(images: list[Path]) -> list[Path]:
    seen: set[str] = set()
    unique: list[Path] = []
    for p in images:
        h = file_md5(p)
        if h not in seen:
            seen.add(h)
            unique.append(p)
    return unique


def split(images: list[Path], seed: int = 42) -> tuple[list[Path], list[Path], list[Path]]:
    rng = random.Random(seed)
    imgs = images[:]
    rng.shuffle(imgs)
    n = len(imgs)
    n_train = int(n * SPLIT_RATIOS[0])
    n_val = int(n * SPLIT_RATIOS[1])
    return imgs[:n_train], imgs[n_train:n_train + n_val], imgs[n_train + n_val:]


def copy_split(images: list[Path], dest: Path, class_name: str):
    dest_cls = dest / class_name
    dest_cls.mkdir(parents=True, exist_ok=True)
    for i, src in enumerate(images):
        dst = dest_cls / f"{i:05d}{src.suffix.lower()}"
        shutil.copy2(src, dst)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--datasets", nargs="+", required=True,
                        help="Paths to raw dataset directories")
    parser.add_argument("--out", required=True,
                        help="Output directory (will contain stage1/ or stage2/)")
    parser.add_argument("--field", default=None,
                        help="Path to field photos directory (triggers Stage 2 mode)")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    stage = "stage2" if args.field else "stage1"
    out_root = Path(args.out) / stage
    print(f"\nBuilding {stage} split → {out_root}")

    # Collect from public datasets
    all_by_class: dict[str, list[Path]] = defaultdict(list)
    for ds_path in args.datasets:
        root = Path(ds_path)
        if not root.exists():
            print(f"[WARN] Dataset path not found: {root} — skipping")
            continue
        print(f"\nScanning {root.name} …")
        by_class = collect_images(root)
        for cls, paths in by_class.items():
            all_by_class[cls].extend(paths)

    # Add field photos if provided (Stage 2)
    if args.field:
        field_root = Path(args.field)
        print(f"\nScanning field photos: {field_root} …")
        field_by_class = collect_images(field_root)
        for cls, paths in field_by_class.items():
            all_by_class[cls].extend(paths)

    print("\n--- Deduplication ---")
    for split_name in ("train", "val", "test"):
        (out_root / split_name).mkdir(parents=True, exist_ok=True)

    total_before = 0
    total_after = 0
    for cls in CLASSES:
        images = all_by_class.get(cls, [])
        before = len(images)
        images = deduplicate(images)
        after = len(images)
        total_before += before
        total_after += after
        print(f"  {cls}: {before} → {after} unique")

        train_imgs, val_imgs, test_imgs = split(images, seed=args.seed)
        copy_split(train_imgs, out_root / "train", cls)
        copy_split(val_imgs, out_root / "val", cls)
        copy_split(test_imgs, out_root / "test", cls)

    print(f"\nTotal: {total_before} raw → {total_after} unique")
    print(f"Output: {out_root}/{{train,val,test}}/<class>/")

    # Write classes.json alongside splits
    import json
    classes_file = out_root / "classes.json"
    with open(classes_file, "w") as f:
        json.dump(CLASSES, f, indent=2)
    print(f"classes.json written to {classes_file}")

    print(f"\n{stage} ready. Next:")
    print(f"  python scripts/train.py --data {out_root} --out runs/{stage} \\")
    print(f"    --model mobilenetv3_large_100 --epochs 12 --lr 1e-3")


if __name__ == "__main__":
    main()
