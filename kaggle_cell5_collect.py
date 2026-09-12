# Cell 5 — Collect + deduplicate + split all datasets
import hashlib, shutil, random, json
from collections import defaultdict

def file_md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def collect(root):
    by_class = defaultdict(list)
    for item in Path(root).rglob('*'):
        if item.suffix.lower() not in VALID_EXTS:
            continue
        folder = item.parent.name.lower().strip()
        canonical = NAME_MAP.get(folder)
        if canonical:
            by_class[canonical].append(item)
    return by_class

def dedup(images):
    seen, unique = set(), []
    for p in images:
        h = file_md5(p)
        if h not in seen:
            seen.add(h)
            unique.append(p)
    return unique

def split_list(images, seed=SEED):
    rng = random.Random(seed)
    imgs = images[:]
    rng.shuffle(imgs)
    n = len(imgs)
    n_tr = int(n * 0.70)
    n_va = int(n * 0.15)
    return imgs[:n_tr], imgs[n_tr:n_tr+n_va], imgs[n_tr+n_va:]

# Collect rice disease images from all sources
# PlantVillage Rice___* folders overlap with Nirmal — dedup handles it
all_by_class = defaultdict(list)
for root in [RICELEAFBD_ROOT, NIRMAL_ROOT, VBOOK_ROOT, PLANTVILL_ROOT]:
    bc = collect(root)
    for cls, paths in bc.items():
        all_by_class[cls].extend(paths)

# Add not_rice_leaf from staging
all_by_class['not_rice_leaf'].extend(NOT_RICE_STAGING.glob('*'))

# Dedup + split + copy
print('Class counts (before → after dedup):')
total = 0
for cls in CLASSES:
    images = all_by_class.get(cls, [])
    before = len(images)
    images = dedup(images)
    after  = len(images)
    total += after
    print(f'  {cls:30s} {before:5d} → {after:5d}')

    tr, va, te = split_list(images)
    for split_name, split_imgs in [('train', tr), ('val', va), ('test', te)]:
        dest = DATA_DIR / split_name / cls
        dest.mkdir(parents=True, exist_ok=True)
        for i, src in enumerate(split_imgs):
            shutil.copy2(src, dest / f'{i:05d}{src.suffix.lower()}')

print(f'\nTotal unique images: {total}')
with open(DATA_DIR / 'classes.json', 'w') as f:
    json.dump(CLASSES, f, indent=2)
print('classes.json written')
print(f'Splits at: {DATA_DIR}/')
