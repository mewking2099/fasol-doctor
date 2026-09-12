# Kaggle Cell 2 — paste this entire block

Click the cell → Cmd+A → Delete → paste below:

```python
# Cell 2 — Auto-discover dataset paths (handles merged 'datasets' folder)
import os
from pathlib import Path

WORK_DIR   = Path('/kaggle/working')
DATA_DIR   = WORK_DIR / 'data' / 'stage1'
RUNS_DIR   = WORK_DIR / 'runs' / 'stage1'
INPUT_ROOT = Path('/kaggle/input')

CLASSES = [
    'bacterial_leaf_blight', 'brown_spot', 'leaf_blast',
    'tungro', 'healthy', 'not_rice_leaf',
]
IMG_SIZE = 224
MEAN     = [0.485, 0.456, 0.406]
STD      = [0.229, 0.224, 0.225]
BATCH    = 64
EPOCHS   = 12
LR       = 1e-3
SEED     = 42

VALID_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}

# Walk the full input tree and show every directory that contains images
print('Scanning /kaggle/input tree...')
image_dirs = {}
for d in INPUT_ROOT.rglob('*'):
    if not d.is_dir():
        continue
    direct_imgs = [f for f in d.iterdir()
                   if f.is_file() and f.suffix.lower() in VALID_EXTS]
    if direct_imgs:
        rel = d.relative_to(INPUT_ROOT)
        image_dirs[d] = len(direct_imgs)

for d, count in sorted(image_dirs.items(), key=lambda x: str(x[0])):
    print(f'  {str(d.relative_to(INPUT_ROOT)):60s} {count:5d} imgs')
```
