This document explains how to train the image recognition model behind Fasol Doctor, written for a team with no machine learning background. It covers what the thing actually is, where to get images, how to label them, which model to pick, and the exact steps to run — first on free online services, and if those are not enough, on a local machine with an RTX 5070.

Nothing here requires you to understand the mathematics. Training an image classifier in 2026 is closer to a configuration task than a research task, provided you do not try to invent anything. Almost all of the difficulty is in the data, not the code.

## **What we are actually building, in plain language**

We are building one thing: an **image classifier**. You give it a photograph, it gives you back a list of possible answers with a number attached to each.

```
INPUT                        OUTPUT
photo of a rice leaf   →     bacterial_leaf_blight   0.81
                             brown_spot              0.12
                             leaf_blast              0.04
                             tungro                  0.02
                             healthy                 0.01
```

That is the whole model. Everything else in the product — the treatment plan, the escalation ladder, the incidence estimate, the multi-image engine — is ordinary software built on top of that one output.

### **The words you need, and only these**

| Term | What it means for us |
| ----- | ----- |
| **Class** | One possible answer. We will have six: four diseases, healthy, and not-a-rice-leaf. |
| **Label** | Telling the computer which class a particular photo belongs to. For our task, this is just putting the file in the right folder. |
| **Model / architecture** | The shape of the neural network. We pick one off the shelf; we do not design one. |
| **Weights** | The numbers inside the model that get adjusted during training. "The model" as a file is really just these numbers. |
| **Pretrained** | Somebody already trained the model on millions of general photographs. It already knows edges, textures, leaf shapes. We start from theirs. |
| **Transfer learning / fine-tuning** | Taking a pretrained model and continuing its training on our rice images. This is the entire technique. It is why a few hundred images can work when a few hundred thousand would otherwise be needed. |
| **Epoch** | One complete pass through all your training images. We will do roughly 10 to 15. |
| **Train / validation / test split** | Three separate piles of images. It learns from the first, we tune using the second, and we score honestly on the third — which we do not look at until the end. |
| **Overfitting** | The model memorises your specific photos instead of learning the disease. Symptom: excellent scores during training, poor performance on new photos. |
| **Augmentation** | Automatically making distorted copies of training images — rotated, darkened, blurred — so the model learns the disease rather than the lighting. |
| **Confidence** | The number next to each answer. Critically, this is **not** the probability of being right unless you check and correct it. See Section 9. |
| **Inference** | Using the trained model to answer a question. This is what happens on the farmer's phone. |

### **The one thing to understand before starting**

Published rice disease papers report 95–99% accuracy. Those numbers come from clean, uniform, single-leaf photographs. When models trained that way meet real field photographs, published accuracy drops have ranged from 20 to 50 percentage points, and in one benchmark by as much as 67 points.

So the goal of this document is not to reproduce a 99% paper result. It is to produce a model that holds up on a photograph taken by a farmer in a windy field in Sirajganj. That requires a specific method — two-stage training on real field images — which is why Section 8 exists.

**A realistic target for version 1: 75–88% top-1 accuracy on genuine field photographs across five or six classes**, with honest confidence scores and a working escalation path for the rest. Anyone promising more than that on field data without a very large proprietary dataset is quoting lab numbers.

## **The decisions already made, and why**

| Decision | Choice | Reason |
| ----- | ----- | ----- |
| Train from scratch or fine-tune? | **Fine-tune a pretrained model** | Training from scratch needs hundreds of thousands of images. Fine-tuning works with hundreds. One study on rice got 96% from 240 images using transfer learning, where a network trained from scratch on the same images managed 62%. |
| How many classes in v1? | **Six** | Bacterial leaf blight, brown spot, leaf blast, tungro, healthy, and not-a-rice-leaf. These four diseases are what the open Bangladeshi datasets actually cover. |
| Which crop first? | **Rice only** | Every open dataset for Bangladesh is rice. Vegetables come after the pipeline works. |
| Detection or classification? | **Classification** | We need to know *what* it is, not draw a box around *where* it is. Classification is far simpler to label and to train. |
| Where does it run? | **On the phone, offline** | So it must be a small, fast model. See Section 4. |

### **Why "not-a-rice-leaf" is a required class**

If you train on only five classes, then when a farmer photographs his hand, a goat, or a maize plant, the model will confidently return one of your five diseases. It has no way to say "I do not know." Models under real-world conditions have been shown to fail specifically at this — rejecting inputs outside what they were trained on.

The fix is cheap: add a sixth class filled with several hundred assorted photographs that are not rice leaves — soil, hands, sky, other crops, blurry nothing, random indoor photos. This single class is what makes your "I am not sure, ask a person" path actually function.

## **Where the images come from**

There are two sources, and you need both.

### **Source 1 — Open datasets, free to download**

These give you volume. Download all of them. Every entry below is real and publicly available; verify each licence yourself before the product ships, because licence terms occasionally change on re-publication.

| Dataset | Contents | Why it matters | Licence |
| ----- | ----- | ----- | ----- |
| **RiceLeafBD** (Mendeley) | 1,555 real-field RGB images from Sylhet and Dhaka, shot on Samsung Galaxy S21 Ultra and Redmi Note 9 during Amon season. Healthy 252, Bacterial Leaf Blight 417, Brown Spot 356, Tungro 530. Expert-validated by Jamalpur Krishi Gobeshona Institution. | **The single most valuable set for us.** Real field conditions, Bangladeshi, smartphone-captured, includes a CSV of labels and metadata. This is closest to what your users will actually send. | Check on Mendeley |
| **Rice Leaf Disease Image Samples** (Sethy et al., Mendeley) | 5,932 images across bacterial blight, blast, brown spot, tungro | Largest single rice set. Good for stage 1 volume. | CC BY 4.0 |
| **RiceyLeafDisease** (Mendeley) | 1,701 original images of eight Bangladeshi rice diseases from Sirajganj and Pabna, plus 5,188 augmented copies | More classes, more regions, varied outdoor and indoor lighting | CC BY 4.0 |
| **Rice Leaf Bacterial and Fungal Disease Dataset** (Mendeley) | Eight diseases from Belkuchi, Sirajganj — between 163 and 310 images per class | Adds leaf scald, rice hispa, narrow brown leaf spot, sheath blight | CC BY 4.0 |
| **BRRI-sourced rice leaf dataset** (Mendeley) | 2,753 original images, 19,000 with augmentation, seven classes, annotated by agronomy experts, sourced from the Bangladesh Rice Research Institute | Institutionally credible, and BRRI is an obvious partner for BRAC | Check on Mendeley |
| **Kaggle mirrors** | Several Kaggle datasets re-host the Mendeley sets | Convenient if you train on Kaggle — it removes the upload step | Often CC0, verify |
| **PlantVillage** | 54,305 images, 38 classes, laboratory conditions | Use only as generic pretraining. Its images have uniform backgrounds and centred single leaves, which is exactly what causes the field accuracy collapse. Never validate on it. | Check |

**Two traps that will silently ruin your results:**

**Trap 1 — Duplicate images across datasets.** Several Kaggle rice datasets are re-uploads of the same Mendeley collection. If you merge them without deduplicating, the same photograph lands in both your training and test piles. Your test score then measures memorisation, and looks fantastic. Deduplicate by file hash before splitting. Section 8 shows the command.

**Trap 2 — Pre-augmented images.** Several of these datasets ship with augmented copies already included (rotations, flips, brightness changes of the same original). If the original goes into training and a rotated copy goes into testing, that is the same leaf on both sides, and again your score is fiction. Either use only the original images, or make sure every copy derived from one original stays in the same pile.

### **Source 2 — Your own field photographs**

This is the one that determines whether the product works. The open datasets teach the model what the diseases look like. Your own photographs teach it what your users' cameras, fields, and lighting look like.

**Minimum useful quantity: 150 images per class. Target: 300 per class.** Evidence from field-image studies suggests roughly 80 images per class gets you into the high-80s with the right method, and 15 per class gets you around 80% — so a few hundred per class is a genuinely strong position, not a compromise.

## **How to collect and label your own images**

### **The capture protocol**

Give every field worker the same instructions, and give them a printed card. Inconsistent collection is worse than less collection.

For each affected plant, capture **four photographs**:

| Shot | What | Why |
| ----- | ----- | ----- |
| **1. Leaf close-up** | One affected leaf filling most of the frame, held flat | The primary training image |
| **2. Lesion macro** | As close as the phone will focus on one lesion edge | Margin shape is what separates similar diseases |
| **3. Whole plant** | The full plant from about 1 metre | Distinguishes disease from nutrient deficiency |
| **4. Wide plot** | Standing height, showing several plants | Spread pattern, and incidence |

Plus, for every case, a short record:

`date · district · union · crop · variety · growth stage · weather that day · phone model · who captured it · what the diagnosis is · how the diagnosis was confirmed`

That last field matters enormously. Record whether the label came from a laboratory test, an agronomist looking at the plant in person, or a field worker's visual guess. These are not equally reliable, and you will want to be able to train on only the high-confidence subset later.

**Deliberately vary the conditions.** Cloudy and bright. Morning and midday. Steady and slightly shaky. Different phone models. If every training photo is perfect, the model will only work on perfect photos. Your users do not take perfect photos.

**Privacy rules, non-negotiable:** no faces, no people, no house numbers, no anything that identifies an individual. Photograph plants only. Get the farmer's spoken consent and log that you have it, keyed to an anonymous plot ID rather than a name. Store no personal details alongside the images.

### **How to label — the good news**

Because this is classification and not detection, **labelling means moving files into folders.** You do not draw boxes. You do not trace outlines. You do not need annotation software.

Build exactly this structure:

```
fasol-data/
    bacterial_leaf_blight/
        BLB_sirajganj_20260315_001.jpg
        BLB_sirajganj_20260315_002.jpg
    brown_spot/
    leaf_blast/
    tungro/
    healthy/
    not_rice_leaf/
    _uncertain/          ← the important extra folder
    _rejected/           ← too blurry, wrong subject, duplicate
```

Folder name becomes the class name. Windows Explorer or macOS Finder is a perfectly good labelling tool for this. A shared Google Drive folder with agreed subfolders works for a distributed team.

**File naming:** `CLASS_district_YYYYMMDD_sequence.jpg`. Never rely on the filename for the label — the folder is the label — but a consistent name makes tracing a problem image back to its record possible.

### **The labelling workflow that produces trustworthy labels**

1. **Field worker sorts first.** Into the six class folders, or into `_uncertain` if genuinely unsure.
2. **An agronomist reviews everything.** This is not optional. A model trained on wrong labels learns to be wrong, and no amount of clever training fixes it.
3. **Two reviewers on a sample.** Have two agronomists independently label the same 200 images. If they disagree on more than about 10%, your class definitions are too vague or the photographs are too poor — fix that before collecting thousands more.
4. **`_uncertain` never enters training.** It becomes your review queue and, later, useful test material.
5. **Log every label decision** in a spreadsheet: filename, class, who labelled it, how it was confirmed, date.

**If you do want a labelling interface** rather than folders — for example to have agronomists review on a tablet — **Label Studio** is free and open source and handles image classification well. **Roboflow** has a free tier with a good review workflow. Neither is necessary for this task, and both add a step where a folder would do. Use them only if the review process genuinely needs an audit trail with multiple reviewers.

## **Which model to use**

You are picking from a menu, not designing anything. The constraint is that it must run on a mid-range Android phone, offline, in under five seconds.

| Model | Size on phone | Speed | Verdict |
| ----- | ----- | ----- | ----- |
| **MobileNetV3-Large** | ~4–6 MB quantised | Very fast | **Start here.** Designed for phones. On rice datasets, MobileNetV2 has repeatedly matched or beaten much heavier models — one study reported 99% accuracy and F1 of 0.99, another 96.87% on test, at a fraction of the compute. |
| **EfficientNet-B0** | ~10–16 MB | Fast | Usually a point or two more accurate. Train both, compare, keep the winner. |
| **ResNet-50** | ~90 MB | Slow on phone | Use only as a reference score during development, not for shipping. |
| **ViT-Tiny / DeiT-Tiny** | ~20 MB | Moderate | Transformers handle cluttered field backgrounds well but need more data. Worth trying at stage 2 once you have your own images. |

### **Where to get the model code, and a licence warning**

| Library | Licence | Use it? |
| ----- | ----- | ----- |
| **timm** (PyTorch Image Models) | Apache 2.0 | **Yes.** Hundreds of pretrained models, one line each. This is what the supplied script uses. |
| **torchvision** | BSD-3-Clause | Yes. Fewer models, equally permissive. |
| **Ultralytics YOLO** (classification mode) | **AGPL-3.0** | **Be careful.** It is genuinely the easiest tool to use, and it is fine for a hackathon demo. But AGPL-3.0 is a strong copyleft licence: shipping it inside a product can oblige you to release your own source code, or to purchase a commercial licence. For a real BRAC product, use timm instead and avoid the question. Have your legal team confirm before any commercial decision. |
| **fastai** | Apache 2.0 | Friendly and short, but it pins specific PyTorch versions, which causes problems on RTX 50-series cards. Use timm to avoid version fights. |

## **Route A — Zero code, about one hour**

Do this first, today, before anything else. Not because it will ship, but because it proves the whole idea end to end and gives you something to demo.

**Google Teachable Machine** (teachablemachine.withgoogle.com) is a free browser tool that trains an image classifier by drag-and-drop and exports a TensorFlow Lite file your Android developer can drop straight into the app.

1. Open the site, choose **Image Project → Standard image model**
2. Create six classes and name them
3. Drag your image folders into each class
4. Click **Train Model**, wait a few minutes, do not close the tab
5. Test it live with your webcam or by uploading new photos
6. **Export Model → TensorFlow Lite → Download**

**What it is good for:** proving the pipeline, a working hackathon demo, showing stakeholders something real, and getting an early honest sense of which diseases are easy and which are hard.

**What it cannot do:** two-stage training, proper augmentation control, calibration, per-class metrics, or a held-out test set. It will also flatter itself, because it decides its own validation split. Do not quote its accuracy number to anyone.

## **Route B — Free cloud GPU, the main recommendation**

**Use Kaggle Notebooks.** It is free, needs no credit card, gives a **guaranteed roughly 30 GPU hours per week** on either a P100 or two T4s, with sessions up to 12 hours, 20 GB of disk, and PyTorch already installed. Crucially, the rice datasets are already hosted on Kaggle, so you skip uploading anything.

Google Colab is the backup — 15 to 30 hours weekly on comparable hardware, with 12-hour sessions, but it now allocates through a compute-unit system that throttles heavy users at peak times. Kaggle's guaranteed quota is the more reliable of the two for a real project.

Our entire training job is small. A MobileNetV3 fine-tune on ten thousand images takes well under an hour on a T4. 30 hours a week is a great deal more than you need.

### **Step by step**

**1. Set up (once)**
- Create an account at kaggle.com and **verify your phone number** — GPU access is locked until you do.

**2. Get the data in**
- Search Kaggle Datasets for "rice leaf disease" and add the relevant sets to your notebook with **Add Input**.
- Upload your own field photographs as a new **private** Kaggle Dataset. Zip the folder structure from Section 5 and upload; Kaggle preserves the folders.

**3. Create the notebook**
- **Code → New Notebook**
- Right panel: **Accelerator → GPU T4 x2** (or P100)
- Right panel: **Internet → On**. Miss this and your package installs fail with confusing errors.

**4. First cell — confirm the GPU is real**
```python
!nvidia-smi
import torch
print(torch.__version__, torch.cuda.is_available(), torch.cuda.get_device_name(0))
```

**5. Second cell — install the one missing package**
```python
!pip install -q timm
```

**6. Third cell — build your folder structure**

Copy the images from the read-only Kaggle input folders into a train/val/test structure. Use the `prepare_data.py` logic in Section 8.

**7. Fourth cell — train**
```python
!python train.py --data data/stage1 --out runs/stage1 --epochs 12
```

**8. Download the results.** The `runs/` folder appears under **Output** on the right. Download `best.pt`, `fasol_doctor.onnx`, `classes.json`, and `metrics.json`.

**Important:** Kaggle wipes everything when the session ends. Download your outputs every time, or commit the notebook so it saves them.

## **Route C — Your own PC with the RTX 5070**

Worth setting up. It removes the session limits and the queueing, and the 5070 will comfortably out-train a free T4. But it has one specific trap.

### **The Blackwell problem, read this first**

The RTX 5070 is a Blackwell-architecture card with compute capability **sm_120**. Older PyTorch builds do not include code for it, and the failure is confusing — sometimes a warning, sometimes a crash, sometimes silent slowness.

What you need:
- **NVIDIA driver 550 or newer**
- **A PyTorch build compiled for CUDA 12.8 or later.** PyTorch 2.7.0 was the first stable release to add native sm_120 support, shipping prebuilt CUDA 12.8 wheels. Anything from 2.7.0 onward with a cu128 or later build will work; take the current stable release.

The error you are looking out for:

```
UserWarning: NVIDIA GeForce RTX 5070 with CUDA capability sm_120 is not
compatible with the current PyTorch installation.
```

If you see that, you installed the wrong wheel. That is all it means.

### **Setup, Windows or Linux**

**1. Check your driver**
```
nvidia-smi
```
Read the driver version in the top row. If it is below 550, update from NVIDIA's site first. You do **not** need to install the CUDA Toolkit separately — the PyTorch wheel bundles what it needs.

**2. Install Python 3.12** from python.org. On Windows, tick "Add Python to PATH".

**3. Create an isolated environment**
```
mkdir fasol-training
cd fasol-training
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
```
Your prompt should now start with `(.venv)`. Everything below happens inside it.

**4. Install PyTorch — the exact command matters**
```
pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
```
The `--index-url` part is what gets you the CUDA 12.8 build instead of the default. Omitting it is the single most common cause of "it does not see my GPU". This download is several gigabytes.

**5. Install the rest**
```
pip install timm numpy pillow
```

**6. Verify before you train anything**
```
python verify_gpu.py
```
Five checks, five seconds. Every one should say PASS. If step 3 or 4 fails, go back to step 4 above.

### **Settings for a 12 GB card**

| Setting | Value | Note |
| ----- | ----- | ----- |
| Image size | 224 | Standard. Larger gains little and costs a lot. |
| Batch size | 32 | If you hit "CUDA out of memory", drop to 16. |
| Mixed precision | On (`--amp 1`) | Roughly doubles speed, costs nothing in accuracy here. |
| Workers | 4 to 8 | On Windows, if you get odd multiprocessing errors, use `--workers 0`. |

Expect stage 1 on around ten thousand images to take roughly 15 to 30 minutes total.

## **The training method — the part that actually matters**

Everything above was setup. This is the recipe.

### **Two stages, in this order**

```
                    STAGE 1                          STAGE 2
            ┌──────────────────────┐        ┌──────────────────────┐
Pretrained  │  All open datasets   │        │  YOUR field photos   │
ImageNet →  │  ~10,000 images      │   →    │  150-300 per class   │   →  Ship
weights     │  learns the diseases │        │  learns YOUR cameras │
            └──────────────────────┘        └──────────────────────┘
                                                       ↓
                                            HELD-OUT FIELD TEST SET
                                            (never used in training)
```

**Why two stages rather than one merged pile.** If you mix ten thousand clean dataset images with a thousand of your own field images, the clean images dominate and the model optimises for conditions your users do not have. Training in sequence, with your field data last and at a lower learning rate, makes your data the final word on what the model believes.

### **Splitting the data — where results get faked accidentally**

Split **before** anything else, and split correctly:

- **70% train / 15% validation / 15% test**
- Split **by original photograph**, never by file. All augmented copies of one original go to the same side.
- The **test set must be your own field images only** — never dataset images. It is the only honest measure of whether the thing works in Bangladesh.
- Where possible, split by **district or collection trip**, so the test set contains locations the model never trained on. This is a harder test and a truer one.
- **Deduplicate first:**
```
# Linux/macOS — find identical images by content hash
find fasol-data -type f \( -iname '*.jpg' -o -iname '*.png' \) \
  -exec md5sum {} + | sort | uniq -w32 -d
```

Then open the test folder once, at the end. Every time you look at test results and change something in response, you leak a little information into your model and the score becomes slightly less honest.

### **Augmentation — imitate bad photographs deliberately**

The supplied `train.py` already applies these. The reasoning behind each:

| Augmentation | Simulates |
| ----- | ----- |
| Random resized crop, 60–100% | Farmers standing at different distances |
| Horizontal and vertical flip | Leaf orientation, held either way up |
| Rotation up to 25° | Nobody holds a phone level |
| Colour jitter — brightness, contrast, saturation | Midday sun versus overcast versus shade |
| Gaussian blur | Motion, and cheap camera autofocus |
| Random erasing | Occlusion by other leaves, soil, insects, a thumb |

Do **not** over-rotate or over-distort colour. Disease diagnosis genuinely depends on hue — yellowing versus browning — so aggressive colour shifting teaches the model to ignore the signal.

### **The commands**

```bash
# STAGE 1 — learn the diseases from public data
python train.py --data data/stage1 --out runs/stage1 \
                --model mobilenetv3_large_100 --epochs 12 --lr 1e-3

# STAGE 2 — adapt to your own field photographs.
# Note the much lower learning rate: we are nudging, not relearning.
python train.py --data data/stage2 --out runs/stage2 \
                --model mobilenetv3_large_100 --epochs 10 --lr 3e-4 \
                --init runs/stage1/best.pt

# Then repeat both with a different model and compare
python train.py --data data/stage1 --out runs/stage1_eff \
                --model efficientnet_b0 --epochs 12 --lr 1e-3
```

### **What the script does that a beginner tutorial would not**

- **Oversamples rare classes**, so a class with 150 images is not drowned out by one with 500
- **Selects the best epoch on macro-F1, not accuracy** — see below
- **Measures calibration**, so you know whether the confidence score can be trusted
- **Stops early** when validation stops improving, which prevents overfitting
- **Prints a confusion matrix and per-class recall**, so you can see *which* disease it is bad at
- **Exports ONNX** ready for the app

## **Reading the results honestly**

### **The five numbers that matter, and one that does not**

| Metric | What it tells you | Target |
| ----- | ----- | ----- |
| **Top-1 accuracy** | How often the first answer is right | 75–88% on real field images is a good v1 |
| **Top-3 accuracy** | How often the right answer is in the shortlist | Should exceed 95%. This is what makes a ranked list honest and useful. |
| **Macro-F1** | Accuracy averaged across classes equally | Within a few points of top-1. A big gap means it is ignoring a rare class. |
| **Per-class recall** | Of all real cases of each disease, how many were caught | Nothing below 70%. A class below that needs more images, not more training. |
| **ECE (calibration)** | Whether the confidence number is trustworthy | Below 0.10. Above that, the model is overconfident and your escalation threshold will not fire when it should. |
| ~~Plain accuracy alone~~ | Misleading | If 60% of your images are healthy, a model that always says "healthy" scores 60% and is worthless. This is why we select on macro-F1. |

### **Why calibration is a product requirement, not a nicety**

FR-18 in the BRD says low-confidence diagnoses get flagged for human review. That rule is only as good as the confidence number. Research on plant disease models under field conditions found not just accuracy collapse but **miscalibration and selective-prediction failure** — the models stayed confident while becoming wrong, which is the worst possible combination for an escalation rule.

The script measures ECE for you. If it exceeds 0.10, apply **temperature scaling**: find a single number T that, when you divide the model's outputs by it, makes the confidences honest on your validation set. It is a dozen lines of code and it is the difference between an escalation threshold that works and one that is decorative.

### **Choosing the escalation threshold**

Once calibration is fixed, pick the threshold from data rather than intuition:

1. Sort validation cases by confidence
2. For each candidate threshold, compute: accuracy on cases above it, and what percentage of cases fall below it
3. Choose the threshold where accuracy above it exceeds about 90%, and accept whatever escalation rate that implies

If that means escalating 25% of cases to field workers, that is a real operational number BRAC needs to plan staffing around. Better to know it now than after launch.

## **From trained model to working app**

```
train.py  →  fasol_doctor.onnx  →  quantise to int8  →  Android app
             (~16 MB float32)      (~4-6 MB)            (offline, <1s)
```

**ONNX** is the handover format. The script produces it automatically, along with `classes.json`.

**Give your Android developer exactly three things:** the model file, `classes.json`, and the preprocessing specification — image size 224×224, RGB, normalised with mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.

**That last part is the most common integration bug in the entire field.** If the app resizes or normalises differently from training, accuracy quietly collapses and everyone blames the model. Test it: run the same ten images through the Python script and through the app, and confirm the numbers match to two decimal places before you believe anything the app tells you.

**Quantisation** converts the weights from 32-bit to 8-bit, cutting the file to roughly a quarter with typically a 1–2 point accuracy cost. Measure that cost on your test set rather than assuming it.

The BRD's requirement of a result within five seconds on-device is not a risk. A quantised MobileNetV3 classifies an image on a mid-range Android phone in well under a second.

## **Building the multi-image engine on top**

The detection engine in the product document needs **no additional model training.** It is ordinary logic wrapped around the same classifier.

**1. Run the classifier on each image separately.** You get a probability list per image.

**2. Combine them.** Start by averaging the probability lists — simple, surprisingly effective, and easy to debug. Research on aggregating multiple leaf images into one decision consistently outperforms single-image classification, and ensemble approaches have shown double-digit improvements over individual models.

**3. Decide what to ask for next** using a lookup table, not machine learning. Read the top two candidates and ask the question that separates them:

| Top two candidates | Next request |
| ----- | ----- |
| Bacterial leaf blight ↔ brown spot | Close-up of the lesion margin |
| Any disease ↔ nutrient deficiency | Whole plant, plus a healthy-looking plant |
| Any disease ↔ pest damage | Underside of the leaf, and the stem base |
| Confident but severity unknown | Three to five separate plants |

**4. Compute incidence** by counting how many of the sampled plants came back diseased. No model needed — it is division.

**5. Stop** when the top candidate exceeds your confidence threshold, or after three additional requests, whichever comes first.

You can build all of this before the model is even finished, using a stub that returns fake probabilities. Recommended — it decouples the app work from the training work entirely.

## **A realistic timeline**

| Phase | Duration | What happens | Who |
| ----- | ----- | ----- | ----- |
| **0. Prove it** | 1 day | Teachable Machine on downloaded data. Working demo, honest sense of which diseases are hard. | Designer alone |
| **1. Set up** | 2 days | Kaggle account, local environment, `verify_gpu.py` passing, all datasets downloaded and deduplicated | Designer plus anyone technical |
| **2. Stage 1 baseline** | 3 days | Train on public data. Compare MobileNetV3 and EfficientNet-B0. Read the confusion matrix. | Same |
| **3. Field collection** | 3–6 weeks | 150–300 images per class, agronomist-verified, following the capture protocol. **This is the long pole and the one that determines success.** | Field workers plus agronomist |
| **4. Stage 2** | 1 week | Fine-tune on field data. Calibrate. Set the escalation threshold. | Same |
| **5. Export and integrate** | 1 week | ONNX, quantise, verify the app matches Python exactly | Plus Android developer |
| **6. Retrain cycle** | Ongoing | Every few months with newly confirmed field cases from the outcome loop | Same |

Note the shape of it: the training itself takes hours. The **data collection takes weeks**. Plan and staff accordingly — this is a field logistics project with a small machine learning component, not the other way round.

## **Mistakes that will cost you a week**

- [ ] **Test set contains dataset images instead of field images.** Your score is then meaningless for Bangladesh.
- [ ] **Duplicates across the train/test boundary.** Deduplicate by hash before splitting. Always.
- [ ] **Augmented copies split across piles.** Same leaf on both sides of the exam.
- [ ] **No not-a-rice-leaf class.** The model will confidently diagnose a photograph of a goat.
- [ ] **Trusting plain accuracy.** Read macro-F1 and per-class recall.
- [ ] **Skipping calibration.** Your entire escalation feature depends on it.
- [ ] **App preprocessing differs from training preprocessing.** Verify numerically, do not assume.
- [ ] **Looking at the test set repeatedly.** Each look makes the number less honest.
- [ ] **Labels never checked by an agronomist.** Garbage labels produce a confidently wrong model.
- [ ] **Wrong PyTorch wheel on the 5070.** Run `verify_gpu.py` first, every time you rebuild the environment.
- [ ] **Comparing your numbers to published papers.** Those are lab conditions. Compare only against your own field test set.
- [ ] **Using an AGPL-licensed library in the shipping product** without a legal review.

## **What to hand over, and to whom**

**From the training work:**
`best.pt` (checkpoint for future retraining) · `fasol_doctor.onnx` (for the app) · `classes.json` (class order) · `metrics.json` (all scores) · the preprocessing specification · the dataset with its splits recorded

**To the Android developer:** the ONNX file, `classes.json`, the preprocessing spec, and the numerical verification test described in Section 10.

**To BRAC's programme team:** per-class recall, the confusion matrix, the chosen escalation threshold and the resulting escalation rate — because that rate is a staffing requirement, not a technical detail.

**For the hackathon judges:** the test-set numbers with a clear statement that they are field numbers, not lab numbers, and the confusion matrix. Presenting an honest 82% on real field photographs alongside a working escalation path is a far stronger position than presenting 99% from a public dataset. Anyone who knows this literature will recognise which one you have done.
