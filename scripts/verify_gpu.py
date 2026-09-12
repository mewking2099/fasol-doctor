"""
Environment verification for Fasol Doctor training.
Run this before any training step.
Target: RTX 5070 / CUDA 12.8 / sm_120
"""

import sys
import subprocess


def check_python():
    major, minor = sys.version_info[:2]
    ok = major == 3 and minor >= 10
    status = "OK" if ok else "WARN"
    print(f"[{status}] Python {major}.{minor} (need 3.10+)")
    return ok


def check_cuda():
    try:
        import torch
        if not torch.cuda.is_available():
            print("[FAIL] CUDA not available — torch.cuda.is_available() returned False")
            return False
        version = torch.version.cuda
        major = int(version.split(".")[0])
        ok = major >= 12
        status = "OK" if ok else "WARN"
        print(f"[{status}] CUDA {version} (need 12.x+)")
        return True
    except ImportError:
        print("[FAIL] PyTorch not installed")
        return False


def check_gpu():
    try:
        import torch
        if not torch.cuda.is_available():
            return False
        name = torch.cuda.get_device_name(0)
        props = torch.cuda.get_device_properties(0)
        vram_gb = props.total_memory / (1024 ** 3)
        sm = f"sm_{props.major}{props.minor}"
        ok = props.major >= 9  # sm_90+ (RTX 4090 is sm_89, RTX 5070 is sm_120)
        status = "OK" if ok else "WARN"
        print(f"[{status}] GPU: {name} | VRAM: {vram_gb:.1f} GB | Arch: {sm}")
        return True
    except Exception as e:
        print(f"[FAIL] GPU check error: {e}")
        return False


def check_timm():
    try:
        import timm
        import torch

        model = timm.create_model("mobilenetv3_large_100", pretrained=False, num_classes=6)
        model.eval()
        dummy = torch.randn(1, 3, 224, 224)
        with torch.no_grad():
            out = model(dummy)
        ok = out.shape == (1, 6)
        status = "OK" if ok else "FAIL"
        print(f"[{status}] timm {timm.__version__} — MobileNetV3 forward pass output: {list(out.shape)}")

        model_eff = timm.create_model("efficientnet_b0", pretrained=False, num_classes=6)
        model_eff.eval()
        with torch.no_grad():
            out_eff = model_eff(dummy)
        print(f"[OK]   timm — EfficientNet-B0 forward pass output: {list(out_eff.shape)}")
        return ok
    except ImportError:
        print("[FAIL] timm not installed — pip install timm")
        return False
    except Exception as e:
        print(f"[FAIL] timm forward pass error: {e}")
        return False


def check_onnx():
    try:
        import onnx
        import onnxruntime
        print(f"[OK]   onnx {onnx.__version__} / onnxruntime {onnxruntime.__version__}")
        return True
    except ImportError as e:
        print(f"[WARN] {e} — ONNX export will fail; install onnx onnxruntime")
        return False


def check_sklearn():
    try:
        import sklearn
        print(f"[OK]   scikit-learn {sklearn.__version__}")
        return True
    except ImportError:
        print("[FAIL] scikit-learn not installed")
        return False


def main():
    print("=" * 55)
    print("Fasol Doctor — Environment Check")
    print("=" * 55)

    results = [
        check_python(),
        check_cuda(),
        check_gpu(),
        check_timm(),
        check_onnx(),
        check_sklearn(),
    ]

    print("=" * 55)
    failures = results.count(False)
    if failures == 0:
        print("All checks passed. Ready to train.")
    else:
        print(f"{failures} check(s) failed. Fix before training.")
        sys.exit(1)


if __name__ == "__main__":
    main()
