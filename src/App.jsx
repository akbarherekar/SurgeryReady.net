import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   SURGERYREADY.NET — Full Website
   
   TABLE OF CONTENTS (search these labels to jump to sections):
   
   [CONFIG]        — Colors, fonts, brand settings
   [NAV]           — Navigation bar component
   [HERO]          — Hero / landing section
   [VALUE-PROPS]   — For patients / hospitals / payers cards
   [JOURNEY]       — "One connected journey" steps
   [HOW-IT-WORKS]  — How SurgeryReady works section
   [FOR-PATIENTS]  — Patient-facing features section
   [FOR-HOSPITALS] — Hospital-facing features section
   [ABOUT]         — About / differentiators section
   [CONTACT]       — Contact form section
   [FOOTER]        — Footer
   [PREOP-PAGE]    — Pre-operative Assessment page
   [ALGORITHM]     — Surgical Readiness Algorithm (full tool)
   [APP]           — Main app with routing
   
   TO EDIT CONTENT: Search for the section label above, then
   modify the text directly. All content is plain text in JSX.
   ═══════════════════════════════════════════════════════════════ */

/* ─── [CONFIG] Brand colors, fonts, spacing ─── */
const BRAND = {
  navy: "#1B3A5C",
  teal: "#0D7C66",
  tealLight: "#E6F5F0",
  tealDark: "#0A6652",
  patientBlue: "#2E75B6",
  providerOrange: "#C65911",
  lightBlue: "#E8F0FE",
  lightOrange: "#FFF3E8",
  bg: "#F7F8FA",
  bgWarm: "#FDFBF7",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  text: "#1E293B",
  textLight: "#475569",
  muted: "#64748b",
  success: "#059669",
  danger: "#DC2626",
  warning: "#D97706",
  cream: "#FBF9F4",
  sand: "#F5F0E8",
};

const FONT = "'DM Sans', sans-serif";
const FONT_DISPLAY = "'Playfair Display', serif";

/* ─── Shared UI Primitives ─── */
function SectionWrapper({ children, id, bg = BRAND.white, py = "100px" }) {
  return (
    <section id={id} style={{ background: bg, padding: `${py} 0` }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px" }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
      color: BRAND.teal, fontFamily: FONT, marginBottom: "12px",
    }}>{children}</div>
  );
}

function SectionTitle({ children, align = "left" }) {
  return (
    <h2 style={{
      fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700,
      color: BRAND.navy, lineHeight: 1.2, margin: "0 0 20px", textAlign: align,
    }}>{children}</h2>
  );
}

function Btn({ children, href, variant = "primary", onClick, style: extraStyle }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: 600,
    fontFamily: FONT, cursor: "pointer", textDecoration: "none",
    transition: "all 0.25s ease", border: "none",
  };
  const variants = {
    primary: { background: BRAND.teal, color: BRAND.white },
    secondary: { background: "transparent", color: BRAND.navy, border: `1.5px solid ${BRAND.navy}` },
    ghost: { background: "transparent", color: BRAND.teal, padding: "14px 0" },
  };
  const merged = { ...base, ...variants[variant], ...extraStyle };
  if (href) return <a href={href} style={merged}>{children}</a>;
  return <button onClick={onClick} style={merged}>{children}</button>;
}

/* ═══════════════════════════════════════════════════════════════
   [NAV] — Top Navigation Bar
   Edit menu items in the `links` array below.
   ═══════════════════════════════════════════════════════════════ */
function Nav({ currentPage, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── EDIT MENU ITEMS HERE ── */
  const links = [
    { label: "How it works", href: "#how-it-works", page: "home" },
    { label: "For patients", href: "#for-patients", page: "home" },
    { label: "For hospitals", href: "#for-hospitals", page: "home" },
    { label: "Pre-Op Assessment", href: "#", page: "preop", highlight: true },
    { label: "About", href: "#about", page: "home" },
  ];

  const handleClick = (link, e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (link.page === "preop") {
      onNavigate("preop");
      window.scrollTo(0, 0);
    } else if (currentPage !== "home") {
      onNavigate("home");
      setTimeout(() => {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.querySelector(link.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${BRAND.borderLight}` : "none",
      transition: "all 0.3s ease", padding: scrolled ? "12px 0" : "20px 0",
    }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <div onClick={(e) => { e.preventDefault(); onNavigate("home"); window.scrollTo(0,0); }}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", background: BRAND.teal,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 800, color: BRAND.white, fontFamily: FONT,
          }}>SR</div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, lineHeight: 1.1 }}>SurgeryReady</div>
            <div style={{ fontSize: "10px", color: BRAND.muted, fontFamily: FONT, letterSpacing: "0.5px" }}>Health before healthcare</div>
          </div>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {links.map(link => (
            <a key={link.label} href={link.href} onClick={(e) => handleClick(link, e)} style={{
              fontSize: "14px", fontWeight: 500, color: link.highlight ? BRAND.teal : BRAND.text,
              textDecoration: "none", fontFamily: FONT, padding: "8px 14px", borderRadius: "6px",
              transition: "all 0.2s",
              background: link.highlight && currentPage === "preop" ? BRAND.tealLight : "transparent",
              fontWeight: link.highlight ? 600 : 500,
            }}>{link.label}</a>
          ))}
          <Btn href="#contact" variant="primary" onClick={(e) => { e.preventDefault(); onNavigate("home"); setTimeout(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            style={{ padding: "10px 24px", fontSize: "13px", marginLeft: "8px" }}>
            Book a call
          </Btn>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [HERO] — Main Hero Section
   Edit the headline, subheadline, and description below.
   ═══════════════════════════════════════════════════════════════ */
function Hero({ onNavigate }) {
  return (
    <section style={{
      background: `linear-gradient(160deg, ${BRAND.cream} 0%, ${BRAND.white} 40%, ${BRAND.tealLight} 100%)`,
      paddingTop: "160px", paddingBottom: "100px", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-120px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: BRAND.tealLight, opacity: 0.4 }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "250px", height: "250px", borderRadius: "50%", background: BRAND.sand, opacity: 0.5 }} />

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <SectionLabel>Hybrid perioperative optimization</SectionLabel>

        {/* ── EDIT HEADLINE HERE ── */}
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700,
          color: BRAND.navy, lineHeight: 1.1, margin: "0 0 24px", maxWidth: "720px",
        }}>
          Get surgery-ready,<br />the right way.
        </h1>

        {/* ── EDIT DESCRIPTION HERE ── */}
        <p style={{
          fontSize: "18px", lineHeight: 1.7, color: BRAND.textLight, maxWidth: "600px",
          margin: "0 0 36px", fontFamily: FONT,
        }}>
          SurgeryReady combines remote physician coaches, metabolic health guidance,
          and smart digital checklists to reduce last-minute cancellations, shorten
          recovery, and put patients back in control of their surgical journey.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Btn href="#contact">Talk to our team →</Btn>
          <Btn href="#how-it-works" variant="secondary">See how it works</Btn>
          <Btn onClick={() => { onNavigate("preop"); window.scrollTo(0,0); }} variant="ghost">
            Try the Pre-Op Assessment →
          </Btn>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [VALUE-PROPS] — Three audience cards
   Edit the title and description for each audience.
   ═══════════════════════════════════════════════════════════════ */
function ValueProps() {
  const cards = [
    {
      audience: "For patients",
      text: "Clear, step-by-step prep, coaching, and recovery support — from symptoms to surgery and back home.",
      color: BRAND.patientBlue, bg: BRAND.lightBlue,
    },
    {
      audience: "For hospitals",
      text: "Fewer day-of-surgery cancellations, smoother OR flow, and better perioperative metrics.",
      color: BRAND.teal, bg: BRAND.tealLight,
    },
    {
      audience: "For payers & employers",
      text: "Lower complication and readmission rates with a scalable, tech-enabled model.",
      color: BRAND.providerOrange, bg: BRAND.lightOrange,
    },
  ];

  return (
    <SectionWrapper bg={BRAND.white} py="80px">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {cards.map(c => (
          <div key={c.audience} style={{
            padding: "32px", borderRadius: "16px", background: c.bg,
            border: `1px solid ${BRAND.borderLight}`, transition: "transform 0.2s",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: c.color, fontFamily: FONT, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>{c.audience}</div>
            <p style={{ fontSize: "15px", color: BRAND.text, lineHeight: 1.6, fontFamily: FONT, margin: 0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [JOURNEY] — "One connected journey" — 3-step overview
   Edit the step titles and descriptions below.
   ═══════════════════════════════════════════════════════════════ */
function Journey() {
  const steps = [
    { num: "01", title: "Pre-op intake & risk scan", desc: "Structured history, red-flag screening, and metabolic risk snapshot in minutes." },
    { num: "02", title: "Personal surgery coach", desc: "Remote physician coaches guide patients through meds, testing, nutrition, sleep, and movement." },
    { num: "03", title: "Day-of-surgery ready", desc: "Fewer surprises on the day of surgery and a clearer, calmer path back to normal life." },
  ];

  return (
    <SectionWrapper id="journey" bg={BRAND.cream} py="100px">
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <SectionLabel>The SurgeryReady journey</SectionLabel>
        <SectionTitle align="center">One connected journey</SectionTitle>
        <p style={{ fontSize: "16px", color: BRAND.textLight, fontFamily: FONT, maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
          From the day surgery is mentioned to the weeks after discharge, SurgeryReady keeps everyone aligned.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
        {steps.map(s => (
          <div key={s.num} style={{
            background: BRAND.white, borderRadius: "16px", padding: "36px 28px",
            border: `1px solid ${BRAND.borderLight}`, position: "relative",
          }}>
            <div style={{
              fontSize: "48px", fontWeight: 800, color: BRAND.tealLight, fontFamily: FONT_DISPLAY,
              position: "absolute", top: "20px", right: "24px", lineHeight: 1,
            }}>{s.num}</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, margin: "0 0 12px", position: "relative" }}>{s.title}</h3>
            <p style={{ fontSize: "14px", color: BRAND.textLight, lineHeight: 1.7, fontFamily: FONT, margin: 0, position: "relative" }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "14px", color: BRAND.teal, fontWeight: 600, fontFamily: FONT, marginTop: "40px" }}>
        Built by clinicians, for clinicians. Designed by anesthesiologists and critical care physicians who live in the OR every day.
      </p>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [HOW-IT-WORKS] — Detailed 3-step process
   Edit each step's title, number, and description.
   ═══════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Enroll", desc: "Patients are onboarded via referral from surgeons, pre-anesthesia testing, or employer programs." },
    { num: "02", title: "Optimize", desc: "Remote coaches work through evidence-informed protocols for chronic disease, nutrition, sleep, and movement." },
    { num: "03", title: "Monitor & report", desc: "Progress dashboards, risk flags, and readiness summaries feed back to the surgical and anesthesia teams." },
  ];

  return (
    <SectionWrapper id="how-it-works" bg={BRAND.white}>
      <SectionLabel>Process</SectionLabel>
      <SectionTitle>How SurgeryReady works</SectionTitle>
      <p style={{ fontSize: "16px", color: BRAND.textLight, fontFamily: FONT, maxWidth: "640px", lineHeight: 1.7, marginBottom: "48px" }}>
        A simple, tech-enabled workflow that plugs into your existing perioperative processes
        without adding work to your over-stretched teams.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{
            display: "grid", gridTemplateColumns: "80px 1fr", gap: "24px",
            padding: "40px 0", borderTop: i === 0 ? `2px solid ${BRAND.teal}` : `1px solid ${BRAND.borderLight}`,
          }}>
            <div style={{
              fontSize: "36px", fontWeight: 800, color: BRAND.tealLight, fontFamily: FONT_DISPLAY, lineHeight: 1,
            }}>{s.num}</div>
            <div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, margin: "0 0 8px" }}>Step {parseInt(s.num)}: {s.title}</h3>
              <p style={{ fontSize: "15px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.7, margin: 0, maxWidth: "520px" }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [FOR-PATIENTS] — Patient-facing features
   Edit feature titles, descriptions, and the testimonial quote.
   ═══════════════════════════════════════════════════════════════ */
function ForPatients() {
  const features = [
    { title: "Plain-language prep checklists", desc: "Exactly what to do (and avoid) in the days and weeks before surgery." },
    { title: "Real clinicians, not chatbots", desc: "Virtual visits and messaging with physicians and nurses trained in perioperative care." },
    { title: "Support after surgery", desc: "Help with pain plans, mobility, nutrition, and when to call your surgical team." },
  ];

  return (
    <SectionWrapper id="for-patients" bg={BRAND.cream}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
        <div>
          <SectionLabel>For patients & families</SectionLabel>
          <SectionTitle>Surgery is stressful. We turn a confusing process into a guided journey.</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "32px" }}>
            {features.map(f => (
              <div key={f.title} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{
                  width: "4px", minHeight: "100%", borderRadius: "2px", background: BRAND.teal, flexShrink: 0, marginTop: "4px",
                }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, marginBottom: "4px" }}>{f.title}</div>
                  <div style={{ fontSize: "14px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── EDIT TESTIMONIAL HERE ── */}
        <div style={{ background: BRAND.white, borderRadius: "16px", padding: "36px", border: `1px solid ${BRAND.borderLight}` }}>
          <div style={{ fontSize: "32px", color: BRAND.teal, fontFamily: FONT_DISPLAY, lineHeight: 1, marginBottom: "16px" }}>"</div>
          <p style={{ fontSize: "16px", color: BRAND.text, fontFamily: FONT, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 20px" }}>
            SurgeryReady was the first time someone explained the whole process in a way my family understood.
            I knew what to eat, which meds to hold, and what to expect when I woke up.
          </p>
          <div style={{ fontSize: "13px", color: BRAND.muted, fontFamily: FONT }}>— Patient, elective joint replacement</div>
          <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
            {["Pre-op education", "Metabolic prep", "Recovery check-ins"].map(tag => (
              <span key={tag} style={{
                padding: "6px 12px", borderRadius: "20px", background: BRAND.tealLight,
                fontSize: "12px", fontWeight: 600, color: BRAND.teal, fontFamily: FONT,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [FOR-HOSPITALS] — Hospital / health-system features
   Edit each column's bullet points below.
   ═══════════════════════════════════════════════════════════════ */
function ForHospitals() {
  const columns = [
    {
      title: "Operational",
      items: ["Fewer day-of-surgery cancellations", "Improved OR utilization & throughput", "Smoother PAT and pre-op workflows"],
    },
    {
      title: "Clinical quality",
      items: ["Better control of diabetes, OSA, and HTN pre-op", "Alignment with ERAS and SSI bundles", "Support for PSIs, readmissions, and NSQIP metrics"],
    },
    {
      title: "Financial",
      items: ["Fewer costly complications and readmissions", "Hybrid onshore/offshore coaching model", "Management services organization (MSO) friendly"],
    },
  ];

  return (
    <SectionWrapper id="for-hospitals" bg={BRAND.white}>
      <SectionLabel>For hospitals, health systems & surgical centers</SectionLabel>
      <SectionTitle>A turnkey perioperative optimization service that extends your care team, not your payroll.</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "48px" }}>
        {columns.map(col => (
          <div key={col.title} style={{
            padding: "32px", borderRadius: "14px", border: `1px solid ${BRAND.borderLight}`,
            background: BRAND.bg,
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, margin: "0 0 16px" }}>{col.title}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {col.items.map(item => (
                <li key={item} style={{
                  fontSize: "14px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.6,
                  padding: "8px 0", borderBottom: `1px solid ${BRAND.borderLight}`,
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ color: BRAND.teal, fontSize: "14px" }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "60px", padding: "40px", borderRadius: "16px",
        background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.tealDark} 100%)`,
        textAlign: "center",
      }}>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: BRAND.white, fontFamily: FONT_DISPLAY, margin: "0 0 8px" }}>
          Ready to explore a pilot?
        </h3>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontFamily: FONT, margin: "0 0 24px" }}>
          We partner with hospitals, health systems, and large surgical groups to run 3–6 month pilots focused on cancellations, LOS, and readmissions.
        </p>
        <Btn href="#contact" style={{ background: BRAND.white, color: BRAND.navy }}>Schedule a strategy call →</Btn>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [ABOUT] — About section & differentiators
   Edit the about description and bullet points.
   ═══════════════════════════════════════════════════════════════ */
function About() {
  const diffs = [
    "Focused on the entire surgical journey — not just a single app or visit.",
    "Designed to plug into MSO / PLLC structures and existing perioperative pathways.",
    "Human-centered coaching supported by, not replaced by, AI.",
  ];

  return (
    <SectionWrapper id="about" bg={BRAND.cream}>
      <div style={{ maxWidth: "720px" }}>
        <SectionLabel>About</SectionLabel>
        <SectionTitle>Built by perioperative clinicians</SectionTitle>
        <p style={{ fontSize: "16px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.8, marginBottom: "16px" }}>
          SurgeryReady was created by anesthesiologists, intensivists, and health systems leaders
          who have lived the reality of day-of-surgery cancellations, preventable complications,
          and fragmented communication.
        </p>
        <p style={{ fontSize: "16px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.8, marginBottom: "32px" }}>
          We combine that frontline experience with digital health technology and a global coaching
          model to deliver something simple: patients who arrive in the OR truly ready for surgery.
        </p>

        <h3 style={{ fontSize: "18px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, margin: "0 0 16px" }}>
          What makes SurgeryReady different?
        </h3>
        {diffs.map(d => (
          <div key={d} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
            <span style={{ color: BRAND.teal, fontSize: "16px", marginTop: "2px" }}>◆</span>
            <span style={{ fontSize: "15px", color: BRAND.text, fontFamily: FONT, lineHeight: 1.6 }}>{d}</span>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [CONTACT] — Contact / CTA Form
   Edit the form title, description, and field labels.
   ═══════════════════════════════════════════════════════════════ */
function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${BRAND.border}`,
    fontSize: "14px", fontFamily: FONT, outline: "none", boxSizing: "border-box",
    background: BRAND.white, transition: "border-color 0.2s",
  };

  return (
    <SectionWrapper id="contact" bg={BRAND.white}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
        <div>
          <SectionLabel>Get started</SectionLabel>
          <SectionTitle>Let's get your patients SurgeryReady</SectionTitle>
          <p style={{ fontSize: "15px", color: BRAND.textLight, fontFamily: FONT, lineHeight: 1.7 }}>
            Share a few details and we'll follow up with a short discovery call to understand your
            current perioperative challenges and explore a pilot that fits your organization.
          </p>
          <p style={{ fontSize: "13px", color: BRAND.muted, fontFamily: FONT, marginTop: "24px" }}>
            We'll never spam you or share your information. One of our clinical founders will reach out personally.
          </p>
        </div>

        <div style={{ background: BRAND.bg, borderRadius: "16px", padding: "32px", border: `1px solid ${BRAND.borderLight}` }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>✓</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT }}>Thank you!</div>
              <div style={{ fontSize: "14px", color: BRAND.muted, fontFamily: FONT, marginTop: "8px" }}>We'll be in touch shortly.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input placeholder="Name" style={inputStyle} />
              <input placeholder="Organization / hospital" style={inputStyle} />
              <input placeholder="Email" type="email" style={inputStyle} />
              <input placeholder="Role" style={inputStyle} />
              <textarea placeholder="What challenges are you trying to solve?" rows={4}
                style={{ ...inputStyle, resize: "vertical" }} />
              <Btn onClick={() => setSubmitted(true)} style={{ width: "100%", justifyContent: "center" }}>
                Submit & request a call
              </Btn>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [FOOTER]
   ═══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{
      background: BRAND.navy, padding: "40px 0", textAlign: "center",
    }}>
      <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT }}>
        © {new Date().getFullYear()} SurgeryReady. All rights reserved.
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT, marginTop: "8px" }}>
        Health before healthcare
      </div>
    </footer>
  );
}


/* ═══════════════════════════════════════════════════════════════
   [ALGORITHM] — Surgical Readiness Algorithm Components
   This is the full interactive pre-op assessment tool.
   ═══════════════════════════════════════════════════════════════ */

const STEPS = ["demographics", "surgery", "medical", "medications", "fitness", "nutrition"];
const STEP_LABELS = ["Patient Info", "Surgery Details", "Medical History", "Medications", "Fitness Baseline", "Nutrition"];

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: "20px", border: `1.5px solid ${selected ? BRAND.teal : BRAND.border}`,
      background: selected ? BRAND.tealLight : BRAND.white, color: selected ? BRAND.teal : BRAND.text,
      cursor: "pointer", fontSize: "13px", fontWeight: selected ? 600 : 400, transition: "all 0.2s", fontFamily: FONT,
    }}>{label}</button>
  );
}

function AlgoField({ label, children, hint }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: BRAND.navy, marginBottom: "6px", fontFamily: FONT }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: "11px", color: BRAND.muted, marginTop: "4px" }}>{hint}</div>}
    </div>
  );
}

function AlgoInput({ value, onChange, type = "text", placeholder, min, max, step }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      min={min} max={max} step={step}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BRAND.border}`,
        fontSize: "14px", fontFamily: FONT, outline: "none", boxSizing: "border-box",
        background: BRAND.white, transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = BRAND.teal}
      onBlur={e => e.target.style.borderColor = BRAND.border}
    />
  );
}

function AlgoSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BRAND.border}`,
      fontSize: "14px", fontFamily: FONT, background: BRAND.white, cursor: "pointer",
      outline: "none", boxSizing: "border-box",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function MultiChip({ options, selected, onChange }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map(o => <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => toggle(o)} />)}
    </div>
  );
}

function StepDemographics({ data, update }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="Age"><AlgoInput type="number" value={data.age || ""} onChange={v => update("age", v)} placeholder="Years" min="1" max="120" /></AlgoField>
        <AlgoField label="Sex">
          <AlgoSelect value={data.sex || ""} onChange={v => update("sex", v)} options={[
            { value: "", label: "Select..." }, { value: "male", label: "Male" }, { value: "female", label: "Female" },
          ]} />
        </AlgoField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <AlgoField label="Height (inches)"><AlgoInput type="number" value={data.height || ""} onChange={v => update("height", v)} placeholder="e.g. 68" /></AlgoField>
        <AlgoField label="Weight (lbs)"><AlgoInput type="number" value={data.weight || ""} onChange={v => update("weight", v)} placeholder="e.g. 180" /></AlgoField>
        <AlgoField label="BMI" hint="Auto-calculated">
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: BRAND.lightBlue, fontSize: "14px", fontWeight: 600, color: BRAND.navy, fontFamily: FONT }}>
            {data.height && data.weight ? (703 * parseFloat(data.weight) / (parseFloat(data.height) ** 2)).toFixed(1) : "—"}
          </div>
        </AlgoField>
      </div>
    </>
  );
}

function StepSurgery({ data, update }) {
  return (
    <>
      <AlgoField label="Type of Surgery"><AlgoInput value={data.surgeryType || ""} onChange={v => update("surgeryType", v)} placeholder="e.g., Total knee replacement, Colectomy" /></AlgoField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="Surgical Risk Category">
          <AlgoSelect value={data.riskCategory || ""} onChange={v => update("riskCategory", v)} options={[
            { value: "", label: "Select..." }, { value: "low", label: "Low Risk" }, { value: "elevated", label: "Elevated Risk" }, { value: "high", label: "High Risk (Vascular/Cardiac)" },
          ]} />
        </AlgoField>
        <AlgoField label="Weeks Until Surgery"><AlgoInput type="number" value={data.weeksUntil || ""} onChange={v => update("weeksUntil", v)} placeholder="e.g. 6" min="0" /></AlgoField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="Expected Duration">
          <AlgoSelect value={data.duration || ""} onChange={v => update("duration", v)} options={[
            { value: "", label: "Select..." }, { value: "short", label: "< 2 hours" }, { value: "medium", label: "2–6 hours" }, { value: "long", label: "> 6 hours" },
          ]} />
        </AlgoField>
        <AlgoField label="ERAS Pathway Available?">
          <AlgoSelect value={data.eras || ""} onChange={v => update("eras", v)} options={[
            { value: "", label: "Select..." }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
          ]} />
        </AlgoField>
      </div>
      <AlgoField label="Expected Blood Loss">
        <AlgoSelect value={data.bloodLoss || ""} onChange={v => update("bloodLoss", v)} options={[
          { value: "", label: "Select..." }, { value: "minimal", label: "Minimal (< 200 mL)" }, { value: "moderate", label: "Moderate (200–500 mL)" }, { value: "significant", label: "Significant (> 500 mL)" },
        ]} />
      </AlgoField>
      <AlgoField label="Surgery Involves (select all that apply)">
        <MultiChip options={["Joint replacement", "Spinal surgery", "Foreign body/implant", "Open chest/cardiac", "Vascular", "Neurologic", "Cancer resection", "Bariatric"]}
          selected={data.surgeryTags || []} onChange={v => update("surgeryTags", v)} />
      </AlgoField>
    </>
  );
}

function StepMedical({ data, update }) {
  const categories = [
    { key: "cardiac", label: "Cardiovascular", items: ["CAD/Angina", "CHF", "Valvular disease", "Arrhythmia/AF", "Pacemaker/AICD", "Cardiomyopathy/HCM", "Prior MI (within 6 months)", "Prior PCI/stent", "Peripheral vascular disease", "Prior stroke", "Uncontrolled HTN (DBP >110)"] },
    { key: "respiratory", label: "Respiratory", items: ["COPD/Emphysema", "Asthma", "OSA (diagnosed)", "OSA (suspected/STOP-BANG ≥3)", "Unexplained dyspnea"] },
    { key: "endocrine", label: "Endocrine / Metabolic", items: ["Type 1 Diabetes", "Type 2 Diabetes", "HbA1c > 8", "Insulin pump", "Pheochromocytoma", "Adrenal disease"] },
    { key: "other", label: "Other", items: ["Cirrhosis/liver disease", "Renal insufficiency/dialysis", "Anemia (Hgb <13)", "Bleeding disorder", "Sickle cell disease", "Seizure disorder", "Myasthenia gravis", "Rheumatoid arthritis", "Down syndrome", "Active cancer/chemo", "History of MH", "Difficult airway history", "Frailty/recent falls"] },
  ];
  return (
    <>
      {categories.map(cat => (
        <AlgoField key={cat.key} label={cat.label}>
          <MultiChip options={cat.items} selected={data[cat.key] || []} onChange={v => update(cat.key, v)} />
        </AlgoField>
      ))}
    </>
  );
}

function StepMedications({ data, update }) {
  const medGroups = [
    { key: "cardioMeds", label: "Cardiovascular", items: ["ACE inhibitor", "ARB", "Beta-blocker", "Statin", "Diuretic (Lasix/HCTZ)", "Digoxin", "Calcium channel blocker"] },
    { key: "anticoag", label: "Anticoagulation / Antiplatelet", items: ["Warfarin", "Apixaban (Eliquis)", "Rivaroxaban (Xarelto)", "Dabigatran (Pradaxa)", "Enoxaparin (LMWH)", "Aspirin", "Clopidogrel (Plavix)", "Ticagrelor"] },
    { key: "diabetesMeds", label: "Diabetes / Metabolic", items: ["GLP-1 RA (semaglutide/Ozempic)", "GLP-1 RA (liraglutide/Victoza)", "Tirzepatide (Mounjaro)", "SGLT2 inhibitor (empagliflozin/Jardiance)", "SGLT2 inhibitor (dapagliflozin/Farxiga)", "Metformin", "Insulin (basal)", "Insulin (bolus/pump)"] },
    { key: "painMeds", label: "Pain / Substance Use", items: ["Buprenorphine (Suboxone/Subutex)", "Methadone", "Naltrexone (oral)", "Naltrexone (XR/Vivitrol)", "Chronic opioids", "Marijuana (medical/recreational)", "Other recreational drugs"] },
    { key: "otherMeds", label: "Other", items: ["Antiepileptics", "Biologics/DMARDs", "Immunotherapy/checkpoint inhibitors", "Corticosteroids"] },
  ];
  return (
    <>
      {medGroups.map(g => (
        <AlgoField key={g.key} label={g.label}>
          <MultiChip options={g.items} selected={data[g.key] || []} onChange={v => update(g.key, v)} />
        </AlgoField>
      ))}
      <AlgoField label="GLP-1 RA Details (if applicable)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <AlgoSelect value={data.glp1Phase || ""} onChange={v => update("glp1Phase", v)} options={[
            { value: "", label: "Escalation phase?" }, { value: "yes", label: "Yes — still titrating up" }, { value: "no", label: "No — stable dose" },
          ]} />
          <AlgoSelect value={data.glp1GI || ""} onChange={v => update("glp1GI", v)} options={[
            { value: "", label: "GI symptoms?" }, { value: "none", label: "None" }, { value: "mild", label: "Mild (occasional nausea)" }, { value: "active", label: "Active (nausea/vomiting/bloating)" },
          ]} />
        </div>
      </AlgoField>
    </>
  );
}

function StepFitness({ data, update }) {
  return (
    <>
      <AlgoField label="Current Exercise Level">
        <AlgoSelect value={data.exerciseLevel || ""} onChange={v => update("exerciseLevel", v)} options={[
          { value: "", label: "Select..." }, { value: "sedentary", label: "Sedentary — no regular exercise" },
          { value: "light", label: "Light — walking 1–2x/week" }, { value: "moderate", label: "Moderate — 3–4x/week, moderate intensity" },
          { value: "active", label: "Active — 5+x/week, vigorous" },
        ]} />
      </AlgoField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="DASI Score (if available)" hint="Duke Activity Status Index (0–58.2). Score < 34 = < 4 METs">
          <AlgoInput type="number" value={data.dasiScore || ""} onChange={v => update("dasiScore", v)} placeholder="0–58.2" min="0" max="58.2" step="0.1" />
        </AlgoField>
        <AlgoField label="Estimated METs" hint="If DASI not available">
          <AlgoSelect value={data.mets || ""} onChange={v => update("mets", v)} options={[
            { value: "", label: "Select..." }, { value: "lt4", label: "< 4 METs (can't climb 1 flight)" },
            { value: "4-7", label: "4–7 METs (climb 2 flights, walk uphill)" }, { value: "gt7", label: "> 7 METs (vigorous activities)" },
          ]} />
        </AlgoField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="VO2max (if known, mL/kg/min)"><AlgoInput type="number" value={data.vo2max || ""} onChange={v => update("vo2max", v)} placeholder="e.g., 28" /></AlgoField>
        <AlgoField label="Grip Strength (if known, kg)"><AlgoInput type="number" value={data.gripStrength || ""} onChange={v => update("gripStrength", v)} placeholder="e.g., 35" /></AlgoField>
      </div>
      <AlgoField label="Tracks HRV?">
        <AlgoSelect value={data.tracksHRV || ""} onChange={v => update("tracksHRV", v)} options={[
          { value: "", label: "Select..." }, { value: "yes", label: "Yes — wearable device" }, { value: "no", label: "No" },
        ]} />
      </AlgoField>
      <AlgoField label="Current thermal conditioning habits">
        <MultiChip options={["Sauna use", "Cold plunge/cold showers", "Contrast therapy", "None"]}
          selected={data.thermalHabits || []} onChange={v => update("thermalHabits", v)} />
      </AlgoField>
    </>
  );
}

function StepNutrition({ data, update }) {
  return (
    <>
      <AlgoField label="Current Daily Protein Intake (estimate)">
        <AlgoSelect value={data.proteinLevel || ""} onChange={v => update("proteinLevel", v)} options={[
          { value: "", label: "Select..." }, { value: "low", label: "Low — minimal meat/protein sources" },
          { value: "moderate", label: "Moderate — some protein each meal" }, { value: "high", label: "High — actively tracking 1.2+ g/kg/day" },
        ]} />
      </AlgoField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <AlgoField label="Albumin (if available, g/dL)"><AlgoInput type="number" value={data.albumin || ""} onChange={v => update("albumin", v)} placeholder="e.g. 3.8" step="0.1" /></AlgoField>
        <AlgoField label="Recent Unintentional Weight Loss?">
          <AlgoSelect value={data.weightLoss || ""} onChange={v => update("weightLoss", v)} options={[
            { value: "", label: "Select..." }, { value: "no", label: "No" }, { value: "mild", label: "Yes — < 5% in 3 months" }, { value: "significant", label: "Yes — > 5% in 3 months" },
          ]} />
        </AlgoField>
      </div>
      <AlgoField label="Current Eating Pattern">
        <AlgoSelect value={data.eatingPattern || ""} onChange={v => update("eatingPattern", v)} options={[
          { value: "", label: "Select..." }, { value: "regular", label: "Regular — 3 meals/day" },
          { value: "if", label: "Intermittent fasting — 16:8 or similar" }, { value: "restricted", label: "Calorie-restricted / dieting" },
          { value: "irregular", label: "Irregular — skips meals frequently" },
        ]} />
      </AlgoField>
      <AlgoField label="Existing Supplements">
        <MultiChip options={["Protein supplement", "Multivitamin", "Omega-3/fish oil", "Vitamin D", "Iron", "Immunonutrition (Impact/equivalent)", "None"]}
          selected={data.supplements || []} onChange={v => update("supplements", v)} />
      </AlgoField>
    </>
  );
}

/* ─── Plan Generator (evidence-based logic) ─── */
function generatePlan(d) {
  const patient = [];
  const provider = [];
  const alerts = [];
  const weeks = parseInt(d.weeksUntil) || 4;
  const age = parseInt(d.age) || 50;
  const bmi = d.height && d.weight ? (703 * parseFloat(d.weight) / (parseFloat(d.height) ** 2)) : null;
  const weightKg = d.weight ? parseFloat(d.weight) * 0.453592 : 80;
  const cardiac = d.cardiac || [];
  const respiratory = d.respiratory || [];
  const endocrine = d.endocrine || [];
  const other = d.other || [];
  const allConditions = [...cardiac, ...respiratory, ...endocrine, ...other];
  const anticoag = d.anticoag || [];
  const diabetesMeds = d.diabetesMeds || [];
  const painMeds = d.painMeds || [];
  const cardioMeds = d.cardioMeds || [];
  const hasGLP1 = diabetesMeds.some(m => m.includes("GLP-1") || m.includes("Tirzepatide"));
  const hasSGLT2 = diabetesMeds.some(m => m.includes("SGLT2"));
  const hasBup = painMeds.includes("Buprenorphine (Suboxone/Subutex)");
  const hasMethadone = painMeds.includes("Methadone");
  const hasNaltrexone = painMeds.some(m => m.includes("Naltrexone"));
  const surgeryTags = d.surgeryTags || [];
  const needsImplant = surgeryTags.some(t => ["Joint replacement", "Spinal surgery", "Foreign body/implant"].includes(t));

  let riskLevel = "low";
  if (d.riskCategory === "high" || cardiac.includes("Prior MI (within 6 months)") || cardiac.includes("CHF")) riskLevel = "high";
  else if (d.riskCategory === "elevated" || cardiac.length > 0 || (d.dasiScore && parseFloat(d.dasiScore) < 34) || d.mets === "lt4") riskLevel = "elevated";

  // Alerts
  if (hasGLP1 && d.glp1GI === "active") alerts.push({ type: "danger", text: "ACTIVE GI SYMPTOMS on GLP-1 RA — consider delaying surgery. If proceeding: liquid diet 24h before, point-of-care gastric ultrasound on DOS, consider rapid sequence induction." });
  if (hasSGLT2) alerts.push({ type: "warning", text: "SGLT2 inhibitor detected — MUST be held 3–4 days before surgery. Monitor ketones perioperatively. Risk of euglycemic DKA." });
  if (cardiac.includes("Prior MI (within 6 months)")) alerts.push({ type: "danger", text: "MI within 6 months — optimal to wait ≥60 days for elective NCS (2024 AHA/ACC Class 1). Proceed only after careful risk-benefit analysis." });
  if (cardiac.includes("Prior stroke") || allConditions.includes("Prior stroke")) alerts.push({ type: "warning", text: "Prior stroke — delay elective NCS for at least 9 months if possible (Class 2b). If <3 months since stroke, high risk of recurrent event." });
  if (other.includes("History of MH")) alerts.push({ type: "danger", text: "MALIGNANT HYPERTHERMIA history — ensure dantrolene availability. MHAUS registry consultation. Avoid triggering agents." });
  if (d.weightLoss === "significant" || (d.albumin && parseFloat(d.albumin) < 3.0)) alerts.push({ type: "warning", text: "MALNUTRITION RISK — significant weight loss or low albumin. Consider nutritional optimization before proceeding." });

  // Patient track: Exercise
  const unsafeForExercise = cardiac.includes("Prior MI (within 6 months)") || allConditions.includes("Uncontrolled HTN (DBP >110)");
  if (!unsafeForExercise) {
    const level = d.exerciseLevel || "sedentary";
    if (weeks >= 4) {
      if (level === "sedentary") patient.push({ domain: "Exercise", priority: "high", title: "Prehabilitation Program — Start Immediately", detail: `Begin with 20-minute walks 5x/week. Progress to 30–40 minutes by week 2. Add resistance training 2x/week from week 2. Target: 500+ total minutes of prehabilitation before surgery. Consider HIIT 2x/week if tolerated after 2 weeks of base building.` });
      else if (level === "light") patient.push({ domain: "Exercise", priority: "high", title: "Increase Exercise Intensity", detail: "Increase walking to 30–45 minutes 5x/week. Add resistance training 3x/week. Introduce interval training 2x/week. Target: 500+ total prehabilitation minutes." });
      else if (level === "moderate") patient.push({ domain: "Exercise", priority: "medium", title: "Optimize Training for Surgery", detail: "Maintain current frequency. Add 2 HIIT sessions/week. Ensure resistance training includes functional movements relevant to post-surgical mobility. Track grip strength weekly." });
      else patient.push({ domain: "Exercise", priority: "low", title: "Maintain Fitness, Taper Before Surgery", detail: "Continue current program. Reduce volume by 30% in the final week before surgery (taper like athletic event preparation). Prioritize recovery and sleep in the final 3 days." });
    } else {
      patient.push({ domain: "Exercise", priority: "high", title: `Accelerated Prehab (${weeks} weeks available)`, detail: `Limited time window. Focus on daily walking (30 min minimum) and resistance training 3x/week. Every session counts.` });
    }
  } else {
    patient.push({ domain: "Exercise", priority: "high", title: "Exercise — Physician Clearance Required", detail: "Active cardiac conditions detected. Do NOT begin exercise program without explicit physician clearance." });
  }

  // Patient track: Nutrition
  const proteinTarget = (weightKg * 1.5).toFixed(0);
  patient.push({ domain: "Nutrition", priority: "high", title: `Protein Target: ${proteinTarget}g/day (1.5 g/kg)`, detail: `Current weight ~${weightKg.toFixed(0)} kg → target 1.2–2.0 g/kg/day. Aim for ${proteinTarget}g. Distribute across 3–4 meals.` });
  if (surgeryTags.includes("Cancer resection") || other.includes("Active cancer/chemo")) {
    patient.push({ domain: "Nutrition", priority: "high", title: "Immunonutrition Recommended", detail: "Cancer surgery patients benefit from preoperative immunonutrition (arginine, omega-3, nucleotides) for minimum 5–7 days before surgery." });
  }
  patient.push({ domain: "Nutrition", priority: "medium", title: "Preoperative Carbohydrate Loading", detail: "Day before surgery: 800 mL carbohydrate-rich clear drink in the evening. Morning of surgery: 400 mL 2–3 hours before. Do NOT fast from midnight — modern evidence supports carb loading per ERAS protocols." });

  // Patient track: Metabolic
  const isDiabetic = endocrine.some(e => e.includes("Diabetes") || e.includes("HbA1c"));
  if (!isDiabetic && weeks >= 3) {
    patient.push({ domain: "Metabolic Prep", priority: "medium", title: "Consider Strategic Intermittent Fasting", detail: "Consider 14:10 or 16:8 time-restricted eating starting 3+ weeks before surgery. STOP fasting 3 days before surgery and switch to carbohydrate loading." });
  } else if (isDiabetic) {
    patient.push({ domain: "Metabolic Prep", priority: "low", title: "Fasting Protocol — Not Recommended", detail: "Given diabetes/metabolic conditions, strategic fasting is NOT recommended without close endocrine supervision." });
  }

  // Patient track: Thermal
  const thermalContraindicated = cardiac.includes("CAD/Angina") || cardiac.includes("Prior MI (within 6 months)") || cardiac.includes("Uncontrolled HTN (DBP >110)") || cardiac.includes("Cardiomyopathy/HCM");
  if (!thermalContraindicated && weeks >= 4) {
    const currentThermal = d.thermalHabits || [];
    if (currentThermal.includes("None") || currentThermal.length === 0) {
      patient.push({ domain: "Thermal", priority: "low", title: "Consider Gradual Thermal Conditioning", detail: "If accessible and cleared by physician: begin with short sauna sessions (10 min) or cool water exposure. Build gradually over weeks." });
    } else {
      patient.push({ domain: "Thermal", priority: "low", title: "Continue Thermal Conditioning", detail: "Continue your current practice. Reduce intensity in the final 3 days before surgery." });
    }
  } else if (thermalContraindicated) {
    patient.push({ domain: "Thermal", priority: "medium", title: "Thermal Conditioning — Contraindicated", detail: "Active cardiac conditions detected. Sauna and cold exposure are NOT recommended." });
  }

  // Patient track: Stress/Sleep + Tracking
  patient.push({ domain: "Stress & Sleep", priority: "medium", title: "Sleep Optimization & Stress Reduction", detail: "Target 7–9 hours sleep nightly. Consider box breathing (4-4-4-4) 10 min daily. Limit screen time 1 hour before bed." });
  if (d.tracksHRV === "yes") {
    patient.push({ domain: "Self-Tracking", priority: "medium", title: "Track HRV Trend", detail: "Monitor your HRV weekly. Aim for an upward trend during prehabilitation." });
  }
  patient.push({ domain: "Self-Tracking", priority: "low", title: "Weekly Readiness Check-In", detail: "Track weekly: grip strength, walking endurance, energy level (1–10), sleep quality (1–10), protein intake adherence." });

  // Provider track: Medications
  if (cardioMeds.includes("ACE inhibitor") || cardioMeds.includes("ARB")) {
    provider.push({ domain: "Medications", priority: "high", title: "ACE-I/ARB: Consider Withholding", detail: "2024 AHA/ACC Class 2b: Consider withholding on the morning of surgery to reduce intraoperative hypotension." });
  }
  if (hasGLP1) {
    const risk = d.glp1Phase === "yes" || d.glp1GI === "active" ? "HIGH-RISK" : "Standard";
    provider.push({ domain: "Medications", priority: "high", title: `GLP-1 RA Management — ${risk}`, detail: risk === "HIGH-RISK"
      ? "Escalation phase or active GI symptoms. Liquid diet 24h before surgery. Point-of-care gastric ultrasound on DOS."
      : "Stable dose, no GI symptoms — most patients may continue GLP-1 RA. Standard NPO guidelines apply." });
  }
  if (hasSGLT2) {
    provider.push({ domain: "Medications", priority: "high", title: "SGLT2 Inhibitor: HOLD 3–4 Days Before Surgery", detail: "Discontinue 3–4 days before. Order point-of-care ketones on DOS. Monitor for euglycemic DKA." });
  }
  if (hasBup) {
    provider.push({ domain: "Medications", priority: "high", title: "Buprenorphine: CONTINUE Through Surgery", detail: "Do NOT discontinue perioperatively. Continue home dose. Supplement with multimodal analgesia." });
  }
  if (hasMethadone) {
    provider.push({ domain: "Medications", priority: "high", title: "Methadone: Continue Maintenance Dose", detail: "Continue through surgery. If NPO: IV methadone at half the oral dose divided q6–12h. Order EKG for QTc monitoring." });
  }
  if (hasNaltrexone) {
    const isXR = painMeds.includes("Naltrexone (XR/Vivitrol)");
    provider.push({ domain: "Medications", priority: "high", title: `Naltrexone: HOLD ${isXR ? "30 Days" : "3 Days"} Before Surgery`, detail: isXR ? "Extended-release: must be held 30 days before surgery." : "Oral naltrexone: hold 3 days (72 hours) before surgery." });
  }
  if (anticoag.length > 0) {
    provider.push({ domain: "Medications", priority: "high", title: "Anticoagulation Management per ASRA 5th Ed (2025)", detail: `Active agents: ${anticoag.join(", ")}. Use ASRA 5th Edition drug-specific timing. Verify renal function for DOAC clearance timing.` });
  }

  // Provider track: Cardiac risk
  if (riskLevel === "elevated" || riskLevel === "high") {
    provider.push({ domain: "Cardiac Risk", priority: "high", title: "2024 AHA/ACC Stepwise Algorithm", detail: `Risk level: ${riskLevel.toUpperCase()}. Use validated risk calculators (RCRI, ACS-NSQIP, MICA). Administer DASI questionnaire.` });
  }
  if (cardiac.includes("Pacemaker/AICD")) {
    provider.push({ domain: "Cardiac Risk", priority: "high", title: "CIED Management", detail: "Preoperative device interrogation required. Coordinate with EP team for reprogramming plan and magnet availability." });
  }

  // Provider track: Respiratory
  if (respiratory.includes("OSA (diagnosed)") || respiratory.includes("OSA (suspected/STOP-BANG ≥3)")) {
    provider.push({ domain: "Respiratory", priority: "medium", title: "OSA Management", detail: "Instruct patient to bring PAP/CPAP to hospital. Plan for postoperative continuous pulse oximetry." });
  }
  if (respiratory.includes("Unexplained dyspnea")) {
    provider.push({ domain: "Respiratory", priority: "high", title: "Evaluate Unexplained Dyspnea", detail: "Consider BNP/NT-proBNP. Administer DASI questionnaire. PFTs only if needed for lung resection assessment." });
  }

  // Provider track: Endocrine
  if (isDiabetic) {
    provider.push({ domain: "Endocrine", priority: "high", title: "Perioperative Glucose Management", detail: "Order A1C if none in 90 days. Intraoperative glucose target: 140–180 mg/dL (STS/ERAS)." });
  }

  // Provider track: Hematologic
  if (other.includes("Anemia (Hgb <13)") || d.bloodLoss === "significant") {
    provider.push({ domain: "Hematologic", priority: "high", title: "Preoperative Anemia Management", detail: "Hgb <13 g/dL defines anemia requiring intervention. Order iron studies. Treat with IV iron 2–4 weeks before surgery." });
  }
  if (other.includes("Sickle cell disease")) {
    provider.push({ domain: "Hematologic", priority: "high", title: "Sickle Cell Protocol", detail: "Order BMP, CBC, reticulocyte count, HbS. Target Hb ≥10 g/dL and HbS <30%." });
  }

  // Provider track: Frailty
  if (age >= 75 || other.includes("Frailty/recent falls")) {
    provider.push({ domain: "Frailty/Age", priority: "high", title: "Frailty Screening & Geriatric Optimization", detail: "Screen with validated tool (Clinical Frailty Scale). Assess delirium risk (CAM). Cognitive screening. Advance care planning." });
  }

  // Provider track: Surgery-specific
  if (needsImplant) {
    provider.push({ domain: "Surgery-Specific", priority: "medium", title: "MRSA/MSSA Screening & Decolonization", detail: "Order nasal swab for MRSA/MSSA PCR screening. Prescribe mupirocin + CHG bathing per protocol." });
  }
  if (surgeryTags.includes("Vascular")) {
    provider.push({ domain: "Surgery-Specific", priority: "high", title: "Vascular Surgery — Elevated Risk Protocol", detail: "Biomarker-based risk stratification (BNP/NT-proBNP) especially valuable. Plan postoperative troponin surveillance." });
  }

  // Day of surgery
  provider.push({ domain: "Day of Surgery", priority: "medium", title: "DOS Verification Checklist", detail: "Verify: medications held/continued per plan, labs within range, blood glucose on arrival, all consult clearances documented, resuscitation preferences confirmed." });

  return { patient, provider, alerts, riskLevel };
}

/* ─── Plan Display Cards ─── */
function PlanCard({ rec, color }) {
  const priorityColors = { high: BRAND.danger, medium: BRAND.warning, low: BRAND.success };
  const priorityLabels = { high: "HIGH", medium: "MED", low: "LOW" };
  return (
    <div style={{ border: `1px solid ${BRAND.border}`, borderLeft: `4px solid ${color}`, borderRadius: "8px", padding: "16px", marginBottom: "12px", background: BRAND.white }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: BRAND.white, background: priorityColors[rec.priority], padding: "2px 8px", borderRadius: "10px", fontFamily: FONT }}>{priorityLabels[rec.priority]}</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: FONT }}>{rec.domain}</span>
        </div>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: BRAND.text, marginBottom: "6px", fontFamily: FONT }}>{rec.title}</div>
      <div style={{ fontSize: "13px", color: "#4a5568", lineHeight: 1.6, fontFamily: FONT }}>{rec.detail}</div>
    </div>
  );
}

function AlertBanner({ alert }) {
  const bg = alert.type === "danger" ? "#FEF2F2" : "#FFFBEB";
  const borderColor = alert.type === "danger" ? BRAND.danger : BRAND.warning;
  const icon = alert.type === "danger" ? "!" : "!";
  return (
    <div style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "14px 16px", marginBottom: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "12px", fontWeight: 800, color: borderColor, width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: BRAND.text, lineHeight: 1.5, fontFamily: FONT }}>{alert.text}</span>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   [PREOP-PAGE] — Pre-Operative Assessment Page
   This wraps the algorithm in a page with header and context.
   ═══════════════════════════════════════════════════════════════ */
function PreOpPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [plan, setPlan] = useState(null);
  const [viewMode, setViewMode] = useState("both");

  const update = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const goNext = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  const generate = () => { setPlan(generatePlan(data)); window.scrollTo(0, 0); };
  const reset = () => { setStep(0); setData({}); setPlan(null); };

  const stepComponents = [
    <StepDemographics data={data} update={update} />,
    <StepSurgery data={data} update={update} />,
    <StepMedical data={data} update={update} />,
    <StepMedications data={data} update={update} />,
    <StepFitness data={data} update={update} />,
    <StepNutrition data={data} update={update} />,
  ];

  if (plan) {
    const riskBg = { low: "#ECFDF5", elevated: "#FFFBEB", high: "#FEF2F2" };
    const riskColor = { low: BRAND.success, elevated: BRAND.warning, high: BRAND.danger };
    const showPatient = viewMode === "both" || viewMode === "patient";
    const showProvider = viewMode === "both" || viewMode === "provider";

    return (
      <div style={{ paddingTop: "100px", minHeight: "100vh", background: BRAND.bg }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: BRAND.navy, margin: 0, fontFamily: FONT }}>Surgical Readiness Plan</h1>
              <p style={{ fontSize: "13px", color: BRAND.muted, margin: "4px 0 0", fontFamily: FONT }}>
                {data.surgeryType || "Surgery"} · {data.weeksUntil || "?"} weeks · Risk: <span style={{ fontWeight: 700, color: riskColor[plan.riskLevel] }}>{plan.riskLevel.toUpperCase()}</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["both", "patient", "provider"].map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{
                  padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${viewMode === m ? BRAND.teal : BRAND.border}`,
                  background: viewMode === m ? BRAND.teal : BRAND.white,
                  color: viewMode === m ? BRAND.white : BRAND.text, fontFamily: FONT,
                }}>
                  {m === "both" ? "Both Tracks" : m === "patient" ? "Patient View" : "Provider View"}
                </button>
              ))}
              <button onClick={reset} style={{
                padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                border: `1px solid ${BRAND.border}`, background: BRAND.white, color: BRAND.muted, fontFamily: FONT,
              }}>Start Over</button>
            </div>
          </div>

          {plan.alerts.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: BRAND.danger, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Critical Alerts</div>
              {plan.alerts.map((a, i) => <AlertBanner key={i} alert={a} />)}
            </div>
          )}

          <div style={{ background: riskBg[plan.riskLevel], border: `1px solid ${riskColor[plan.riskLevel]}`, borderRadius: "8px", padding: "14px 18px", marginBottom: "24px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: riskColor[plan.riskLevel], fontFamily: FONT }}>
              PERIOPERATIVE RISK LEVEL: {plan.riskLevel.toUpperCase()}
            </span>
            <span style={{ fontSize: "12px", color: BRAND.muted, marginLeft: "12px", fontFamily: FONT }}>
              {plan.riskLevel === "low" ? "Standard preoperative pathway." : plan.riskLevel === "elevated" ? "Enhanced evaluation recommended." : "Comprehensive evaluation required."}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: showPatient && showProvider ? "1fr 1fr" : "1fr", gap: "24px" }}>
            {showPatient && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "10px", borderBottom: `3px solid ${BRAND.patientBlue}` }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: BRAND.patientBlue, fontFamily: FONT }}>Patient Preparation Track</span>
                  <span style={{ fontSize: "11px", color: BRAND.muted, background: BRAND.lightBlue, padding: "2px 8px", borderRadius: "10px" }}>{plan.patient.length} items</span>
                </div>
                {plan.patient.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])).map((r, i) => <PlanCard key={i} rec={r} color={BRAND.patientBlue} />)}
              </div>
            )}
            {showProvider && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "10px", borderBottom: `3px solid ${BRAND.providerOrange}` }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: BRAND.providerOrange, fontFamily: FONT }}>Provider Optimization Track</span>
                  <span style={{ fontSize: "11px", color: BRAND.muted, background: BRAND.lightOrange, padding: "2px 8px", borderRadius: "10px" }}>{plan.provider.length} items</span>
                </div>
                {plan.provider.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])).map((r, i) => <PlanCard key={i} rec={r} color={BRAND.providerOrange} />)}
              </div>
            )}
          </div>

          <div style={{ marginTop: "30px", padding: "16px", background: BRAND.white, borderRadius: "8px", border: `1px solid ${BRAND.border}` }}>
            <div style={{ fontSize: "11px", color: BRAND.muted, lineHeight: 1.6 }}>
              <strong>Disclaimer:</strong> This tool generates recommendations based on current evidence and guidelines (2024 AHA/ACC, ASRA 5th Ed 2025, ESAIC 2025, Multi-Society GLP-1 RA Guidance 2024). It is a clinical decision support prototype and does not replace physician judgment.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh", background: BRAND.bg }}>
      {/* Page Header */}
      <div style={{ background: `linear-gradient(160deg, ${BRAND.cream} 0%, ${BRAND.white} 100%)`, padding: "40px 0 48px", borderBottom: `1px solid ${BRAND.borderLight}` }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <SectionLabel>Clinical Tool</SectionLabel>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "32px", fontWeight: 700, color: BRAND.navy, margin: "0 0 8px" }}>Surgical Readiness Algorithm</h1>
          <p style={{ fontSize: "15px", color: BRAND.muted, margin: 0, fontFamily: FONT }}>Patient intake for personalized dual-track prehabilitation planning</p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Progress bar */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, cursor: i <= step ? "pointer" : "default" }} onClick={() => { if (i <= step) setStep(i); }}>
              <div style={{ height: "4px", borderRadius: "2px", background: i <= step ? BRAND.teal : BRAND.border, transition: "background 0.3s" }} />
              <div style={{ fontSize: "10px", color: i === step ? BRAND.teal : BRAND.muted, fontWeight: i === step ? 700 : 400, marginTop: "6px", textAlign: "center", fontFamily: FONT }}>
                {STEP_LABELS[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div style={{ background: BRAND.white, borderRadius: "12px", padding: "28px", border: `1px solid ${BRAND.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: BRAND.navy, margin: "0 0 20px", fontFamily: FONT }}>{STEP_LABELS[step]}</h2>
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button onClick={goBack} disabled={step === 0} style={{
            padding: "10px 24px", borderRadius: "8px", border: `1px solid ${BRAND.border}`,
            background: BRAND.white, color: step === 0 ? BRAND.border : BRAND.text,
            cursor: step === 0 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600, fontFamily: FONT,
          }}>Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={goNext} style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: BRAND.teal, color: BRAND.white, cursor: "pointer",
              fontSize: "14px", fontWeight: 600, fontFamily: FONT,
            }}>Continue</button>
          ) : (
            <button onClick={generate} style={{
              padding: "10px 28px", borderRadius: "8px", border: "none",
              background: BRAND.navy, color: BRAND.white, cursor: "pointer",
              fontSize: "14px", fontWeight: 700, fontFamily: FONT,
              boxShadow: "0 2px 8px rgba(27,58,92,0.3)",
            }}>Generate Readiness Plan</button>
          )}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   [APP] — Main Application with Page Routing
   
   Pages: "home" and "preop"
   To add a new page:
   1. Create a component (like PreOpPage above)
   2. Add it to the pages object below
   3. Add a nav link in the Nav component's `links` array
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");

  /* ── ADD NEW PAGES HERE ── */
  const pages = {
    home: (
      <>
        <Hero onNavigate={setPage} />
        <ValueProps />
        <Journey />
        <HowItWorks />
        <ForPatients />
        <ForHospitals />
        <About />
        <Contact />
      </>
    ),
    preop: <PreOpPage />,
  };

  return (
    <div style={{ fontFamily: FONT, color: BRAND.text, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
      <Nav currentPage={page} onNavigate={setPage} />
      {pages[page]}
      <Footer />
    </div>
  );
}
