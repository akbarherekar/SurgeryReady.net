/**
 * SurgeryReady Patient Timeline — Personalized Generator
 *
 * Data only. No JSX, no imports, no UI.
 *
 * generateTimeline(data, plan) → phase[]
 *   data  = the full assessment data object
 *   plan  = generatePlan() output { patient[], provider[], alerts[], riskLevel }
 *
 * Each phase: { id, badge, timespan, sub, title, focus, milestone, dayOfSurgery?, cards[] }
 * Each card:  { domain, title, detail, show(data, plan) → boolean }
 *
 * Design principle: timeline starts from TODAY and shows only forward-looking phases.
 * No past phases. Exercise content is generated based on the patient's fitness baseline
 * and their available program weeks using an evidence-based progressive overload model.
 */

// ─── Show condition helpers ───────────────────────────────────────────────────

const isSmoker        = (d) => d.smokingStatus === "current";
const isRecentSmoker  = (d) => d.smokingStatus === "current" || d.smokingStatus === "former_lt8";
const isDrinker       = (d) => d.alcoholUse && d.alcoholUse !== "none";
const isHeavyDrinker  = (d) => d.alcoholUse === "heavy" || d.alcoholUse === "moderate";
const hasWithdrawal   = (d) => d.alcoholUse === "heavy" || d.withdrawalHistory === "yes";
const hasAnemia       = (d, p) => p.patient.some(r => r.domain === "Anemia");
const hasCardiac      = (d) => Array.isArray(d.cardiac) && d.cardiac.length > 0;
const noCardiac       = (d) => !hasCardiac(d);
const hasSGLT2        = (d) => Array.isArray(d.diabetesMeds) && d.diabetesMeds.some(m => m.includes("SGLT2"));
const hasGLP1         = (d) => Array.isArray(d.diabetesMeds) && d.diabetesMeds.some(m => m.includes("GLP-1") || m.includes("Tirzepatide"));
const hasAnticoag     = (d) => Array.isArray(d.anticoag) && d.anticoag.some(a => !["Aspirin", ""].includes(a));
const hasThermal      = (d) => Array.isArray(d.thermalHabits) && d.thermalHabits.some(h => h !== "None");
const hasOSA          = (d) => Array.isArray(d.respiratory) && d.respiratory.some(r => r.includes("OSA"));
const hasDiabetes     = (d) => Array.isArray(d.endocrine) && d.endocrine.some(e => e.includes("Diabetes") || e.includes("Insulin"));
const isIF            = (d) => d.eatingPattern === "if";
const isElevated      = (d) => d.riskCategory === "elevated" || d.riskCategory === "high";
const hasBloodLoss    = (d, p) => d.bloodLoss === "significant" || p.patient.some(r => r.domain === "Anemia");
const isCardiacUnsafe = (d) => {
  const cardiac = d.cardiac || [];
  const all = [...cardiac, ...(d.endocrine || []), ...(d.other || []), ...(d.respiratory || [])];
  return cardiac.includes("Prior MI (within 6 months)") || all.includes("Uncontrolled HTN (DBP >110)");
};

// ─── Evidence-based exercise card generator ───────────────────────────────────
//
// programWeek: 1 = this is their first week of the program (right now)
// totalProgramWeeks: how many weeks they have before the final taper week
// exerciseLevel: "sedentary" | "light" | "moderate" | "active" | "high"
//
// Evidence basis:
// - Prehabilitation >500 total minutes reduces postop rehab needs (JAMA Netw Open 2023)
// - HIIT produces superior surgical fitness vs moderate-continuous — but requires a
//   minimum 2-3 week aerobic base for sedentary patients before safe introduction
//   (Multimodal prehab meta-analysis, Sci Rep 2024)
// - Cold introduction of HIIT without base = injury risk, DOMS, adherence failure
// - Taper: 20-30% volume reduction in final 5-7 days (athletic periodization literature)

function exerciseCardForPhase(level, programWeek, totalProgramWeeks, d) {
  // Always taper in final week regardless of fitness level
  if (programWeek >= totalProgramWeeks) {
    return {
      domain: "Exercise",
      title: "Final Week Taper — Arrive Rested",
      detail: "Reduce all exercise volume by 30% this week. Think of it as an athletic taper before competition — you want to arrive at surgery rested and at peak capacity, not fatigued and depleted. Light walks (20 min) and gentle mobility work are ideal. Protect your sleep above all else this week.",
      show: () => true,
    };
  }

  // HIIT gate thresholds by baseline fitness
  // Sedentary: HIIT only if programWeek >= 3 (needs 2 weeks of aerobic base first)
  // Light: HIIT only if programWeek >= 2 (needs 1 week of walking base first)
  // Moderate/Active: HIIT from week 1 (already has the base)
  const hiitReady = {
    sedentary: programWeek >= 3,
    light:     programWeek >= 2,
    moderate:  programWeek >= 1,
    active:    programWeek >= 1,
    high:      programWeek >= 1,
  };
  const canHIIT = hiitReady[level] || false;

  if (level === "sedentary") {
    if (programWeek === 1) return {
      domain: "Exercise",
      title: "Begin With Walking — Build the Habit",
      detail: "Start with 20-minute walks 5 days this week. Move at a comfortable, conversational pace — you should be able to hold a sentence while walking. Consistency beats intensity at this stage. Every session you complete is building cardiovascular adaptation. No resistance training or intervals this week — let your body establish the aerobic foundation first.",
      show: () => true,
    };
    if (programWeek === 2) return {
      domain: "Exercise",
      title: "Extend Walks + Begin Resistance Training",
      detail: "Increase walks to 30 minutes, 5 days this week. Add resistance training 2 days this week: bodyweight squats (3×10), wall push-ups (3×10), step-ups on a stair (3×10 each leg), glute bridges (3×12). These build the muscle reserves your body will need for recovery. No intervals yet — continue building your aerobic base.",
      show: () => true,
    };
    // programWeek 3+ for sedentary: add intervals, and HIIT if week 4+
    if (!canHIIT) return {
      domain: "Exercise",
      title: "Add Light Intervals + Resistance 3x/Week",
      detail: "Increase walks to 30–40 minutes. Add light intervals 1 day this week: alternate 2 minutes of brisk walking with 1 minute of easy pace, repeated 8–10 times. Resistance training 3 days: add progress to your exercises from last week (increase reps to 12–15 or add light dumbbells if available). Your cardiovascular system is adapting — you should feel noticeably more capable than week 1.",
      show: () => true,
    };
    return {
      domain: "Exercise",
      title: "Add HIIT + Full Resistance Program",
      detail: "You have built sufficient aerobic base to safely add high-intensity intervals. Add 1–2 HIIT sessions this week: 6–8 rounds of 1-minute maximum effort (brisk walking or jogging) followed by 2 minutes easy recovery. Evidence shows HIIT produces greater surgical fitness improvement than moderate training. Continue resistance 3 days/week. Track grip strength weekly — a rising trend confirms your preparation is working.",
      show: () => true,
    };
  }

  if (level === "light") {
    if (programWeek === 1) return {
      domain: "Exercise",
      title: "Increase Intensity + Add Resistance",
      detail: "Increase your walking sessions to 30–40 minutes, 5 days this week. Add resistance training 2 days: squats (3×12), lunges (3×10 each leg), rows with bands or light dumbbells (3×12), push-ups (3×10). Focus on full range of motion — functional muscle quality matters more than raw load at this stage.",
      show: () => true,
    };
    if (!canHIIT) return {
      domain: "Exercise",
      title: "Add Light Intervals + Resistance 3x",
      detail: "Add light intervals 2 days this week: alternate 2 minutes brisk walking with 1 minute easy pace for 25–30 minute sessions. This efficiently boosts VO2max. Resistance training 3 days this week — increase reps or add light load to last week's exercises. You should be building visible momentum by now.",
      show: () => true,
    };
    return {
      domain: "Exercise",
      title: "Full HIIT + Resistance Program",
      detail: "Add HIIT 2 days this week: 6–8 rounds of 1-minute high-effort intervals (jogging, cycling, or brisk walking) with 90-second recovery between each. Evidence consistently shows HIIT sustains greater post-surgical fitness than moderate-intensity training. Resistance 3 days/week — continue progressing loads. Track grip strength weekly: a rising trend is your objective measure of preparation.",
      show: () => true,
    };
  }

  if (level === "moderate") {
    if (programWeek === 1) return {
      domain: "Exercise",
      title: "Add HIIT to Your Current Program",
      detail: "Your fitness base is solid — the opportunity is to sharpen it. Add 1–2 HIIT sessions this week: replace 2 moderate sessions with high-intensity intervals (6–8 × 1 min maximum effort / 2 min recovery). HIIT produces superior post-surgical fitness compared to moderate-continuous training. Begin tracking grip strength weekly — it is a validated predictor of postoperative outcomes.",
      show: () => true,
    };
    return {
      domain: "Exercise",
      title: "HIIT 2x/Week + Resistance + Grip Tracking",
      detail: "Maintain HIIT 2 days/week. Continue resistance training 3 days/week — ensure your program includes functional movements: single-leg exercises, hip hinges, pressing, and pulling patterns that map to post-surgical mobility demands. Track grip strength weekly. Are you on pace for 500+ total prehabilitation minutes? A rising grip trend confirms your preparation is translating to objective readiness.",
      show: () => true,
    };
  }

  // active / high
  if (programWeek === 1) return {
    domain: "Exercise",
    title: "Maintain Program — Track Objective Readiness",
    detail: "Your fitness level is a major physiological asset. Continue your current program without adding new stressors — consistency is the goal. Begin tracking grip strength weekly with a dynamometer or firm hand-squeeze assessment (maximum effort × 3 each hand). Rising grip strength confirms your preparation is working. A sudden drop may indicate overtraining — scale back if this occurs.",
    show: () => true,
  };
  return {
    domain: "Exercise",
    title: "Maintain Program + Confirm 500+ Prehab Minutes",
    detail: "Continue your current program. Confirm you are on pace for 500+ total prehabilitation minutes before surgery — evidence shows this threshold significantly reduces postoperative rehabilitation needs vs. lower doses. Track grip strength weekly. Monitor for overtraining signs: HRV drop, persistent fatigue, soreness that does not resolve in 48h — these are signals to reduce intensity.",
    show: () => true,
  };
}

// Exercise card for when exercise is medically unsafe (cardiac gate)
function exerciseUnsafeCard() {
  return {
    domain: "Exercise",
    title: "Exercise — Physician Clearance Required First",
    detail: "Active cardiac conditions have been noted in your profile (recent cardiac event or uncontrolled blood pressure). Do NOT begin any new exercise program without explicit physician clearance. Once cleared, even gentle supervised activity during this window preserves function. Ask your physician about cardiac rehabilitation or a supervised prehabilitation program appropriate for your situation.",
    show: () => true,
  };
}

// ─── Phase builder utilities ──────────────────────────────────────────────────

function makeBadge(index) {
  return `Phase ${index + 1}`;
}

// ─── Fixed phase builders ─────────────────────────────────────────────────────

function buildMedicationHoldsPhase(id) {
  return {
    id,
    badge: "Medication Holds",
    timespan: "3–5 Days Before Surgery",
    sub: "Critical hold windows open now.",
    title: "Specific Medication Holds Begin",
    focus: "Several medications have specific hold windows that open this week. Follow your team's exact instructions — general guidance is shown below.",
    milestone: {
      text: "Never stop a medication without explicit instruction from your care team. Hold windows vary by drug and patient — your team's instructions always take precedence over general guidance.",
    },
    dayOfSurgery: false,
    cards: [
      {
        domain: "Medications",
        title: "SGLT2 Inhibitor Hold (3 or More Days)",
        detail: "If you take empagliflozin, dapagliflozin, canagliflozin, or similar: hold for 3–4 days before surgery. Risk of euglycemic diabetic ketoacidosis — a dangerous condition that can occur even with normal blood sugar. Urine ketones will be checked on the day of surgery.",
        show: hasSGLT2,
      },
      {
        domain: "Medications",
        title: "GLP-1 Receptor Agonist Hold",
        detail: "Semaglutide, liraglutide, tirzepatide and similar: may require holding one full dose cycle before surgery (up to 1 week for weekly dosing) due to delayed gastric emptying and aspiration risk. Confirm the exact hold timing with your anesthesia team.",
        show: hasGLP1,
      },
      {
        domain: "Fasting",
        title: "Stop Time-Restricted Eating Now",
        detail: "If you have been practicing time-restricted eating, stop your protocol now — at least 3 days before surgery. Resume normal eating patterns. Carbohydrate loading, not fasting, is your preparation tool for the final stretch.",
        show: (d) => isIF(d) && !hasDiabetes(d),
      },
      {
        domain: "Thermal",
        title: "Wind Down Thermal Conditioning",
        detail: "Begin reducing sauna and cold exposure session intensity. Lighter sessions remain acceptable. Stop all thermal conditioning completely 24–48 hours before surgery to allow full hemodynamic stability before anesthesia induction.",
        show: hasThermal,
      },
      {
        domain: "Anticoagulants",
        title: "Anticoagulant Hold Window (Varies by Drug)",
        detail: "Warfarin: INR must reach target range before surgery. Direct oral anticoagulants have hold windows of 24 hours to 5 days depending on drug and kidney function (ASRA 5th Edition). Your anesthesiologist will give you specific timing instructions — do not adjust on your own.",
        show: hasAnticoag,
      },
      {
        domain: "Alcohol",
        title: "Complete Alcohol Abstinence Starting Now",
        detail: "Stop all alcohol consumption now. Even moderate alcohol affects platelet function and interacts with anesthetic medications. No alcohol for at least 48–72 hours before surgery — longer if you have a history of heavy use or dependence.",
        show: isDrinker,
      },
    ],
  };
}

function buildEveningBeforePhase(id) {
  return {
    id,
    badge: "Evening Before",
    timespan: "The Evening Before Surgery",
    sub: "Carbohydrate loading. NPO begins.",
    title: "Carbohydrate Loading and Rest",
    focus: "ERAS-protocol carbohydrate loading reduces insulin resistance, nausea, and catabolism. Then rest — you have done the work.",
    milestone: null,
    dayOfSurgery: false,
    cards: [
      {
        domain: "Carb Loading",
        title: "800 mL Carbohydrate Drink Tonight",
        detail: "Drink 800 mL of a clear carbohydrate beverage this evening (Gatorade, apple juice, or a commercial preop drink like Clearfast). ERAS evidence: reduces postoperative insulin resistance, nausea, muscle catabolism, and hospital length of stay. This replaces the old 'nothing after midnight' rule for liquids.",
        show: () => true,
      },
      {
        domain: "NPO",
        title: "Nothing to Eat After Midnight",
        detail: "No solid food after midnight, or as specifically directed by your team — they may give a different cutoff based on your procedure. This prevents aspiration of stomach contents during anesthesia. No gum, no hard candy, no food of any kind.",
        show: () => true,
      },
      {
        domain: "Infection Prevention",
        title: "Chlorhexidine Shower Tonight",
        detail: "Shower with chlorhexidine (CHG) soap tonight as prescribed. This reduces skin bacterial burden before your procedure. Do not shave the surgical site yourself — this increases infection risk. Your surgical team will prepare the area.",
        show: isElevated,
      },
      {
        domain: "Sleep",
        title: "Protect Sleep — No Alcohol, No Screens",
        detail: "Get to bed at a reasonable hour. No alcohol tonight — it severely disrupts sleep architecture and increases aspiration risk. Dim screens 1 hour before bed. If anxious, 10 minutes of box breathing (4-4-4-4). Your body does its best recovery work during sleep. You have prepared well.",
        show: () => true,
      },
      {
        domain: "Logistics",
        title: "Confirm Tomorrow's Plan",
        detail: "Confirm your arrival time and facility address. Know which medications to take in the morning with a small sip of water (your team told you which ones). Leave jewelry and valuables at home. Arrange a driver — you cannot drive after anesthesia. Bring your CPAP machine and settings documentation if you use one.",
        show: () => true,
      },
    ],
  };
}

function buildDayOfSurgeryPhase(id) {
  return {
    id,
    badge: "Surgery Day",
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
        detail: "Drink 400 mL of clear carbohydrate beverage 2–3 hours before your scheduled surgery time. This is the second dose of ERAS carbohydrate loading. Clear liquid only — no pulp, no dairy, no protein. Confirm the exact timing with your anesthesia team.",
        show: () => true,
      },
      {
        domain: "Medications",
        title: "Take Only Approved Medications",
        detail: "Take only the medications your team told you to take this morning, with a small sip of water. If you are unsure about any medication, call before you arrive — do not guess on the day of surgery. Your anesthesiologist needs to know exactly what is in your system.",
        show: () => true,
      },
      {
        domain: "Labs",
        title: "Day-of Labs: Ketones and Glucose",
        detail: "If you take SGLT2 inhibitors: urine ketone check on arrival is required (euglycemic DKA risk). If you have diabetes: fingerstick glucose check to guide intraoperative management. Results are reviewed by your anesthesiologist before proceeding.",
        show: (d) => hasSGLT2(d) || hasDiabetes(d),
      },
      {
        domain: "Check-In",
        title: "Confirm Consents and Preferences",
        detail: "Your anesthesiologist will introduce themselves and review the plan. This is the time to confirm your resuscitation preferences, known allergies, and any concerns about pain management. Ask any remaining questions before you go back — this is your moment.",
        show: () => true,
      },
      {
        domain: "Airway & OSA",
        title: "CPAP and Airway Details Confirmed",
        detail: "If you use CPAP for sleep apnea, your device settings are documented in your chart. Bring your machine. Your anesthesiologist has your airway assessment on file — Mallampati score, neck circumference, and mouth opening already documented at your pre-anesthesia visit.",
        show: hasOSA,
      },
      {
        domain: "NPO",
        title: "Nothing by Mouth — Final",
        detail: "After your 2–3 hour carbohydrate drink: nothing by mouth until surgery. No water, no gum, no mints. If your surgery is delayed significantly, ask your team whether the NPO window resets — in some cases a small amount of clear fluid can be re-permitted.",
        show: () => true,
      },
    ],
  };
}

// ─── Prehab phase builders ────────────────────────────────────────────────────
//
// Each prehab phase receives:
//   programWeek   — which week of the patient's program this phase represents (1 = now)
//   totalProgWeeks — total prehab program weeks available (weeksUntil - 1 for taper)
//   data, plan    — for show conditions

function buildPrehabPhase(id, timespan, sub, title, focus, milestone, programWeek, totalProgWeeks, data, plan) {
  const level = data.exerciseLevel || "sedentary";
  const cardiacUnsafe = isCardiacUnsafe(data);
  const weeks = parseInt(data.weeksUntil) || 0;

  const exerciseCard = cardiacUnsafe
    ? exerciseUnsafeCard()
    : exerciseCardForPhase(level, programWeek, totalProgWeeks, data);

  const isFirstPhase = programWeek === 1;
  const isFinalPrehabPhase = programWeek >= totalProgWeeks;

  // Smoking card: use urgency appropriate to how many weeks remain
  const smokingDetail = (() => {
    if (!isSmoker(data)) return null;
    if (weeks >= 8) return "This is the ideal window for smoking cessation. Quitting now allows 6–8 weeks of immune and wound healing recovery before surgery — the full benefit window. Carbon monoxide clears in just 24–48 hours. Ask your physician about nicotine replacement therapy or varenicline. This is the single most impactful change you can make for your surgical outcome.";
    if (weeks >= 4) return `With ${weeks} weeks until surgery, cessation now still significantly reduces complications. Carbon monoxide clears in 24–48 hours (immediate tissue oxygenation benefit), airway reactivity improves in 1–2 weeks, and immune and wound healing improves in 4–6 weeks. Ask about nicotine replacement therapy. Every smoke-free week compounds the benefit.`;
    return `Even stopping in the next 24–48 hours is directly beneficial: carboxyhemoglobin normalizes, restoring the oxygen-carrying capacity that was bound to carbon monoxide. Do not smoke the day of surgery. Discuss nicotine replacement therapy with your anesthesiologist. Every smoke-free hour before surgery improves tissue oxygenation.`;
  })();

  const cards = [
    // Exercise — always first
    exerciseCard,

    // Nutrition protein target — first phase only
    ...(isFirstPhase ? [{
      domain: "Nutrition",
      title: "Hit Your Protein Target Every Day",
      detail: "Aim for 1.2–2.0 g of protein per kg of body weight per day, distributed across 3–4 meals. Surgery accelerates protein catabolism — building reserves now means your body has the raw material for immune function, wound healing, and maintaining the muscle you gained in prehabilitation. Sources: lean meats, fish, eggs, Greek yogurt, legumes, whey protein.",
      show: () => true,
    }] : []),

    // PAT visit — first phase only
    ...(isFirstPhase ? [{
      domain: "PAT Visit",
      title: "Pre-Anesthesia Testing Visit",
      detail: "Baseline labs are ordered at this visit: CBC, metabolic panel, HbA1c if diabetic, iron studies. Cardiac risk is stratified with RCRI and DASI score. Anemia workup begins if indicated. Bring a complete medication list including supplements and doses. This visit directly informs your personalized care plan.",
      show: () => true,
    }] : []),

    // Anemia workup — early phases
    ...(!isFinalPrehabPhase ? [{
      domain: "Anemia",
      title: "Iron Studies and Anemia Workup",
      detail: weeks >= 4
        ? "If hemoglobin is low, iron deficiency workup starts now. IV iron infusion, if indicated, needs 4–6 weeks to raise hemoglobin adequately. Starting as early as possible is critical — your physician will guide the treatment plan. Target hemoglobin at or above 13 g/dL before surgery."
        : "With limited time before surgery, your physician will determine the fastest path to optimizing hemoglobin — which may include IV iron, expedited blood bank coordination, or other approaches. Discuss your anemia management plan at your next visit.",
      show: hasAnemia,
    }] : []),

    // Anemia recheck — later phases only (not first)
    ...(!isFirstPhase && isFinalPrehabPhase ? [{
      domain: "Anemia",
      title: "Hemoglobin Recheck",
      detail: "If IV iron was administered, recheck hemoglobin now to confirm response. Confirm blood availability with the blood bank for surgeries with significant expected blood loss. If hemoglobin remains critically low, hematology consultation is indicated.",
      show: hasAnemia,
    }] : []),

    // Cardiac risk stratification — second phase onward
    ...(!isFirstPhase ? [{
      domain: "Cardiac",
      title: "Cardiac Risk Stratification Confirmed",
      detail: "RCRI and DASI scores are documented. BNP or NT-proBNP ordered if risk is elevated. Cardiology consultation arranged if indicated. Stress testing or echocardiogram may be requested based on your risk profile and the 2024 AHA/ACC stepwise algorithm.",
      show: (d) => hasCardiac(d) || isElevated(d),
    }] : []),

    // Sleep — all phases
    {
      domain: "Sleep",
      title: "Sleep 7–9 Hours. Box Breathe Daily.",
      detail: "Target 7–9 hours of sleep each night. Practice box breathing (4 seconds in, 4 hold, 4 out, 4 hold) for 10 minutes daily — this directly improves heart rate variability, a validated predictor of perioperative outcomes. Preoperative anxiety measurably alters immune markers before surgery even begins. Managing stress is biological preparation.",
      show: () => true,
    },

    // Smoking — first phase if current smoker
    ...(isFirstPhase && smokingDetail ? [{
      domain: "Smoking",
      title: weeks >= 8 ? "Quit Smoking — Ideal Window" : weeks >= 4 ? "Quit Smoking — Meaningful Benefit Still Achievable" : "Stop Smoking — Every Hour Helps",
      detail: smokingDetail,
      show: isSmoker,
    }] : []),

    // Smoking reinforcement — later phases
    ...(!isFirstPhase ? [{
      domain: "Smoking",
      title: "Cessation Confirmed — Stay Smoke-Free",
      detail: "Confirm smoking status at your pre-anesthesia visit. If still smoking, carbon monoxide may be measured. Every additional smoke-free week between now and surgery measurably reduces pulmonary and wound complications. Airway reactivity in recent quitters remains slightly elevated — standard precautions apply.",
      show: isRecentSmoker,
    }] : []),

    // Alcohol — first phase for heavy/moderate drinkers
    ...(isFirstPhase ? [{
      domain: "Alcohol",
      title: "Begin Alcohol Reduction Now",
      detail: "Heavy alcohol use causes immune suppression (2–5x higher infection rates), coagulopathy, and withdrawal risk. Target supervised cessation at least 4 weeks before surgery. Never stop abruptly without medical guidance if you are dependent — withdrawal typically begins 6–24 hours after the last drink and can be dangerous during hospitalization.",
      show: isHeavyDrinker,
    }] : []),

    // Alcohol withdrawal plan — final prehab phase
    ...(isFinalPrehabPhase ? [{
      domain: "Alcohol",
      title: "Withdrawal Risk Plan Confirmed",
      detail: "If you have a history of significant alcohol use or prior withdrawal events, CIWA-Ar monitoring orders are placed and a benzodiazepine protocol is ready for your admission. Never abruptly stop alcohol without medical supervision if you are dependent.",
      show: hasWithdrawal,
    }] : []),

    // Thermal — first phase only if no cardiac risk
    ...(isFirstPhase ? [{
      domain: "Thermal",
      title: "Introduce Thermal Conditioning",
      detail: "If cardiac-cleared: begin sauna 2–3 times per week for heat shock protein upregulation and autonomic conditioning. Cold water exposure (15°C or below) trains autonomic flexibility — precisely the adaptability that determines how well your body tolerates surgical stress. Contraindicated with active CAD, recent MI, uncontrolled hypertension, or cardiomyopathy.",
      show: noCardiac,
    }] : []),

    // Fasting — first phase if not diabetic and enough time
    ...(isFirstPhase && weeks >= 3 ? [{
      domain: "Fasting",
      title: "Consider Time-Restricted Eating (14:10)",
      detail: "If you do not have diabetes, a 14:10 time-restricted eating window may activate AMPK, SIRT1, and autophagy pathways that precondition cells against surgical stress. Not appropriate for insulin users. Stop this protocol completely 3 days before surgery — carbohydrate loading, not fasting, is your final pre-surgical protocol.",
      show: (d) => !hasDiabetes(d),
    }] : []),

    // IF continuation reminder — middle phases
    ...(!isFirstPhase && !isFinalPrehabPhase ? [{
      domain: "Fasting",
      title: "Continue Time-Restricted Eating (if applicable)",
      detail: "If practicing time-restricted eating, maintain your protocol. You will stop this 3 days before surgery and switch to the ERAS carbohydrate loading protocol. Do not fast in the days immediately before surgery.",
      show: (d) => !hasDiabetes(d) && isIF(d),
    }] : []),

    // MRSA decolonization — final prehab phase only
    ...(isFinalPrehabPhase ? [{
      domain: "Infection Prevention",
      title: "MRSA Decolonization Begins",
      detail: "For elevated-risk surgeries: a 5-day MRSA decolonization protocol begins now (mupirocin nasal ointment twice daily + chlorhexidine bathing). This significantly reduces surgical site infection risk. Follow the protocol precisely and completely. Do not skip doses.",
      show: isElevated,
    }] : []),

    // Blood bank — final prehab phase
    ...(isFinalPrehabPhase ? [{
      domain: "Blood Availability",
      title: "Blood Bank Confirmed",
      detail: "For surgeries with expected significant blood loss: blood availability is confirmed with the blood bank. Type and screen or type and crossmatch has been completed. Your anemia target hemoglobin is confirmed in the chart.",
      show: hasBloodLoss,
    }] : []),

    // Medication plan — final prehab phase
    ...(isFinalPrehabPhase ? [{
      domain: "Medications",
      title: "All Medication Hold Orders Confirmed",
      detail: "All hold, continue, and adjust orders for your medications are placed in your chart. Do not change any medications on your own. If you are unsure what to take the morning of surgery, call your surgical team before your procedure — never guess.",
      show: () => true,
    }] : []),
  ];

  return {
    id,
    badge: makeBadge(id - 1),
    timespan,
    sub,
    title,
    focus,
    milestone: milestone || null,
    dayOfSurgery: false,
    cards,
  };
}

// ─── Main generator function ──────────────────────────────────────────────────

export function generateTimeline(data, plan) {
  const weeks = parseInt(data.weeksUntil) || 0;
  const phases = [];
  let phaseId = 1;

  // ── No prehab time at all (day of surgery or past) ──
  if (weeks <= 0) {
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── Less than 1 week — skip prehab, go straight to med holds ──
  if (weeks < 1) {
    phases.push(buildMedicationHoldsPhase(phaseId++));
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── 1 week only — taper phase ──
  if (weeks === 1) {
    phases.push(buildPrehabPhase(
      phaseId++,
      "1 Week Before Surgery",
      "Final prehab week. Protect your readiness.",
      "Final Week — Taper and Prepare",
      "This week is about arriving at surgery rested and at peak capacity, not pushing harder. Reduce volume, protect sleep, and let your preparation consolidate.",
      null,
      1, 1, data, plan
    ));
    phases.push(buildMedicationHoldsPhase(phaseId++));
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── 2 weeks — start + taper ──
  if (weeks === 2) {
    phases.push(buildPrehabPhase(
      phaseId++,
      "2 Weeks Before Surgery",
      "Start now. Every session matters.",
      "Begin Prehabilitation — 2 Weeks Available",
      "Two weeks is a meaningful window. Evidence shows even short prehabilitation periods improve outcomes. Begin immediately — consistency matters more than intensity.",
      {
        text: "Your goal: accumulate as many prehabilitation minutes as possible in the next week, then taper before surgery. Every session you complete has measurable benefit.",
      },
      1, 2, data, plan
    ));
    phases.push(buildPrehabPhase(
      phaseId++,
      "Final Week Before Surgery",
      "Taper. Protect sleep. Arrive rested.",
      "Final Week — Taper",
      "Reduce exercise volume this week. Protecting sleep and arriving well-rested is more valuable than one more training session at this stage.",
      null,
      2, 2, data, plan
    ));
    phases.push(buildMedicationHoldsPhase(phaseId++));
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── 3–4 weeks — foundation + build combined, then taper ──
  if (weeks <= 4) {
    phases.push(buildPrehabPhase(
      phaseId++,
      `Weeks ${weeks}–2 Before Surgery`,
      "Build your prehab base systematically.",
      "Begin and Build Prehabilitation",
      `You have ${weeks} weeks of prehabilitation time. Follow the evidence-based progression below — each week builds on the last. Do not skip ahead to higher intensities before your body has adapted.`,
      {
        text: `Your goal: accumulate 500+ total prehabilitation minutes across your ${weeks - 1} active weeks. This threshold is associated with significantly reduced need for postoperative rehabilitation.`,
      },
      1, weeks - 1, data, plan  // totalProgWeeks = weeks - 1 (taper takes the last week)
    ));

    // Middle phase if 4 weeks (programWeek 2)
    if (weeks === 4) {
      phases.push(buildPrehabPhase(
        phaseId++,
        "Weeks 3–2 Before Surgery",
        "Progress. Add intensity based on your adaptation.",
        "Build Momentum",
        "Your body has had one week to adapt. Now add the next layer of training based on your response to week 1.",
        null,
        2, weeks - 1, data, plan
      ));
    }

    phases.push(buildPrehabPhase(
      phaseId++,
      "Final Week Before Surgery",
      "Taper. Protect sleep. Arrive rested.",
      "Final Week — Taper",
      "Reduce exercise volume this week. Arriving at surgery rested and at peak readiness is the goal.",
      null,
      weeks - 1, weeks - 1, data, plan
    ));
    phases.push(buildMedicationHoldsPhase(phaseId++));
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── 5–7 weeks — build-start, escalate, taper ──
  if (weeks <= 7) {
    phases.push(buildPrehabPhase(
      phaseId++,
      `Weeks ${weeks}–3 Before Surgery`,
      "Establish aerobic base and resistance foundation.",
      "Begin and Build Prehabilitation",
      `You have ${weeks} weeks — a strong window for meaningful preparation. Begin the program below and progress systematically. Consistency beats intensity in the early weeks.`,
      {
        text: `Your goal: reach 500+ total prehabilitation minutes before the final taper week. Track your sessions — the evidence threshold for reduced postoperative rehabilitation is 500 cumulative minutes.`,
      },
      1, weeks - 1, data, plan
    ));
    phases.push(buildPrehabPhase(
      phaseId++,
      "Weeks 3–2 Before Surgery",
      "Progress intensity based on your adaptation.",
      "Escalate and Optimize",
      "Your aerobic base has been established. Add the next training layer based on how your body has responded.",
      null,
      Math.floor((weeks - 1) / 2) + 1, weeks - 1, data, plan
    ));
    phases.push(buildPrehabPhase(
      phaseId++,
      "Final Week Before Surgery",
      "Taper. Protect sleep. Arrive rested.",
      "Final Week — Taper",
      "Reduce exercise volume this week. Arrive at surgery rested and at peak capacity.",
      null,
      weeks - 1, weeks - 1, data, plan
    ));
    phases.push(buildMedicationHoldsPhase(phaseId++));
    phases.push(buildEveningBeforePhase(phaseId++));
    phases.push(buildDayOfSurgeryPhase(phaseId++));
    return phases;
  }

  // ── 8+ weeks — full 4-prehab-phase program ──
  const totalProgWeeks = weeks - 1; // last week = taper
  phases.push(buildPrehabPhase(
    phaseId++,
    `Weeks ${weeks}–${Math.max(5, weeks - 3)} Before Surgery`,
    "Ideal start window. Begin immediately.",
    "Begin Biological Preparation",
    "This is the highest-leverage window. Every week added here improves outcomes measurably. Establish all prehabilitation habits now — you have the time to do this right.",
    {
      text: "Your goal for this phase: establish the prehabilitation habit, get baseline labs drawn at your pre-anesthesia testing visit, and begin any smoking or alcohol cessation journey now.",
    },
    1, totalProgWeeks, data, plan
  ));
  phases.push(buildPrehabPhase(
    phaseId++,
    "Weeks 4–3 Before Surgery",
    "Build momentum. Escalate intensity.",
    "Accelerate and Escalate",
    "Prehabilitation is in full swing. Add the next layer of training. Clinical workup deepens.",
    null,
    Math.ceil(totalProgWeeks * 0.4), totalProgWeeks, data, plan
  ));
  phases.push(buildPrehabPhase(
    phaseId++,
    "2 Weeks Before Surgery",
    "Clinical finalization. Labs confirmed.",
    "Clinical Optimization and Final Push",
    "Providers confirm all labs and risk stratification. Patients are nearing their readiness benchmarks.",
    null,
    Math.ceil(totalProgWeeks * 0.7), totalProgWeeks, data, plan
  ));
  phases.push(buildPrehabPhase(
    phaseId++,
    "Final Week Before Surgery",
    "Taper. Confirm medications. Protect sleep.",
    "Final Week — Taper and Prepare",
    "Reduce volume, confirm all medication orders, and protect sleep. Arrive at surgery rested.",
    null,
    totalProgWeeks, totalProgWeeks, data, plan
  ));
  phases.push(buildMedicationHoldsPhase(phaseId++));
  phases.push(buildEveningBeforePhase(phaseId++));
  phases.push(buildDayOfSurgeryPhase(phaseId++));
  return phases;
}
