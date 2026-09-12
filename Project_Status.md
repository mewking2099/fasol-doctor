---
project: fasol-doctor
started: 2026-09-12
status: active
stack: python + pytorch + timm + onnx
tier: stalk
current_phase: "Phase 1 — Dataset acquisition + Stage 1 training"
plan_approved: true
output: "fasol_doctor.onnx (~4-6 MB quantised, on-device Android inference)"
classes:
  - bacterial_leaf_blight
  - brown_spot
  - leaf_blast
  - tungro
  - healthy
  - not_rice_leaf
architecture: "MobileNetV3-Large (primary), EfficientNet-B0 (comparison)"
target_accuracy: "75–88% top-1 on real field photographs"
collaborators:
  - "mohabbat — ML pipeline"
  - "mobile developer — Android app (separate repo, receives ONNX handover)"
datasets:
  approved:
    - "RiceLeafBD — 1,555 real Bangladeshi field images (verify licence on Mendeley)"
    - "Sethy et al. — 5,932 images, CC BY 4.0"
    - "RiceyLeafDisease — 1,701 originals (skip pre-augmented copies), CC BY 4.0"
  pending_licence_check:
    - "BRRI dataset — expert-annotated, BRRI-sourced; verify licence before production"
  still_needed:
    - "not_rice_leaf class — 300–500 miscellaneous non-rice-leaf images"
    - "Field photos for Stage 2 — 150–300 per class, agronomist-verified (3–6 weeks)"
next_action: "Download datasets via scripts/download_datasets.py, then run prepare_data.py"
blockers: []
open_questions:
  - "BRRI licence — verify on Mendeley before including in any commercial release"
  - "not_rice_leaf source — ImageNet samples, PlantVillage non-rice, or field photos of soil/hands/sky"
  - "Field photo collection timeline — coordinates with BRAC field workers"
handover_to_mobile:
  files:
    - "runs/stage2/fasol_doctor.onnx"
    - "runs/stage2/classes.json"
  preprocessing: "size=224×224, RGB, mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]"
  verification: "Run same 10 images through Python and the app; outputs must match to 2 decimal places"
---

# Fasol Doctor — AI Model Pipeline

Rice disease image classifier for offline on-device inference. 6 classes, two-stage fine-tuning,
MobileNetV3-Large, ONNX export.

## Source of truth

- `raw/fasol-doctor.md` — full product PRD
- `raw/fasol-doctor-training-guide.md` — training methodology, data sources, decisions

## Phase plan

| Phase | What | Status |
|---|---|---|
| 0 — Setup | Scripts written, environment documented | ✓ Done |
| 1 — Stage 1 training | Download public datasets, prepare_data.py, train on ~10k images | Next |
| 2 — Stage 2 fine-tuning | Field photos collected, 150–300/class, lower-LR fine-tune | Blocked on field data |
| 3 — Calibration + eval | ECE check, temperature scaling if needed, full metrics | After Phase 2 |
| 4 — Handover | ONNX + classes.json + preprocessing spec + verification test | Final |
