# Cell 2 — Exact paths from tree scan
from pathlib import Path

WORK_DIR   = Path('/kaggle/working')
DATA_DIR   = WORK_DIR / 'data' / 'stage1'
RUNS_DIR   = WORK_DIR / 'runs' / 'stage1'
INPUT_ROOT = Path('/kaggle/input')

CLASSES = [
    'bacterial_leaf_blight', 'brown_spot', 'leaf_blast',
    'tungro', 'healthy', 'not_rice_leaf',
]
IMG_SIZE   = 224
MEAN       = [0.485, 0.456, 0.406]
STD        = [0.229, 0.224, 0.225]
BATCH      = 64
EPOCHS     = 12
LR         = 1e-3
SEED       = 42
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}

# Exact paths confirmed from tree scan
RICELEAFBD_ROOT = INPUT_ROOT / 'datasets/mohabbatjan/rice-leaf-diseases/RiceLeafBD A Real-Field Image Dataset for Rice Lea/Original Images/Original Images'
NIRMAL_ROOT     = INPUT_ROOT / 'datasets/nirmalsankalana/rice-leaf-disease-image'
PLANTVILL_ROOT  = INPUT_ROOT / 'datasets/nirmalsankalana/plant-diseases-training-dataset/data'
VBOOK_ROOT      = INPUT_ROOT / 'datasets/vbookshelf/rice-leaf-diseases/rice_leaf_diseases'

print('Path check:')
for name, p in [
    ('RiceLeafBD — Bangladeshi field images', RICELEAFBD_ROOT),
    ('Nirmal rice disease images',            NIRMAL_ROOT),
    ('PlantVillage (not_rice_leaf source)',   PLANTVILL_ROOT),
    ('vbookshelf rice diseases',              VBOOK_ROOT),
]:
    ok = 'OK' if p.exists() else 'MISSING'
    print(f'  [{ok}] {name}')
