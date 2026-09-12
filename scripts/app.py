"""
Fasol Doctor — demo web app.
Run: python scripts/app.py
Opens at http://localhost:7860
"""

import json
from pathlib import Path

import gradio as gr
import numpy as np
import onnxruntime as ort
from PIL import Image

MODEL_PATH   = Path("runs/stage1/fasol_doctor.onnx")
CLASSES_PATH = Path("runs/stage1/classes.json")

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

CONFIDENCE_THRESHOLD = 0.60

DISEASE_INFO = {
    "bacterial_leaf_blight": {
        "label":    "Bacterial Leaf Blight",
        "emoji":    "🦠",
        "severity": "High",
        "color":    "#ef4444",
        "advice":   "Apply copper-based bactericide. Remove and burn infected leaves. Avoid flood irrigation.",
    },
    "brown_spot": {
        "label":    "Brown Spot",
        "emoji":    "🟤",
        "severity": "Medium",
        "color":    "#f97316",
        "advice":   "Improve soil potassium levels. Apply mancozeb or iprodione fungicide.",
    },
    "leaf_blast": {
        "label":    "Leaf Blast",
        "emoji":    "💥",
        "severity": "High",
        "color":    "#ef4444",
        "advice":   "Apply tricyclazole fungicide immediately. Avoid excess nitrogen fertiliser.",
    },
    "tungro": {
        "label":    "Tungro Virus",
        "emoji":    "⚠️",
        "severity": "Critical",
        "color":    "#dc2626",
        "advice":   "No cure. Remove infected plants immediately to stop spread. Control leafhopper insects.",
    },
    "healthy": {
        "label":    "Healthy Leaf",
        "emoji":    "✅",
        "severity": "None",
        "color":    "#22c55e",
        "advice":   "No disease detected. Continue normal crop management.",
    },
    "not_rice_leaf": {
        "label":    "Not a Rice Leaf",
        "emoji":    "❌",
        "severity": "N/A",
        "color":    "#6b7280",
        "advice":   "Please photograph a rice plant leaf clearly.",
    },
}

with open(CLASSES_PATH) as f:
    classes = json.load(f)

session = ort.InferenceSession(str(MODEL_PATH))
print(f"Model loaded — {MODEL_PATH.stat().st_size/1e6:.1f} MB")


def predict(image):
    if image is None:
        return (
            "<div style='text-align:center;padding:40px;color:#9ca3af;font-size:18px'>Upload a rice leaf photo</div>",
            "",
        )

    img = Image.fromarray(image).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)[np.newaxis]

    logits = session.run(["logits"], {"image": arr})[0][0]
    probs  = np.exp(logits - logits.max())
    probs  = probs / probs.sum()

    top_idx  = int(probs.argmax())
    top_prob = float(probs[top_idx])
    top_cls  = classes[top_idx]
    info     = DISEASE_INFO[top_cls]

    # Low confidence
    if top_prob < CONFIDENCE_THRESHOLD:
        result_html = """
        <div style="border-radius:16px;padding:32px;background:#fefce8;border:2px solid #fbbf24;text-align:center">
            <div style="font-size:48px;margin-bottom:12px">⚠️</div>
            <div style="font-size:24px;font-weight:700;color:#92400e;margin-bottom:8px">Unclear Result</div>
            <div style="font-size:15px;color:#78350f">Confidence too low. Take a clearer photo of the leaf in good lighting.</div>
        </div>"""
        bars_html = _bars_html(classes, probs)
        return result_html, bars_html

    # Disease / healthy / not-rice result card
    is_disease = top_cls not in ("healthy", "not_rice_leaf")

    if is_disease:
        header_bg = info["color"]
        badge = f'<span style="background:white;color:{info["color"]};padding:4px 14px;border-radius:99px;font-size:13px;font-weight:700">{info["severity"]} Risk</span>'
    elif top_cls == "healthy":
        header_bg = "#22c55e"
        badge = '<span style="background:white;color:#16a34a;padding:4px 14px;border-radius:99px;font-size:13px;font-weight:700">No Disease</span>'
    else:
        header_bg = "#6b7280"
        badge = ""

    result_html = f"""
    <div style="border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <div style="background:{header_bg};padding:28px 24px;text-align:center">
            <div style="font-size:52px;margin-bottom:10px">{info["emoji"]}</div>
            <div style="font-size:26px;font-weight:800;color:white;margin-bottom:8px">{info["label"]}</div>
            {badge}
        </div>
        <div style="padding:24px;background:white">
            <div style="font-size:13px;font-weight:600;color:#6b7280;letter-spacing:0.05em;margin-bottom:6px">CONFIDENCE</div>
            <div style="background:#f3f4f6;border-radius:99px;height:12px;margin-bottom:20px">
                <div style="background:{header_bg};width:{top_prob*100:.0f}%;height:12px;border-radius:99px;transition:width 0.5s"></div>
            </div>
            <div style="font-size:22px;font-weight:700;color:{header_bg};margin-bottom:20px;text-align:center">{top_prob*100:.1f}%</div>
            {'<div style="font-size:13px;font-weight:600;color:#6b7280;letter-spacing:0.05em;margin-bottom:8px">RECOMMENDED ACTION</div><div style="background:#f9fafb;border-radius:10px;padding:14px;font-size:15px;color:#374151;line-height:1.6">' + info["advice"] + '</div>' if top_cls != 'not_rice_leaf' else ''}
        </div>
    </div>"""

    bars_html = _bars_html(classes, probs)
    return result_html, bars_html


def _bars_html(classes, probs):
    rows = ""
    for cls, prob in sorted(zip(classes, probs), key=lambda x: -x[1]):
        info  = DISEASE_INFO[cls]
        width = f"{prob*100:.0f}%"
        rows += f"""
        <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:14px;color:#374151">{info["emoji"]} {info["label"]}</span>
                <span style="font-size:14px;font-weight:600;color:{info["color"]}">{prob*100:.1f}%</span>
            </div>
            <div style="background:#f3f4f6;border-radius:99px;height:8px">
                <div style="background:{info["color"]};width:{width};height:8px;border-radius:99px"></div>
            </div>
        </div>"""
    return f'<div style="padding:8px 0">{rows}</div>'


with gr.Blocks(title="Fasol Doctor") as app:

    gr.HTML("""
        <div style="text-align:center;padding:32px 0 16px">
            <div style="font-size:40px;margin-bottom:8px">🌾</div>
            <div style="font-size:32px;font-weight:800;color:#166534">Fasol Doctor</div>
            <div style="font-size:16px;color:#6b7280;margin-top:6px">
                Rice Disease Detection — 4 diseases · Bangladeshi field conditions
            </div>
        </div>
    """)

    with gr.Row(equal_height=True):
        with gr.Column(scale=1):
            image_input = gr.Image(
                label="Upload Rice Leaf Photo",
                type="numpy",
                height=360,
                sources=["upload", "clipboard"],
            )
            gr.HTML("""
                <div style="background:#f0fdf4;border-radius:10px;padding:12px 16px;margin-top:8px;font-size:13px;color:#166534">
                    <b>Detects:</b> Bacterial Leaf Blight · Brown Spot · Leaf Blast · Tungro Virus · Healthy
                </div>
            """)

        with gr.Column(scale=1):
            result_card  = gr.HTML('<div style="background:#f9fafb;border-radius:16px;padding:40px;text-align:center;color:#9ca3af;height:100%;display:flex;align-items:center;justify-content:center">Upload a photo to begin</div>')
            gr.HTML("<div style='font-size:13px;font-weight:600;color:#6b7280;margin:16px 0 4px;letter-spacing:0.05em'>ALL CLASS PROBABILITIES</div>")
            bars_output  = gr.HTML()

    image_input.change(
        fn=predict,
        inputs=image_input,
        outputs=[result_card, bars_output],
    )

    gr.HTML("""
        <div style="text-align:center;padding:20px 0 8px;font-size:12px;color:#9ca3af">
            Stage 1 model · Trained on 11,639 images including RiceLeafBD Bangladeshi field photos
        </div>
    """)

if __name__ == "__main__":
    app.launch(
        server_port=7860,
        share=False,
        theme=gr.themes.Soft(),
        css=".gradio-container { max-width: 900px !important; } footer { display: none !important; }",
    )
