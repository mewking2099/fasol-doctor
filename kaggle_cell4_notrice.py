# Cell 4 — Build not_rice_leaf from PlantVillage non-rice folders
import shutil, random
random.seed(SEED)

NOT_RICE_STAGING = WORK_DIR / 'not_rice_leaf_staging'
NOT_RICE_STAGING.mkdir(parents=True, exist_ok=True)

# Collect from every PlantVillage folder that is NOT a rice folder
collected = []
for folder in PLANTVILL_ROOT.iterdir():
    if not folder.is_dir():
        continue
    if folder.name.lower().startswith('rice'):
        continue  # skip Rice___* — those are disease training data
    imgs = [f for f in folder.iterdir() if f.suffix.lower() in VALID_EXTS]
    collected.extend(imgs)

random.shuffle(collected)
target = collected[:500]

for i, src in enumerate(target):
    shutil.copy2(src, NOT_RICE_STAGING / f'{i:04d}{src.suffix.lower()}')

print(f'not_rice_leaf staging: {len(target)} images from PlantVillage non-rice folders')
print(f'(sampled from {len(collected)} available)')
