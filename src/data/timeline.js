/**
 * SurgeryReady Patient Timeline — Clinical Content
 *
 * Data only. No JSX, no imports, no UI.
 * Edit card copy, conditions, and phase structure here.
 * The TimelineView component reads this file and renders it.
 *
 * show(data, plan) → boolean
 *   data  = the full assessment data object
 *   plan  = generatePlan() output { patient[], provider[], alerts[], riskLevel }
 */

// ─── Show condition helpers ──────────────────────────────────────────────────

const isSmoker       = (d) => d.smokingStatus === "current";
const isRecentSmoker = (d) => d.smokingStatus === "current" || d.smokingStatus === "former_lt8";
const isDrinker      = (d) => d.alcoholUse && d.alcoholUse !== "none";
const isHeavyDrinker = (d) => d.alcoholUse === "heavy" || d.alcoholUse === "moderate";
const hasWithdrawal  = (d) => d.alcoholUse === "heavy" || d.withdrawalHistory === "yes";
const hasAnemia      = (d, p) => p.patient.some(r => r.domain === "Anemia");
const hasCardiac     = (d) => Array.isArray(d.cardiac) && d.cardiac.length > 0;
const noCardiac      = (d) => !hasCardiac(d);
const hasSGLT2       = (d) => Array.isArray(d.diabetesMeds) && d.diabetesMeds.some(m => m.includes("SGLT2"));
const hasGLP1        = (d) => Array.isArray(d.diabetesMeds) && d.diabetesMeds.some(m => m.includes("GLP-1") || m.includes("Tirzepatide"));
const hasAnticoag    = (d) => Array.isArray(d.anticoag) && d.anticoag.some(a => !["Aspirin", ""].includes(a));
const hasThermal     = (d) => Array.isArray(d.thermalHabits) && d.thermalHabits.some(h => h !== "None");
const hasOSA         = (d) => Array.isArray(d.respiratory) && d.respiratory.some(r => r.includes("OSA"));
const hasDiabetes    = (d) => Array.isArray(d.endocrine) && d.endocrine.some(e => e.includes("Diabetes") || e.includes("Insulin"));
const isIF           = (d) => d.eatingPattern === "if";
const isElevated     = (d) => d.riskCategory === "elevated" || d.riskCategory === "high";
const hasBloodLoss   = (d, p) => d.bloodLoss === "significant" || p.patient.some(r => r.domain === "Anemia");

// ─── Timeline Phases ─────────────────────────────────────────────────────────

export const TIMELINE_PHASES = [

  // ═══════════════════════════════════════════════════
  // PHASE 1 — 8+ WEEKS
  // ═══════════════════════════════════════════════════
  {
    id: 1,
    badge: "Phase 1",
    timespan: "8+ Weeks Before Surgery",
    sub: "Ideal start window. Begin immediately.",
    title: "Begin Biological Preparation",
    focus: "This is the highest-leverage window. Every week added here improves outcomes measurably.",
    milestone: {
      text: "Your goal for this phase: Establish all prehabilitation habits, get baseline labs drawn at your pre-anesthesia testing visit, and begin any smoking or alcohol cessation journey now.",
    },
    cards: [
      {
        domain: "Exercise",
        title: "Begin Prehabilitation Now",
        detail: "Start with 20-minute walks 5x per week. Progress to 30–40 minutes by week 2. Add resistance training 2x per week. Target: 500 or more total prehabilitation minutes before surgery.",
        show: () => true,
      },
      {
        domain: "Nutrition",
        title: "Hit Your Protein Target Daily",
        detail: "Aim for 1.2–2.0 g of protein per kg of body weight per day, spread across 3–4 meals. Sources: lean meats, fish, eggs, Greek yogurt, legumes, whey. Build muscle reserve now — it is the raw material for healing.",
        show: () => true,
      },
      {
        domain: "Smoking",
        title: "Quit Smoking — Ideal Window",
        detail: "This is the single most impactful change you can make. Ciliary recovery begins in 2–4 weeks; immune and wound healing improves measurably in 6–8 weeks. Ask your physician about nicotine replacement therapy or varenicline.",
        show: isSmoker,
      },
      {
        domain: "Alcohol",
        title: "Begin Alcohol Reduction Now",
        detail: "Heavy alcohol use causes immune suppression, coagulopathy, and withdrawal risk. Target supervised cessation at least 4 weeks before surgery. Never stop abruptly without medical guidance if you are dependent.",
        show: isHeavyDrinker,
      },
      {
        domain: "PAT Visit",
        title: "Pre-Anesthesia Testing Visit",
        detail: "Baseline labs ordered: CBC, metabolic panel, HbA1c, iron studies. Cardiac risk stratification with RCRI and DASI score. Anemia workup begins if indicated. Bring a complete medication list including supplements.",
        show: () => true,
      },
      {
        domain: "Anemia",
        title: "Iron Studies and Anemia Workup",
        detail: "If hemoglobin is low, iron deficiency workup starts now. IV iron infusion, if indicated, needs 4–6 weeks to raise hemoglobin adequately. Target hemoglobin at or above 13 g/dL before surgery.",
        show: hasAnemia,
      },
      {
        domain: "Fasting",
        title: "Consider Time-Restricted Eating (14:10)",
        detail: "If you do not have diabetes, a 14:10 time-restricted eating window may improve metabolic flexibility and cellular repair. Not appropriate for insulin users. Stop this protocol 3 days before surgery.",
        show: (d) => !hasDiabetes(d),
      },
      {
        domain: "Thermal",
        title: "Introduce Thermal Conditioning",
        detail: "If cardiac-cleared: begin sauna 2–3x per week for heat stress protein upregulation, and cold exposure for autonomic flexibility training. Contraindicated with active CAD, recent MI, uncontrolled hypertension, or cardiomyopathy.",
        show: noCardiac,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 2 — 4–6 WEEKS
  // ═══════════════════════════════════════════════════
  {
    id: 2,
    badge: "Phase 2",
    timespan: "4–6 Weeks Before Surgery",
    sub: "Build momentum. Escalate intensity.",
    title: "Accelerate and Escalate",
    focus: "Prehabilitation is in full swing. Clinical workup deepens. Anemia treatment is underway.",
    milestone: null,
    cards: [
      {
        domain: "Exercise",
        title: "Add HIIT and Resistance Training",
        detail: "Increase to 30–45 minutes of cardio 5x per week. Add 2 HIIT sessions per week — evidence shows superior post-surgical fitness compared to moderate-only training. Resistance training 3x per week. Track grip strength weekly as a readiness biomarker.",
        show: () => true,
      },
      {
        domain: "Nutrition",
        title: "Sustain Protein and Log Daily",
        detail: "Protein adherence should be consistent and logged. If you are having cancer surgery, discuss immunonutrition with your team (arginine, omega-3, and nucleotides). Evidence shows a 54% reduction in infectious complications in high-risk surgical patients.",
        show: () => true,
      },
      {
        domain: "Anemia",
        title: "IV Iron Infusion (if prescribed)",
        detail: "IV iron, if indicated, is administered during this window. It takes 4–6 weeks to raise hemoglobin. A recheck will be ordered 2 weeks post-infusion to confirm response. Target: hemoglobin at or above 13 g/dL before surgery.",
        show: hasAnemia,
      },
      {
        domain: "Cardiac",
        title: "Cardiac Risk Stratification",
        detail: "RCRI and DASI scores are documented. BNP or NT-proBNP drawn if risk is elevated. Cardiology consultation ordered if indicated. Stress testing or echocardiogram may be requested based on your risk profile.",
        show: (d) => hasCardiac(d) || isElevated(d),
      },
      {
        domain: "Sleep",
        title: "Sleep 7–9 Hours. Breathe Daily.",
        detail: "Target 7–9 hours of sleep each night. Practice box breathing (4 in, 4 hold, 4 out, 4 hold) for 10 minutes daily — this measurably improves heart rate variability. Preoperative anxiety alters immune markers before surgery even begins.",
        show: () => true,
      },
      {
        domain: "Self-Tracking",
        title: "Weekly Readiness Check-In",
        detail: "Track weekly: grip strength, walking endurance, energy level (1–10), sleep quality, protein intake. Log HRV if you have a wearable device. A rising HRV trend confirms your preparation is working.",
        show: () => true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 3 — 2–4 WEEKS
  // ═══════════════════════════════════════════════════
  {
    id: 3,
    badge: "Phase 3",
    timespan: "2–4 Weeks Before Surgery",
    sub: "Clinical finalization. Labs confirmed.",
    title: "Clinical Optimization and Confirmation",
    focus: "Providers confirm all labs and risk stratification. Patients are nearing their readiness benchmarks.",
    milestone: null,
    cards: [
      {
        domain: "Anemia",
        title: "Hemoglobin Recheck",
        detail: "Recheck hemoglobin 2 weeks after IV iron infusion. Confirm response toward target. If insufficient, blood availability is confirmed with the blood bank. Hematology consultation if hemoglobin remains critically low.",
        show: hasAnemia,
      },
      {
        domain: "Labs",
        title: "Biomarkers Confirmed in Chart",
        detail: "BNP or NT-proBNP confirmed in chart if cardiac risk is elevated. HbA1c, creatinine, potassium, and INR confirmed. If on dialysis or at renal risk, creatinine clearance is checked. All lab results reviewed by the anesthesia team.",
        show: () => true,
      },
      {
        domain: "Medications",
        title: "Medication Plan Established",
        detail: "Hold, continue, and adjust orders are documented for all medications. Special attention to ACE inhibitors, ARBs, GLP-1 receptor agonists, SGLT2 inhibitors, anticoagulants, buprenorphine, insulin, and beta-blockers. Do not stop anything without explicit instruction.",
        show: () => true,
      },
      {
        domain: "Exercise",
        title: "Benchmark: 500 Prehabilitation Minutes",
        detail: "Are you on pace for 500 or more total prehabilitation minutes? A rising grip strength trend confirms adaptation. Maintain your current program — do not push to exhaustion. Recovery quality matters as much as session volume.",
        show: () => true,
      },
      {
        domain: "Smoking",
        title: "Cessation Confirmed at Visit",
        detail: "If still smoking, carbon monoxide level may be measured at your pre-anesthesia testing visit. Wound healing complications and pulmonary risks are significantly elevated in active smokers. Every smoke-free week between now and surgery matters.",
        show: isRecentSmoker,
      },
      {
        domain: "Fasting",
        title: "Continue Time-Restricted Eating (if applicable)",
        detail: "If practicing time-restricted eating, continue your protocol. Adherence for 3 or more weeks sustained is the target. You will stop this protocol 3 days before surgery — do not fast immediately pre-surgery.",
        show: (d) => !hasDiabetes(d) && isIF(d),
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 4 — 1 WEEK BEFORE
  // ═══════════════════════════════════════════════════
  {
    id: 4,
    badge: "Phase 4",
    timespan: "1 Week Before Surgery",
    sub: "Final medication holds placed.",
    title: "Final Preparation Countdown",
    focus: "Medications finalized, decolonization begins, exercise volume tapers.",
    milestone: null,
    cards: [
      {
        domain: "Medications",
        title: "All Hold Orders Confirmed",
        detail: "All medication hold, continue, and adjust orders are placed in your chart. Do not change any medications on your own. If you are unsure what to take the morning of surgery, call your surgical team before your procedure — never guess.",
        show: () => true,
      },
      {
        domain: "Infection Prevention",
        title: "MRSA Decolonization Begins",
        detail: "For higher-risk surgeries: a 5-day MRSA decolonization protocol begins (mupirocin nasal ointment and chlorhexidine bathing). This significantly reduces surgical site infection risk. Follow the instructions precisely and completely.",
        show: isElevated,
      },
      {
        domain: "Alcohol",
        title: "Withdrawal Risk Plan Confirmed",
        detail: "If you have a history of significant alcohol use or prior withdrawal, CIWA-Ar monitoring orders are placed and a benzodiazepine protocol is ready. Never abruptly stop alcohol without medical supervision if you are dependent.",
        show: hasWithdrawal,
      },
      {
        domain: "Exercise",
        title: "Begin Taper — Like Race Week",
        detail: "Reduce exercise volume by 30% this week. Think of it like an athletic taper before competition — you want to arrive rested and at peak capacity, not fatigued. Light walks and mobility work continue daily.",
        show: () => true,
      },
      {
        domain: "Sleep",
        title: "Protect Your Sleep — 8+ Hours",
        detail: "This week, sleep is a top priority. Avoid alcohol (disrupts sleep architecture), limit screens 1 hour before bed. Preoperative anxiety is real — breathe. Your body is ready. Talk to your care team about any fears you have.",
        show: () => true,
      },
      {
        domain: "Blood Availability",
        title: "Blood Bank Confirmed",
        detail: "For surgeries with expected significant blood loss, blood availability is confirmed with the blood bank. Type and screen or type and crossmatch completed. Your anemia target hemoglobin is confirmed in the chart.",
        show: hasBloodLoss,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 5 — 3–5 DAYS BEFORE
  // ═══════════════════════════════════════════════════
  {
    id: 5,
    badge: "Phase 5",
    timespan: "3–5 Days Before Surgery",
    sub: "Critical medication hold windows.",
    title: "Specific Medication Holds Begin",
    focus: "Several medications have specific hold windows that open now. Follow your team's exact instructions.",
    milestone: {
      text: "Never stop a medication without explicit instruction from your care team. Hold windows vary by drug and patient — the guidance below is general. Your team's instructions always take precedence.",
    },
    cards: [
      {
        domain: "Medications",
        title: "SGLT2 Inhibitor Hold (3 or More Days)",
        detail: "If you take empagliflozin, dapagliflozin, canagliflozin, or similar: hold for 3–4 days before surgery. Risk of euglycemic diabetic ketoacidosis — a dangerous condition with normal blood sugar. Urine ketones will be checked on the day of surgery.",
        show: hasSGLT2,
      },
      {
        domain: "Medications",
        title: "GLP-1 Receptor Agonist Hold",
        detail: "Semaglutide, liraglutide, tirzepatide: may require holding one full dose cycle before surgery (up to 1 week for weekly dosing) due to delayed gastric emptying and aspiration risk. Confirm the exact hold timing with your team.",
        show: hasGLP1,
      },
      {
        domain: "Fasting",
        title: "Stop Time-Restricted Eating",
        detail: "If you have been practicing time-restricted eating, stop your protocol now — at least 3 days before surgery. Resume normal eating patterns. Carbohydrate loading, not fasting, is your tool for the final stretch.",
        show: (d) => isIF(d) && !hasDiabetes(d),
      },
      {
        domain: "Thermal",
        title: "Wind Down Thermal Conditioning",
        detail: "Begin reducing sauna and cold exposure session intensity. Lighter sessions are acceptable. Stop all thermal conditioning completely 24–48 hours before surgery to allow full hemodynamic stability and recovery.",
        show: hasThermal,
      },
      {
        domain: "Anticoagulants",
        title: "Anticoagulant Hold Window (Varies by Drug)",
        detail: "Warfarin: INR must reach target range. Direct oral anticoagulants hold windows vary by drug and kidney function (24 hours to 5 days). ASRA 5th Edition guidelines apply. Your anesthesiologist will give specific timing instructions.",
        show: hasAnticoag,
      },
      {
        domain: "Alcohol",
        title: "Complete Alcohol Abstinence Now",
        detail: "Stop all alcohol consumption now. Even moderate alcohol affects platelet function and interacts with anesthetic medications. No alcohol for at least 48–72 hours before surgery — longer if you have a history of heavy use.",
        show: isDrinker,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 6 — EVENING BEFORE
  // ═══════════════════════════════════════════════════
  {
    id: 6,
    badge: "Phase 6",
    timespan: "The Evening Before Surgery",
    sub: "Carbohydrate loading. NPO begins.",
    title: "Carbohydrate Loading and Rest",
    focus: "ERAS-protocol carbohydrate loading reduces insulin resistance and nausea. Then rest — you have earned it.",
    milestone: null,
    cards: [
      {
        domain: "Carb Loading",
        title: "800 mL Carbohydrate Drink Tonight",
        detail: "Drink 800 mL of a clear carbohydrate drink this evening (Gatorade, apple juice, or a commercial preop drink like Clearfast). ERAS evidence: reduces postoperative insulin resistance, nausea, muscle catabolism, and hospital length of stay.",
        show: () => true,
      },
      {
        domain: "NPO",
        title: "Nothing to Eat After Midnight",
        detail: "No solid food after midnight, or as directed — your team may specify a different cutoff. This prevents aspiration of stomach contents during anesthesia. No gum, hard candy, or food of any kind.",
        show: () => true,
      },
      {
        domain: "Infection Prevention",
        title: "Chlorhexidine Shower Tonight",
        detail: "Shower with chlorhexidine soap tonight if prescribed as part of MRSA decolonization or standard prep. Reduces skin bacterial burden significantly. Do not shave the surgical site yourself — this increases infection risk.",
        show: isElevated,
      },
      {
        domain: "Sleep",
        title: "Protect Sleep — No Alcohol, No Screens",
        detail: "Get to bed at a reasonable hour. No alcohol tonight — it severely disrupts sleep architecture and increases aspiration risk. Dim screens 1 hour before bed. If anxious, 10 minutes of box breathing. You have prepared well.",
        show: () => true,
      },
      {
        domain: "Logistics",
        title: "Prepare for Tomorrow",
        detail: "Confirm your arrival time. Know which medications to take in the morning with a small sip of water. Leave jewelry and valuables at home. Arrange a driver — you cannot drive after anesthesia. Bring your CPAP machine if you use one.",
        show: () => true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 7 — DAY OF SURGERY
  // ═══════════════════════════════════════════════════
  {
    id: 7,
    badge: "Phase 7",
    timespan: "Day of Surgery",
    sub: "Final prep. You are ready.",
    title: "Surgery Day — Final Checklist",
    focus: "A few final steps, then trust your team. You have done the work.",
    milestone: {
      text: "You have completed your preparation. The weeks of prehabilitation, nutrition, and clinical optimization converge today. Your physiological reserve is higher. Your risk is lower. Trust your team.",
      isSuccess: true,
    },
    dayOfSurgery: true,
    cards: [
      {
        domain: "Carb Loading",
        title: "400 mL Carbohydrate Drink — 2 to 3 Hours Before",
        detail: "Drink 400 mL of clear carbohydrate drink 2–3 hours before your scheduled surgery time. This is the second dose of ERAS carbohydrate loading. It must be clear liquid only — no pulp, no dairy, no protein.",
        show: () => true,
      },
      {
        domain: "Medications",
        title: "Take Only Approved Medications",
        detail: "Take only the medications your team told you to take this morning, with a small sip of water. If you are unsure about any medication, call before you arrive — do not guess on the day of surgery.",
        show: () => true,
      },
      {
        domain: "Labs",
        title: "Day-of Labs: Ketones and Glucose",
        detail: "If you take SGLT2 inhibitors: urine ketone check on arrival. If you have diabetes: fingerstick glucose check. Results guide intraoperative glucose management. CPAP users: bring your device and settings documentation.",
        show: (d) => hasSGLT2(d) || hasDiabetes(d),
      },
      {
        domain: "Check-In",
        title: "Confirm Consents and Preferences",
        detail: "Your anesthesiologist will introduce themselves and review the plan. This is the time to confirm your resuscitation preferences, known allergies, and any concerns about pain management. Ask any remaining questions — this is your moment.",
        show: () => true,
      },
      {
        domain: "Airway & OSA",
        title: "CPAP and Airway Details Confirmed",
        detail: "If you use CPAP for sleep apnea, your device settings are in the chart. Bring your machine. Your anesthesiologist has your airway assessment on file — Mallampati score, neck circumference, and mouth opening already documented.",
        show: hasOSA,
      },
      {
        domain: "NPO",
        title: "Nothing by Mouth — Final",
        detail: "After your 2–3 hour carbohydrate drink: nothing by mouth until surgery. No water, no gum, no mints. If your surgery is delayed significantly, ask your team if the NPO window resets — sometimes a small amount of clear fluid is re-permitted.",
        show: () => true,
      },
    ],
  },
];
