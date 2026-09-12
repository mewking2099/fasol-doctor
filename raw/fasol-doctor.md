Fasol Doctor is a proposed crop diagnosis and treatment guidance platform that helps smallholder farmers identify what is wrong with a crop early enough to act on it, and receive treatment guidance they can actually carry out. Each farmer or field worker creates a profile and describes a problem by photo, voice, or guided taps in Bangla. The platform gathers evidence across multiple images, returns a likely diagnosis, explains what it saw, states how confident it is, and converts that into a treatment plan tied to locally available inputs and the remaining window to act. Where it is not confident, it hands the case to a named human being.

BRAC's Agriculture Programme would serve as the first pilot channel. The pilot would test whether Fasol Doctor shortens the time between noticing a problem and acting correctly on it, whether farmers trust and repeat the interaction, and whether field workers can operate it on behalf of low-tech-literacy farmers. Findings would guide expansion to more crops, districts, and eventually other markets and institutional partners.

## **The central Fasol Doctor mental model**

NOTICE
Something is wrong with the crop
       ↓

CAPTURE
Show it or describe it
       ↓

GATHER  ⟲
Show me one more thing — the engine asks for what it still needs
       ↓

DIAGNOSE
What is this, most likely, and how widespread?
       ↓

UNDERSTAND
Why does the system think so, and how sure is it?
       ↓

ACT
What do I do, with what, by when?
       ↓

VERIFY
Did it work?

Two loops matter. **GATHER** loops back on itself — a diagnosis is assembled from several pieces of evidence, not decided by one photo. **VERIFY** feeds the whole system, and it is the step most crop diagnosis tools drop. Without it there is no learning signal, no impact evidence, and no honest answer to how the product improves after launch.

## **The core workflow would be**

| Stage | What Fasol Doctor does | Value to the farmer / to BRAC |
| ----- | ----- | ----- |
| **1. Profile & Field Context** | Captures district and union, and — asked one question at a time, only when it changes the answer — crop, rough sowing time, and rough field size. Supports multiple farmer profiles on one handset. | Turns a generic image classifier into a locally grounded diagnosis. Growth stage alone eliminates whole groups of candidate diseases, and field size turns a dosage rate into a quantity to buy. |
| **2. Guided Capture** | Coaches the photo before it is taken — distance, angle, one affected leaf, plain background, avoid direct glare — and rejects or re-requests unusable images. | The single highest-leverage accuracy lever in the whole system, and the one entirely under design control rather than model control. |
| **3. Multi-Image Detection Engine** | Treats each image as evidence rather than a verdict. Holds a live ranking of candidates and requests whichever next image would most reduce its uncertainty — a lesion close-up, a whole plant, a neighbouring plant, a wide field shot. | Higher accuracy where it matters most: separating visually similar diseases. Also yields an incidence estimate, which is what actually determines urgency. |
| **4. Symptom Conversation** | Asks in Bangla for what the camera cannot see: where on the plant, how fast it spread, smell, texture, whether neighbouring fields show it, recent weather and irrigation. | Captures the evidence that separates visually similar diseases, and works for farmers who cannot get a usable photo at all. |
| **5. Diagnosis** | Returns a ranked shortlist of likely diagnoses rather than a single confident label, each with a confidence indicator and an incidence estimate. | A ranked list is honest and still actionable. A single wrong label given confidently is how a tool loses a farmer permanently. |
| **6. Evidence & Explanation** | Shows what the system observed — lesion shape, colour, position, spread pattern — and which of those pointed to the diagnosis. | Explanation is what converts a black-box output into something a farmer or field worker can agree or disagree with. |
| **7. Escalation Ladder** | Where confidence is low, or the image falls outside known classes, says so plainly and routes to a real person: BRAC field worker, then the local DAE office, then the national agriculture call centre. | Protects trust. Also protects BRAC from being the source of a bad chemical recommendation. |
| **8. Treatment Plan** | Step-by-step actions using locally available inputs, ordered by cost and effectiveness, with non-chemical and preventive options ranked alongside chemical ones, including dosage and safety notes. | Directly counters the over-prescription incentive of local input sellers. |
| **9. Action Window** | States urgency and the remaining window — act today, this week, or monitor — informed by incidence, and explains what happens if the farmer waits. | Converts a diagnosis into a decision with a deadline, which is what actually changes behaviour. |
| **10. Follow-up & Outcome** | Reminds the farmer after the expected treatment interval and asks whether the problem resolved, improved, or worsened. | Creates the outcome signal that no image dataset contains. |
| **11. Outcome Evidence** | Shows the farmer how the same advice performed for others nearby — resolution rates and before/after photos from consented, confirmed cases. | Demonstrable results are among the strongest drivers of perceived usefulness for agricultural advisory apps. This is a trust feature, not marketing. |
| **12. Neighbour Outbreak Alerts** | Tells a farmer when the same problem has been confirmed on nearby fields recently, and warns of it before they notice symptoms themselves. | Turns the aggregate data layer into a direct farmer benefit rather than something extracted from them. Also the earliest possible intervention point. |
| **13. Learning Loop** | Feeds confirmed outcomes back into treatment ranking and model retraining, and aggregates anonymised cases into regional disease trends. | Makes recommendations progressively more locally accurate, and produces the outbreak signal that institutional partners will pay for. |

### **1. Three onboarding paths**

Unlike a single-audience tool, Fasol Doctor has three genuinely different entry points, and conflating them is the fastest way to build the wrong interface.

| Profile type | Designed for | Example |
| ----- | ----- | ----- |
| **Farmer Profile** | Smallholder and marginal farmers using the app or SMS directly, often low-literacy, often on a shared or borrowed handset | A farmer in Sirajganj with 0.4 hectares of Boro rice |
| **Field Worker Profile** | BRAC community agriculture workers running diagnoses on behalf of farmers during home and field visits | A community agriculture worker covering 60 households |
| **Institution Profile** | BRAC programme staff, government bodies, MFIs, and research partners consuming aggregated regional data | BRAC Agriculture Programme regional coordinator |

A farmer must never be asked to understand that these tiers exist. The field worker profile is the one that carries the farmer's identity on their behalf, and every diagnosis run in assisted mode must attach to the farmer's own record, not the worker's.

### **2. One handset, several farmers**

Handset ownership is not the same as farming. A meaningful share of users will be operating on a son's, neighbour's, or shopkeeper's phone, and a single-account app quietly excludes exactly the farmers the product exists for — disproportionately older farmers and women.

The app therefore supports **multiple farmer profiles on one device**, as a first-class concept rather than an account-switching afterthought:

| Requirement | Design implication |
| ----- | ----- |
| Fast, low-friction switching | Profile chooser on launch when more than one profile exists — photo and name, large tap targets, spoken aloud. No password. |
| Correct attribution | Every diagnosis, field record, and outcome attaches to the farmer it concerns, never to the handset owner. |
| Independent history | Each profile has its own field records, active problems, follow-ups, and alert radius. |
| Independent notification | Follow-up reminders name the farmer they are for, because the handset owner may not be that person. |
| Consent per profile | Data sharing consent is held per farmer, not per device. A phone owner cannot consent on someone else's behalf. |
| Graceful handover | A profile can later be moved to the farmer's own handset without losing history. |

Do not require the handset owner to be a registered farmer at all. "I am helping someone else" is a legitimate first-run answer.

## **Fasol Doctor Access Tiers**

### **Free — Diagnose**

**Find out what is wrong, and what to do about it.**
For every farmer, on every channel, permanently. Photo and voice diagnosis, multi-image verification, treatment guidance, crop history, follow-up reminders, neighbour alerts, and escalation to a human. This tier is never metered, never gated, and never influenced by a sponsor — the diagnosis is the product's integrity and cannot be a paid feature.

### **Assisted — Field Worker**

**Diagnose on behalf of the farmers you visit.**
For BRAC community agriculture workers and extension staff. Adds multi-farmer management, offline queueing with later sync, batch capture across a visit, override and correction of machine diagnoses, and a personal review queue of escalated cases including farmer voice notes.

### **Institutional — Monitor & Analyse**

**See what is spreading, where, and how fast.**
For BRAC programme teams, government bodies, MFIs, insurers, and researchers. Adds the regional trend dashboard, outbreak alerting, cohort and district comparison, anonymised structured exports, and API access. This is where monetisation sits — on top of the aggregate layer, never on the farmer's diagnosis.

## **Voice is the output layer, not the input layer**

The instinct to make the product voice-driven is correct. The mistake would be making voice the way farmers *enter* information.

**Why voice output is unambiguous.** Spoken feedback in the local language is well established as central to usability for low-literacy users in this context. Every piece of text in the app has an audio equivalent, and audio is not an accessibility afterthought — it is the primary presentation.

**Why open voice input is not ready.** Two independent constraints:

- Field research on voice systems for farmers found task success significantly higher for keypad selection than for speech input. Menu-based navigation was understood and used more reliably than speaking.
- Bangla dialect speech recognition is genuinely weak. The best dialect-aware Bangladeshi model reports roughly 74% word error rate across ten regional dialects — and it substantially outperforms the general-purpose baselines it was compared against. Generic Bengali models degrade far worse on strong regional dialects. A farmer describing a lesion in dialect, outdoors, in wind, will not be transcribed reliably.

But the distinction that saves the design: **constrained recognition is a much easier problem than open transcription.** Yes/no, one-of-four, digits, and a closed set of roughly thirty domain words is tractable where free dictation is not.

### **The four-layer interaction stack**

| Layer | Role | Notes |
| ----- | ----- | ----- |
| **1. Voice out — everything** | Primary output for all content | Auto-play on screen entry, speaker icon on every card, always-available repeat, adjustable speed. No text ever appears without audio. |
| **2. Tap on a photograph** | Primary input | The farmer picks the picture that most resembles their plant. Never a list of category names. |
| **3. Constrained voice in** | Equal alternative input | "Say yes or no." "Say one, two, or three." Explicit confirmation before acting on any recognised answer. |
| **4. Free voice note** | Fallback — routed, not parsed | Not transcribed for diagnosis. Attached to the case and delivered to a field worker. A failed recognition becomes a human handoff instead of a wrong answer. |

That fourth layer is the important one. It converts the weakest part of the technology stack into the strongest part of the service model.

### **Low-literacy design rules that follow from this**

- **No abstract category menus.** Less educated users have documented difficulty with categorical groupings, so "Fungal / Bacterial / Viral / Deficiency" is the wrong first screen. Photographs of symptoms are the right one.
- **No date entry.** Anchor time to seasons, festivals, and crop stages, or infer it from the field record.
- **No free numeric entry** beyond single digits and phone numbers.
- **Explicit confirmation for error recovery.** Every recognised or ambiguous input is read back before it is acted on.
- **One question per screen.** Never a form.
- **Icons must be validated, not assumed.** Test every symbol with farmers in the pilot districts before locking the set.
- **Audio is cached offline** alongside the model and treatment library, or the voice layer silently disappears exactly where it is needed most.

## **Field context matters, but the farmer never registers a field**

The quality of a diagnosis depends far more on what the system knows about the field than on the resolution of the photo. The same image, with and without context, produces a materially different differential.

But there is a trap here, and it is not a usability trap. **Land is a sensitive subject in a way that crops are not.** Tenancy and sharecropping are widespread, boundaries are often informal, and many farmers work land they do not own. An app that opens by asking someone to "register your land" can read as connected to taxation, subsidy eligibility, or land records. That is a trust problem no amount of good interface design repairs.

So Fasol Doctor keeps a field record internally, and never asks the farmer to create or manage one.

### **What the field record is for**

| What it enables | Why it earns its place |
| ----- | ----- |
| **Narrowing the diagnosis by growth stage** | Many rice diseases are stage-specific — tungro appears at tillering, panicle diseases require a panicle. Knowing roughly when the crop was sown eliminates candidates outright. One question, asked once, paying off all season. |
| **Turning a dosage rate into a quantity** | "Apply 2g per litre" makes a farmer guess at the shop, and the input seller is happy to help him guess high. "For your field, buy about 200 grams" does not. This directly attacks the over-prescription problem. |
| **Spotting recurrence** | Brown spot once is a disease event. Brown spot on the same field three seasons running is a soil or nutrient problem, and the correct advice is to stop treating the symptom. Invisible without history attached to a place. |
| **Anchoring the follow-up question** | "Did it improve?" is meaningless unless the system knows what it is asking about. |
| **Targeting alerts** | Untargeted outbreak alerts get muted within two weeks. Alerting only farmers with a susceptible crop at a susceptible stage is the difference between a warning and a nuisance. |
| **Handling scattered holdings** | Smallholders commonly work several separate parcels with different crops and sowing dates. A single "my farm" model breaks immediately — a diagnosis on the roadside parcel says nothing about the one behind the house. |
| **Giving the institutional layer a denominator** | Case counts give "40 reports in Belkuchi." Adding rough area gives affected area, which is what MFIs, insurers, and DAE actually need. |

### **How it gets created — implicitly, never as a form**

- **The first diagnosis creates the record automatically.** Crop and location are already known from that diagnosis. Nothing is asked.
- **The farmer names it by voice, if they want to.** Farmers refer to fields by local names — the one by the road, the north one, Karim's side. An imposed "Field 1" is a label they will never recognise. Naming is optional and skippable.
- **Two further questions, asked lazily, one at a time, at the moment each first changes the answer:** roughly when it was sown, asked the first time growth stage matters, anchored to a season or festival rather than a date; and roughly how big it is, asked the first time a dose recommendation needs it, in whatever local unit the farmer uses — bigha, katha, decimal — never hectares.
- **There is no field management screen in the farmer app.** The record exists in the data from the first diagnosis, but it is not a place the farmer visits. It surfaces only where it is doing work: "which field is this?" during a diagnosis, and the history shown inside a result. Every screen a low-literacy user never opens is a cost.
- **Full field management lives in the field worker console**, where someone maintaining records across sixty households genuinely needs it.

### **What we deliberately never capture**

- **No ownership or tenure.** Not who owns it, not how it was acquired, not whether it is sharecropped. The system needs to know what is growing, not who holds title.
- **No boundaries and no GPS coordinates.** Union-level location serves every use above. Precise field coordinates are a liability with no matching benefit.
- **Not called a "plot".** That word carries a land-record connotation. Use "field", or whatever the field workers naturally say in Bangla.

### **What the field worker profile holds instead**

`Assigned area → Farmer roster → Field records per farmer → Visit history → Diagnoses run → Overrides made → Escalations raised → Sync status → Offline queue`

This is an operating set, not a personal one, and it is fine for it to be a richer interface — the field worker is a trained user doing a job.

## **The multi-image detection engine**

A single photograph is a weak basis for a diagnosis, and the reason is not image quality. Symptoms are spatially distributed: one leaf can look healthy while the plant beside it is failing, and the pattern of *where* symptoms appear is often more diagnostic than the lesion itself. Research on aggregating multiple leaf images into one decision exists precisely because single-leaf examination is unreliable, and ensemble approaches consistently outperform single-model, single-image classification.

So the engine is an **evidence accumulator with an appetite**. It holds a live probability distribution over candidates and, at each step, asks for the input that would most reduce its uncertainty.

| If the engine is confused between | It should ask for |
| ----- | ----- |
| Two similar leaf diseases | A close-up of the lesion edge — margin shape is usually the separator |
| Disease vs nutrient deficiency | A whole-plant shot, plus one *healthy-looking* plant for comparison |
| Localised damage vs systemic infection | A wide shot showing spread pattern across the field |
| Disease vs pest damage | The underside of an affected leaf, and the stem base |
| Anything, with severity unclear | Three to five separate plants, to establish incidence |

### **Incidence is the second output**

Sampling several plants gives you something worth as much as the accuracy gain: **how much of the field is affected.** "Three of the eight plants you showed me have it" sets the urgency, decides whether treatment is economically worth it at all, and feeds the outbreak signal. Accuracy improves the label. Incidence improves the decision.

### **Design discipline**

- **Never gate the first result.** Give a provisional answer on image one, immediately.
- **Then invite, don't demand.** "I think I know. Show me two more things and I can be sure."
- **Cap the sequence at three additional requests.** Every extra ask is an abandonment risk.
- **Show progress as certainty, not as steps.** The farmer should see confidence rising, not a 1-of-4 counter.
- **Let the farmer stop at any point** and still receive the best current answer, clearly labelled as provisional.
- **Field workers get the uncapped version** — they have the patience and the reason.

### **What the field record and the engine buy you together**

**Field record — built from earlier diagnoses, never entered as a form**

> **"The one by the road" — Boro rice**
> Variety: BRRI dhan28
> Sown: 12 December
> Location: Belkuchi, Sirajganj
> Irrigation: Shallow tubewell
> Last treatment: 4 January — nothing applied since

**Image 1 — leaf close-up.** Yellowing leaf tips with water-soaked margins.

**Provisional: Bacterial Leaf Blight — moderate confidence**

> Also possible: Brown Spot
> **To be sure, show me:** the edge of one lesion, close up

**Image 2 — lesion margin.** Water-soaked boundary, wavy edge, no concentric rings.

**Bacterial Leaf Blight — high confidence**

> **Evidence observed:** Water-soaked lesions beginning at leaf margin, wavy lesion boundary, yellowing progressing along the leaf, no target-shaped spotting.
> **Context used:** Boro season, standing water, recent heavy irrigation — conditions that favour bacterial spread.
> **Ruled less likely:** Brown Spot — no concentric ring pattern. Tungro — plant height and spread pattern do not fit.
> **Now show me:** three or four other plants, so I can tell you how far it has gone

**Images 3–6 — four plants.**

> **Incidence: 3 of 4 plants affected — spreading**
> **Nearby: 4 farmers within 5 km confirmed this in the last 10 days**

**Act within: 2–3 days**

> **Step 1:** Drain the field to 2–3 cm, stop top-dressing nitrogen immediately
> **Step 2:** Remove and destroy the worst-affected plants at the field edge
> **Step 3:** If spread continues past 3 days, a copper-based application may be warranted — confirm with your field worker before purchasing
> **Do not:** Increase urea. This is the most common local response and it accelerates the disease.
> **Cost of steps 1–2:** No purchase required
> **This advice resolved the problem for 8 of 10 farmers near you**

That is where I think **Fasol Doctor becomes genuinely valuable** — not in naming the disease, but in assembling enough evidence to be honest about certainty, then converting the name into a sequence of actions with a deadline, a cost, an incidence estimate, and an explicit warning about the wrong instinct.

## **The officer directory and the escalation ladder**

A machine diagnosis with a named, callable human attached is a categorically different product from one without. Trust is the single strongest determinant of whether digital agricultural tools are adopted and kept in use, and a visible human backstop is the cheapest trust you will ever buy.

Crucially, this should **route into services that already exist** rather than build a parallel one.

### **Three tiers, in order**

| Tier | Who | When | Contact |
| ----- | ----- | ----- | ----- |
| **1. BRAC Field Worker** | The community agriculture worker covering the farmer's area | Default for anything low-confidence, disputed, or out of scope | Direct call, or request a visit |
| **2. Local DAE Office** | The block-level Sub-Assistant Agriculture Officer and the upazila agriculture office | Where an official prescription, verification, or subsidy question is involved | Office line, location on a map, opening hours |
| **3. National Agriculture Call Centre** | The government's toll-free agricultural advisory line | Anything outside BRAC's coverage or the app's crop list, and for farmers with no smartphone at all | Toll-free shortcode, one tap to dial |

The national call centre is free, has run since 2012, and handled over 92,000 calls in the most recent year — so farmers in the pilot districts may already know it. Presenting it inside the app is a credibility gain, not a leak of users.

### **What the directory holds**

`Office name → Type (BRAC / DAE upazila / DAE block) → Upazila and union coverage → Designated officer role → Office contact number → Opening hours → Location and map → Services available → Last verified date`

### **Governance, which is the hard part**

- **Institutional agreement before publication.** Surfacing government officers' contact points requires a data-sharing agreement with DAE. Default to office lines, not personal mobile numbers, until that agreement explicitly permits otherwise.
- **A named owner for the data.** Officers transfer and offices reorganise. Without an assigned maintainer, this directory rots within a year and starts destroying trust instead of building it.
- **"This number was wrong" on every entry.** One tap, no form. Route corrections to the maintainer.
- **A visible last-verified date** on every record, so a stale entry announces itself.
- **Never present an office as available when it is closed.** Show the next opening time and offer the call centre instead.

## **Full Sitemap — Farmer App (Android, offline-first)**

Fasol Doctor

├── Who is this for?  (profile chooser — shown when >1 profile on device)
│   ├── Switch farmer
│   ├── Add another farmer
│   └── I am helping someone else
│
├── Home
│   ├── Diagnose now (primary action, always one tap from launch)
│   ├── Nearby alerts  ← neighbour outbreak warnings
│   ├── Active problems
│   ├── Follow-ups due
│   └── Seasonal advisories
│
├── Diagnose
│   ├── Capture
│   │   ├── Camera with capture guidance
│   │   ├── Retake prompt
│   │   ├── Choose from gallery
│   │   └── Skip photo — describe instead
│   ├── Describe
│   │   ├── Tap the picture that looks like this  (primary)
│   │   ├── Guided yes/no questions (voice or tap)
│   │   └── Record a voice note  (routed to a person, not parsed)
│   ├── Which field?  (only if more than one exists; skippable)
│   ├── Add more evidence  ← detection engine loop
│   │   ├── What the engine still needs
│   │   ├── Requested shot (with example image)
│   │   ├── Certainty so far
│   │   ├── Sample other plants → incidence
│   │   └── Stop here and show me what you have
│   └── Result
│       ├── Most likely diagnosis
│       ├── Other possibilities
│       ├── Certainty and what it means
│       ├── How widespread (incidence)
│       ├── What the system saw
│       ├── What it ruled out, and why
│       ├── Treatment plan
│       ├── Action window
│       ├── Cost summary
│       ├── Safety notes
│       ├── Did this work for others?  ← outcome evidence
│       ├── Ask a person
│       └── Saved automatically to this field
│
├── Nearby Alerts
│   ├── Active in my area
│   ├── What to look for
│   ├── Preventive action now
│   ├── Check my field for this
│   └── Alert radius & settings
│
├── History
│   ├── Past problems  (grouped by field, no field management)
│   ├── Treatments applied
│   ├── Outcomes recorded
│   └── Rename a field  (by voice, optional)
│
├── Follow-ups
│   ├── Due now
│   ├── Upcoming
│   ├── Record outcome
│   │   ├── Resolved
│   │   ├── Improving
│   │   ├── No change
│   │   └── Worse
│   └── Escalate to a person
│
├── Get Help
│   ├── My field worker
│   │   ├── Call
│   │   ├── Request a visit
│   │   └── Send my case (images + voice note)
│   ├── My local agriculture office
│   │   ├── Office details & services
│   │   ├── Opening hours
│   │   ├── Location & how to get there
│   │   └── Call office
│   ├── Agriculture call centre (toll-free)
│   ├── My escalated cases
│   └── Report wrong contact details
│
├── Learn
│   ├── Common problems this season
│   ├── Problems in my district
│   ├── Cases that were resolved  ← outcome evidence, before/after
│   ├── Prevention basics
│   └── Safe input handling
│
├── Coming Soon  (visible, non-functional — see below)
│   ├── Market prices
│   ├── Weather & risk alerts
│   ├── Fertiliser & dose calculator
│   └── Verified input sellers
│
└── Settings
    ├── Profiles on this device
    ├── My profile
    ├── Language & dialect
    ├── Voice & audio  (speed, auto-play, repeat)
    ├── Notifications & reminders
    ├── Alert radius
    ├── Offline data & sync
    ├── Data sharing & consent  (per profile)
    └── Help

## **Full Sitemap — Field Worker Console (tablet)**

Field Worker Console

├── Today
│   ├── Visit list
│   ├── Escalated cases assigned to me
│   ├── Voice notes to review
│   ├── Follow-ups due in my area
│   ├── Outbreak alerts in my area
│   ├── Sync status
│   └── Offline queue
│
├── Farmers
│   ├── My roster
│   ├── Add farmer
│   ├── Shared-device groups
│   └── Farmer Detail
│       ├── Profile
│       ├── Fields
│       ├── Diagnosis history
│       ├── Outcomes
│       ├── Visit log
│       └── Notes
│
├── Assisted Diagnosis
│   ├── Select farmer & field
│   ├── Capture (guided, uncapped evidence sequence)
│   ├── Symptom entry
│   ├── Incidence sampling
│   ├── Result & review
│   ├── Override diagnosis
│   ├── Adjust treatment plan
│   ├── Record what was advised
│   └── Escalate to agronomist or DAE
│
├── Review Queue
│   ├── Low-confidence cases
│   ├── Out-of-scope images
│   ├── Farmer voice notes
│   ├── Farmer-disputed diagnoses
│   └── Resolved & closed
│
├── Directory
│   ├── DAE offices in my area
│   ├── Agronomist contacts
│   ├── Referral log
│   └── Flag outdated contact
│
├── My Area
│   ├── Case volume
│   ├── Emerging problems
│   ├── Coverage gaps
│   └── Outcome rates
│
└── Settings
    ├── Account & role
    ├── Assigned area
    ├── Offline data
    └── Help

## **Full Sitemap — Institutional Dashboard (web)**

Fasol Doctor Insights

├── Overview
│   ├── Cases this week
│   ├── Active outbreak signals
│   ├── Coverage by district
│   ├── Channel split (app / SMS / assisted)
│   └── Model confidence trend
│
├── Disease Trends
│   ├── By crop
│   ├── By district & union
│   ├── By season & week
│   ├── Incidence & severity distribution
│   ├── Spread velocity
│   └── Compare periods
│
├── Outbreak Alerts
│   ├── Active alerts
│   ├── Thresholds & rules
│   ├── Farmer alerts sent & opened
│   ├── Alert history
│   └── Notification routing
│
├── Model Performance
│   ├── Accuracy on reviewed cases
│   ├── Confidence calibration
│   ├── Accuracy gain per additional image  ← detection engine value
│   ├── Abstention & escalation rate
│   ├── Override rate by field workers
│   └── Weak classes needing data
│
├── Field Operations
│   ├── Field worker activity
│   ├── Escalation resolution time
│   ├── Referrals to DAE / call centre
│   ├── Follow-up completion
│   └── Farmer retention & repeat use
│
├── Outcomes
│   ├── Resolution rate by diagnosis
│   ├── Resolution rate by treatment option
│   ├── Chemical vs non-chemical outcomes
│   └── Consented case library
│
├── Reports
│   ├── Programme reporting
│   ├── Cost per farmer reached
│   ├── Outcome & yield-protection indicators
│   └── Exports (CSV / API)
│
└── Administration
    ├── Users & roles
    ├── Disease & treatment library
    ├── Officer & office directory
    │   ├── Records
    │   ├── Verification queue
    │   ├── Reported corrections
    │   └── Data-sharing agreements
    ├── Crop & language configuration
    ├── Consent & anonymisation policy
    └── Partner data access

## **SMS / USSD Flow Map (feature phones)**

The SMS channel is not a reduced version of the app. It is a separate, linear, menu-driven product that must complete a full diagnosis in as few turns as possible, because every turn costs the farmer money and patience.

```
START  →  Send "FASOL" to shortcode
   ↓
1. Which crop?          → 1 Rice  2 Vegetable  3 Other
   ↓
2. Which part?          → 1 Leaf  2 Stem  3 Panicle  4 Whole plant
   ↓
3. What do you see?     → 1 Yellowing  2 Spots  3 Wilting
                          4 Holes  5 White/powder  6 Other
   ↓
4. One confirming question (branch-specific)
   ↓
5. How many plants affected?  → 1 A few  2 About half  3 Most
   ↓
6. RESULT
   - Likely problem
   - First action (free, do today)
   - Second action (if it continues)
   ↓
7. → Reply 1 for full treatment steps
   → Reply 2 for your field worker's number
   → Reply 3 for the agriculture call centre
   → Reply 4 to get a reminder in 3 days
   ↓
8. FOLLOW-UP (automatic, day 3)
   "Did it improve? 1 Yes  2 No  3 Worse"
```

Design constraint: a complete diagnosis must be reachable in six inbound messages or fewer, and the first result message must be useful on its own if the farmer never replies again.

## **Visible but non-functional features**

Some features belong in the app's structure before they belong in its capability — they establish the product's intended shape, and they let the pilot measure demand before anything is built. Market prices and weather are the clearest cases: a village-level study in Bangladesh found that disease, market, and weather information were the farmers' actual priorities, yet market and weather information were the things agricultural apps neglected.

They ship as **labelled empty states, never as screens with sample data.**

| Rule | Why |
| ----- | ----- |
| **No placeholder numbers, ever** | A farmer who sees a fake market price and sells on it loses money and never returns. A fake price is worse than no price. |
| **Say plainly what it will do and that it is not ready** | In audio as well as text. "This will show you today's paddy prices in your area. It is not working yet." |
| **Capture a demand signal** | A single "tell me when this is ready" tap. This is real pilot data on what to build next. |
| **Never in a primary navigation slot** | Group them under one clearly-labelled area. A dead item in the main tab bar reads as a broken app. |
| **No dead ends** | Where a real alternative exists — the DAE office, the call centre — offer it from the empty state. |

Grouped under **Coming Soon**: market prices, weather and weather-linked risk alerts, fertiliser and dose calculator, verified input sellers.

**Deliberately not shown at all**, because they imply commitments the product cannot yet make: marketplace and in-app purchasing, insurance and credit integration, yield prediction, drone and satellite analysis.

## **Recommended MVP IA boundary**

**Farmer app:** Profile Chooser → Home → Guided Capture → Detection Engine (add more evidence) → Symptom Conversation → Result (ranked, explained, incidence, outcome evidence) → Treatment Plan → Get Help → Follow-up & Outcome → Nearby Alerts

Field records are created implicitly by the first diagnosis and are **not** a farmer-facing destination. There is no add-field screen, no field list, and no field management in the farmer app — only a lightweight History view and a "which field is this?" prompt when more than one exists. Field management lives in the field worker console.

**Field worker console:** Farmer Roster → Field Records → Assisted Diagnosis → Override → Review Queue (including voice notes) → Directory

**Institutional:** Overview → Disease Trends → Model Performance → Outcomes

**Structure present, function deferred:** market prices, weather, dose calculator, verified sellers.

**Out of MVP entirely:** marketplace, insurance API, yield prediction, multi-country configuration, drone and satellite analysis.

Three things I would not cut from the MVP even under time pressure: **the outcome loop**, because without it there is no learning signal and no impact evidence; **the escalation ladder**, because it is the only honest answer to the cases the model gets wrong; and **voice output on every screen**, because without it the product excludes the farmers it was built for.
