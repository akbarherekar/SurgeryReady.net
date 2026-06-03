# SurgeryReady Website

The full SurgeryReady.net website including the Surgical Readiness Algorithm.

## Editing Content

All website content lives in `src/App.jsx`. Search for these labels to jump to sections:

- `[HERO]` — Headline, subheadline, description
- `[VALUE-PROPS]` — Patient / hospital / payer cards
- `[JOURNEY]` — "One connected journey" steps
- `[HOW-IT-WORKS]` — 3-step process section
- `[FOR-PATIENTS]` — Patient features + testimonial
- `[FOR-HOSPITALS]` — Hospital features + CTA
- `[ABOUT]` — About section + differentiators
- `[CONTACT]` — Contact form
- `Chat Intake` — `CHAT_QUESTIONS` array + `ChatIntake` component (conversational intake)
- `[PREOP-PAGE]` — Pre-operative assessment page (mode picker, form steps, plan view, progress tracker)
- `[ALGORITHM]` — Surgical Readiness Algorithm (`generatePlan()`)
- `[NAV]` — Navigation menu items
- `[APP]` — Page routing (add new pages here)

> **Note:** Both `src/App.jsx` (Vercel-deployed) and `surgeryready-website/src/App.jsx` (local preview) must be kept in sync for every change.

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy

Push to GitHub → Vercel auto-deploys.
