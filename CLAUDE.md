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

SurgeryReady is a **perioperative optimization platform** serving three audiences:

| Audience | Purpose |
|---|---|
| **Patients** | Guided prehabilitation (exercise, nutrition, fasting, thermal conditioning) before surgery |
| **Providers** | Clinical risk stratification, medication/lab management, guideline lookup |
| **Health Systems** | ERAS pathway integration, population-level surgical optimization |

The core product model is a **dual-track design**: patient-facing UX (digestible, friendly, step-based) is strictly separated from provider-facing UX (scannable under time pressure, clinically precise).

The unifying biological framework is **hormesis** — controlled stress exposure as preparation.

---

## Repository Structure (Expected)

```
src/
  components/
    Navbar.jsx
    Hero.jsx            # Split two-card layout (patients | health systems)
    HowItWorks.jsx
    ContactForm.jsx     # Formspree endpoint mnjoqngr, includes firstName field
  pages/
    GuidelinesPage.jsx  # Provider-facing guidelines (IN PROGRESS — see docs/GUIDELINES_PAGE.md)
  data/
    guidelines.js       # Clinical content, separate from UI (IN PROGRESS)
  App.jsx
  main.jsx
public/
docs/                   # These context docs live here
CLAUDE.md               # ← you are here
```

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

- **File:** `Surgical_Readiness_Algorithm_2026-03-25_v4.jsx` (1950 lines)
- **Steps (6):** Patient Info → Surgery Details → Medical History → Medications → Fitness Baseline → Nutrition
- **Role selection:** Patient vs. Provider at step 1, drives branching throughout
- **Key clinical modules:**
  - Anemia protocols: 4 severity tiers by hemoglobin (Hb)
  - Smoking cessation with timeline branching
  - Alcohol use with withdrawal risk detection (PAWSS/CIWA-Ar screening)
  - DASI questionnaire with live VO₂max estimation
  - Expandable patient output cards with custom two-tone SVG domain icons
  - VO₂max modal
- **Known constraint:** PDF export was removed due to JSX parsing error (template literal + embedded script tag). Do **not** reintroduce PDF generation using that pattern.
- **InfoButton placement:** Must be inside their `Field` component as children, not outside — placing them outside creates layout gaps.

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
- **Versioned timestamps.** New standalone JSX files get timestamped names: `Surgical_Readiness_Algorithm_YYYY-MM-DD_HHMM.jsx`
- **Separation of concerns is critical.** Content data files and UI component files must never be merged.
- **No cross-dependencies on the algorithm file.** It is a standalone artifact.
- **Akbar runs git commands himself.** Just produce the files / diffs.
- **Clinical precision.** Use exact terminology: hemoglobin tiers (not "low blood count"), drug class names, guideline version numbers.

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
