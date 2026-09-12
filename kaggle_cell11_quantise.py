# Cell 11 — INT8 Quantisation
from pathlib import Path
import numpy as np
from PIL import Image
import onnxruntime as ort
from onnxruntime.quantization import (
    quantize_static, CalibrationDataReader, QuantFormat, QuantType
)

MODEL_PATH = RUNS_DIR / 'fasol_doctor.onnx'
OUT_PATH   = RUNS_DIR / 'fasol_doctor_int8.onnx'
VAL_DIR    = DATA_DIR / 'val'

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Load 200 val images for calibration
all_files = []
for cls_dir in VAL_DIR.iterdir():
    if cls_dir.is_dir():
        all_files.extend([f for f in cls_dir.iterdir()
                          if f.suffix.lower() in {'.jpg', '.jpeg', '.png'}])

rng = np.random.default_rng(42)
rng.shuffle(all_files)
cal_images = []
for path in all_files[:200]:
    img = Image.open(path).convert('RGB').resize((224, 224))
    arr = (np.array(img, dtype=np.float32) / 255.0 - MEAN) / STD
    cal_images.append(arr.transpose(2, 0, 1)[np.newaxis])

print(f'Calibration images: {len(cal_images)}')

class Reader(CalibrationDataReader):
    def __init__(self): self.idx = 0
    def get_next(self):
        if self.idx >= len(cal_images): return None
        r = {'image': cal_images[self.idx]}; self.idx += 1; return r
    def rewind(self): self.idx = 0

quantize_static(
    model_input=str(MODEL_PATH),
    model_output=str(OUT_PATH),
    calibration_data_reader=Reader(),
    quant_format=QuantFormat.QDQ,
    per_channel=False,
    weight_type=QuantType.QInt8,
    activation_type=QuantType.QInt8,
)

in_mb  = MODEL_PATH.stat().st_size / 1e6
out_mb = OUT_PATH.stat().st_size / 1e6
print(f'{in_mb:.1f} MB → {out_mb:.1f} MB  ({(1-out_mb/in_mb)*100:.0f}% smaller)')

# Agreement check
sess_fp = ort.InferenceSession(str(MODEL_PATH))
sess_q  = ort.InferenceSession(str(OUT_PATH))
match = sum(
    sess_fp.run(['logits'], {'image': img})[0].argmax() ==
    sess_q.run( ['logits'], {'image': img})[0].argmax()
    for img in cal_images
)
print(f'FP32 vs INT8 agreement: {match/len(cal_images)*100:.1f}%')

# Add to zip — re-run Cell 10 after this, or just zip manually
import zipfile
zip_path = WORK_DIR / 'fasol_doctor_stage1_final.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for name in ['fasol_doctor.onnx', 'fasol_doctor_int8.onnx', 'classes.json', 'best.pt']:
        f = RUNS_DIR / name
        if f.exists():
            zf.write(f, name)
print(f'Final zip: {zip_path}  ({zip_path.stat().st_size/1e6:.1f} MB)')
print('Download from: Kaggle sidebar → Output → fasol_doctor_stage1_final.zip')
