# Fasol Doctor — ML Model Pipeline

## Key files for active work

- `scripts/train.py` — main training script (two-stage fine-tuning)
- `scripts/prepare_data.py` — deduplication + train/val/test split
- `scripts/verify_gpu.py` — RTX 5070 / CUDA 12.8 environment check (run first)
- `scripts/calibrate.py` — temperature scaling when ECE > 0.10
- `scripts/download_datasets.py` — Kaggle API commands + Mendeley links
- `raw/fasol-doctor-training-guide.md` — canonical training decisions

## Training commands (in order)

```bash
# 1. Verify environment
python scripts/verify_gpu.py

# 2. Prepare data (public datasets)
python scripts/prepare_data.py \
  --datasets raw_datasets/riceleafbd raw_datasets/sethy raw_datasets/riceyleaf \
  --out data/

# 3. Stage 1 — learn diseases from public data
python scripts/train.py \
  --data data/stage1 --out runs/stage1 \
  --model mobilenetv3_large_100 --epochs 12 --lr 1e-3

# 4. (Optional comparison) EfficientNet-B0
python scripts/train.py \
  --data data/stage1 --out runs/stage1_eff \
  --model efficientnet_b0 --epochs 12 --lr 1e-3

# 5. Stage 2 — fine-tune on field photos (once collected)
python scripts/prepare_data.py \
  --datasets raw_datasets/riceleafbd raw_datasets/sethy raw_datasets/riceyleaf \
  --out data/ --field /path/to/field_photos
python scripts/train.py \
  --data data/stage2 --out runs/stage2 \
  --model mobilenetv3_large_100 --epochs 10 --lr 3e-4 \
  --init runs/stage1/best.pt

# 6. Calibrate if ECE > 0.10
python scripts/calibrate.py \
  --checkpoint runs/stage2/best.pt --data data/stage2/val
```

## Handover spec (for mobile developer)

Hand over exactly:
1. `runs/stage2/fasol_doctor.onnx`
2. `runs/stage2/classes.json`
3. Preprocessing: `size=224, mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]`
4. Run the same 10 test images through Python and through the app. Numbers must match to 2 decimal places before trusting anything the app reports.

## Critical rules

- Never compare results against published papers — those are lab photos. Compare only against our own field test set.
- BRRI licence pending — do not include in any commercial handover until cleared.
- not_rice_leaf class is not optional. Without it the model confidently diagnoses a photo of a goat.
- ECE > 0.10 means the escalation feature does not work. Run calibrate.py.
- App preprocessing must match training preprocessing exactly — the #1 integration failure mode.
