# ALGORITHM.md — Surgical Readiness Algorithm Spec

**Live file:** `src/App.jsx` — `PreOpPage` component + `generatePlan()` + `TimelineView`  
**Legacy standalone:** `Surgical_Readiness_Algorithm_2026-03-25_v4.jsx` (archived reference)  
**Version convention for standalone artifacts:** `Surgical_Readiness_Algorithm_YYYY-MM-DD_HHMM.jsx`

---

## Architecture

The algorithm is a **standalone JSX artifact** — single file, no imports from other site components, no cross-dependencies. It is imported into the site as a page-level component only.

### Step Flow

```
Step 0: Demographics     → Role selection (patient | provider) + age, sex, BMI
Step 1: Surgery Details  → Procedure type, urgency, surgical risk tier
Step 2: Medical History  → Comorbidities, RCRI inputs, anemia screening
Step 3: Medications      → Anticoagulants, GLP-1 RA, SGLT2i, buprenorphine, etc.
Step 4: Fitness Baseline → DASI questionnaire → live VO₂max estimate
Step 5: Nutrition        → Diet, supplements, fasting status, frailty indicators
```

Constants at top of file:
```js
const STEPS = ["demographics", "surgery", "medical", "medications", "fitness", "nutrition"];
const STEP_LABELS = ["Patient Info", "Surgery Details", "Medical History", "Medications", "Fitness Baseline", "Nutrition"];
const STEP_NUMS = ["01", "02", "03", "04", "05", "06"];
```

---

## Reusable UI Primitives (defined in file)

| Component | Purpose |
|---|---|
| `SRLogo` | Square logo mark with SR initials |
| `Chip` | Selectable chip button (single select) |
| `MultiChip` | Multi-select chip group |
| `Field` | Form field wrapper with label + hint |
| `Input` | Styled text/number input |
| `Select` | Styled dropdown |

**InfoButton rule:** InfoButton must be placed as a `children` prop inside `Field`, not adjacent to it — placing outside creates layout gaps.

---

## Clinical Logic Modules

### Anemia — 4 Severity Tiers

| Tier | Hemoglobin | Protocol |
|---|---|---|
| Normal | ≥ 13 g/dL (M) / ≥ 12 g/dL (F) | No intervention |
| Mild | 10–12.9 (M) / 10–11.9 (F) | Iron studies, oral iron if deficient |
| Moderate | 8–9.9 g/dL | IV iron, hematology consult, consider delay |
| Severe | < 8 g/dL | Urgent hematology, likely surgery delay, ESA consideration |

### Smoking Cessation — Timeline Branching

- < 2 weeks pre-op: Counsel but note limited benefit window for pulmonary
- 2–8 weeks: Significant benefit period — NRT, varenicline
- > 8 weeks: Optimal — full pulmonary benefit realized
- Cessation products: NRT (patch, gum), varenicline (Chantix), bupropion

### Alcohol Use — Withdrawal Risk Detection

- Screens use PAWSS (Prediction of Alcohol Withdrawal Severity Scale) and CIWA-Ar logic
- Flags patients at risk for alcohol withdrawal syndrome (AWS)
- High-risk → anesthesia/medicine co-management, consider prophylactic benzodiazepine protocol
- CAGE questions embedded as intake screen

### DASI → VO₂max Estimation

- Duke Activity Status Index: 12-item validated questionnaire
- VO₂max estimated from DASI score: `VO₂max = 0.43 × DASI + 9.6` (ml/kg/min)
- < 4 METs (VO₂max < 14): High functional impairment — flag for further evaluation
- 4–7 METs: Moderate — optimization opportunity
- > 7 METs: Good functional reserve

DASI displayed with live calculation updating as user answers questions. VO₂max shown in a modal.

---

## Output Cards

Results rendered as expandable cards, one per clinical domain. Each card has:
- Priority badge: **Important** / **Recommended** / **Optional**
- Two-tone SVG domain icon (white stroke on `SR.navy` tile, `#2ECC9B` accent)
- Collapsed summary visible before expansion
- Expanded content: domain-specific clinical recommendations

---

## Known Issues / Constraints

| Issue | Status |
|---|---|
| PDF export removed | Caused JSX parsing error: embedded `<script>` tag inside template literal. Do NOT reintroduce. |
| InfoButton placement | Must be `Field` children, not siblings — avoids layout gap |

---

## Demo Patients

Three pre-filled showcase patients are defined in the `DEMO_PATIENTS` const at the top of `src/App.jsx` (just after the BRAND config). Typing their exact name in the First Name field auto-fills all 6 steps. Matching is case-insensitive.

| Name | Age/Sex | Surgery | Weeks | Key complexity |
|---|---|---|---|---|
| `Demo Patient 1` | 52F | Total knee replacement | 8 | Healthy baseline, light complexity |
| `Demo Patient 2` | 68M | Left hip replacement | 4 | AF on Apixaban, SGLT2i + GLP-1 RA, OSA, HbA1c 8.4 |
| `Demo Patient 3` | 74M | Colorectal cancer resection | 2 | Anemia (Hgb 9.2), frailty, COPD, current smoker, chemo |

The three patients produce meaningfully different timelines due to different `weeksUntil` values and clinical profiles. A teal confirmation banner appears for 3 seconds after auto-fill fires.

To add a new demo patient: add an entry to `DEMO_PATIENTS` in **both** `src/App.jsx` and `surgeryready-website/src/App.jsx` using the same key structure.

---

## How to Edit

1. Read the file first — always view current state before editing
2. Use targeted string replacements, not full rewrites
3. Apply changes to **both** `src/App.jsx` (deployed) and `surgeryready-website/src/App.jsx` (preview)
4. Test in browser (Vite dev server) before committing
5. Commit and push after verifying
