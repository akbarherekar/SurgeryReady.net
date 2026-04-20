# CLAUDE.md — SurgeryReady.net Project Context

> Drop this file in the root of your repo. Claude Code will read it automatically on every session.

---

## Project Identity

**Product:** SurgeryReady (`surgeryready.net`)  
**Tagline:** Health before healthcare™  
**Owner:** Akbar Herekar MD MPH  
**Repo:** `akbarherekar/SurgeryReady.net` (GitHub, `main` branch)  
**Deploy:** Vercel (custom domain `surgeryready.net`)  
**Stack:** React + Vite + JSX, deployed via GitHub → Vercel CI  
**Form handling:** Formspree (endpoint `mnjoqngr`)

---

## What This Product Does

SurgeryReady is an **evidence-based surgical preparation tool** serving two primary audiences:

| Audience | Purpose |
|---|---|
| **Patients** | Personalized, guideline-driven prep plan tailored to their surgery, health history, and timeline |
| **Physicians** | Evidence-based perioperative risk stratification, medication hold windows, and prehab protocols |

Health systems and surgical groups are a secondary audience (B2B pilots, ERAS integration) — not the primary product framing.

The core product model is a **dual-track design**: one structured intake produces two tailored outputs — a plain-language checklist for the patient and a clinical decision-support summary for the physician. Same evidence, right format for each.

The unifying biological framework is **hormesis** — controlled stress exposure as preparation.

---

## Repository Structure (Expected)

```
src/
  components/
    TimelineView.jsx    # Patient-only forward-looking prep timeline
  data/
    timeline.js         # Timeline phase/card generator (patient only)
  App.jsx               # All homepage sections + PreOpPage + algorithm (single file, ~5000 lines)
  main.jsx
  supabaseClient.js     # Supabase auth + persistence
public/
docs/                   # These context docs live here
CLAUDE.md               # ← you are here
```

**Note:** The entire site — homepage, PreOp assessment, algorithm — lives in `src/App.jsx`. There are no separate component files for Hero, Navbar, etc. Everything is inline in one file.

**Vercel deploys from root `src/App.jsx`.** There is also a `surgeryready-website/src/App.jsx` (a parallel copy used for local preview server). Both must be kept in sync when making changes.

**Active standalone artifact (versioned separately):**
```
Surgical_Readiness_Algorithm_2026-03-25_v4.jsx   ← CANONICAL CURRENT VERSION
```
This file is treated as a **standalone artifact** — it must never be cross-imported from other components. Edit it independently and version with timestamps (`YYYY-MM-DD_HHMM`).

---

## Design System

All styling uses the `SR` design token object defined at the top of every component file. **Never use hardcoded hex values — always reference SR tokens.**

```js
const SR = {
  navy:         "#1B3A5C",   // primary dark — headers, nav, dark tiles
  teal:         "#0D7C66",   // primary action — buttons, links, success
  tealLight:    "#E6F5F0",   // teal backgrounds / chips selected state
  tealDark:     "#095C4B",   // hover / gradient endpoint
  patientTeal:  "#0D7C66",   // patient-facing accent
  providerNavy: "#1B3A5C",   // provider-facing accent
  lightBlue:    "#E8F0FE",
  lightOrange:  "#FFF3E8",
  bg:           "#F8FAFB",
  white:        "#FFFFFF",
  offWhite:     "#F1F5F4",
  border:       "#DDE5E3",
  borderLight:  "#EDF1F0",
  text:         "#1A2B3C",
  textSecondary:"#4A6274",
  muted:        "#7C8E9B",
  success:      "#0D7C66",
  danger:       "#C53030",
  warning:      "#B7791F",
  dangerBg:     "#FFF5F5",
  warningBg:    "#FFFFF0",
  cardShadow:   "0 1px 3px rgba(27,58,92,0.06), 0 1px 2px rgba(27,58,92,0.04)",
  font:         "'DM Sans', 'Segoe UI', sans-serif",
};
```

**SVG icons:** White strokes on `SR.navy` dark tiles, `#2ECC9B` green for accent contrast.

---

## Brand Voice Rules (Non-Negotiable)

- **No trademark symbols** anywhere on the site
- **No emojis** anywhere on the site
- Use **"physician"** (not "provider") in brand-facing copy
- Hero / journey sections: **"Built by anesthesiologists and surgeons"**
- About section: **"Anesthesiologists, surgeons, intensivists, and health systems leaders"**
- Tagline is always: **Health before healthcare™** (trademark symbol only on the tagline itself)

---

## Surgical Readiness Algorithm (Core Interactive Tool)

See `docs/ALGORITHM.md` for full spec. Summary:

- **File:** `src/App.jsx` — `PreOpPage` component + `generatePlan()` function (live, deployed)
- **Steps (6):** Patient Info → Surgery Details → Medical History → Medications → Fitness Baseline → Nutrition
- **Role selection:** Patient vs. Provider at step 1, drives branching throughout
- **Key clinical modules:**
  - Anemia protocols: 4 severity tiers by hemoglobin (Hb)
  - Smoking cessation with timeline branching
  - Alcohol use with withdrawal risk detection (PAWSS/CIWA-Ar screening)
  - DASI questionnaire with live VO₂max estimation
  - Expandable patient output cards with custom two-tone SVG domain icons
  - VO₂max modal
  - Personalized forward-looking timeline (`TimelineView.jsx` + `src/data/timeline.js`)
  - Supabase auth + plan persistence (save/resume across sessions)
- **Known constraint:** PDF export was removed due to JSX parsing error (template literal + embedded script tag). Do **not** reintroduce PDF generation using that pattern.
- **InfoButton placement:** Must be inside their `Field` component as children, not outside — placing them outside creates layout gaps.

## Demo Patients

Three showcase patients auto-fill the entire assessment when their name is typed in the First Name field. Defined as `DEMO_PATIENTS` const in `src/App.jsx` (just after BRAND config).

| Name (type exactly) | Profile | Weeks to surgery |
|---|---|---|
| `Demo Patient 1` | 52F, total knee replacement, healthy baseline | 8 |
| `Demo Patient 2` | 68M, AF on Apixaban, SGLT2i + GLP-1 RA, OSA | 4 |
| `Demo Patient 3` | 74M, colorectal cancer, anemia (Hgb 9.2), frailty | 2 |

Matching is case-insensitive. A teal confirmation banner appears for 3 seconds on load.

---

## Guidelines Page (Next Major Feature)

See `docs/GUIDELINES_PAGE.md` for full spec. Summary:

- **Files to create:** `src/data/guidelines.js` + `src/pages/GuidelinesPage.jsx`
- **Route:** Add one entry to `App.jsx`; optionally add nav link in `Navbar.jsx`
- **Architecture principle:** Clinical content (`guidelines.js`) is **completely separate** from UI (`GuidelinesPage.jsx`) so content updates never require touching component code
- **UI pattern:** Search bar + category filter tabs + collapsed accordion cards with key metadata visible before expansion
- **Planned categories:** Anticoagulation/ASRA, Cardiac/RCRI, Airway, Medications (GLP-1 RA, SGLT2i, buprenorphine), Labs/transfusion, Fasting, Anesthesia-specific protocols

---

## Clinical Guidelines Sources

The platform is built on these authoritative sources. Always cite them when generating clinical content:

| Guideline | Scope |
|---|---|
| ASRA 5th Edition | Anticoagulation / regional anesthesia |
| 2024 AHA/ACC | Cardiac perioperative risk |
| ESAIC 2025 | European anesthesia guidelines |
| Multi-society GLP-1 RA guidance | GLP-1 receptor agonist perioperative management |
| ERAS protocols | Enhanced Recovery After Surgery pathways |
| RCRI | Revised Cardiac Risk Index |
| DASI | Duke Activity Status Index / VO₂max estimation |
| ACS-NSQIP / MICA | Surgical risk calculators |

---

## Working Style & Conventions

- **Read the file before editing.** Always view the current file state before making changes — stale context causes errors.
- **Targeted edits only.** This is a production site. Make surgical (pun intended) string replacements, not full rewrites, unless a full rewrite is explicitly requested.
- **Edit both App.jsx files.** Changes to the site must be applied to both `src/App.jsx` (deployed by Vercel) and `surgeryready-website/src/App.jsx` (local preview server). They must stay in sync.
- **Separation of concerns is critical.** Content data files and UI component files must never be merged.
- **Clinical precision.** Use exact terminology: hemoglobin tiers (not "low blood count"), drug class names, guideline version numbers.
- **Commit and push after every feature.** Claude runs git commands directly — no need to ask Akbar to run them.

---

## Contact / Form

- Formspree endpoint: `mnjoqngr`  
- Contact form includes `firstName` field → used in personalized plan greeting
- Do not change the Formspree endpoint without confirming with Akbar

---

## Related Docs in This Repo

| File | Contents |
|---|---|
| `docs/ALGORITHM.md` | Full algorithm spec, step-by-step logic, clinical branching |
| `docs/GUIDELINES_PAGE.md` | Guidelines page architecture, data schema, UI spec |
| `docs/BRAND.md` | Brand voice, copy rules, logo/icon spec |
| `docs/CLINICAL_SOURCES.md` | Annotated clinical guideline reference list |
