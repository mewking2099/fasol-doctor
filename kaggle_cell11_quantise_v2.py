# Cell 11 v2 — Dynamic INT8 quantisation (no calibration needed, reliable)
from pathlib import Path
import numpy as np
from PIL import Image
import onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType

MODEL_PATH = RUNS_DIR / 'fasol_doctor.onnx'
OUT_PATH   = RUNS_DIR / 'fasol_doctor_int8.onnx'
VAL_DIR    = DATA_DIR / 'val'

# Dynamic quantisation — quantises weights only, no calibration data needed
quantize_dynamic(
    model_input=str(MODEL_PATH),
    model_output=str(OUT_PATH),
    weight_type=QuantType.QUInt8,
    optimize_model=True,
)

in_mb  = MODEL_PATH.stat().st_size / 1e6
out_mb = OUT_PATH.stat().st_size / 1e6
print(f'{in_mb:.1f} MB → {out_mb:.1f} MB  ({(1-out_mb/in_mb)*100:.0f}% smaller)')

# Agreement check on 100 val images
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

all_files = []
for cls_dir in VAL_DIR.iterdir():
    if cls_dir.is_dir():
        all_files.extend([f for f in cls_dir.iterdir()
                          if f.suffix.lower() in {'.jpg','.jpeg','.png'}])
np.random.default_rng(42).shuffle(all_files)

sess_fp = ort.InferenceSession(str(MODEL_PATH))
sess_q  = ort.InferenceSession(str(OUT_PATH))

match = 0
for path in all_files[:100]:
    img = Image.open(path).convert('RGB').resize((224, 224))
    arr = ((np.array(img, dtype=np.float32)/255.0 - MEAN) / STD).transpose(2,0,1)[np.newaxis]
    if sess_fp.run(['logits'],{'image':arr})[0].argmax() == \
       sess_q.run( ['logits'],{'image':arr})[0].argmax():
        match += 1

print(f'FP32 vs INT8 agreement: {match}%  (should be >95%)')

# Final zip
import zipfile
zip_path = WORK_DIR / 'fasol_doctor_final.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for name in ['fasol_doctor.onnx', 'fasol_doctor_int8.onnx', 'classes.json', 'best.pt']:
        f = RUNS_DIR / name
        if f.exists():
            zf.write(f, name)
print(f'Zip: {zip_path}  ({zip_path.stat().st_size/1e6:.1f} MB)')
print('Download: Kaggle sidebar → Output → fasol_doctor_final.zip')
