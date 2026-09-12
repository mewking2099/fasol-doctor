# Cell 9 — Export ONNX (legacy exporter, no onnxscript needed)
import shutil

model.eval()
dummy    = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
onnx_path = RUNS_DIR / 'fasol_doctor.onnx'

torch.onnx.export(
    model, dummy, str(onnx_path),
    input_names=['image'],
    output_names=['logits'],
    dynamic_axes={'image': {0: 'batch'}, 'logits': {0: 'batch'}},
    opset_version=17,
    dynamo=False,       # use legacy TorchScript exporter — no onnxscript needed
)

# Verify round-trip
sess = onnxruntime.InferenceSession(str(onnx_path))
out  = sess.run(['logits'], {'image': dummy.cpu().numpy()})
print(f'ONNX verified — output shape: {list(out[0].shape)}')
print(f'File size: {onnx_path.stat().st_size / 1e6:.2f} MB')
print(f'Saved:     {onnx_path}')

shutil.copy2(DATA_DIR / 'classes.json', RUNS_DIR / 'classes.json')
print('classes.json copied')
