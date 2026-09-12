# Cell 12 — Add 2 sample val images per class to the zip for local demo testing
import zipfile, shutil, random

SAMPLE_DIR = WORK_DIR / 'test_samples'
SAMPLE_DIR.mkdir(exist_ok=True)

random.seed(42)
for cls_dir in sorted((DATA_DIR / 'val').iterdir()):
    if not cls_dir.is_dir():
        continue
    imgs = [f for f in cls_dir.iterdir()
            if f.suffix.lower() in {'.jpg', '.jpeg', '.png'}]
    random.shuffle(imgs)
    for img in imgs[:2]:
        dest = SAMPLE_DIR / cls_dir.name / img.name
        dest.parent.mkdir(exist_ok=True)
        shutil.copy2(img, dest)

zip_path = WORK_DIR / 'fasol_doctor_demo.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write(RUNS_DIR / 'fasol_doctor.onnx', 'fasol_doctor.onnx')
    zf.write(RUNS_DIR / 'classes.json', 'classes.json')
    for f in SAMPLE_DIR.rglob('*'):
        if f.is_file():
            zf.write(f, f'test_samples/{f.parent.name}/{f.name}')

print(f'Demo zip: {zip_path}  ({zip_path.stat().st_size/1e6:.1f} MB)')
print('Contents: fasol_doctor.onnx + classes.json + 12 sample images (2 per class)')
print('Download: Kaggle sidebar → Output → fasol_doctor_demo.zip')
