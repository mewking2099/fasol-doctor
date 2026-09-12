"""
Dataset download guide for Fasol Doctor.

This script prints exact download instructions for each approved dataset.
It does NOT auto-download — Kaggle requires a browser login, and Mendeley
requires accepting individual licences. Run each command manually.

Usage:
    python scripts/download_datasets.py
"""

import textwrap

DATASETS = [
    {
        "name": "Sethy et al. — Rice Leaf Disease Images",
        "licence": "CC BY 4.0",
        "size": "~5,932 images",
        "status": "APPROVED",
        "instructions": """
            1. Install Kaggle CLI: pip install kaggle
            2. Put your kaggle.json token in ~/.kaggle/kaggle.json (chmod 600)
            3. Run:
                mkdir -p raw_datasets/sethy
                kaggle datasets download -d minhhuy2810/rice-diseases-image-dataset -p raw_datasets/sethy --unzip
            4. Resulting folder structure should contain:
                Bacterial leaf blight/
                Brown spot/
                Leaf smut/   ← map this to leaf_blast (closest match; note in wiki)
        """,
        "note": "3 classes in this dataset. 'Leaf smut' is included as a leaf_blast proxy "
                "because no dedicated blast images exist here — acceptable for Stage 1.",
    },
    {
        "name": "RiceyLeafDisease (Kaggle)",
        "licence": "CC BY 4.0",
        "size": "~1,701 originals (skip pre-augmented copies)",
        "status": "APPROVED",
        "instructions": """
            1. Run:
                mkdir -p raw_datasets/riceyleaf
                kaggle datasets download -d vbookshelf/rice-leaf-diseases -p raw_datasets/riceyleaf --unzip
            2. Inside the unzipped folder, use ONLY the 'original' subfolder if present.
               Skip folders named 'augmented', 'flipped', etc. — they are near-duplicates
               that will inflate validation accuracy artificially.
               prepare_data.py's MD5 deduplication catches most of these, but skip
               them manually if the folder names make them obvious.
        """,
        "note": None,
    },
    {
        "name": "RiceLeafBD — Bangladeshi Field Images",
        "licence": "Mendeley Data — verify before commercial use",
        "size": "~1,555 images",
        "status": "APPROVED (verify Mendeley licence)",
        "instructions": """
            1. Go to: https://data.mendeley.com/datasets/fwcj7stb8r/1
            2. Log in (free account) and accept the licence terms.
            3. Download the dataset ZIP manually.
            4. Unzip to: raw_datasets/riceleafbd/
            5. Verify folder structure contains class subfolders matching NAME_MAP in prepare_data.py.
        """,
        "note": "These are real Bangladeshi field photos — highest quality for Stage 1 "
                "and most representative of the app's target conditions.",
    },
    {
        "name": "BRRI Dataset",
        "licence": "PENDING — do NOT use until cleared",
        "size": "~2,753 images",
        "status": "BLOCKED — licence check required",
        "instructions": """
            1. Contact BRRI (Bangladesh Rice Research Institute) to verify distribution rights.
            2. The dataset may be available via Mendeley; check for a data use agreement.
            3. Do NOT include in any training run until you have written confirmation
               that the licence permits use in a commercial product (the Fasol Doctor app).
            4. Once cleared: update Project_Status.md datasets.approved list and remove
               from datasets.pending_licence_check. Then re-run prepare_data.py.
        """,
        "note": "Expert-annotated, high quality. Worth pursuing — but licence MUST be verified.",
    },
    {
        "name": "not_rice_leaf class — miscellaneous images",
        "licence": "Various (see sources below)",
        "size": "300–500 images needed",
        "status": "NOT YET COLLECTED — must be sourced",
        "instructions": """
            Option A — ImageNet validation set samples (non-plant categories):
                1. Download ILSVRC2012 validation set (requires ImageNet account).
                2. Pull 100-200 images from non-plant categories (vehicles, animals, food, hands).
                3. Place in raw_datasets/not_rice_leaf/

            Option B — PlantVillage non-rice images (CC BY-SA 3.0):
                kaggle datasets download -d emmarex/plantdisease -p raw_datasets/plantvillage --unzip
                Then filter for tomato, apple, or potato images — NOT rice.

            Option C — Field photos of soil, hands, sky, tools:
                Collect 50-100 photos during field photo collection sessions.
                Label as 'not_rice_leaf' — these are the most realistic negatives.

            Recommendation: combine all three for diversity. The model needs to see
            varied non-rice-leaf content to refuse confidently. Without this class,
            the model will confidently diagnose a photo of a hand or a goat.
        """,
        "note": "This class is NOT optional. See CLAUDE.md critical rules.",
    },
]


def main():
    print("=" * 65)
    print("Fasol Doctor — Dataset Download Guide")
    print("=" * 65)
    print()

    for ds in DATASETS:
        print(f"{'─' * 65}")
        print(f"  {ds['name']}")
        print(f"  Licence: {ds['licence']}")
        print(f"  Size:    {ds['size']}")
        print(f"  Status:  {ds['status']}")
        print()

        instructions = textwrap.dedent(ds["instructions"]).strip()
        for line in instructions.splitlines():
            print(f"    {line}")

        if ds["note"]:
            print()
            note_lines = textwrap.wrap(ds["note"], width=60)
            print(f"  NOTE: {note_lines[0]}")
            for line in note_lines[1:]:
                print(f"        {line}")

        print()

    print("=" * 65)
    print("After downloading, run:")
    print()
    print("  python scripts/prepare_data.py \\")
    print("    --datasets raw_datasets/riceleafbd raw_datasets/sethy raw_datasets/riceyleaf \\")
    print("    --out data/")
    print()
    print("This deduplicates, splits 70/15/15, and writes data/stage1/{train,val,test}/")
    print("=" * 65)


if __name__ == "__main__":
    main()
