---
proposal: fasol-doctor-app-build
tier: mewking
status: approved
plan_approved: true
created: 2026-09-12
author: mohabbat
---

# Fasol Doctor — Market-Ready Android App
## MewKing Plan v1.0

**Goal:** Build a production-grade, Play Store-ready Android app that a Bangladeshi farmer with no literacy can use to diagnose rice crop disease using voice-first Bangla UI, offline AI inference, and optional expert consultation.

**Tech stack:** React 18 + Vite + TypeScript + Tailwind + Capacitor 6 → real APK
**Backend:** Supabase (PostgreSQL + Storage) — used only for expert queue
**Distribution:** Google Play Store (primary) + PWA install (secondary)
**Language:** Bangla UI, audio-first

---

## §1 Non-negotiables (market launch blockers — not this plan's scope)

These are listed so we don't forget them. The plan doesn't code these — they need real-world action.

| Blocker | Owner | ETA |
|---|---|---|
| Agronomist to write + approve disease content (6 sections × 4 diseases) | Mohabbat → recruit | Before Phase 5 |
| 150–300 field photos per class, verified | BRAC field workers | 3–6 weeks |
| Stage 2 model training on Kaggle | Mohabbat | After field photos |
| Expert queue staff (to answer Ask-an-Expert within 24h) | Mohabbat → recruit | Before Phase 3 launch |
| BRRI dataset licence verification | Mohabbat | Before commercial use |
| Google Play developer account ($25 one-time) | Mohabbat | Before Phase 6 |
| Legal review for medical/agronomic advice liability | Mohabbat → lawyer | Before Phase 6 |

---

## §2 Tech Architecture

### 2.1 Repository structure

```
fasol-doctor/
  app/                        # React + Vite + Capacitor
    src/
      screens/                # S1–S7 + CG + F0–F5 + T1 + SV1
      components/             # UI atoms (Button, Card, AudioPlayer, CameraView)
      hooks/                  # useAudio, useInference, useOfflineQueue
      lib/
        inference.ts          # ONNX Runtime Web wrapper
        audio.ts              # Audio player + preload
        supabase.ts           # Supabase client (Ask-an-Expert only)
        storage.ts            # IndexedDB via idb
      assets/
        audio/                # Bangla .mp3 files (generated at build time)
        fonts/                # Noto Sans Bengali (self-hosted — NO CDN, offline)
        model/                # fasol_doctor.onnx + classes.json
      types/
        index.ts
      router.tsx              # React Router v6 — screen routing
      main.tsx
    public/
      sw.js                   # Workbox service worker (precache all assets)
    capacitor.config.ts
    vite.config.ts
    tailwind.config.ts
    index.html
  android/                    # Capacitor auto-generated (do not hand-edit)
  scripts/                    # ML pipeline (existing)
  runs/                       # ML artefacts (existing)
  proposals/                  # Plans
  raw/                        # SoT v1.2 PRD (immutable)
  log.md
  Project_Status.md
```

### 2.2 Screen map (from SoT v1.2)

| Screen ID | Name | Key interaction |
|---|---|---|
| S1 | Home | 4 buttons + weekly tip |
| S2 | Crop select | Tile grid (rice, potato, maize) |
| S2b | Location | Field vs homestead |
| S3 | Plant part | Leaf / stem / fruit / root / whole |
| S4 | Symptom | 7 symptom tiles |
| S5 | Candidates | 2–3 disease cards + escape button |
| S6 | Confirmation gate | Full-width photo + yes/no |
| S7 | Report | 7 accordion sections |
| CG | Camera guide | Real-time quality prompts |
| F0 | Ask intro | Explainer |
| F1 | Photo capture | 1–2 photos |
| F1r | Photo review | Retake / use |
| F5 | Submission confirm | Promise of 24h answer |
| T1 | Tips | Monthly agri tips |
| SV1 | Saved reports | User's saved diagnoses |

### 2.3 Inference pipeline (on-device)

```
Camera/Gallery → Capacitor Camera API
  → ImageData → resize to 224×224
  → Normalize (ImageNet mean/std)
  → ONNX Runtime Web (WebAssembly backend)
  → Softmax → top prediction + confidence
  → Confidence < 0.60 → "Unclear" → show escape path
  → Confidence ≥ 0.60 → candidate list
```

The ONNX model runs entirely in WebAssembly. No network call for inference.

### 2.4 Data model (IndexedDB, offline-first)

```typescript
interface Session {
  id: string;                    // uuid
  crop: 'rice' | 'potato' | 'maize';
  location: 'field' | 'homestead';
  part: string;
  symptom: string;
  confirmed_disease: string | null;
  confidence: number;
  timestamp: number;
  saved: boolean;
}

interface Submission {           // Ask-an-Expert
  id: string;
  session_id: string;
  photo_uris: string[];          // local storage paths
  status: 'queued' | 'uploading' | 'submitted' | 'answered';
  answer?: string;
  created_at: number;
}
```

### 2.5 Supabase schema (Ask-an-Expert only)

```sql
-- submissions table (anon insert, no select for anon)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  photo_urls text[] not null,
  crop text,
  symptom_path jsonb,       -- {part, symptom, candidates}
  status text default 'pending',
  expert_answer text,
  created_at timestamptz default now()
);

-- RLS
alter table submissions enable row level security;
create policy "anon insert only"
  on submissions for insert to anon using (true);
```

Storage: `submission-media` bucket, anon upload allowed, no anon download.

### 2.6 Audio system

- All audio keys defined in `audio-clips.csv` (79 clips)
- `.mp3` files generated at build time via `generate-audio.ts` (TTS provider TBD: Google Cloud TTS or ElevenLabs Bangla)
- Bundled with app — no runtime TTS calls
- `useAudio` hook: auto-plays on screen mount, manual replay button
- Tier: `navigation` clips always bundled; `content` clips (disease descriptions) loaded lazily
- `safety_critical` tier: displayed as text AND audio, never audio-only

### 2.7 Offline strategy (Workbox)

Precached on install:
- All JS/CSS/HTML bundles
- `fasol_doctor.onnx` + `classes.json`
- All `navigation` tier audio clips
- All screen components
- Noto Sans Bengali font files

Not precached (network-first with offline fallback):
- `content` + `safety_critical` audio (large; load on disease unlock)
- Weekly tips (stale-while-revalidate, 7-day cache)

Offline indicator: `common.offline` audio + banner on S1

---

## §3 Phase Plan

### Phase 0 — Scaffold (1 week)

**Definition of done:**
- [ ] `npm create vite@latest app -- --template react-ts` initialised
- [ ] Tailwind v3 configured, Noto Sans Bengali self-hosted via `@font-face` in CSS
- [ ] React Router v6 configured with all screen routes (S1–SV1) as stubs
- [ ] Capacitor 6 initialised, Android platform added (`npx cap add android`)
- [ ] `capacitor.config.ts` — appId: `io.fasol.doctor`, appName: `Fasol Doctor`
- [ ] ONNX Runtime Web installed (`onnxruntime-web`), stub `inference.ts` with a console.log test
- [ ] Supabase client installed (`@supabase/supabase-js`), env vars set up (`.env.local`)
- [ ] Workbox `vite-plugin-pwa` installed, basic manifest written
- [ ] `npm run dev` runs without errors; stub S1 screen renders in browser
- [ ] `npx cap sync android` runs without errors
- [ ] `npx cap open android` opens Android Studio without errors
- [ ] Commit: `feat(scaffold): phase 0 — vite + react + capacitor + onnx runtime`

**Files created this phase:**
`app/src/router.tsx`, `app/src/main.tsx`, `app/src/screens/S1Home.tsx` (stub),
`app/src/lib/inference.ts` (stub), `app/src/lib/supabase.ts` (stub),
`app/capacitor.config.ts`, `app/vite.config.ts`, `app/tailwind.config.ts`

---

### Phase 1 — Core navigation flow (2 weeks)

**Definition of done:**
- [ ] S1 → S2 → S2b → S3 → S4 → S5 → S6 → S7 full click-through works
- [ ] All `navigation` tier audio clips play automatically on screen mount
- [ ] Bangla text renders correctly (Noto Sans Bengali, no system font fallback)
- [ ] Session state held in React context + persisted to IndexedDB via `idb`
- [ ] Back navigation works on all screens (physical back button + nav.back audio)
- [ ] Escape path (S3/S4/S5 → "এর কোনোটাই নয়") routes to F0
- [ ] Confirmation gate (S6): yes → S7, no → S5 (next candidate), no candidates left → F0
- [ ] S7 report: all 7 sections render with placeholder content (real content Phase 5)
- [ ] `common.wait` spinner shown during any async operation > 300ms
- [ ] `common.offline` banner visible on S1 when navigator.onLine = false
- [ ] Responsive: works at 360×800 (target device) and 393×852 (iPhone 15 for testing)
- [ ] Commit: `feat(screens): phase 1 — core S1–S7 navigation + audio`

**Key components built:**
`AudioButton`, `TileGrid`, `ConfirmationGate`, `ReportSection`, `OfflineBanner`, `Spinner`

---

### Phase 2 — Camera + AI inference (2 weeks)

**Definition of done:**
- [ ] `Capacitor Camera` plugin opens native camera on Android
- [ ] Camera guide screen (CG) shows real-time quality prompts (too dark, blurry, too bright, move closer/back, centre, one leaf)
- [ ] Photo review (F1r) shows captured image + retake/use buttons
- [ ] `inference.ts` loads `fasol_doctor.onnx` from app bundle once at startup
- [ ] Inference runs in < 3 seconds on mid-range Android (Samsung A-series, 2022)
- [ ] Output: ranked candidate list passed to S5
- [ ] Confidence < 0.60 → `candidates.broad` audio + escape shown
- [ ] Confidence ≥ 0.60, exact match → direct to S5 with top 2-3 candidates
- [ ] `not_rice_leaf` class → redirect immediately to CG with `cam_one_leaf` audio
- [ ] Model loaded from `/assets/model/fasol_doctor.onnx` (Workbox precached)
- [ ] Commit: `feat(inference): phase 2 — camera + ONNX inference pipeline`

**Key work:**
- Implement `useInference` hook with ONNX Runtime Web
- Implement `useCameraQuality` hook (brightness, blur detection via canvas pixel analysis)
- Wire camera capture → preprocessing → inference → route to S5

---

### Phase 3 — Ask-an-expert (1 week)

**Definition of done:**
- [ ] F0 → F1 → F1r → F5 full flow works
- [ ] Photo(s) stored to Capacitor Filesystem (`Directory.Data`) before upload attempt
- [ ] Online: upload to Supabase `submission-media` bucket, insert row to `submissions` table
- [ ] Offline: submission queued in IndexedDB, retried on next online event
- [ ] `ask.promise` audio plays on F5 confirming 24h answer
- [ ] Submission status visible in SV1 (saved reports screen)
- [ ] No PII collected — no device ID, no phone number, no name
- [ ] Commit: `feat(ask-expert): phase 3 — photo submission + offline queue`

---

### Phase 4 — Offline hardening + PWA (1 week)

**Definition of done:**
- [ ] Workbox service worker precaches all navigation-tier audio, model, fonts, bundles
- [ ] App installs as PWA on Android Chrome (manifest: icons, name, theme_color, display: standalone)
- [ ] Capacitor APK works fully offline (no network call for inference or navigation)
- [ ] `content` tier audio (disease descriptions) cached on first S7 view
- [ ] App shell loads in < 2s on 3G (Lighthouse PWA score ≥ 85)
- [ ] Noto Sans Bengali loads from bundle — zero Google Fonts network calls
- [ ] `common.save_report` saves Session to IndexedDB; SV1 lists saved sessions
- [ ] Commit: `feat(offline): phase 4 — workbox precache + PWA manifest + save report`

---

### Phase 5 — Disease content + agronomist review (3 weeks)

**Blocked on:** agronomist engagement (see §1)

**Definition of done:**
- [ ] All 4 disease × 7 sections content written and agronomist-approved
- [ ] All `content` + `safety_critical` audio clips generated via TTS pipeline
- [ ] Audio clips placed at correct paths per `audio-clips.csv`
- [ ] S7 report renders real content for all 4 diseases (what, spread, immediate, nonchem, chem, safety, related tips)
- [ ] Safety-critical content (chemical doses) shows text + audio + disclaimer (`chem.phi`)
- [ ] `chem.unverified` overlay shown until agronomist approves each chemical entry
- [ ] Weekly tips (T1 screen) populated with 4 tips (one per month, rotates)
- [ ] Stage 2 ONNX model swapped in (when ready from ML pipeline)
- [ ] Commit: `feat(content): phase 5 — agronomist-reviewed disease content + audio`

---

### Phase 6 — Play Store launch (2 weeks)

**Blocked on:** Play developer account, legal review, agronomist sign-off

**Definition of done:**
- [ ] `android/app/build.gradle` — versionCode, versionName, applicationId set
- [ ] Release keystore generated, stored securely (NOT in repo)
- [ ] APK signed with release keystore, tested on 3 physical devices
- [ ] Google Play listing: app name, description (Bangla + English), screenshots, feature graphic
- [ ] Privacy policy published (no PII collected, explicit)
- [ ] Content rating: Agriculture / General audience
- [ ] App bundle (`.aab`) uploaded to Play Console — Internal testing track first
- [ ] Internal test (5 farmers, 5 agronomists): pass rate ≥ 80% correct diagnosis
- [ ] Production release to Bangladesh (geographic restriction initially)
- [ ] Commit: `feat(release): phase 6 — signed APK + Play Store submission`

---

## §4 Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Agronomist unavailable/slow | High | Critical | Start recruiting now; Phase 5 blocks on this |
| Stage 2 model accuracy < 75% in field | Medium | High | Fallback to Ask-an-Expert for all diagnoses until Stage 3 |
| Supabase free tier limits hit | Low | Medium | Upgrade to Pro ($25/mo) — expert queue volume will be low initially |
| ONNX Runtime Web too slow on low-end devices | Medium | High | Test on Samsung A13 (2021, 3GB RAM); fallback: server-side inference |
| Play Store rejection (agricultural advice) | Low | High | Frame as "educational tool" not "medical advice"; disclaimer on every diagnosis |
| Audio TTS quality issues (Bangla) | Medium | Medium | Manual QA every clip; allow agronomist to re-record |

---

## §5 Success criteria (for market launch)

| Metric | Target |
|---|---|
| On-device inference latency | < 3 seconds on Samsung A13 |
| Diagnostic accuracy (Stage 2, field photos) | ≥ 75% top-1 on held-out field test set |
| App bundle size (APK) | < 50 MB including model |
| Offline functionality | 100% core flow (S1–S7) works without network |
| Audio coverage | 100% of `in_demo: yes` clips generated and tested |
| Agronomist approval | All 4 disease × 7 sections signed off before launch |
| Play Store rating | ≥ 4.0 after first 50 reviews |

---

## §6 Immediate next steps (Phase 0 — start now)

1. Run `npm create vite@latest app -- --template react-ts` inside `fasol-doctor/`
2. Install dependencies: `tailwindcss`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/camera`, `@capacitor/filesystem`, `onnxruntime-web`, `@supabase/supabase-js`, `react-router-dom`, `idb`, `vite-plugin-pwa`
3. Self-host Noto Sans Bengali — download from Google Fonts, place in `app/src/assets/fonts/`
4. Set up Tailwind with Bangla font as default sans
5. Create all screen stub components (one file each, returns `<div>Screen: S1</div>`)
6. Wire React Router with all routes
7. Add ONNX Runtime Web + test load of `fasol_doctor.onnx` from `public/` folder
8. Initialise Capacitor, add Android platform, verify `npx cap sync` runs clean

**Do not start Phase 1 until user confirms Phase 0 definition of done is met.**
