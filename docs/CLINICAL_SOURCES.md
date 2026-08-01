# CLINICAL_SOURCES.md — Guideline & Evidence Reference

All clinical content on SurgeryReady must be traceable to one of these sources. Use exact citations when generating content.

> **Never write a PMID or citation from memory.** Every citation in `src/App.jsx` must be verified against the live record before it ships — resolve the PMID through the NCBI esummary API and confirm the first author, journal, and year match the quoted text:
>
> ```
> https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=<PMID>
> ```
>
> An August 2026 audit found that roughly a third of the citation links in the algorithm pointed at unrelated papers (materials science, oncology, ENT) because PMIDs had been written from memory rather than looked up. The canonical PMIDs below are verified.

---

## Verified canonical PMIDs

| Source | PMID | Record |
|---|---|---|
| 2024 AHA/ACC Perioperative Guideline | 39316661 | Thompson A et al. Circulation. 2024;150:e351–e442 (JACC co-publication: 39320289) |
| ASRA Anticoagulation, 5th Edition | 39880411 | Kopp SL et al. Reg Anesth Pain Med. 2025 |
| ESAIC preoperative assessment update | 39492705 | Lamperti M et al. Eur J Anaesthesiol. 2025;42(1):1–35 |
| ESAIC postoperative delirium | 37599617 | Aldecoa C et al. Eur J Anaesthesiol. 2024;41:81–108 |
| Multi-society GLP-1 RA guidance | 39370500 | Kindel TL et al. Surg Endosc. 2025;39:180–183 |
| SGLT2i and perioperative DKA | 39969891 | Dixit AA et al. JAMA Surg. 2025;160(4):423–430 |
| ICCAMS perioperative anemia | 36134567 | Shander A et al. Ann Surg. 2023;277:581–590 (Richards T is **not** an author) |
| BSH preoperative anaemia | 38664944 | Hands K et al. Br J Haematol. 2024 |
| TRICC transfusion trial | 9971864 | Hébert PC et al. NEJM. 1999;340:409–417 |
| SAMBA glucose consensus | 38517760 | Rajan N et al. Anesth Analg. 2024;139(3):459–477 |
| STOP-or-NOT (ACEi/ARB) | 39212270 | Legrand M et al. JAMA. 2024;332:970–978 |
| POISE-3 hypotension-avoidance | 37094336 | Marcucci M et al. Ann Intern Med. 2023;176:605–614 |
| ESPEN clinical nutrition in surgery | 28385477 | Weimann A et al. Clin Nutr. 2017;36(3):623–650 |
| STOP-Bang | 26378880 | Chung F et al. **Chest**. 2016;149(3):631–638 |
| PAWSS | 24657098 | Maldonado JR et al. **Alcohol**. 2014;48(4):375–390 |
| Buprenorphine multisociety consensus | 34385292 | Kohan L et al. Reg Anesth Pain Med. 2021;46(10):840–859 (buprenorphine **only** — not methadone or naltrexone) |

---

## Primary Guidelines

### Anticoagulation
- **ASRA 5th Edition (2025)** — Regional Anesthesia and Anticoagulation  
  Full title: *Regional Anesthesia in the Patient Receiving Antithrombotic or Thrombolytic Therapy — American Society of Regional Anesthesia and Pain Medicine Evidence-Based Guidelines (Fifth Edition)*  
  Key tables: neuraxial time intervals by drug class, peripheral nerve block recommendations

### Cardiac Risk
- **2024 AHA/ACC Guideline** — Perioperative Cardiovascular Management for Noncardiac Surgery  
  Replaces 2014 guideline. Key additions: updated functional capacity assessment, MACE risk thresholds  
- **RCRI (Revised Cardiac Risk Index)** — Lee et al., Circulation 1999  
  6 factors: high-risk surgery, ischemic heart disease, CHF, cerebrovascular disease, DM on insulin, Cr > 2.0  
  Score → MACE risk: 0=0.4%, 1=1.0%, 2=2.4%, ≥3=5.4%

### European Guidelines
- **ESAIC 2025** — European Society of Anaesthesiology and Intensive Care  
  Full title: *Preoperative assessment of adults undergoing elective noncardiac surgery: Updated guidelines from the European Society of Anaesthesiology and Intensive Care* (Lamperti M et al., Eur J Anaesthesiol 2025;42(1):1–35).  
  There is no ESAIC document titled "Guidelines for Perioperative Care" — cite this one by its real title.

### Medications
- **Multi-society GLP-1 RA Statement** (2023–2024)  
  Societies: ADA, ASGE, ASMBS, OMA, TOS  
  Recommendation: Hold weekly GLP-1 RA agents 1 week pre-op; daily agents day-of  
  Rationale: delayed gastric emptying → aspiration risk; evidence base evolving  
  Consider gastric ultrasound if patient took dose within hold window

- **SGLT2 Inhibitor Perioperative Guidance**  
  Hold 3–4 days pre-op  
  Risk: euglycemic diabetic ketoacidosis (euDKA) — check anion gap if not appropriately held  
  Reinitiate when eating/drinking normally post-op

- **Buprenorphine Perioperative Management**  
  Current evidence (2022–2024): Do NOT hold buprenorphine pre-op  
  Continue through perioperative period  
  Coordinate with pain team: buprenorphine does not block analgesia at typical doses; use multimodal analgesia  
  Bridge if needed with full agonist supplementation under supervision

### Functional Assessment
- **DASI (Duke Activity Status Index)**  
  Hlatky et al., Am J Cardiol 1989  
  12-item self-reported activity questionnaire  
  VO₂max estimation: `VO₂max (ml/kg/min) = 0.43 × DASI + 9.6`  
  < 4 METs equivalent = poor functional capacity = high perioperative risk

### Surgical Risk
- **ACS-NSQIP Surgical Risk Calculator**  
  nsqip.org/riskcalculator — 21 preoperative variables → 30-day outcome predictions  
- **MICA (Myocardial Infarction or Cardiac Arrest) Calculator**  
  Gupta et al., Circulation 2011 — 5 variables, validated in NSQIP dataset

### Alcohol Withdrawal
- **PAWSS (Prediction of Alcohol Withdrawal Severity Scale)**  
  Maldonado et al. — 10-item validated tool  
  Score ≥ 4 → high risk for complicated AWS  
- **CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol)**  
  10-item clinical assessment tool for monitoring withdrawal severity  
  Used post-operatively to guide benzodiazepine dosing

### Fasting (NPO)
- **ASA Practice Guidelines for Preoperative Fasting (2023 update)**  
  Clear liquids: 2 hours  
  Breast milk: 4 hours  
  Infant formula / light meal: 6 hours  
  Fatty/fried food, meat: 8 hours  
  GLP-1 RA patients: may warrant extended NPO per institutional policy

### ERAS (Enhanced Recovery After Surgery)
- **ERAS Society Protocols** — eras-society.org  
  Disease-specific pathways (colorectal, gynecology, orthopedic, cardiac, etc.)  
  Key elements: carbohydrate loading, multimodal analgesia, early mobilization, minimizing opioids

---

## Clinical Calculators Embedded or Referenced

| Calculator | Variables | Output |
|---|---|---|
| RCRI | 6 binary factors | MACE risk % |
| DASI | 12 activity items | METs / VO₂max |
| ACS-NSQIP | 21 variables | 30-day complication risk |
| MICA | 5 variables | MI/cardiac arrest risk |
| PAWSS | 10 items | AWS severity prediction |

---

## Evidence Tiers for Content Labels

When displaying recommendations in the UI, use these tiers:
- **Important** — strong guideline recommendation (Class I / Grade A evidence) or direct patient safety implication
- **Recommended** — moderate evidence or consensus recommendation
- **Optional** — expert opinion, emerging evidence, or patient preference-driven
