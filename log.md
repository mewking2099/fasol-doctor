# Fasol Doctor — Session Log

## 2026-09-12 — Session 1 (setup)

- Project initialised at `software-projects/fasol-doctor/`
- Raw documents ingested: PRD + training guide
- Scripts written: `train.py`, `prepare_data.py`, `verify_gpu.py`, `calibrate.py`, `download_datasets.py`
- `requirements.txt` and `.gitignore` added
- Datasets confirmed: RiceLeafBD, Sethy, RiceyLeafDisease approved; BRRI pending licence check
- Git repo initialised, initial commit `acb4d41`
- Next: run `python scripts/download_datasets.py` for instructions, download datasets, run `prepare_data.py`, begin Stage 1 training

- **2026-09-12 04:11** — auto-wrap: modified log.md [auto-wrap]

## 2026-09-12 — Session 3 (Phase 0 app scaffold)

- MewKing plan written: `proposals/active/app-build/plan.md` — 6 phases, full market-launch scope
- ONNX integration brief written: `proposals/active/app-build/onnx-integration-brief.md` — shareable with Android developer
- App scaffold complete at `app/` — Vite 8 + React 18 + TypeScript + Tailwind v4 + Capacitor 6
- Dependencies installed: `react-router-dom`, `onnxruntime-web`, `@supabase/supabase-js`, `idb`, `vite-plugin-pwa`, all Capacitor plugins
- Self-hosted Noto Sans Bengali (400 + 700 weights, Bengali unicode range) — no CDN dependency
- Zero TypeScript errors confirmed (`tsc --noEmit` clean)
- Dev server confirmed working at localhost:5173 (HTTP 200, `lang="bn"` verified)
- All 15 screens created as working stubs: S1–S7, CG, F0, F1, F1r, F5, T1, SV1
- Session context, router, inference module, audio module, storage module, Supabase client all wired
- `fasol_doctor.onnx` (16 MB) + `classes.json` copied into `app/public/model/` — inference ready
- Phase 0 definition of done: fully met
- Next: Phase 1 — build out S1 home screen to full production quality, then progress through S2→S7

- **2026-09-12 04:14** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 04:20** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 04:21** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 04:24** — auto-wrap: modified fasol_doctor_train.ipynb [auto-wrap]

- **2026-09-12 04:48** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 04:50** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 05:02** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 05:12** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 06:52** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 06:53** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 07:03** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 07:04** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 07:48** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 07:49** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 08:02** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 08:13** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 08:15** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 08:16** — auto-wrap: modified kaggle_cell2_fix.md [auto-wrap]

- **2026-09-12 08:19** — auto-wrap: modified kaggle_cell2_fix.py [auto-wrap]

- **2026-09-12 08:34** — auto-wrap: modified kaggle_cell2_paths.py, kaggle_cell3_namemap.py, kaggle_cell4_notrice.py +1 more [auto-wrap]

- **2026-09-12 08:36** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 09:06** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 09:24** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 09:25** — auto-wrap: modified kaggle_cell9_onnx.py [auto-wrap]

- **2026-09-12 09:26** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 09:28** — auto-wrap: session ended [auto-wrap]

## 2026-09-12 — Session 2 (Stage 1 training complete)

- Trained Stage 1 on Kaggle T4 GPU
- Datasets used: RiceLeafBD 1,560 BD field images + Nirmal/Sethy 5,932 + vbookshelf 120 + PlantVillage not_rice_leaf 500
- Total unique images after MD5 dedup: 11,639
- Results: macro-F1 0.9916, ECE 0.0433 (calibration not needed)
- Per-class F1: blight 0.987, brown_spot 0.989, leaf_blast 1.000 (37 val samples — unreliable), tungro 0.997, healthy 0.987, not_rice_leaf 0.990
- Artifacts saved: `runs/stage1/best.pt` (16 MB), `runs/stage1/fasol_doctor.onnx` (16 MB unquantised)
- Val F1 is on public dataset distribution — real-field accuracy will be lower, assessed at Stage 2
- Next: wait for BRAC field photos → Stage 2 fine-tuning → quantise to ~4-6 MB → mobile handover

- **2026-09-12 10:02** — auto-wrap: modified Project_Status.md, log.md [auto-wrap]

- **2026-09-12 10:06** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 10:07** — auto-wrap: modified quantise.py, kaggle_cell11_quantise.py [auto-wrap]

- **2026-09-12 10:16** — auto-wrap: modified kaggle_cell11_quantise_v2.py [auto-wrap]

- **2026-09-12 10:18** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 10:20** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 10:21** — auto-wrap: modified demo.py, kaggle_cell12_samples.py [auto-wrap]

- **2026-09-12 10:24** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 10:30** — auto-wrap: modified app.py [auto-wrap]

- **2026-09-12 10:42** — auto-wrap: modified app.py [auto-wrap]

- **2026-09-12 14:18** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 14:22** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 14:22** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 14:23** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 15:08** — auto-wrap: modified vite.config.ts, index.html, index.css +30 more [auto-wrap]

- **2026-09-12 15:21** — auto-wrap: modified index.css, S1Home.tsx, S2CropSelect.tsx +13 more [auto-wrap]

- **2026-09-12 15:28** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 16:31** — auto-wrap: modified index.html [auto-wrap]

- **2026-09-12 16:35** — auto-wrap: modified index.html [auto-wrap]

- **2026-09-12 16:39** — auto-wrap: modified index.html [auto-wrap]

- **2026-09-12 16:43** — auto-wrap: modified index.html [auto-wrap]

- **2026-09-12 16:45** — auto-wrap: modified index.html [auto-wrap]

- **2026-09-12 16:52** — auto-wrap: modified index.ts, diseaseMeta.ts, SessionContext.tsx +8 more [auto-wrap]

- **2026-09-12 16:53** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 16:55** — auto-wrap: modified CGCamera.tsx [auto-wrap]

- **2026-09-12 16:59** — auto-wrap: modified vite.config.ts, inference.ts [auto-wrap]

- **2026-09-12 17:00** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:04** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:05** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:07** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:08** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:12** — auto-wrap: modified CGCamera.tsx, storage.ts [auto-wrap]

- **2026-09-12 17:13** — auto-wrap: modified AndroidManifest.xml [auto-wrap]

- **2026-09-12 17:16** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:29** — auto-wrap: modified diseaseMeta.ts, S6ResultAction.tsx, DS1DiseaseDetail.tsx +3 more [auto-wrap]

- **2026-09-12 17:33** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:42** — auto-wrap: modified index.html, index.css, S1Home.tsx +7 more [auto-wrap]

- **2026-09-12 17:44** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:45** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:50** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:53** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 17:58** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 18:00** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 18:05** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 18:06** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 18:07** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 18:27** — auto-wrap: modified scanHistory.ts, ThemeContext.tsx, BottomNav.tsx +10 more [auto-wrap]

- **2026-09-12 19:16** — auto-wrap: modified KD1KrishiDirectory.tsx, useWeather.ts, S1Home.tsx [auto-wrap]

- **2026-09-12 19:17** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 19:29** — auto-wrap: modified CGCamera.tsx, GalleryScreen.tsx [auto-wrap]

- **2026-09-12 19:30** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 19:30** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 19:48** — auto-wrap: modified index.css, S1Home.tsx, S6ResultAction.tsx +6 more [auto-wrap]

- **2026-09-12 20:20** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 20:21** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 20:25** — auto-wrap: modified ic_launcher_background.xml, styles.xml [auto-wrap]

- **2026-09-12 20:34** — auto-wrap: session ended [auto-wrap]

- **2026-09-12 20:36** — auto-wrap: session ended [auto-wrap]
