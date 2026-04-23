# GUIDELINES_PAGE.md — Provider-Facing Guidelines Page Spec

**Status:** Architecture designed, implementation NOT YET STARTED  
**Priority:** Next major feature after algorithm stabilization

---

## Overview

A provider-facing guidelines reference page at `surgeryready.net/guidelines`. Designed for use under clinical time pressure — scannable, filterable, keyboard-friendly.

**Design principle:** Clinical content lives in `src/data/guidelines.js`. UI lives in `src/pages/GuidelinesPage.jsx`. These two files must never be merged. Content updates (new guidelines, revised recommendations) should never require touching UI code.

---

## Files to Create

```
src/data/guidelines.js         ← clinical content only, no JSX
src/pages/GuidelinesPage.jsx   ← UI only, imports from guidelines.js
```

**Files to modify:**
```
src/App.jsx        ← add one route: /guidelines → GuidelinesPage
src/Navbar.jsx     ← optionally add nav link (confirm with Akbar first)
```

---

## Data Schema — `guidelines.js`

```js
export const GUIDELINES = [
  {
    id: "asra-anticoag-2024",          // unique slug
    category: "anticoagulation",        // drives filter tabs
    title: "ASRA 5th Edition — Anticoagulation & Regional Anesthesia",
    source: "ASRA 2024",               // displayed on card
    updated: "2024",                   // year of guideline
    summary: "...",                    // 1–2 sentence summary visible in collapsed card
    keyPoints: [                       // bullet points shown when expanded
      "Warfarin: hold 5 days, INR < 1.5 before neuraxial",
      "DOACs: hold 2–5 days depending on agent and renal function",
      // ...
    ],
    tags: ["neuraxial", "warfarin", "DOAC", "heparin"],  // for search
    urgencyNote: null,                 // string | null — red banner if present
    link: "https://...",               // optional external link to source
  },
  // ...
];
```

---

## Planned Guideline Categories

| Category Key | Display Label | Example Guidelines |
|---|---|---|
| `anticoagulation` | Anticoagulation | ASRA 5th Ed, bridging therapy, DOACs |
| `cardiac` | Cardiac Risk | RCRI, 2024 AHA/ACC periop cardiac |
| `airway` | Airway | Difficult airway algorithm, ASA DAA |
| `medications` | Medications | GLP-1 RA (multi-society), SGLT2i, buprenorphine |
| `labs` | Labs & Transfusion | Pre-op testing matrix, transfusion triggers |
| `fasting` | Fasting (NPO) | ASA NPO guidelines, gastric ultrasound |
| `anesthesia` | Anesthesia Protocols | TIVA, regional, PONV prophylaxis |

---

## UI Spec — `GuidelinesPage.jsx`

### Layout

```
┌─────────────────────────────────┐
│  [Search bar — full width]      │
├─────────────────────────────────┤
│  [Tab: All] [Anticoag] [Cardiac]│  ← filter chips
│  [Airway] [Medications] [Labs]  │
│  [Fasting] [Anesthesia]         │
├─────────────────────────────────┤
│  ┌──────────────────────────┐   │
│  │ ASRA 5th Ed              │   │  ← collapsed card
│  │ Anticoagulation · 2024   │   │
│  │ "Hold warfarin 5 days..."│   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 2024 AHA/ACC Cardiac     │ ▼ │  ← expanded card
│  │ ...key points expanded...│   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Interaction Rules

- Search filters by `title`, `summary`, `keyPoints`, and `tags` — real-time, no submit
- Category tabs filter by `category` field; "All" shows everything
- Cards default collapsed; click anywhere on card header to expand
- `urgencyNote` → renders a red banner at top of expanded card
- External `link` → "View Source" button opens in new tab (never navigates away)
- No pagination — virtual scroll or simple render-all (guidelines list will be < 50 items)

### Styling

- Use `SR` design tokens (same as rest of site)
- Provider UI: denser, more compact than patient UI
- Tab chips: same `Chip` component pattern as algorithm
- Cards: `SR.cardShadow`, `SR.borderLight` borders, `SR.navy` headings
- Expanded state: smooth CSS height transition (not JS toggle)

---

## Implementation Order

1. Build `guidelines.js` with 3–5 seed entries (one per category)
2. Build `GuidelinesPage.jsx` with search + filter tabs + accordion cards
3. Add route in `App.jsx`
4. Test filtering and search
5. Add nav link in `Navbar.jsx` (confirm with Akbar)
6. Populate remaining guideline content

---

## Content Notes

- ASRA 5th Edition anticoagulation table is the highest-priority entry
- GLP-1 RA guidance: multi-society statement (ADA/ASGE/ASMBS/etc.) — hold 1 week pre-op for weekly agents, day-of for daily; gastric emptying concern
- SGLT2i: hold 3–4 days pre-op (euglycemic DKA risk); check anion gap if not held
- Buprenorphine: do NOT hold pre-op per current evidence; continue through perioperative period; coordinate with pain team for opioid supplementation
- RCRI: 6-factor cardiac risk calculator — embed as interactive widget inside guideline card (future enhancement)
