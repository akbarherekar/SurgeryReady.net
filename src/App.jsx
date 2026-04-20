import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import { track } from "@vercel/analytics";
import TimelineView from "./components/TimelineView.jsx";

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

/* ─── Responsive hook ─── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Global responsive styles ─── */
function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .sr-grid-2 { grid-template-columns: 1fr !important; }
        .sr-grid-3 { grid-template-columns: 1fr !important; }
        .sr-grid-2-1 { grid-template-columns: 1fr !important; }
        .sr-grid-3-algo { grid-template-columns: 1fr !important; }
        .sr-plan-grid { grid-template-columns: 1fr !important; }
        .sr-hero-btns { flex-direction: column; align-items: stretch; }
        .sr-hero-btns a, .sr-hero-btns button { text-align: center; justify-content: center; }
        .sr-section { padding-top: 60px !important; padding-bottom: 60px !important; }
        .sr-hero { padding-top: 120px !important; padding-bottom: 60px !important; }
        .sr-hero h1 { font-size: 32px !important; }
        .sr-hero p { font-size: 16px !important; }
        .sr-plan-header { flex-direction: column; align-items: flex-start !important; }
        .sr-plan-buttons { width: 100%; }
        .sr-plan-buttons button { flex: 1; }
      }
      @media (max-width: 480px) {
        .sr-grid-3-algo { grid-template-columns: 1fr !important; }
        .sr-hero h1 { font-size: 28px !important; }
      }
    `}</style>
  );
}

/* ─── Shared UI Primitives ─── */
function SectionWrapper({ children, id, bg = BRAND.white, py = "100px" }) {
  return (
    <section className="sr-section" id={id} style={{ background: bg, padding: `${py} 0` }}>
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
  const mobile = useIsMobile();

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
      background: scrolled || mobileOpen ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled || mobileOpen ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${BRAND.borderLight}` : "none",
      transition: "all 0.3s ease", padding: scrolled ? "12px 0" : "20px 0",
    }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <div onClick={(e) => { e.preventDefault(); onNavigate("home"); setMobileOpen(false); window.scrollTo(0,0); }}
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
        {!mobile && (
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
        )}

        {/* Mobile hamburger */}
        {mobile && (
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px",
            display: "flex", flexDirection: "column", gap: "5px",
          }}>
            <span style={{ display: "block", width: "22px", height: "2px", background: BRAND.navy, borderRadius: "1px", transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: BRAND.navy, borderRadius: "1px", transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: BRAND.navy, borderRadius: "1px", transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {mobile && mobileOpen && (
        <div style={{
          background: BRAND.white, borderTop: `1px solid ${BRAND.borderLight}`,
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {links.map(link => (
            <a key={link.label} href={link.href} onClick={(e) => handleClick(link, e)} style={{
              fontSize: "15px", fontWeight: link.highlight ? 600 : 500, color: link.highlight ? BRAND.teal : BRAND.text,
              textDecoration: "none", fontFamily: FONT, padding: "12px 0", borderBottom: `1px solid ${BRAND.borderLight}`,
            }}>{link.label}</a>
          ))}
          <Btn href="#contact" variant="primary" onClick={(e) => { e.preventDefault(); setMobileOpen(false); onNavigate("home"); setTimeout(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}>
            Book a call
          </Btn>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   [HERO] — Main Hero Section
   Edit the headline, subheadline, and description below.
   ═══════════════════════════════════════════════════════════════ */
function Hero({ onNavigate }) {
  return (
    <section className="sr-hero" style={{
      background: `linear-gradient(160deg, ${BRAND.cream} 0%, ${BRAND.white} 40%, ${BRAND.tealLight} 100%)`,
      paddingTop: "160px", paddingBottom: "100px", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-120px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: BRAND.tealLight, opacity: 0.4 }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "250px", height: "250px", borderRadius: "50%", background: BRAND.sand, opacity: 0.5 }} />

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <SectionLabel>Hybrid perioperative optimization</SectionLabel>
        </div>

        <h1 className="sr-hero" style={{
          fontFamily: FONT_DISPLAY, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
          color: BRAND.navy, lineHeight: 1.15, margin: "0 0 16px", textAlign: "center",
        }}>
          Get surgery-ready, the right way.
        </h1>

        <p style={{
          fontSize: "17px", lineHeight: 1.7, color: BRAND.textLight, maxWidth: "600px",
          margin: "0 auto 48px", fontFamily: FONT, textAlign: "center",
        }}>
          Remote physician coaches, metabolic health guidance, and smart digital
          checklists — for patients and the teams that care for them.
        </p>

        {/* ── SPLIT PATH CARDS ── */}
        <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "780px", margin: "0 auto" }}>

          {/* Left: Patient or Provider → Assessment */}
          <div onClick={() => { onNavigate("preop"); window.scrollTo(0, 0); }} style={{
            background: BRAND.white, borderRadius: "16px", border: `2px solid ${BRAND.teal}`,
            padding: "36px 28px", textAlign: "center", cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 2px 12px rgba(13,124,102,0.08)",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,124,102,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,124,102,0.08)"; }}
          >
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%", background: BRAND.tealLight,
              margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="3.5" stroke={BRAND.teal} strokeWidth="2"/>
                <path d="M7 21v-4a5 5 0 0110 0v4" stroke={BRAND.teal} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, marginBottom: "8px" }}>
              I'm a patient or provider
            </div>
            <p style={{ fontSize: "14px", color: BRAND.textLight, lineHeight: 1.6, fontFamily: FONT, margin: "0 0 24px" }}>
              Get a personalized surgical readiness plan with evidence-based recommendations in minutes.
            </p>
            <div style={{
              background: BRAND.teal, color: BRAND.white, padding: "13px 28px", borderRadius: "8px",
              fontSize: "15px", fontWeight: 600, fontFamily: FONT, display: "inline-block",
            }}>
              Start the assessment →
            </div>
          </div>

          {/* Right: Health System → Learn More */}
          <div onClick={() => {
            const el = document.querySelector("#how-it-works");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }} style={{
            background: BRAND.white, borderRadius: "16px", border: `1.5px solid ${BRAND.border}`,
            padding: "36px 28px", textAlign: "center", cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 2px 12px rgba(27,58,92,0.04)",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,58,92,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(27,58,92,0.04)"; }}
          >
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%", background: BRAND.lightBlue,
              margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke={BRAND.navy} strokeWidth="1.8"/>
                <path d="M8 12h8M12 8v8" stroke={BRAND.navy} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: BRAND.navy, fontFamily: FONT, marginBottom: "8px" }}>
              I'm a health system
            </div>
            <p style={{ fontSize: "14px", color: BRAND.textLight, lineHeight: 1.6, fontFamily: FONT, margin: "0 0 24px" }}>
              Reduce cancellations, optimize perioperative care, and improve surgical outcomes at scale.
            </p>
            <div style={{
              background: "transparent", color: BRAND.navy, padding: "13px 28px", borderRadius: "8px",
              fontSize: "15px", fontWeight: 600, fontFamily: FONT, display: "inline-block",
              border: `1.5px solid ${BRAND.navy}`,
            }}>
              Learn more →
            </div>
          </div>

        </div>

        <p style={{
          textAlign: "center", fontSize: "13px", color: BRAND.muted, fontFamily: FONT,
          marginTop: "32px",
        }}>
          Built by anesthesiologists and surgeons. Evidence-based. Free to use.
        </p>
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
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
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
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
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
        Built by clinicians, for clinicians. Designed by anesthesiologists and surgeons who live in the OR every day.
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
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
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

      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "48px" }}>
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
          SurgeryReady was created by anesthesiologists, surgeons, intensivists, and health systems leaders
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
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${BRAND.border}`,
    fontSize: "14px", fontFamily: FONT, outline: "none", boxSizing: "border-box",
    background: BRAND.white, transition: "border-color 0.2s",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    try {
      await fetch("https://formspree.io/f/mnjoqngr", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" },
      });
      track("contact_submitted");
      setSubmitted(true);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <SectionWrapper id="contact" bg={BRAND.white}>
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
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
            <div onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="name" placeholder="Name" required style={inputStyle} />
              <input name="organization" placeholder="Organization / hospital" style={inputStyle} />
              <input name="email" placeholder="Email" type="email" required style={inputStyle} />
              <input name="role" placeholder="Role" style={inputStyle} />
              <textarea name="challenges" placeholder="What challenges are you trying to solve?" rows={4}
                style={{ ...inputStyle, resize: "vertical" }} />
              <Btn onClick={(e) => { const form = e.target.closest('div'); const inputs = form.querySelectorAll('input[required]'); let valid = true; inputs.forEach(i => { if (!i.value) valid = false; }); if (valid) { const fd = new FormData(); form.querySelectorAll('input,textarea').forEach(el => { if (el.name) fd.append(el.name, el.value); }); setSubmitting(true); fetch('https://formspree.io/f/mnjoqngr', { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).then(() => setSubmitted(true)).catch(() => alert('Something went wrong.')).finally(() => setSubmitting(false)); } }} style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Sending..." : "Submit & request a call"}
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
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, marginTop: "10px", maxWidth: "560px", margin: "10px auto 0", lineHeight: 1.5 }}>
        SurgeryReady provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment.
      </div>
    </footer>
  );
}



/* ═══════════════════════════════════════════════════════════════
   [ALGORITHM] — Surgical Readiness Algorithm (v4)
   Includes: DASI questionnaire, VO2max modal, smoking/alcohol/
   anemia assessment, severity-graded protocols, expandable cards.
   ═══════════════════════════════════════════════════════════════ */


const STEPS = ["demographics", "surgery", "medical", "medications", "fitness", "nutrition"];
const STEP_LABELS = ["Patient Info", "Surgery Details", "Medical History", "Medications", "Fitness Baseline", "Nutrition"];
const STEP_NUMS = ["01", "02", "03", "04", "05", "06"];

const SR = {
  navy: "#1B3A5C", teal: "#0D7C66", tealLight: "#E6F5F0", tealDark: "#095C4B",
  patientTeal: "#0D7C66", providerNavy: "#1B3A5C",
  lightBlue: "#E8F0FE", lightOrange: "#FFF3E8",
  bg: "#F8FAFB", white: "#FFFFFF", offWhite: "#F1F5F4",
  border: "#DDE5E3", borderLight: "#EDF1F0",
  text: "#1A2B3C", textSecondary: "#4A6274", muted: "#7C8E9B",
  success: "#0D7C66", danger: "#C53030", warning: "#B7791F",
  dangerBg: "#FFF5F5", warningBg: "#FFFFF0",
  cardShadow: "0 1px 3px rgba(27,58,92,0.06), 0 1px 2px rgba(27,58,92,0.04)",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

// ─── PROGRESS TRACKING DATA LAYER ───
const PLAN_HASH_KEYS = [
  "age", "sex", "height", "weight", "weeksUntil", "surgeryType", "surgeryTags",
  "riskCategory", "cardiac", "respiratory", "endocrine", "other",
  "anticoag", "diabetesMeds", "painMeds", "cardioMeds",
  "hemoglobin", "albumin", "dasiScore", "mets", "vo2Max",
  "exerciseLevel", "smokingStatus", "alcoholUse", "tracksHRV",
  "glp1GI", "proteinLevel", "userRole",
];

function planHash(data) {
  const subset = {};
  PLAN_HASH_KEYS.forEach(k => { if (data[k] !== undefined) subset[k] = data[k]; });
  return btoa(JSON.stringify(subset)).slice(0, 40);
}

function recKey(rec) { return `${rec.domain}::${rec.title}`; }

const VALUE_LOG_CONFIG = {
  "Exercise": { label: "Minutes of activity", unit: "min", placeholder: "e.g., 30" },
  "Nutrition": { label: "Grams of protein", unit: "g", placeholder: "e.g., 90" },
  "Self-Tracking": { label: "HRV reading", unit: "ms", placeholder: "e.g., 45" },
  "Anemia": { label: "Hemoglobin", unit: "g/dL", placeholder: "e.g., 12.5" },
  "Stress & Sleep": { label: "Hours of sleep", unit: "hrs", placeholder: "e.g., 7.5" },
};

function initProgress(plan) {
  const items = {};
  (plan.patient || []).forEach(rec => {
    const key = recKey(rec);
    const stepStates = {};
    if (rec.steps) {
      rec.steps.forEach((_, i) => { stepStates[i] = { done: false, doneAt: null }; });
    }
    items[key] = { completed: false, steps: stepStates, loggedValues: [] };
  });
  return { items, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

function computeProgress(progress, plan) {
  if (!progress || !plan) return { done: 0, total: 0, pct: 0 };
  let done = 0, total = 0;
  (plan.patient || []).forEach(rec => {
    const key = recKey(rec);
    const item = progress.items[key];
    if (rec.steps && rec.steps.length > 0) {
      rec.steps.forEach((_, i) => {
        total++;
        if (item?.steps?.[i]?.done) done++;
      });
    } else {
      total++;
      if (item?.completed) done++;
    }
  });
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function getMotivationalMessage(pct) {
  if (pct === 0) return "Every journey starts with a single step. You have got this.";
  if (pct <= 25) return "Great start. You are building momentum.";
  if (pct <= 50) return "You are making real progress. Your body is getting ready.";
  if (pct <= 75) return "More than halfway there. Your preparation is paying off.";
  if (pct < 100) return "Almost there. You are going to be so ready for this.";
  return "You have completed your preparation plan. Well done.";
}

// ─── SUPABASE PERSISTENCE HELPERS ───
async function savePlanToSupabase(userId, data, planOutput) {
  if (!supabase) return null;
  const hash = planHash(data);
  // Check for existing plan with same hash
  const { data: existing } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_hash", hash)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: row, error } = await supabase
    .from("plans")
    .insert({ user_id: userId, plan_hash: hash, plan_data: data, plan_output: planOutput })
    .select("id")
    .single();
  if (error) { console.error("savePlan:", error); return null; }
  return row.id;
}

async function saveProgressToSupabase(planId, progress) {
  if (!supabase || !planId) return;
  const entries = Object.entries(progress.items).map(([key, item]) => ({
    plan_id: planId,
    item_key: key,
    completed: item.completed || false,
    step_states: item.steps || {},
    logged_values: item.loggedValues || [],
  }));
  for (const entry of entries) {
    await supabase.from("progress").upsert(entry, { onConflict: "plan_id,item_key" });
  }
}

async function loadLatestPlan(userId) {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("plans")
    .select("id, plan_data, plan_output, plan_hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !row) return null;
  // Load progress
  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_key, completed, step_states, logged_values")
    .eq("plan_id", row.id);
  const items = {};
  (progressRows || []).forEach(p => {
    items[p.item_key] = {
      completed: p.completed,
      steps: p.step_states || {},
      loggedValues: p.logged_values || [],
      completedAt: p.completed ? new Date().toISOString() : null,
    };
  });
  return {
    planId: row.id,
    data: row.plan_data,
    plan: row.plan_output,
    hash: row.plan_hash,
    progress: { items, createdAt: null, updatedAt: null },
  };
}

// ─── AUTH MODAL ───
function AuthModal({ open, onClose, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSend = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (!supabase) { setError("Authentication is not configured yet."); return; }
    setSending(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/preop" },
    });
    setSending(false);
    if (authError) { setError(authError.message); return; }
    setSent(true);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(27,58,92,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: SR.white, borderRadius: "16px", padding: "36px 32px",
        maxWidth: "420px", width: "100%", boxShadow: "0 8px 32px rgba(27,58,92,0.15)",
        fontFamily: SR.font,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <SRLogo size={32} />
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: 0 }}>
            {sent ? "Check your email" : "Save your progress"}
          </h2>
        </div>

        {sent ? (
          <div>
            <p style={{ fontSize: "14px", color: SR.textSecondary, lineHeight: 1.7, marginBottom: "20px" }}>
              We sent a login link to <strong style={{ color: SR.navy }}>{email}</strong>. Click the link in your email to sign in and save your plan.
            </p>
            <button onClick={onClose} style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              background: SR.navy, color: SR.white, border: "none",
              fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: SR.font,
            }}>Got it</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "14px", color: SR.textSecondary, lineHeight: 1.7, marginBottom: "20px" }}>
              Enter your email to save your plan and track progress across visits. No password needed.
            </p>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="you@email.com"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "10px",
                border: `1.5px solid ${SR.border}`, fontSize: "14px", fontFamily: SR.font,
                outline: "none", boxSizing: "border-box", marginBottom: "12px",
              }}
              onFocus={e => { e.target.style.borderColor = SR.teal; }}
              onBlur={e => { e.target.style.borderColor = SR.border; }}
            />
            {error && (
              <p style={{ fontSize: "12px", color: SR.danger, margin: "0 0 10px", fontFamily: SR.font }}>{error}</p>
            )}
            <button onClick={handleSend} disabled={sending} style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              background: SR.teal, color: SR.white, border: "none",
              fontSize: "14px", fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
              fontFamily: SR.font, opacity: sending ? 0.7 : 1,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => { if (!sending) e.target.style.background = SR.tealDark; }}
            onMouseLeave={e => { e.target.style.background = SR.teal; }}
            >
              {sending ? "Sending..." : "Send login link"}
            </button>
            <p style={{ fontSize: "11px", color: SR.muted, textAlign: "center", marginTop: "14px", lineHeight: 1.5 }}>
              We will email you a secure link. No passwords, no spam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SRLogo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, background: SR.navy,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: SR.font, fontWeight: 700, fontSize: size * 0.4, color: SR.teal,
      letterSpacing: "-0.5px", flexShrink: 0, boxShadow: "0 2px 8px rgba(27,58,92,0.15)",
    }}>SR</div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: "20px", border: `1.5px solid ${selected ? SR.teal : SR.border}`,
      background: selected ? SR.tealLight : SR.white, color: selected ? SR.teal : SR.text,
      cursor: "pointer", fontSize: "13px", fontWeight: selected ? 600 : 400, transition: "all 0.2s",
      fontFamily: SR.font,
    }}>{label}</button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: SR.navy, marginBottom: "6px", fontFamily: SR.font }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: "11px", color: SR.muted, marginTop: "4px" }}>{hint}</div>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, min, max, step }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      min={min} max={max} step={step}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${SR.border}`,
        fontSize: "14px", fontFamily: SR.font, outline: "none", boxSizing: "border-box",
        background: SR.white, transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = SR.teal}
      onBlur={e => e.target.style.borderColor = SR.border}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${SR.border}`,
      fontSize: "14px", fontFamily: SR.font, background: SR.white, cursor: "pointer",
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
  const providerAck = !!data.providerAck;
  const isProvider = data.userRole === "provider";

  return (
    <>
      <Field label="First Name">
        <Input value={data.firstName || ""} onChange={v => update("firstName", v)} placeholder="e.g. Sam" />
      </Field>
      <Field label="I am a...">
        <div style={{ display: "flex", gap: "12px" }}>
          {[{ value: "patient", label: "Patient", desc: "Preparing for surgery", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3.5" stroke="currentColor" strokeWidth="2"/><path d="M7 21v-4a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}, { value: "provider", label: "Provider", desc: "Optimizing a patient", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><rect x="4" y="18" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
          )}].map(r => {
            const sel = data.userRole === r.value;
            return (
              <button key={r.value} onClick={() => { update("userRole", r.value); track("role_selected", { role: r.value }); }} style={{
                flex: 1, padding: "16px", borderRadius: "12px", cursor: "pointer",
                border: `2px solid ${sel ? SR.teal : SR.border}`,
                background: sel ? SR.tealLight : SR.white,
                transition: "all 0.2s", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              }}>
                <div style={{ color: sel ? SR.teal : SR.muted }}>{r.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: sel ? SR.teal : SR.text, fontFamily: SR.font }}>{r.label}</div>
                <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>{r.desc}</div>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Provider-specific clinical disclaimer */}
      {isProvider && !providerAck && (
        <div style={{
          background: SR.lightBlue, borderRadius: "12px", padding: "18px 20px",
          border: `1px solid ${SR.navy}22`, marginTop: "4px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: SR.navy, marginBottom: "8px", fontFamily: SR.font }}>
            Clinical Decision Support Notice
          </div>
          <p style={{ fontSize: "12px", color: SR.textSecondary, lineHeight: 1.7, margin: "0 0 14px", fontFamily: SR.font }}>
            SurgeryReady is a <strong>clinical decision support tool</strong> intended to assist — not replace — your professional clinical judgment. By proceeding, you acknowledge that:
          </p>
          <ul style={{ fontSize: "12px", color: SR.textSecondary, lineHeight: 1.8, margin: "0 0 14px", paddingLeft: "18px", fontFamily: SR.font }}>
            <li>You retain <strong>full clinical and legal responsibility</strong> for all decisions, orders, and patient outcomes.</li>
            <li>Use of this tool does not establish or imply a <strong>standard of care</strong>.</li>
            <li>Recommendations are based on population-level evidence and may not apply to individual patients.</li>
            <li>SurgeryReady does not practice medicine and assumes <strong>no liability</strong> for clinical outcomes resulting from use of this tool.</li>
            <li>This tool does not create a physician-patient relationship between SurgeryReady and any patient.</li>
          </ul>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={providerAck}
              onChange={e => {
                update("providerAck", e.target.checked || undefined);
                if (e.target.checked) sessionStorage.setItem("sr_provider_ack", "1");
                else sessionStorage.removeItem("sr_provider_ack");
              }}
              style={{ marginTop: "2px", accentColor: SR.navy, width: "15px", height: "15px", flexShrink: 0, cursor: "pointer" }}
            />
            <span style={{ fontSize: "12px", color: SR.text, lineHeight: 1.6, fontFamily: SR.font }}>
              I understand that SurgeryReady is a clinical decision support tool. I retain full responsibility for all clinical decisions and patient care.
            </span>
          </label>
        </div>
      )}
      {isProvider && providerAck && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "11px", color: SR.teal, fontFamily: SR.font, marginTop: "4px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={SR.teal} strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke={SR.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Clinical decision support notice acknowledged
        </div>
      )}

      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="Age"><Input type="number" value={data.age || ""} onChange={v => update("age", v)} placeholder="Years" min="1" max="120" /></Field>
        <Field label="Sex">
          <Select value={data.sex || ""} onChange={v => update("sex", v)} options={[
            { value: "", label: "Select..." }, { value: "male", label: "Male" }, { value: "female", label: "Female" },
          ]} />
        </Field>
      </div>
      <div className="sr-grid-3-algo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <Field label="Height (inches)"><Input type="number" value={data.height || ""} onChange={v => update("height", v)} placeholder="e.g. 68" /></Field>
        <Field label="Weight (lbs)"><Input type="number" value={data.weight || ""} onChange={v => update("weight", v)} placeholder="e.g. 180" /></Field>
        <Field label="BMI" hint="Auto-calculated">
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: SR.tealLight, fontSize: "14px", fontWeight: 600, color: SR.navy, fontFamily: SR.font }}>
            {data.height && data.weight ? (703 * parseFloat(data.weight) / (parseFloat(data.height) ** 2)).toFixed(1) : "—"}
          </div>
        </Field>
      </div>
    </>
  );
}

function StepSurgery({ data, update }) {
  return (
    <>
      <Field label="Type of Surgery"><Input value={data.surgeryType || ""} onChange={v => update("surgeryType", v)} placeholder="e.g., Total knee replacement, Colectomy" /></Field>
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="Surgical Risk Category">
          <Select value={data.riskCategory || ""} onChange={v => update("riskCategory", v)} options={[
            { value: "", label: "Select..." }, { value: "low", label: "Low Risk" }, { value: "elevated", label: "Elevated Risk" }, { value: "high", label: "High Risk (Vascular/Cardiac)" },
          ]} />
        </Field>
        <Field label="Weeks Until Surgery"><Input type="number" value={data.weeksUntil || ""} onChange={v => update("weeksUntil", v)} placeholder="e.g. 6" min="0" /></Field>
      </div>
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="Expected Duration">
          <Select value={data.duration || ""} onChange={v => update("duration", v)} options={[
            { value: "", label: "Select..." }, { value: "short", label: "< 2 hours" }, { value: "medium", label: "2–6 hours" }, { value: "long", label: "> 6 hours" },
          ]} />
        </Field>
        <Field label="ERAS Pathway Available?">
          <Select value={data.eras || ""} onChange={v => update("eras", v)} options={[
            { value: "", label: "Select..." }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
          ]} />
        </Field>
      </div>
      <Field label="Expected Blood Loss">
        <Select value={data.bloodLoss || ""} onChange={v => update("bloodLoss", v)} options={[
          { value: "", label: "Select..." }, { value: "minimal", label: "Minimal (< 200 mL)" }, { value: "moderate", label: "Moderate (200–500 mL)" }, { value: "significant", label: "Significant (> 500 mL)" },
        ]} />
      </Field>
      <Field label="Surgery Involves (select all that apply)">
        <MultiChip options={["Joint replacement", "Spinal surgery", "Foreign body/implant", "Open chest/cardiac", "Vascular", "Neurologic", "Cancer resection", "Bariatric"]}
          selected={data.surgeryTags || []} onChange={v => update("surgeryTags", v)} />
      </Field>
    </>
  );
}

function StepMedical({ data, update }) {
  const categories = [
    { key: "cardiac", label: "Cardiovascular", items: ["CAD/Angina", "CHF", "HFrEF", "HFpEF", "Valvular disease", "Severe aortic stenosis (symptomatic)", "Severe aortic stenosis (asymptomatic)", "Mechanical valve", "Arrhythmia/AF", "Atrial fibrillation / flutter", "Pacemaker/AICD", "Cardiomyopathy/HCM", "Pulmonary hypertension", "Prior MI (within 6 months)", "Prior PCI/stent", "Peripheral vascular disease", "Prior stroke", "Uncontrolled HTN (DBP >110)"] },
    { key: "respiratory", label: "Respiratory", items: ["COPD/Emphysema", "Asthma", "OSA (diagnosed)", "OSA (suspected/STOP-BANG ≥3)", "Unexplained dyspnea"] },
    { key: "endocrine", label: "Endocrine / Metabolic", items: ["Type 1 Diabetes", "Type 2 Diabetes", "HbA1c > 8", "Insulin pump", "Pheochromocytoma", "Adrenal disease", "Adrenal insufficiency / Addison's", "Chronic steroid use"] },
    { key: "other", label: "Other", items: ["Cirrhosis/liver disease", "Chronic kidney disease (CKD)", "On dialysis", "Renal insufficiency/dialysis", "Anemia (Hgb <13)", "Bleeding disorder", "Sickle cell disease", "Seizure disorder / epilepsy", "Seizure disorder", "Myasthenia gravis", "Rheumatoid arthritis / autoimmune", "Rheumatoid arthritis", "Down syndrome", "Active cancer/chemo", "History of MH", "Difficult airway history", "Frailty/recent falls"] },
  ];
  const showCigPerDay = data.smokingStatus === "current";
  const showAlcoholSub = data.alcoholUse === "moderate" || data.alcoholUse === "heavy";

  // ── Conditional detail-field flags ──
  const cardiac = data.cardiac || [];
  const other = data.other || [];
  const endocrine = data.endocrine || [];
  const respiratory = data.respiratory || [];
  const hasCAD = cardiac.some(c => ["CAD/Angina", "Prior MI (within 6 months)", "Prior PCI/stent"].includes(c));
  const hasStent = cardiac.includes("Prior PCI/stent");
  const hasHF = cardiac.some(c => ["CHF", "HFrEF", "HFpEF"].includes(c));
  const hasAF = cardiac.includes("Arrhythmia/AF") || cardiac.includes("Atrial fibrillation / flutter");
  const hasStroke = cardiac.includes("Prior stroke");
  const hasOSA = respiratory.includes("OSA (diagnosed)") || respiratory.includes("OSA (suspected/STOP-BANG ≥3)");
  const hasOSADiag = respiratory.includes("OSA (diagnosed)");
  const hasDiabetes = endocrine.some(e => e.includes("Diabetes") || e.includes("HbA1c"));
  const hasPheo = endocrine.includes("Pheochromocytoma");
  const hasChronicSteroid = endocrine.includes("Chronic steroid use") || endocrine.includes("Adrenal insufficiency / Addison's");
  const hasCKD = other.includes("Chronic kidney disease (CKD)") || other.includes("On dialysis") || other.includes("Renal insufficiency/dialysis");
  const hasDialysis = other.includes("On dialysis") || other.includes("Renal insufficiency/dialysis");
  const hasCirrhosis = other.includes("Cirrhosis/liver disease");
  const hasRA = other.includes("Rheumatoid arthritis / autoimmune") || other.includes("Rheumatoid arthritis");
  const hasMG = other.includes("Myasthenia gravis");
  const hasSeizure = other.includes("Seizure disorder / epilepsy") || other.includes("Seizure disorder");
  const hasCancer = other.includes("Active cancer/chemo") || (data.surgeryTags || []).includes("Cancer resection");
  const hasAnemia = other.includes("Anemia (Hgb <13)") || (data.hemoglobin && parseFloat(data.hemoglobin) < 13);
  const ageNum = parseInt(data.age) || 0;
  const showGeriatric = ageNum >= 65;
  const showAnyDetail = hasCAD || hasStent || hasHF || hasAF || hasStroke || hasOSA || hasDiabetes || hasPheo || hasChronicSteroid || hasCKD || hasCirrhosis || hasRA || hasMG || hasSeizure || hasCancer || hasAnemia || showGeriatric;

  return (
    <>
      {categories.map(cat => (
        <Field key={cat.key} label={cat.label}>
          <MultiChip options={cat.items} selected={data[cat.key] || []} onChange={v => update(cat.key, v)} />
        </Field>
      ))}

      {/* ── Clinical Detail Fields (conditional, unlock specific pathway recommendations) ── */}
      {showAnyDetail && (
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${SR.borderLight}` }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: SR.navy, marginBottom: "6px", fontFamily: SR.font }}>Clinical Detail (optional — unlocks more specific recommendations)</div>
          <div style={{ fontSize: "11px", color: SR.muted, marginBottom: "14px", fontFamily: SR.font }}>Leave any field blank if unknown.</div>

          {hasCAD && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Time since last cardiac event (MI/PCI/CABG)">
                <Select value={data.cardiacEventMonths || ""} onChange={v => update("cardiacEventMonths", v)} options={[
                  { value: "", label: "Unknown" }, { value: "<3", label: "< 3 months" }, { value: "3-6", label: "3–6 months" }, { value: "6-12", label: "6–12 months" }, { value: ">12", label: "> 12 months" },
                ]} />
              </Field>
              {hasStent && (
                <Field label="Stent type">
                  <Select value={data.stentType || ""} onChange={v => update("stentType", v)} options={[
                    { value: "", label: "Unknown" }, { value: "BMS", label: "Bare-metal stent (BMS)" }, { value: "DES", label: "Drug-eluting stent (DES)" }, { value: "none", label: "No stent" },
                  ]} />
                </Field>
              )}
            </div>
          )}
          {hasStent && (
            <Field label="Currently on dual antiplatelet therapy (DAPT)?">
              <Select value={data.onDAPT || ""} onChange={v => update("onDAPT", v)} options={[
                { value: "", label: "Unknown" }, { value: "yes", label: "Yes (aspirin + P2Y12 inhibitor)" }, { value: "no", label: "No" },
              ]} />
            </Field>
          )}

          {hasHF && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Heart failure type">
                <Select value={data.hfType || ""} onChange={v => update("hfType", v)} options={[
                  { value: "", label: "Unknown" }, { value: "HFrEF", label: "HFrEF (reduced EF)" }, { value: "HFpEF", label: "HFpEF (preserved EF)" },
                ]} />
              </Field>
              <Field label="Echocardiogram within last year?">
                <Select value={data.hasRecentEcho || ""} onChange={v => update("hasRecentEcho", v)} options={[
                  { value: "", label: "Unknown" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
                ]} />
              </Field>
            </div>
          )}

          {hasAF && (
            <Field label="Rate-controlled (resting HR < 110)?">
              <Select value={data.rateControlled || ""} onChange={v => update("rateControlled", v)} options={[
                { value: "", label: "Unknown" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
              ]} />
            </Field>
          )}

          {hasStroke && (
            <Field label="Time since last stroke / TIA">
              <Select value={data.strokeMonths || ""} onChange={v => update("strokeMonths", v)} options={[
                { value: "", label: "Unknown" }, { value: "<3", label: "< 3 months" }, { value: "3-9", label: "3–9 months" }, { value: ">9", label: "> 9 months" },
              ]} />
            </Field>
          )}

          {hasOSA && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="STOP-BANG score (0–8)" hint="0–2 low / 3–4 intermediate / ≥5 high">
                <Input type="number" value={data.stopBang || ""} onChange={v => update("stopBang", v)} placeholder="0–8" min="0" max="8" />
              </Field>
              {hasOSADiag && (
                <Field label="CPAP adherent?">
                  <Select value={data.cpapAdherent || ""} onChange={v => update("cpapAdherent", v)} options={[
                    { value: "", label: "Unknown" }, { value: "yes", label: "Yes — ≥4 hr/night" }, { value: "no", label: "No" },
                  ]} />
                </Field>
              )}
            </div>
          )}

          {hasDiabetes && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Last HbA1c (%)" hint="Target ≤ 8.5% for elective surgery; defer if > 9.0%">
                <Input type="number" value={data.a1cValue || ""} onChange={v => update("a1cValue", v)} placeholder="e.g. 7.8" min="4" max="20" step="0.1" />
              </Field>
              <Field label="Insulin use">
                <Select value={data.insulinType || ""} onChange={v => update("insulinType", v)} options={[
                  { value: "", label: "Unknown / not on insulin" }, { value: "none", label: "Not on insulin" }, { value: "basal", label: "Basal only" }, { value: "basal-bolus", label: "Basal-bolus" }, { value: "pump", label: "Insulin pump" },
                ]} />
              </Field>
            </div>
          )}

          {hasPheo && (
            <Field label="Alpha-blockade started ≥10–14 days?">
              <Select value={data.alphaBlockadeStarted || ""} onChange={v => update("alphaBlockadeStarted", v)} options={[
                { value: "", label: "Unknown" }, { value: "yes", label: "Yes, ≥10–14 days" }, { value: "no", label: "No / not yet" },
              ]} />
            </Field>
          )}

          {hasChronicSteroid && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Chronic steroid dose" hint="Prednisone equivalent">
                <Select value={data.steroidDose || ""} onChange={v => update("steroidDose", v)} options={[
                  { value: "", label: "Unknown" }, { value: "le5", label: "≤ 5 mg/day" }, { value: "5-20", label: "5–20 mg/day" }, { value: "ge20", label: "≥ 20 mg/day" }, { value: "addisons", label: "Addison's / replacement dose" },
                ]} />
              </Field>
              <Field label="Duration on steroids">
                <Select value={data.steroidDurationWks || ""} onChange={v => update("steroidDurationWks", v)} options={[
                  { value: "", label: "Unknown" }, { value: "lt3", label: "< 3 weeks" }, { value: "ge3", label: "≥ 3 weeks" },
                ]} />
              </Field>
            </div>
          )}

          {hasAnemia && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Ferritin (ng/mL)" hint="< 30 = absolute iron deficiency">
                <Input type="number" value={data.ferritinValue || ""} onChange={v => update("ferritinValue", v)} placeholder="e.g. 45" min="0" max="2000" />
              </Field>
              <Field label="TSAT (%)" hint="< 20% with ferritin 30–100 = functional deficiency">
                <Input type="number" value={data.tsatValue || ""} onChange={v => update("tsatValue", v)} placeholder="e.g. 18" min="0" max="100" />
              </Field>
            </div>
          )}

          {(hasCKD || hasDialysis) && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="eGFR (mL/min/1.73m²)" hint="Drives DOAC hold timing, drug avoidance">
                <Input type="number" value={data.egfrValue || ""} onChange={v => update("egfrValue", v)} placeholder="e.g. 45" min="0" max="150" />
              </Field>
              {hasDialysis && (
                <Field label="On dialysis?">
                  <Select value={data.onDialysis || ""} onChange={v => update("onDialysis", v)} options={[
                    { value: "", label: "Unknown" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
                  ]} />
                </Field>
              )}
            </div>
          )}

          {hasCirrhosis && (
            <Field label="Child-Pugh class" hint="A safe; B increased risk; C contraindicated">
              <Select value={data.childPughClass || ""} onChange={v => update("childPughClass", v)} options={[
                { value: "", label: "Unknown" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" },
              ]} />
            </Field>
          )}

          {hasRA && (
            <>
              <Field label="Biologic medications (hold 1 dosing interval preop)">
                <MultiChip options={["TNFi (etanercept/adalimumab/infliximab)", "IL-6i (tocilizumab)", "IL-17i (secukinumab)", "IL-23i (ustekinumab)", "JAK inhibitor (tofacitinib/baricitinib)", "Rituximab", "Abatacept", "None"]}
                  selected={data.biologicMeds || []} onChange={v => update("biologicMeds", v)} />
              </Field>
              <Field label="Conventional DMARDs (continue through surgery)">
                <MultiChip options={["Methotrexate (MTX)", "Hydroxychloroquine (HCQ)", "Sulfasalazine (SSZ)", "Leflunomide", "Apremilast", "None"]}
                  selected={data.conventionalDMARDs || []} onChange={v => update("conventionalDMARDs", v)} />
              </Field>
            </>
          )}

          {hasMG && (
            <Field label="On pyridostigmine?">
              <Select value={data.pyridostigmineUse || ""} onChange={v => update("pyridostigmineUse", v)} options={[
                { value: "", label: "Unknown" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
              ]} />
            </Field>
          )}

          {hasSeizure && (
            <Field label="Antiepileptic medications (continue through surgery)">
              <MultiChip options={["Levetiracetam (Keppra)", "Phenytoin", "Valproate", "Lacosamide", "Lamotrigine", "Carbamazepine", "Other"]}
                selected={data.aedMeds || []} onChange={v => update("aedMeds", v)} />
            </Field>
          )}

          {hasCancer && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Weeks since last chemotherapy" hint="Recovery ≥3–4 weeks recommended">
                <Input type="number" value={data.chemoWeeksAgo || ""} onChange={v => update("chemoWeeksAgo", v)} placeholder="e.g. 6" min="0" max="999" />
              </Field>
              <Field label="Anthracycline exposure (doxorubicin, etc.)?">
                <Select value={data.anthracyclineExposure || ""} onChange={v => update("anthracyclineExposure", v)} options={[
                  { value: "", label: "Unknown" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
                ]} />
              </Field>
            </div>
          )}

          {showGeriatric && (
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Clinical Frailty Scale (CFS 1–9)" hint="≥5 prompts geriatric assessment; ≥7 goals-of-care">
                <Input type="number" value={data.cfsScore || ""} onChange={v => update("cfsScore", v)} placeholder="1–9" min="1" max="9" />
              </Field>
              <Field label="Mini-Cog / MoCA screen">
                <Select value={data.miniCogNormal || ""} onChange={v => update("miniCogNormal", v)} options={[
                  { value: "", label: "Not done" }, { value: "yes", label: "Normal" }, { value: "no", label: "Abnormal (delirium risk)" },
                ]} />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* ── Smoking, Alcohol & Anemia Subsection ── */}
      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${SR.borderLight}` }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: SR.navy, marginBottom: "16px", fontFamily: SR.font }}>Smoking, Alcohol & Anemia Assessment</div>

        <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Smoking Status">
            <Select value={data.smokingStatus || ""} onChange={v => update("smokingStatus", v)} options={[
              { value: "", label: "Select..." }, { value: "never", label: "Never smoker" },
              { value: "former_gt8", label: "Former (quit >8 weeks ago)" },
              { value: "former_lt8", label: "Former (quit <8 weeks ago)" },
              { value: "current", label: "Current smoker" },
            ]} />
          </Field>
          {showCigPerDay && (
            <Field label="Cigarettes per day" hint="≥20/day = heavy smoker">
              <Input type="number" value={data.cigPerDay || ""} onChange={v => update("cigPerDay", v)} placeholder="e.g. 10" min="1" />
            </Field>
          )}
        </div>

        <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Alcohol Use">
            <Select value={data.alcoholUse || ""} onChange={v => update("alcoholUse", v)} options={[
              { value: "", label: "Select..." }, { value: "none", label: "None / Rare" },
              { value: "light", label: "Light (1–7 drinks/week)" },
              { value: "moderate", label: "Moderate (8–14 drinks/week)" },
              { value: "heavy", label: "Heavy (>14 drinks/week)" },
            ]} />
          </Field>
          {showAlcoholSub && (
            <Field label="Binge drinking episodes?">
              <Select value={data.bingeDrinking || ""} onChange={v => update("bingeDrinking", v)} options={[
                { value: "", label: "Select..." }, { value: "yes", label: "Yes" }, { value: "no", label: "No" },
              ]} />
            </Field>
          )}
        </div>
        {showAlcoholSub && (
          <Field label="History of alcohol withdrawal (seizures / DTs)?">
            <Select value={data.withdrawalHistory || ""} onChange={v => update("withdrawalHistory", v)} options={[
              { value: "", label: "Select..." }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "Unknown" },
            ]} />
          </Field>
        )}

        <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Hemoglobin (g/dL)" hint="Enables severity-graded anemia protocol">
            <Input type="number" value={data.hemoglobin || ""} onChange={v => update("hemoglobin", v)} placeholder="e.g. 11.5" min="3" max="22" step="0.1" />
          </Field>
          <Field label="Known Iron Deficiency?">
            <Select value={data.ironDeficiency || ""} onChange={v => update("ironDeficiency", v)} options={[
              { value: "", label: "Select..." }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "Unknown" },
            ]} />
          </Field>
        </div>
      </div>
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
        <Field key={g.key} label={g.label}>
          <MultiChip options={g.items} selected={data[g.key] || []} onChange={v => update(g.key, v)} />
        </Field>
      ))}
      <Field label="GLP-1 RA Details (if applicable)">
        <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Select value={data.glp1Phase || ""} onChange={v => update("glp1Phase", v)} options={[
            { value: "", label: "Escalation phase?" }, { value: "yes", label: "Yes — still titrating up" }, { value: "no", label: "No — stable dose" },
          ]} />
          <Select value={data.glp1GI || ""} onChange={v => update("glp1GI", v)} options={[
            { value: "", label: "GI symptoms?" }, { value: "none", label: "None" }, { value: "mild", label: "Mild (occasional nausea)" }, { value: "active", label: "Active (nausea/vomiting/bloating)" },
          ]} />
        </div>
      </Field>
    </>
  );
}

// ─── DASI SURVEY MODAL ───
const DASI_QUESTIONS = [
  { id: 1,  text: "Can you take care of yourself — eating, dressing, bathing, or using the toilet?",                                              weight: 2.75 },
  { id: 2,  text: "Can you walk indoors, such as around your house?",                                                                              weight: 1.75 },
  { id: 3,  text: "Can you walk a block or two on level ground?",                                                                                  weight: 2.75 },
  { id: 4,  text: "Can you climb a flight of stairs or walk up a hill?",                                                                           weight: 5.50 },
  { id: 5,  text: "Can you run a short distance?",                                                                                                  weight: 8.00 },
  { id: 6,  text: "Can you do light housework — like dusting or washing dishes?",                                                                  weight: 2.70 },
  { id: 7,  text: "Can you do moderate housework — like vacuuming, sweeping, or carrying in groceries?",                                           weight: 3.50 },
  { id: 8,  text: "Can you do heavy housework — like scrubbing floors or moving heavy furniture?",                                                 weight: 8.00 },
  { id: 9,  text: "Can you do yard work — like raking leaves, weeding, or pushing a power mower?",                                                weight: 4.50 },
  { id: 10, text: "Can you have sexual relations?",                                                                                                weight: 5.25 },
  { id: 11, text: "Can you participate in moderate recreational activities — like golf, bowling, dancing, doubles tennis, or throwing a ball?",    weight: 6.00 },
  { id: 12, text: "Can you participate in strenuous sports — like swimming, singles tennis, football, basketball, or skiing?",                     weight: 7.50 },
];

function DASIModal({ onClose, onApply }) {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const score = DASI_QUESTIONS.reduce((sum, q) => sum + (answers[q.id] === "yes" ? q.weight : 0), 0);
  const vo2est = (0.43 * score + 9.48).toFixed(1);
  const allDone = answered === DASI_QUESTIONS.length;

  const toggle = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  const metsCategory = score >= 34 ? "≥ 4 METs — adequate functional capacity"
    : score > 0 ? "< 4 METs — reduced functional capacity"
    : null;
  const metsColor = score >= 34 ? SR.success : SR.warning;

  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000,
      background: "rgba(27,58,92,0.65)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: SR.white, borderRadius: "20px", maxWidth: "560px", width: "100%",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(27,58,92,0.3)",
      }}>
        {/* Sticky header */}
        <div style={{ padding: "24px 24px 0", position: "sticky", top: 0, background: SR.white, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px", fontFamily: SR.font }}>Duke Activity Status Index</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: 0, fontFamily: SR.font }}>DASI Survey</h2>
              <p style={{ fontSize: "12px", color: SR.muted, margin: "4px 0 0", fontFamily: SR.font }}>Answer Yes or No for each activity. Be honest — there are no wrong answers.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${SR.border}`, background: SR.white, cursor: "pointer", color: SR.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, fontFamily: SR.font }}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ margin: "14px 0 0", height: 5, borderRadius: 3, background: SR.borderLight }}>
            <div style={{ height: "100%", borderRadius: 3, background: SR.teal, width: `${(answered / 12) * 100}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font, margin: "4px 0 14px" }}>{answered} of 12 answered</div>
          <div style={{ height: 1, background: SR.borderLight, marginLeft: "-24px", marginRight: "-24px" }} />
        </div>

        {/* Questions */}
        <div style={{ padding: "16px 24px" }}>
          {DASI_QUESTIONS.map((q, i) => {
            const ans = answers[q.id];
            return (
              <div key={q.id} style={{
                padding: "14px 16px", borderRadius: "12px", marginBottom: "10px",
                border: `1.5px solid ${ans ? SR.teal : SR.borderLight}`,
                background: ans === "yes" ? SR.tealLight : ans === "no" ? SR.bg : SR.white,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: SR.muted, fontFamily: SR.font, marginRight: "6px" }}>{i + 1}.</span>
                    <span style={{ fontSize: "13px", color: SR.text, lineHeight: 1.5, fontFamily: SR.font }}>{q.text}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginTop: "1px" }}>
                    {["yes", "no"].map(v => (
                      <button key={v} onClick={() => toggle(q.id, v)} style={{
                        padding: "5px 14px", borderRadius: "7px", border: `1.5px solid ${ans === v ? (v === "yes" ? SR.teal : "#C53030") : SR.border}`,
                        background: ans === v ? (v === "yes" ? SR.teal : "#C53030") : SR.white,
                        color: ans === v ? SR.white : SR.textSecondary,
                        fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: SR.font,
                        transition: "all 0.15s",
                      }}>{v === "yes" ? "Yes" : "No"}</button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Live score */}
          {answered > 0 && (
            <div style={{
              marginTop: "6px", padding: "18px 20px", borderRadius: "14px",
              background: `linear-gradient(135deg, ${SR.navy} 0%, ${SR.tealDark} 100%)`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontFamily: SR.font, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                    {allDone ? "Your DASI Score" : "Score so far…"}
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: SR.white, fontFamily: SR.font, lineHeight: 1 }}>
                    {score.toFixed(1)}
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 400, marginLeft: "4px" }}>/ 58.2</span>
                  </div>
                  {metsCategory && (
                    <div style={{ fontSize: "12px", color: allDone ? "#6EE7C7" : "rgba(255,255,255,0.6)", fontFamily: SR.font, marginTop: "4px", fontWeight: allDone ? 600 : 400 }}>
                      {metsCategory}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontFamily: SR.font, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.7px" }}>Est. VO₂max</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: SR.white, fontFamily: SR.font, lineHeight: 1 }}>
                    {vo2est}
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 400, marginLeft: "3px" }}>mL/kg/min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Apply button */}
          <button
            disabled={!allDone}
            onClick={() => { onApply(score.toFixed(1), vo2est, score < 34 ? "lt4" : score < 50 ? "4-7" : "gt7"); onClose(); }}
            style={{
              marginTop: "14px", width: "100%", padding: "13px",
              borderRadius: "10px", border: "none",
              background: allDone ? SR.teal : SR.borderLight,
              color: allDone ? SR.white : SR.muted,
              fontSize: "14px", fontWeight: 700, cursor: allDone ? "pointer" : "not-allowed",
              fontFamily: SR.font, transition: "all 0.2s",
            }}>
            {allDone ? `Apply Score (${score.toFixed(1)}) to My Plan →` : `Answer all 12 questions to apply`}
          </button>
          <button onClick={onClose} style={{ marginTop: "8px", width: "100%", padding: "10px", borderRadius: "10px", border: `1.5px solid ${SR.border}`, background: SR.white, color: SR.muted, fontSize: "13px", cursor: "pointer", fontFamily: SR.font }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── VO2MAX INFO MODAL ───
function VO2MaxModal({ onClose }) {
  const sources = [
    {
      label: "Apple Watch / iPhone",
      color: SR.navy,
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill={SR.navy}/>
          <rect x="11" y="5" width="14" height="26" rx="3" fill="none" stroke="white" strokeWidth="1.8"/>
          <rect x="14" y="7" width="8" height="2" rx="1" fill="white" opacity="0.5"/>
          <circle cx="18" cy="27" r="1.5" fill="white" opacity="0.6"/>
          <path d="M14 15 L16 12 L18 17 L20 13 L22 15" stroke="#2ECC9B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Open the Health app on your iPhone" },
        { num: "2", text: "Tap Browse → Heart → Cardio Fitness" },
        { num: "3", text: "Your VO₂max estimate is shown in mL/kg/min" },
        { num: "!", text: "Requires Apple Watch Series 3+ and at least one outdoor walk/run", note: true },
      ],
      note: "Apple Watch estimates VO₂max during outdoor walks (if your pace is brisk) and runs. The estimate becomes more accurate over time with more activity data.",
    },
    {
      label: "Garmin / Fitbit / Polar",
      color: "#1a56a0",
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill="#1a56a0"/>
          <rect x="9" y="10" width="18" height="16" rx="3" fill="none" stroke="white" strokeWidth="1.8"/>
          <path d="M9 16 L6 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M30 16 L27 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M13 19 L15 16 L18 21 L20 17 L23 19" stroke="#6EE7C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Open your device's companion app (Garmin Connect, Fitbit, or Polar Flow)" },
        { num: "2", text: "Navigate to Health Stats → VO₂max or Fitness Level" },
        { num: "3", text: "Your current estimate is shown in mL/kg/min" },
      ],
      note: "Most Garmin, Fitbit, and Polar wearables estimate VO₂max during running or cycling activities. Accuracy improves after several weeks of tracked workouts.",
    },
    {
      label: "Formally Tested (Gold Standard)",
      color: SR.tealDark,
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill={SR.tealDark}/>
          <path d="M12 18 Q12 10 18 10 Q24 10 24 18 Q24 26 18 26 Q12 26 12 18z" fill="none" stroke="white" strokeWidth="1.8"/>
          <path d="M15 18 Q15 13 18 13 Q21 13 21 18" stroke="#6EE7C7" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M18 26 L18 29 M14 29 L22 29" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="18" cy="18" r="2" fill="white" opacity="0.7"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Done at a sports medicine clinic, cardiopulmonary lab, or hospital exercise testing center" },
        { num: "2", text: "Involves a graded exercise test (treadmill or bike) with a mask measuring your breath gases" },
        { num: "3", text: "Results give your exact VO₂max in mL/kg/min — the most accurate measurement available" },
      ],
      note: "A formal VO₂max test is considered the gold standard. It can be arranged through your physician or a sports medicine clinic — particularly valuable before major surgery.",
    },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: "rgba(27,58,92,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SR.white, borderRadius: "20px", maxWidth: "540px", width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(27,58,92,0.3)" }}>
        <div style={{ padding: "24px 24px 0", position: "sticky", top: 0, background: SR.white, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px", fontFamily: SR.font }}>Fitness Metric</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: 0, fontFamily: SR.font }}>How to Find Your VO₂max</h2>
              <p style={{ fontSize: "12px", color: SR.muted, margin: "4px 0 0", fontFamily: SR.font }}>Three ways to get your number — pick whichever applies to you.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${SR.border}`, background: SR.white, cursor: "pointer", color: SR.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ height: 1, background: SR.borderLight, marginLeft: "-24px", marginRight: "-24px" }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          {sources.map((src, i) => (
            <div key={i} style={{ borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ padding: "14px 18px", background: SR.bg, display: "flex", alignItems: "center", gap: "12px", borderBottom: `1px solid ${SR.borderLight}` }}>
                {src.icon}
                <span style={{ fontSize: "14px", fontWeight: 700, color: SR.navy, fontFamily: SR.font }}>{src.label}</span>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {src.steps.map((step, j) => (
                  <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: j < src.steps.length - 1 ? "10px" : "0" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: step.note ? SR.warningBg : SR.tealLight,
                      border: `1.5px solid ${step.note ? SR.warning : SR.teal}`,
                      color: step.note ? SR.warning : SR.teal,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, fontFamily: SR.font,
                    }}>{step.num}</div>
                    <span style={{ fontSize: "13px", color: step.note ? SR.warning : SR.text, lineHeight: 1.5, fontFamily: SR.font, fontWeight: step.note ? 600 : 400 }}>{step.text}</span>
                  </div>
                ))}
                <div style={{ marginTop: "12px", padding: "10px 12px", background: SR.bg, borderRadius: "8px", borderLeft: `3px solid ${src.color}` }}>
                  <span style={{ fontSize: "12px", color: SR.textSecondary, lineHeight: 1.55, fontFamily: SR.font }}>{src.note}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Reference ranges */}
          <div style={{ padding: "16px 18px", borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, background: SR.bg }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: SR.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px", fontFamily: SR.font }}>Reference Ranges (adults, mL/kg/min)</div>
            {[
              { label: "< 18", desc: "Very low — high surgical risk", color: SR.danger },
              { label: "18–25", desc: "Below average", color: SR.warning },
              { label: "26–35", desc: "Average — most adults", color: SR.textSecondary },
              { label: "36–45", desc: "Above average — good surgical fitness", color: SR.teal },
              { label: "> 45", desc: "Excellent", color: SR.tealDark },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: i < 4 ? "7px" : 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: SR.text, fontFamily: SR.font, minWidth: "44px" }}>{r.label}</span>
                <span style={{ fontSize: "12px", color: SR.textSecondary, fontFamily: SR.font }}>{r.desc}</span>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{ marginTop: "14px", width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: SR.teal, color: SR.white, fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: SR.font }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

// ─── GRIP STRENGTH MODAL ───
function GripStrengthModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: "rgba(27,58,92,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SR.white, borderRadius: "20px", maxWidth: "520px", width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(27,58,92,0.3)" }}>
        <div style={{ padding: "24px 24px 0", position: "sticky", top: 0, background: SR.white, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px", fontFamily: SR.font }}>Fitness Metric</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: 0, fontFamily: SR.font }}>How to Measure Grip Strength</h2>
              <p style={{ fontSize: "12px", color: SR.muted, margin: "4px 0 0", fontFamily: SR.font }}>A validated predictor of surgical outcomes and overall fitness.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${SR.border}`, background: SR.white, cursor: "pointer", color: SR.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ height: 1, background: SR.borderLight, marginLeft: "-24px", marginRight: "-24px" }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Why it matters */}
          <div style={{ padding: "14px 16px", borderRadius: "12px", background: SR.tealLight, border: `1.5px solid ${SR.teal}20`, marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: SR.teal, marginBottom: "4px", fontFamily: SR.font }}>Why grip strength matters</div>
            <div style={{ fontSize: "13px", color: SR.text, lineHeight: 1.6, fontFamily: SR.font }}>Grip strength is one of the strongest predictors of surgical recovery, muscle mass, and overall frailty. It's used by researchers and clinicians as a simple proxy for total body strength — and it's easy to measure at home.</div>
          </div>

          {/* Method 1: Dynamometer */}
          <div style={{ borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, overflow: "hidden", marginBottom: "14px" }}>
            <div style={{ padding: "12px 18px", background: SR.bg, borderBottom: `1px solid ${SR.borderLight}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "8px", background: SR.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 12 Q5 6 12 6 Q19 6 19 12 Q19 18 12 18 Q5 18 5 12z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M9 12 Q9 9 12 9 Q15 9 15 12" stroke="#2ECC9B" strokeWidth="1.8" strokeLinecap="round" fill="none"/><line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: SR.navy, fontFamily: SR.font }}>Option 1 — Handheld Dynamometer</div>
                <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>Most accurate · available at most pharmacies or online (~$20–40)</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              {[
                "Sit upright with your elbow bent at 90° and your arm close to your body.",
                "Hold the dynamometer in your dominant hand with a neutral wrist position.",
                "Squeeze as hard as you can for 3 seconds — a full maximum effort.",
                "Rest 1 minute, then repeat twice more. Record the highest of the 3 readings.",
                "Repeat with your non-dominant hand and record that too.",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 4 ? "10px" : 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: SR.tealLight, color: SR.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0, fontFamily: SR.font }}>{i + 1}</div>
                  <span style={{ fontSize: "13px", color: SR.text, lineHeight: 1.5, fontFamily: SR.font }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Method 2: No device */}
          <div style={{ borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, overflow: "hidden", marginBottom: "18px" }}>
            <div style={{ padding: "12px 18px", background: SR.bg, borderBottom: `1px solid ${SR.borderLight}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "8px", background: SR.tealDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M8 6 Q8 3 11 3 L13 3 Q16 3 16 6 L16 12 Q16 16 12 16 Q8 16 8 12 Z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M8 10 L5 10 Q3 10 3 12 Q3 14 5 14 L8 14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 10 L19 10 Q21 10 21 12 Q21 14 19 14 L16 14" stroke="#2ECC9B" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="21" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: SR.navy, fontFamily: SR.font }}>Option 2 — No Device (Practical Estimate)</div>
                <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>Good for weekly self-tracking · use a firm stress ball or rolled towel</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              {[
                "Squeeze a firm stress ball, tennis ball, or tightly rolled towel as hard as possible for 10 seconds.",
                "Note how it feels compared to last week — stronger, same, or weaker.",
                "Consistent weekly testing is more useful than any single number. A downward trend before surgery is a warning sign.",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 2 ? "10px" : 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: SR.tealLight, color: SR.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0, fontFamily: SR.font }}>{i + 1}</div>
                  <span style={{ fontSize: "13px", color: SR.text, lineHeight: 1.5, fontFamily: SR.font }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference ranges */}
          <div style={{ padding: "16px 18px", borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, background: SR.bg, marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: SR.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px", fontFamily: SR.font }}>Reference Ranges (dominant hand, kg)</div>
            <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Men", ranges: [{ r: "< 26 kg", d: "Low — concern for frailty", c: SR.danger }, { r: "26–38 kg", d: "Average", c: SR.textSecondary }, { r: "> 38 kg", d: "Strong", c: SR.teal }] },
                { label: "Women", ranges: [{ r: "< 16 kg", d: "Low — concern for frailty", c: SR.danger }, { r: "16–24 kg", d: "Average", c: SR.textSecondary }, { r: "> 24 kg", d: "Strong", c: SR.teal }] },
              ].map((sex, i) => (
                <div key={i}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: SR.navy, fontFamily: SR.font, marginBottom: "6px" }}>{sex.label}</div>
                  {sex.ranges.map((r, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.c, flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: SR.text, fontFamily: SR.font }}>{r.r}</span>
                      <span style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>{r.d}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: SR.teal, color: SR.white, fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: SR.font }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

// ─── HELPER: small teal link-button ───
function InfoButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      marginTop: "7px", display: "inline-flex", alignItems: "center", gap: "5px",
      background: "none", border: "none", cursor: "pointer", padding: "0",
      fontSize: "12px", fontWeight: 700, color: SR.teal, fontFamily: SR.font,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={SR.teal} strokeWidth="2.2"/><path d="M12 11v5" stroke={SR.teal} strokeWidth="2.2" strokeLinecap="round"/><circle cx="12" cy="7.5" r="1.2" fill={SR.teal}/></svg>
      {label}
    </button>
  );
}

// ─── HRV INFO MODAL ───
function HRVModal({ onClose }) {
  const sources = [
    {
      label: "Apple Watch / iPhone",
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill={SR.navy}/>
          <rect x="11" y="5" width="14" height="26" rx="3" fill="none" stroke="white" strokeWidth="1.8"/>
          <rect x="14" y="7" width="8" height="2" rx="1" fill="white" opacity="0.5"/>
          <circle cx="18" cy="27" r="1.5" fill="white" opacity="0.6"/>
          <path d="M12 18 Q14 13 16 18 Q18 23 20 18 Q22 13 24 18" stroke="#2ECC9B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Open the Health app on your iPhone" },
        { num: "2", text: "Tap Browse → Heart → Heart Rate Variability" },
        { num: "3", text: "Your HRV trend is shown in milliseconds (ms)" },
        { num: "!", text: "Requires Apple Watch — measured automatically during sleep", note: true },
      ],
      note: "Apple Watch measures HRV each night using the SDNN method during sleep. Your daily average is shown in the Health app. A rising trend over weeks indicates improving recovery and readiness.",
    },
    {
      label: "Garmin / Polar / WHOOP",
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill="#1a56a0"/>
          <rect x="9" y="10" width="18" height="16" rx="3" fill="none" stroke="white" strokeWidth="1.8"/>
          <path d="M9 16 L6 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M30 16 L27 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 18 Q14 14 16 18 Q18 22 20 18 Q22 14 24 18" stroke="#6EE7C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Open your device's companion app (Garmin Connect, Polar Flow, or WHOOP)" },
        { num: "2", text: "Look for HRV Status, Recovery, or Readiness section" },
        { num: "3", text: "Your HRV is shown in ms — WHOOP and Garmin show this daily on wake-up" },
      ],
      note: "WHOOP and Garmin track HRV every morning before you get out of bed — the most consistent measurement window. Polar measures during sleep. All use rMSSD, a slightly different method than Apple's SDNN, so numbers aren't directly comparable across devices.",
    },
    {
      label: "Dedicated HRV Apps",
      icon: (
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <rect width="36" height="36" rx="10" fill={SR.tealDark}/>
          <rect x="8" y="8" width="20" height="20" rx="4" fill="none" stroke="white" strokeWidth="1.8"/>
          <path d="M12 18 Q14 13 16 18 Q18 23 20 18 Q22 13 24 18" stroke="#6EE7C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="24" cy="18" r="1.5" fill="white" opacity="0.6"/>
        </svg>
      ),
      steps: [
        { num: "1", text: "Download HRV4Training, Elite HRV, or Welltory (all free versions available)" },
        { num: "2", text: "Measure each morning before getting out of bed using your phone camera (finger over lens) or a chest strap" },
        { num: "3", text: "The app builds your personal baseline over 1–2 weeks and shows trends" },
      ],
      note: "These apps use your phone's camera to detect pulse via photoplethysmography — no wearable needed. HRV4Training is particularly well-validated for tracking readiness over time.",
    },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: "rgba(27,58,92,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SR.white, borderRadius: "20px", maxWidth: "540px", width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(27,58,92,0.3)" }}>
        <div style={{ padding: "24px 24px 0", position: "sticky", top: 0, background: SR.white, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px", fontFamily: SR.font }}>Fitness Metric</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: 0, fontFamily: SR.font }}>How to Find Your HRV</h2>
              <p style={{ fontSize: "12px", color: SR.muted, margin: "4px 0 0", fontFamily: SR.font }}>Heart Rate Variability measures the variation between heartbeats — a key window into recovery and readiness.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${SR.border}`, background: SR.white, cursor: "pointer", color: SR.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ height: 1, background: SR.borderLight, marginLeft: "-24px", marginRight: "-24px" }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* What is HRV */}
          <div style={{ padding: "14px 16px", borderRadius: "12px", background: SR.tealLight, border: `1.5px solid ${SR.teal}20`, marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: SR.teal, marginBottom: "4px", fontFamily: SR.font }}>What is HRV and why does it matter before surgery?</div>
            <div style={{ fontSize: "13px", color: SR.text, lineHeight: 1.6, fontFamily: SR.font }}>Your heart doesn't beat perfectly evenly — the tiny variations between beats reflect how well your nervous system is recovering. Higher HRV generally means better fitness and resilience. A rising HRV trend during prehabilitation is one of the best signals that your preparation is working.</div>
          </div>

          {sources.map((src, i) => (
            <div key={i} style={{ borderRadius: "14px", border: `1.5px solid ${SR.borderLight}`, overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ padding: "12px 18px", background: SR.bg, borderBottom: `1px solid ${SR.borderLight}`, display: "flex", alignItems: "center", gap: "12px" }}>
                {src.icon}
                <span style={{ fontSize: "14px", fontWeight: 700, color: SR.navy, fontFamily: SR.font }}>{src.label}</span>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {src.steps.map((step, j) => (
                  <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: j < src.steps.length - 1 ? "10px" : "0" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: step.note ? SR.warningBg : SR.tealLight,
                      border: `1.5px solid ${step.note ? SR.warning : SR.teal}`,
                      color: step.note ? SR.warning : SR.teal,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, fontFamily: SR.font,
                    }}>{step.num}</div>
                    <span style={{ fontSize: "13px", color: step.note ? SR.warning : SR.text, lineHeight: 1.5, fontFamily: SR.font, fontWeight: step.note ? 600 : 400 }}>{step.text}</span>
                  </div>
                ))}
                <div style={{ marginTop: "12px", padding: "10px 12px", background: SR.bg, borderRadius: "8px", borderLeft: `3px solid ${SR.teal}` }}>
                  <span style={{ fontSize: "12px", color: SR.textSecondary, lineHeight: 1.55, fontFamily: SR.font }}>{src.note}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Context note */}
          <div style={{ padding: "14px 16px", borderRadius: "12px", background: SR.bg, border: `1.5px solid ${SR.borderLight}`, marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: SR.navy, marginBottom: "4px", fontFamily: SR.font }}>How to use your HRV in this plan</div>
            <div style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.6, fontFamily: SR.font }}>You don't need a specific number — just select "Yes — wearable device" if you're tracking it. Your plan will include guidance on monitoring your HRV trend throughout prehabilitation and recognising a drop that may indicate overtraining.</div>
          </div>

          <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: SR.teal, color: SR.white, fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: SR.font }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

function StepFitness({ data, update }) {
  const [showDASI, setShowDASI] = useState(false);
  const [showVO2,  setShowVO2]  = useState(false);
  const [showGrip, setShowGrip] = useState(false);
  const [showHRV,  setShowHRV]  = useState(false);

  const applyDASI = (score, vo2, mets) => {
    update("dasiScore", score);
    update("vo2max", vo2);
    update("mets", mets);
  };

  return (
    <>
      {showDASI && <DASIModal onClose={() => setShowDASI(false)} onApply={applyDASI} />}
      {showVO2  && <VO2MaxModal onClose={() => setShowVO2(false)} />}
      {showGrip && <GripStrengthModal onClose={() => setShowGrip(false)} />}
      {showHRV  && <HRVModal onClose={() => setShowHRV(false)} />}

      <Field label="Current Exercise Level">
        <Select value={data.exerciseLevel || ""} onChange={v => update("exerciseLevel", v)} options={[
          { value: "", label: "Select..." }, { value: "sedentary", label: "Sedentary — no regular exercise" },
          { value: "light", label: "Light — walking 1–2x/week" }, { value: "moderate", label: "Moderate — 3–4x/week, moderate intensity" },
          { value: "active", label: "Active — 5+x/week, vigorous" },
        ]} />
      </Field>

      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="DASI Score (if available)" hint="Duke Activity Status Index (0–58.2). Score < 34 = < 4 METs">
          <Input type="number" value={data.dasiScore || ""} onChange={v => update("dasiScore", v)} placeholder="0–58.2" min="0" max="58.2" step="0.1" />
          <InfoButton label="Take the DASI survey →" onClick={() => setShowDASI(true)} />
          {data.dasiScore && (
            <div style={{ marginTop: "5px", fontSize: "11px", color: SR.teal, fontWeight: 600, fontFamily: SR.font }}>
              ✓ Score recorded: {data.dasiScore}
            </div>
          )}
        </Field>
        <Field label="Estimated METs" hint="If DASI not available">
          <Select value={data.mets || ""} onChange={v => update("mets", v)} options={[
            { value: "", label: "Select..." }, { value: "lt4", label: "< 4 METs (can't climb 1 flight)" },
            { value: "4-7", label: "4–7 METs (climb 2 flights, walk uphill)" }, { value: "gt7", label: "> 7 METs (vigorous activities)" },
          ]} />
        </Field>
      </div>

      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="VO₂max (if known, mL/kg/min)">
          <Input type="number" value={data.vo2max || ""} onChange={v => update("vo2max", v)} placeholder="e.g., 28" />
          <InfoButton label="How do I find my VO₂max? →" onClick={() => setShowVO2(true)} />
        </Field>
        <Field label="Grip Strength (if known, kg)">
          <Input type="number" value={data.gripStrength || ""} onChange={v => update("gripStrength", v)} placeholder="e.g., 35" />
          <InfoButton label="How do I measure this? →" onClick={() => setShowGrip(true)} />
        </Field>
      </div>

      <Field label="Heart Rate Variability (HRV) — do you track it?">
        <Select value={data.tracksHRV || ""} onChange={v => update("tracksHRV", v)} options={[
          { value: "", label: "Select..." }, { value: "yes", label: "Yes — wearable device" }, { value: "no", label: "No" },
        ]} />
        <InfoButton label="How do I find my HRV? →" onClick={() => setShowHRV(true)} />
      </Field>

      {data.tracksHRV === "yes" && (
        <Field label="Most recent HRV value (ms)">
          <Input type="number" value={data.hrvValue || ""} onChange={v => update("hrvValue", v)} placeholder="e.g., 45" />
          <div style={{ fontSize: "12px", color: SR.textSecondary, marginTop: "4px", fontFamily: SR.font }}>
            Enter your average or most recent resting HRV in milliseconds. Found in your wearable app (Apple Health, WHOOP, Garmin, etc.).
          </div>
        </Field>
      )}

      <Field label="Current thermal conditioning habits">
        <MultiChip options={["Sauna use", "Cold plunge/cold showers", "None"]}
          selected={data.thermalHabits || []} onChange={v => update("thermalHabits", v)} />
      </Field>
    </>
  );
}

function StepNutrition({ data, update }) {
  return (
    <>
      <Field label="Current Daily Protein Intake (estimate)">
        <Select value={data.proteinLevel || ""} onChange={v => update("proteinLevel", v)} options={[
          { value: "", label: "Select..." }, { value: "low", label: "Low — minimal meat/protein sources" },
          { value: "moderate", label: "Moderate — some protein each meal" }, { value: "high", label: "High — actively tracking 1.2+ g/kg/day" },
        ]} />
      </Field>
      <div className="sr-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Field label="Albumin (if available, g/dL)"><Input type="number" value={data.albumin || ""} onChange={v => update("albumin", v)} placeholder="e.g. 3.8" step="0.1" /></Field>
        <Field label="Recent Unintentional Weight Loss?">
          <Select value={data.weightLoss || ""} onChange={v => update("weightLoss", v)} options={[
            { value: "", label: "Select..." }, { value: "no", label: "No" }, { value: "mild", label: "Yes — < 5% in 3 months" }, { value: "significant", label: "Yes — > 5% in 3 months" },
          ]} />
        </Field>
      </div>
      <Field label="Current Eating Pattern">
        <Select value={data.eatingPattern || ""} onChange={v => update("eatingPattern", v)} options={[
          { value: "", label: "Select..." }, { value: "regular", label: "Regular — 3 meals/day" },
          { value: "if", label: "Intermittent fasting — 16:8 or similar" }, { value: "restricted", label: "Calorie-restricted / dieting" },
          { value: "irregular", label: "Irregular — skips meals frequently" },
        ]} />
      </Field>
      <Field label="Existing Supplements">
        <MultiChip options={["Protein supplement", "Multivitamin", "Omega-3/fish oil", "Vitamin D", "Iron", "Immunonutrition (Impact/equivalent)", "None"]}
          selected={data.supplements || []} onChange={v => update("supplements", v)} />
      </Field>
    </>
  );
}

// ───────── PLAN GENERATOR ─────────
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

  // ── RISK STRATIFICATION ──
  let riskLevel = "low";
  if (d.riskCategory === "high" || cardiac.includes("Prior MI (within 6 months)") || cardiac.includes("CHF")) riskLevel = "high";
  else if (d.riskCategory === "elevated" || cardiac.length > 0 || (d.dasiScore && parseFloat(d.dasiScore) < 34) || d.mets === "lt4") riskLevel = "elevated";

  // ── ALERTS ──
  if (hasGLP1 && d.glp1GI === "active") alerts.push({ type: "danger", text: "ACTIVE GI SYMPTOMS on GLP-1 RA — consider delaying surgery. If proceeding: liquid diet 24h before, point-of-care gastric ultrasound on DOS, consider rapid sequence induction." });
  if (hasSGLT2) alerts.push({ type: "warning", text: "SGLT2 inhibitor detected — MUST be held 3–4 days before surgery. Monitor ketones perioperatively. Risk of euglycemic DKA." });
  if (cardiac.includes("Prior MI (within 6 months)")) alerts.push({ type: "danger", text: "MI within 6 months — optimal to wait ≥60 days for elective NCS (2024 AHA/ACC Class 1). Proceed only after careful risk-benefit analysis." });
  if (cardiac.includes("Prior stroke") || allConditions.includes("Prior stroke")) alerts.push({ type: "warning", text: "Prior stroke — delay elective NCS for at least 9 months if possible (Class 2b). If <3 months since stroke, high risk of recurrent event." });
  if (other.includes("History of MH")) alerts.push({ type: "danger", text: "MALIGNANT HYPERTHERMIA history — ensure dantrolene availability. MHAUS registry consultation. Avoid triggering agents." });
  if (d.weightLoss === "significant" || (d.albumin && parseFloat(d.albumin) < 3.0)) alerts.push({ type: "warning", text: "MALNUTRITION RISK — significant weight loss or low albumin. Consider nutritional optimization before proceeding. May benefit from 7–14 day preoperative nutritional supplementation." });

  // ── ANEMIA ALERTS ──
  const hgb = d.hemoglobin ? parseFloat(d.hemoglobin) : null;
  if (hgb !== null && hgb < 8) alerts.push({ type: "danger", text: "SEVERE ANEMIA (Hgb < 8 g/dL) — consider preoperative transfusion and hematology consult. Defer elective surgery if possible." });

  // ── SMOKING ALERTS ──
  if (d.smokingStatus === "current" && d.cigPerDay && parseInt(d.cigPerDay) >= 20) alerts.push({ type: "warning", text: "HEAVY SMOKER (≥20 cigarettes/day) — significantly elevated risk of pulmonary complications, wound infection, and impaired healing." });

  // ── ALCOHOL ALERTS ──
  if (d.withdrawalHistory === "yes") alerts.push({ type: "danger", text: "ALCOHOL WITHDRAWAL HISTORY (seizures/DTs) — high risk perioperative withdrawal. Requires formal withdrawal prevention protocol, possible ICU monitoring, addiction medicine consult. Do NOT stop alcohol abruptly without medical supervision." });
  if (d.alcoholUse === "heavy") alerts.push({ type: "warning", text: "HEAVY ALCOHOL USE (>14 drinks/week) — elevated perioperative risk: immune suppression (2–5x infection), coagulopathy, hepatic dysfunction, withdrawal risk. Recommend supervised cessation ≥4 weeks before surgery." });

  // ── PATIENT TRACK: EXERCISE ──
  const unsafeForExercise = cardiac.includes("Prior MI (within 6 months)") || allConditions.includes("Uncontrolled HTN (DBP >110)");
  if (!unsafeForExercise) {
    const level = d.exerciseLevel || "sedentary";
    if (weeks >= 4) {
      if (level === "sedentary") patient.push({
        domain: "Exercise", priority: "high", title: "Prehabilitation Program — Start Immediately",
        detail: "Begin with 20-minute walks 5x/week. Progress to 30–40 minutes by week 2. Add resistance training (bodyweight or light weights) 2x/week from week 2. Target: 500+ total minutes of prehabilitation before surgery. Consider HIIT 2x/week if tolerated after 2 weeks of base building.",
        steps: [
          { title: "20-min walks, 5×/week", desc: "Start at a comfortable, conversational pace. You should be able to hold a conversation while walking. Complete all 5 sessions in week 1 — consistency beats intensity at the start.", icon: "walk", timing: "Week 1 · 20 min × 5 sessions" },
          { title: "Progress to 30–40 min by week 2", desc: "Gradually extend each session by 5 minutes. Pick up the pace slightly. Your body is adapting — this is where real cardiovascular benefit begins to build.", icon: "walk_prog", timing: "Week 2 · 30–40 min × 5 sessions" },
          { title: "Add resistance training 2×/week", desc: "Start week 2: bodyweight squats (3×10), wall push-ups (3×10), step-ups (3×10 each leg), glute bridges (3×12). Light dumbbells optional. These build the muscle reserves that protect you during recovery.", icon: "strength", timing: "Week 2 onward · 2 sessions/week" },
          { title: "Add HIIT 2×/week (if tolerated)", desc: "After 2 weeks of base building: alternate 1 min brisk walking with 1 min easy pace, repeated 10–15 times. HIIT has the strongest evidence for improving surgical fitness rapidly. Stop if dizzy or chest pain.", icon: "hiit", timing: "Week 3 onward · 2 sessions/week" },
        ],
        target: { label: "500+ total minutes before surgery", desc: "Track every session — the minutes add up and the evidence is clear: more prehab = faster recovery." },
        learnMore: {
          why: "Exercise triggers hormesis — a controlled biological stress that forces your body to adapt, rebuild, and grow more resilient. Prehabilitation increases cardiorespiratory reserve (VO2max), builds muscle mass, activates heat shock proteins that protect tissues under surgical stress, and stimulates mitochondrial biogenesis. Each session creates measurable adaptations that directly improve your tolerance of the surgical insult.",
          evidence: "A 2023 JAMA Network Open systematic review of prehabilitation across orthopedic surgical populations found significant improvements in preoperative function, muscle strength, and quality of life, with postoperative benefits extending to 6 weeks (knee replacement) and 6 months (lumbar surgery). Critically, prehabilitation doses exceeding 500 total minutes significantly reduced the need for postoperative rehabilitation — lower doses did not reach this threshold. HIIT sustained greater physical fitness at 2 months post-surgery compared to moderate-intensity continuous training. A separate meta-analysis of 10 RCTs confirmed protective benefits against all-cause complications in upper abdominal surgery.",
          citations: [
            { text: "Punnoose A, et al. Prehabilitation for orthopedic surgery: systematic review and meta-analysis. JAMA Netw Open. 2023;6(4):e238050.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10102876/" },
            { text: "Multimodal prehabilitation in upper abdominal surgery: meta-analysis of 10 RCTs. Sci Rep. 2024;14:16069.", url: "https://www.nature.com/articles/s41598-024-66633-6" },
            { text: "Prehabilitation for abdominal cancer surgery: meta-analysis. Front Surg. 2021;8:628848.", url: "https://www.frontiersin.org/journals/surgery/articles/10.3389/fsurg.2021.628848/" },
            { text: "Calabrese EJ. Preconditioning is hormesis. Pharmacol Res. 2016;110:218–225.", url: "https://www.sciencedirect.com/science/article/abs/pii/S1043661815301924" },
          ],
        },
      });
      else if (level === "light") patient.push({
        domain: "Exercise", priority: "high", title: "Increase Exercise Intensity",
        detail: "Increase walking to 30–45 minutes 5x/week. Add resistance training 3x/week. Introduce interval training (alternating brisk walking with moderate pace) 2x/week. Target: 500+ total prehabilitation minutes.",
        steps: [
          { title: "Walk 30–45 min, 5×/week", desc: "Increase duration from your current baseline. Aim for a brisk pace — you should feel your heart rate rise. 5 days per week creates the consistency that builds fitness.", icon: "walk_prog", timing: "Start now · 30–45 min × 5 sessions" },
          { title: "Add resistance training 3×/week", desc: "Progress from bodyweight to light dumbbells. Focus on squats, lunges, rows, and push-ups. 3 sets of 10–15 reps. Resistance training is as important as cardio for surgical recovery.", icon: "strength", timing: "3 sessions/week" },
          { title: "Introduce interval training 2×/week", desc: "Alternate brisk walking (2 min) with moderate pace (1 min) for 20–30 minute sessions. This boosts VO2max more efficiently than steady-state walking alone.", icon: "hiit", timing: "2 sessions/week" },
        ],
        target: { label: "500+ total prehabilitation minutes", desc: "You're already moving — now let's make those sessions count more." },
        learnMore: {
          why: "Exercise is the single most evidence-backed intervention in surgical preparation. Your cardiorespiratory fitness (VO2max) is one of the strongest predictors of postoperative outcomes — and it is modifiable even in weeks. Each 1.0 mL/kg/min improvement in VO2max is associated with 9–15% improved survival and 21% fewer cardiovascular events. Resistance training builds the muscle reserves that buffer the inevitable catabolism of surgical recovery.",
          evidence: "A 2023 JAMA Network Open systematic review confirmed prehabilitation improved function, strength, and quality of life across orthopedic surgical populations. Prehabilitation exceeding 500 total minutes significantly reduced postoperative rehabilitation needs — lower doses did not reach this threshold. A meta-analysis of abdominal cancer surgery patients showed prehabilitation improved walking distance by 33 meters and reduced hospital length of stay by 3.68 days.",
          citations: [
            { text: "Punnoose A, et al. Prehabilitation for orthopedic surgery: systematic review and meta-analysis. JAMA Netw Open. 2023;6(4):e238050.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10102876/" },
            { text: "Prehabilitation for abdominal cancer surgery: meta-analysis. Front Surg. 2021;8:628848.", url: "https://www.frontiersin.org/journals/surgery/articles/10.3389/fsurg.2021.628848/" },
            { text: "Assessing cardiorespiratory fitness in clinical settings. Prog Cardiovasc Dis. 2024.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0033062024000306" },
          ],
        },
      });
      else if (level === "moderate") patient.push({
        domain: "Exercise", priority: "medium", title: "Optimize Training for Surgery",
        detail: "Maintain current frequency. Add 2 HIIT sessions/week (sustained greater post-surgical fitness vs. moderate-intensity per evidence). Ensure resistance training includes functional movements relevant to post-surgical mobility. Track grip strength weekly.",
        steps: [
          { title: "Maintain your current frequency", desc: "Keep your existing workout schedule as your foundation. Consistency is the bedrock — don't skip sessions to add new intensity too fast.", icon: "walk", timing: "Ongoing" },
          { title: "Add 2 HIIT sessions/week", desc: "High-intensity intervals have the strongest evidence for surgical fitness improvement. Replace 2 moderate sessions with HIIT: 6–8 × 1-min max effort with 2-min recovery between each.", icon: "hiit", timing: "2 additional sessions/week" },
          { title: "Functional resistance training", desc: "Ensure your resistance work includes movements relevant to post-surgical mobility: single-leg exercises, hip hinges, pressing, and pulling patterns. These build the functional reserves recovery demands.", icon: "strength", timing: "Maintain existing sessions" },
          { title: "Weekly grip strength tracking", desc: "Track grip strength weekly with a dynamometer or by squeezing a firm object for maximum effort 3 times each hand. Rising grip strength = improving readiness. A sudden drop may signal overtraining.", icon: "track", timing: "Every Monday" },
        ],
        target: { label: "Arrive at peak readiness", desc: "Taper volume by 30% in the final week — like an athlete preparing for competition." },
        learnMore: {
          why: "At a moderate fitness level, your foundation is solid — the opportunity is to sharpen it. HIIT (high-intensity interval training) creates a greater cardiovascular stimulus per unit time than steady-state exercise, driving VO2max improvements more efficiently. Grip strength is a validated biomarker of overall physiological reserve, consistently predicting postoperative complications, hospital length of stay, and discharge disposition. Tapering before surgery — like an athlete before competition — ensures you arrive rested and primed, not fatigued.",
          evidence: "Evidence consistently shows HIIT sustained greater physical fitness at 2 months post-surgery compared to moderate-intensity continuous training. Grip strength is associated with postoperative complications across surgical specialties and has been validated as a frailty surrogate. The AHA advocates cardiorespiratory fitness as a clinical vital sign: each 1.0 mL/kg/min increase in VO2max is associated with 9–15% improved survival and 21% fewer cardiovascular events.",
          citations: [
            { text: "Multimodal prehabilitation in upper abdominal surgery: meta-analysis of 10 RCTs. Sci Rep. 2024;14:16069.", url: "https://www.nature.com/articles/s41598-024-66633-6" },
            { text: "Grip strength: an indispensable biomarker for older adults. PMC. 2019.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6778477/" },
            { text: "Assessing cardiorespiratory fitness in clinical settings. Prog Cardiovasc Dis. 2024.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0033062024000306" },
          ],
        },
      });
      else patient.push({
        domain: "Exercise", priority: "low", title: "Maintain Fitness, Taper Before Surgery",
        detail: "Continue current program. Reduce volume by 30% in the final week before surgery (taper like athletic event preparation). Prioritize recovery and sleep in the final 3 days.",
        steps: [
          { title: "Continue your current program", desc: "Your fitness is already a major asset. Keep doing what you're doing — don't try to push harder now. Consistency through preparation is the goal.", icon: "walk", timing: "Ongoing" },
          { title: "Taper volume 30% in final week", desc: "One week before surgery, reduce session duration and intensity by 30%. This is exactly how athletes prepare for competition — you want to arrive rested and sharp, not fatigued.", icon: "walk_prog", timing: "Final 7 days before surgery" },
          { title: "Prioritize rest in final 3 days", desc: "Light walking and mobility work only. Protect your sleep — aim for 8+ hours. Your body uses sleep to repair and stockpile energy. Arrive at surgery rested.", icon: "sleep", timing: "Final 3 days" },
        ],
        target: { label: "Arrive rested and at peak readiness", desc: "Your fitness is your advantage — protect it with smart tapering." },
        learnMore: {
          why: "High fitness is one of the strongest predictors of surgical outcome — your cardiovascular reserve is a direct buffer against the physiological insult of surgery. The risk at this level is over-preparation: pushing too hard in the final weeks can arrive at surgery with accumulated fatigue, muscle damage markers, or overtraining syndrome. Strategic tapering preserves your peak capacity while ensuring full recovery before the day of surgery.",
          evidence: "Athletic periodization principles translate directly to surgical preparation. Marathon runners and competitive athletes reduce training volume by 20–30% in the final 1–2 weeks before a race, arriving with elevated glycogen stores, reduced inflammation, and peak neuromuscular readiness. The same principle applies to surgery. Prehabilitation literature consistently identifies that more total prehab minutes improve outcomes — but quality of fitness on the day of surgery matters most.",
          citations: [
            { text: "Punnoose A, et al. Prehabilitation for orthopedic surgery: systematic review and meta-analysis. JAMA Netw Open. 2023;6(4):e238050.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10102876/" },
            { text: "Gardner E. 10 Ways to Recover From a Marathon. Yale Medicine.", url: "https://www.yalemedicine.org/news/10-ways-recover-from-marathon" },
          ],
        },
      });
    } else {
      patient.push({
        domain: "Exercise", priority: "high", title: `Accelerated Prehab (${weeks} weeks available)`,
        detail: `Limited time window. Focus on daily walking (30 min minimum) and resistance training 3x/week. Every session counts — evidence shows even short prehabilitation periods improve outcomes. Target as many minutes as possible before surgery.`,
        steps: [
          { title: "Daily walking — 30 min minimum", desc: "Start today. Walk every single day from now until surgery. Even a limited window of prehab measurably improves outcomes — every session matters.", icon: "walk", timing: "Daily · 30 min minimum" },
          { title: "Resistance training 3×/week", desc: "Bodyweight circuits: squats (3×15), push-ups (3×10), step-ups (3×10), lunges (3×10). No equipment needed. 3 sessions per week builds muscle reserves that protect you during recovery.", icon: "strength", timing: "3 sessions/week" },
          { title: "Track every session", desc: "Log every walk and every resistance session. Total as many minutes as you can. Research shows even 2–4 weeks of consistent prehab significantly reduces recovery time and complication rates.", icon: "track", timing: "Log daily" },
        ],
        target: { label: "Maximize every minute before surgery", desc: `You have ${weeks} weeks — make each one count. Every session has measurable benefit.` },
        learnMore: {
          why: "Even short windows of structured exercise create meaningful physiological adaptation. The body responds to aerobic stress within days by improving mitochondrial efficiency, increasing capillary density in muscle, and reducing resting inflammatory markers. Resistance training preserves lean mass and builds the functional reserves that buffer the catabolic insult of surgery. Every session — even with limited time — contributes measurable biological benefit.",
          evidence: "Prehabilitation research consistently demonstrates that even 2–4 week programs significantly improve preoperative function and reduce postoperative recovery time. A meta-analysis of abdominal cancer surgery found prehabilitation improved 6-minute walk distance by 33 meters and reduced hospital length of stay by 3.68 days — with benefit even from shorter programs. The total prehab dose (minutes) is the strongest predictor of outcome benefit.",
          citations: [
            { text: "Prehabilitation for abdominal cancer surgery: meta-analysis. Front Surg. 2021;8:628848.", url: "https://www.frontiersin.org/journals/surgery/articles/10.3389/fsurg.2021.628848/" },
            { text: "Multimodal prehabilitation in upper abdominal surgery: meta-analysis of 10 RCTs. Sci Rep. 2024;14:16069.", url: "https://www.nature.com/articles/s41598-024-66633-6" },
          ],
        },
      });
    }
  } else {
    patient.push({ domain: "Exercise", priority: "high", title: "Exercise — Physician Clearance Required", detail: "Active cardiac conditions detected (recent MI or uncontrolled HTN). Do NOT begin exercise program without explicit physician clearance. Gentle ambulation may be acceptable — discuss with your care team.",
      learnMore: {
        why: "Exercise is one of the most powerful preparation tools — but in the setting of recent MI or uncontrolled hypertension, unguided exercise increases the risk of a cardiac event before surgery. Your physician needs to evaluate your current cardiac stability and determine a safe starting point. Even gentle, supervised activity during this window can preserve function and reduce deconditioning.",
        evidence: "The 2024 AHA/ACC perioperative guidelines identify active cardiac conditions (unstable angina, recent MI, severe valvular disease, decompensated heart failure) as major risk factors requiring evaluation and stabilization before elective surgery. Exercise testing and supervised cardiac rehabilitation can be initiated safely once your care team has cleared you.",
        citations: [
          { text: "2024 AHA/ACC Perioperative Cardiovascular Management Guidelines. Circulation. 2024.", url: "" },
          { text: "Bisch SP, et al. ERAS guidelines and outcomes: meta-analysis of RCTs. JAMA Netw Open. 2024;7(6):e2418611.", url: "https://pubmed.ncbi.nlm.nih.gov/38888922/" },
        ],
      },
    });
  }

  // ── PATIENT TRACK: NUTRITION ──
  const proteinTarget = (weightKg * 1.5).toFixed(0);
  patient.push({
    domain: "Nutrition", priority: "high", title: `Protein Target: ${proteinTarget}g/day (1.5 g/kg)`,
    detail: `Current weight ~${weightKg.toFixed(0)} kg → target 1.2–2.0 g/kg/day. Aim for ${proteinTarget}g as the middle of the range. Distribute across 3–4 meals. Good sources: lean meats, fish, eggs, Greek yogurt, legumes, whey protein. If current intake is low, increase gradually over 1 week.`,
    steps: [
      { title: `Spread ${proteinTarget}g across 3–4 meals`, desc: `Protein synthesis is maximized in 25–40g doses per meal. Skipping meals means losing critical muscle-building windows that protect you during recovery. Plan every meal around a protein anchor.`, icon: "protein", timing: "Every meal, every day" },
      { title: "Prioritize high-quality sources", desc: "Best sources by protein density: chicken breast (31g/100g), Greek yogurt (17g/cup), eggs (6g each), salmon (25g/100g cooked), lentils (18g/cup), cottage cheese (14g/half cup), whey protein (25g/scoop).", icon: "protein", timing: "Daily" },
      { title: "Supplement if food alone isn't enough", desc: `If hitting ${proteinTarget}g from food is difficult, add a whey or plant-based protein shake. Take post-exercise or between meals. This is one of the most evidence-backed interventions for surgical preparation.`, icon: "protein", timing: "Post-exercise or between meals" },
    ],
    target: { label: `${proteinTarget}g protein every day`, desc: `~${Math.round(parseFloat(proteinTarget) / 4)}g per meal · start immediately and maintain through the morning before surgery` },
    learnMore: {
      why: "Surgery triggers accelerated protein catabolism — without adequate protein reserves before surgery, your body breaks down muscle to fuel the stress response, the inflammatory cascade, and wound repair. Preloading protein means your body has the raw material to maintain immune function, support tissue healing, and preserve the muscle you will need during recovery. Protein synthesis occurs in 25–40g per-meal doses; spreading intake across 3–4 meals is more effective than front- or back-loading.",
      evidence: "ESPEN (European Society for Clinical Nutrition and Metabolism) guidelines establish 1.2–2.0 g/kg/day as the perioperative protein target. Higher preoperative protein intake is associated with reduced complications and better functional recovery, particularly in older adults undergoing major surgery. Between 30–50% of surgical patients have some degree of nutritional risk, frequently unrecognized — sarcopenia can exist even in apparently well-nourished patients and is a powerful independent predictor of postoperative complications.",
      citations: [
        { text: "Weimann A, et al. ESPEN guideline: Clinical nutrition in surgery. Clin Nutr. 2017;36(3):623–650.", url: "" },
        { text: "Cruz-Jentoft AJ, et al. Sarcopenia: revised European consensus on definition and diagnosis. Age Ageing. 2019;48(1):16–31.", url: "" },
        { text: "Deutz NE, et al. Protein intake and exercise for optimal muscle function with aging. Clin Nutr. 2014;33(6):929–936.", url: "" },
        { text: "Correia & Waitzberg. Impact of malnutrition on morbidity, mortality, LOS, and costs. Curr Opin Clin Nutr Metab Care. 2003;6(5):519–523.", url: "" },
      ],
    },
  });

  if (surgeryTags.includes("Cancer resection") || other.includes("Active cancer/chemo")) {
    patient.push({ domain: "Nutrition", priority: "high", title: "Immunonutrition Recommended", detail: "Cancer surgery patients benefit from preoperative immunonutrition (arginine, omega-3, nucleotides) for minimum 5–7 days before surgery. Evidence: 54% reduction in infectious complications (OR 0.46). Discuss with your surgical team about starting Impact Advanced Recovery or equivalent formula.",
      learnMore: {
        why: "Immunonutrition formulas enriched with arginine, omega-3 fatty acids, and nucleotides actively modulate the immune response to surgical stress. Arginine supports T-cell function and collagen synthesis for wound healing. Omega-3 fatty acids shift the inflammatory cascade toward resolution rather than excess. Nucleotides support the rapid proliferation of immune cells needed to defend against perioperative infection.",
        evidence: "A 2019 systematic review and meta-analysis of 16 RCTs (1,387 GI cancer patients) found that preoperative immunonutrition for a minimum of 3 days significantly reduced infectious complications (OR 0.46, 95% CI 0.30–0.69) — roughly half the infection rate compared to standard nutrition. A 2024 retrospective cohort study (SUPREMO, 620 patients) confirmed reduced infectious complications (OR 0.54), lower ICU admission rates, and reduced need for mechanical ventilation with complete preoperative immunonutrition.",
        citations: [
          { text: "Wong CS, et al. Impact of preoperative immune modulating nutrition on outcomes in GI cancer surgery. Ann Surg. 2019;270(2):229–236.", url: "" },
          { text: "SUPREMO retrospective cohort: complete preoperative immunonutrition. 2024.", url: "https://www.sciencedirect.com/science/article/pii/S2405457724015559" },
          { text: "Probst P, et al. Meta-analysis of immunonutrition in major abdominal surgery. Br J Surg. 2017;104:1594–1608.", url: "" },
        ],
      },
    });
  }

  patient.push({ domain: "Nutrition", priority: "medium", title: "Preoperative Carbohydrate Loading", detail: "Day before surgery: 800 mL carbohydrate-rich clear drink in the evening. Morning of surgery: 400 mL carbohydrate drink 2–3 hours before (confirm with anesthesia team). This reduces insulin resistance, anxiety, and hunger. Do NOT fast from midnight — modern evidence supports carb loading per ERAS protocols.",
    learnMore: {
      why: "Overnight fasting from midnight depletes glycogen stores and worsens insulin resistance — putting your body in a catabolic state before surgery even begins. Carbohydrate loading reverses this by stimulating endogenous insulin release, switching the body from catabolism toward an anabolic-ready state. It also reduces preoperative anxiety, thirst, and hunger — making the morning of surgery substantially more comfortable.",
      evidence: "A systematic review of 17 RCTs (1,445 patients) found that preoperative carbohydrate drinks significantly improved insulin resistance and patient comfort — including hunger, thirst, malaise, anxiety, and nausea — with no aspiration events reported. A 2022 Bayesian network meta-analysis of 23 RCTs identified low-dose carbohydrate loading given 3 hours before surgery as most strongly associated with reduced insulin resistance (WMD: −4.04, 95% CrI: −5.67 to −2.40). A 2024 RCT in colorectal surgery confirmed reduced insulin resistance, lower inflammatory markers, and shorter hospital stays.",
      citations: [
        { text: "Bilku DK, et al. Role of preoperative carbohydrate loading: systematic review. Ann R Coll Surg Engl. 2014;96(1):15–22.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5137663/" },
        { text: "Tong X, et al. Effects of preoperative carbohydrate loading: Bayesian network meta-analysis. Front Nutr. 2022;9:951676.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9726728/" },
        { text: "Kumar SM, et al. Effect of preoperative oral carbohydrate loading on postoperative insulin resistance. J Gastrointest Surg. 2024;28(10):1654–1660.", url: "" },
      ],
    },
  });

  // ── PATIENT TRACK: FASTING / METABOLIC ──
  const isDiabetic = endocrine.some(e => e.includes("Diabetes") || e.includes("HbA1c"));
  if (!isDiabetic && weeks >= 3) {
    patient.push({ domain: "Metabolic Prep", priority: "medium", title: "Consider Strategic Intermittent Fasting", detail: "If not already practicing: consider 14:10 or 16:8 time-restricted eating starting 3+ weeks before surgery. This activates AMPK/SIRT1/autophagy pathways that precondition cells against surgical stress. STOP fasting 3 days before surgery and switch to carbohydrate loading. NOTE: This is a directional recommendation based on strong preclinical evidence; human surgical RCTs are still emerging.",
      learnMore: {
        why: "When you fast, the AMP/ATP ratio in cells rises, activating AMPK (AMP-activated protein kinase). AMPK triggers autophagy — your body's cellular housekeeping system, which degrades damaged organelles and misfolded proteins. Each cell enters surgery in a 'cleaner,' more stress-resistant state. Simultaneously, SIRT1 (a cellular longevity enzyme) is activated, stimulating mitochondrial biogenesis. The resulting ketone beta-hydroxybutyrate directly inhibits the NLRP3 inflammasome, reducing the inflammatory cytokine surge that accompanies surgical injury.",
        evidence: "Mitchell et al. (2010) demonstrated that 2–4 weeks of 30% dietary restriction or brief water-only fasting protected kidneys and liver against ischemia-reperfusion injury, with protection emerging within 1 day and extending across organs. Rickenbacher et al. (2014) showed 1-day fasting protected the liver through SIRT1-mediated downregulation of HMGB1 — a potent inflammatory cytokine — via autophagy. Godar et al. (2015) found intermittent fasting over 6 weeks markedly reduced myocardial infarct size through repetitive autophagy stimulation. A key distinction: strategic intermittent fasting activates protective pathways; prolonged starvation worsens catabolism — the two are biologically different.",
        citations: [
          { text: "Mitchell JR, et al. Short-term dietary restriction and fasting precondition against ischemia reperfusion injury in mice. Aging Cell. 2010;9(1):40–53.", url: "https://pubmed.ncbi.nlm.nih.gov/19878145/" },
          { text: "Rickenbacher A, et al. Fasting protects liver from ischemic injury through Sirt1-mediated downregulation of HMGB1. J Hepatol. 2014;61(2):301–308.", url: "" },
          { text: "Godar RJ, et al. Repetitive stimulation of autophagy-lysosome machinery by intermittent fasting preconditions the myocardium. Autophagy. 2015;11(9):1537–1560.", url: "" },
          { text: "Robertson LT, Mitchell JR. Is overnight fasting before surgery too much or not enough? GeroScience. 2017;39(5-6):543–556.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5722208/" },
        ],
      },
    });
  } else if (isDiabetic) {
    patient.push({ domain: "Metabolic Prep", priority: "low", title: "Fasting Protocol — Not Recommended", detail: "Given diabetes/metabolic conditions, strategic fasting is NOT recommended without close endocrine supervision. Focus instead on blood glucose optimization and carbohydrate loading per ERAS protocol.",
      learnMore: {
        why: "In diabetes, fasting without close monitoring can precipitate hypoglycemia or, in patients on certain medications, euglycemic diabetic ketoacidosis (DKA). The metabolic benefits of fasting — AMPK activation, autophagy, ketogenesis — are achievable through other means: exercise, glycemic optimization, and carbohydrate loading per ERAS protocol provide meaningful metabolic preparation without the risks of unmonitored fasting.",
        evidence: "ERAS protocols specifically recommend against prolonged fasting in favor of carbohydrate loading, which improves insulin sensitivity and reduces the stress response in diabetic surgical patients. Perioperative glucose targets of 140–180 mg/dL (intraoperative) are supported by the Society of Thoracic Surgeons and ERAS guidelines. SGLT2 inhibitors must be held 3–4 days before surgery due to euglycemic DKA risk — fasting would compound this risk.",
        citations: [
          { text: "Bisch SP, et al. ERAS guidelines and outcomes: meta-analysis of RCTs. JAMA Netw Open. 2024;7(6):e2418611.", url: "https://pubmed.ncbi.nlm.nih.gov/38888922/" },
          { text: "Robertson LT, Mitchell JR. Is overnight fasting before surgery too much or not enough? GeroScience. 2017;39(5-6):543–556.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5722208/" },
        ],
      },
    });
  }

  // ── PATIENT TRACK: THERMAL ──
  const thermalContraindicated = cardiac.includes("CAD/Angina") || cardiac.includes("Prior MI (within 6 months)") || cardiac.includes("Uncontrolled HTN (DBP >110)") || cardiac.includes("Cardiomyopathy/HCM");
  if (!thermalContraindicated && weeks >= 4) {
    const currentThermal = d.thermalHabits || [];
    if (currentThermal.includes("None") || currentThermal.length === 0) {
      patient.push({ domain: "Thermal", priority: "low", title: "Consider Gradual Thermal Conditioning", detail: "If accessible and cleared by physician: begin with short sauna sessions (10 min at moderate temperature) or cool (not ice cold) water exposure. Build gradually over weeks. Aim for 4+ sauna sessions per week >19 minutes for maximum benefit. Heat exposure upregulates HSPs and Nrf2 pathways; cold trains autonomic flexibility. This is an emerging area — no surgical outcome RCTs exist yet.",
        learnMore: {
          why: "Heat exposure dramatically increases expression of heat shock proteins (HSP70, HSP90) — molecular chaperones that stabilize proteins under stress, protect against ischemia-reperfusion injury, and slow muscle atrophy. Cold water immersion (≤15°C) triggers a surge in norepinephrine (up to 530% above baseline) and trains the autonomic nervous system to rapidly toggle between sympathetic and parasympathetic activation — precisely the flexibility that determines how well you tolerate surgical stress and anesthesia induction. Contrast therapy (alternating heat and cold) maximally exercises the vasomotor system.",
          evidence: "The KIHD cohort study of 2,315 Finnish men followed for 20.7 years found sauna use 4–7 times per week was associated with 40% reduced all-cause mortality, 50% reduced fatal cardiovascular disease, and 63% reduced sudden cardiac death — with dose-response for both frequency (4–7x/week vs. once/week) and session duration (>19 min provided substantially greater protection than <11 min). A 2025 systematic review and meta-analysis of 11 RCTs (3,177 participants) confirmed cold water immersion produces significant acute inflammatory signaling followed by significant stress reduction at 12 hours (SMD: −1.00), improved quality of life, and 29% reduced sickness absence. Important caveat: no RCT has directly tested thermal conditioning as a preoperative intervention.",
          citations: [
            { text: "Laukkanen T, et al. Sauna bathing and fatal cardiovascular and all-cause mortality: KIHD cohort. JAMA Intern Med. 2015;175(4):542–548.", url: "" },
            { text: "Patrick RP, Johnson TL. Sauna use as a lifestyle practice to extend healthspan. Exp Gerontol. 2021;154:111509.", url: "https://pubmed.ncbi.nlm.nih.gov/34363927/" },
            { text: "Effects of cold-water immersion on health and wellbeing: systematic review and meta-analysis. PLOS ONE. 2025;20(1):e0317615.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/" },
            { text: "Cold-water immersion: neurohormesis and implications for clinical neurosciences. J Neuropsych Clin Neurosci. 2024.", url: "https://psychiatryonline.org/doi/full/10.1176/appi.neuropsych.20240053" },
          ],
        },
      });
    } else {
      patient.push({ domain: "Thermal", priority: "low", title: "Continue Thermal Conditioning", detail: "Continue your current sauna/cold exposure practice through preparation. Aim for sauna 4+ times per week at >19 minutes per session for maximum benefit. Reduce intensity in the final 3 days before surgery. Evidence supports HSP upregulation (heat) and autonomic flexibility training (cold) as relevant to surgical stress tolerance.",
        learnMore: {
          why: "Your existing thermal practice is already building the biological foundation for surgical resilience. Heat shock proteins (HSPs) generated through sauna act as molecular chaperones — stabilizing proteins under the extreme stress of surgery, protecting against ischemia-reperfusion injury, and slowing muscle atrophy. Cold exposure trains your autonomic nervous system's ability to rapidly toggle between activation states, building the flexibility that anesthesia and surgical stress demand. Reducing intensity in the final 3 days prevents cumulative fatigue from affecting your arrival state.",
          evidence: "The KIHD cohort study found a clear dose-response: 4–7 sauna sessions per week of >19 minutes each provided substantially greater protection than shorter or less frequent sessions (40% reduction in all-cause mortality). Heat exposure additionally produces cardiovascular conditioning that mimics moderate exercise — raising heart rate to 100–150 bpm, increasing cardiac output, and expanding plasma volume. Trained individuals show lower inflammatory responses to subsequent heat exposure, meaning your body is mounting more efficient stress responses.",
          citations: [
            { text: "Laukkanen T, et al. Sauna bathing and fatal cardiovascular and all-cause mortality: KIHD cohort. JAMA Intern Med. 2015;175(4):542–548.", url: "" },
            { text: "Patrick RP, Johnson TL. Sauna use as a lifestyle practice to extend healthspan. Exp Gerontol. 2021;154:111509.", url: "https://pubmed.ncbi.nlm.nih.gov/34363927/" },
            { text: "Lee E, et al. Effects of regular sauna bathing with exercise on cardiovascular function: RCT. Am J Physiol. 2022.", url: "https://journals.physiology.org/doi/full/10.1152/ajpregu.00076.2022" },
          ],
        },
      });
    }
  } else if (thermalContraindicated) {
    patient.push({ domain: "Thermal", priority: "medium", title: "Thermal Conditioning — Contraindicated", detail: "Active cardiac conditions detected. Sauna and cold exposure are NOT recommended given risk of hemodynamic instability. Focus preparation on gentle exercise, nutrition, and stress reduction.",
      learnMore: {
        why: "Heat and cold exposure produce significant acute cardiovascular demands — sauna raises heart rate to 100–150 bpm and dramatically alters peripheral vascular resistance. Cold immersion triggers sudden sympathetic activation with sharp rises in blood pressure and heart rate. In the setting of active cardiac disease, these acute hemodynamic changes can precipitate ischemia, arrhythmia, or other serious events. The preparation benefit does not outweigh the risk.",
        evidence: "Contraindications to sauna and thermal stress exposure include unstable angina, recent MI, decompensated heart failure, severe aortic stenosis, and uncontrolled hypertension. The 2024 AHA/ACC perioperative guidelines identify these as conditions requiring stabilization before elective procedures. Other preparation modalities — structured gentle exercise, protein nutrition, carbohydrate loading, and sleep optimization — provide substantial benefit without cardiovascular risk.",
        citations: [
          { text: "2024 AHA/ACC Perioperative Cardiovascular Management Guidelines. Circulation. 2024.", url: "" },
          { text: "Patrick RP, Johnson TL. Sauna use as a lifestyle practice to extend healthspan (contraindications). Exp Gerontol. 2021;154:111509.", url: "https://pubmed.ncbi.nlm.nih.gov/34363927/" },
        ],
      },
    });
  }

  // ── PATIENT TRACK: STRESS / SLEEP ──
  patient.push({
    domain: "Stress & Sleep", priority: "medium", title: "Sleep Optimization & Stress Reduction",
    detail: "Target 7–9 hours sleep nightly throughout preparation. Consider: box breathing (4-4-4-4) or diaphragmatic breathing practice 10 min daily (improves HRV). Limit screen time 1 hour before bed. Preoperative anxiety alters immune markers before surgery even begins — stress management is biological preparation.",
    steps: [
      { title: "7–9 hours sleep every night", desc: "Sleep is when your body makes the adaptations from exercise and protein intake. It is not optional — it is the mechanism. Set a fixed bedtime and wake time. Treat sleep as a non-negotiable training variable.", icon: "sleep", timing: "Every night · target 10–11 PM bedtime" },
      { title: "Box breathing 10 min daily", desc: "Inhale 4 seconds → hold 4 seconds → exhale 4 seconds → hold 4 seconds. Repeat 10 cycles. This directly improves HRV (heart rate variability), a validated marker of physiological readiness. Do this before bed or in the morning.", icon: "breathing", timing: "10 min daily · any time" },
      { title: "Screen-free wind-down 1 hour before bed", desc: "Blue light suppresses melatonin for 2–3 hours. Dim your environment and stop screens 60 minutes before your target sleep time. Replace with reading, stretching, or breathwork.", icon: "sleep", timing: "Every night" },
    ],
    target: { label: "7–9 hours per night", desc: "Quality sleep is biological preparation — it works in parallel with every other intervention in this plan" },
    learnMore: {
      why: "Preoperative psychological stress is not just emotional — it directly alters immune function before a single incision is made. Anxious patients show measurably altered white blood cell counts and pro-inflammatory cytokine profiles before surgery begins. This matters because the surgical insult is already arriving into a compromised immune environment. Separately, sleep is the mechanism through which your body integrates every other preparation intervention: protein synthesis, muscle adaptation from exercise, and hormonal recovery all occur primarily during sleep.",
      evidence: "A 2025 Scientific Reports study demonstrated that preoperative psychological preparation significantly improved immunity and surgical outcomes — confirming that the stress response begins before the OR. Preoperative HRV — the biomarker most directly improved by breathing practice and sleep — is validated in a systematic review of 63 studies as predicting intraoperative hypotension, postoperative pneumonia, and arrhythmia. The surgical stress response mirrors marathon running physiology: the same IL-6, CRP, troponin elevation, and immune suppression ('open window') patterns appear — and in both cases, the prepared, rested body tolerates the insult significantly better.",
      citations: [
        { text: "Impact of stress and preoperative psychological preparation on immunity and surgical outcomes. Sci Rep. 2025;15:26253.", url: "https://www.nature.com/articles/s41598-025-01869-4" },
        { text: "Preoperative HRV as predictor of perioperative outcomes: systematic review (63 studies). J Clin Monit Comput. 2022.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9293802/" },
        { text: "Cristescu T, et al. The Surgical Stress Response and Anesthesia: Narrative Review. J Clin Med. 2024;13(10):3017.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11121777/" },
      ],
    },
  });

  // ── PATIENT TRACK: SELF-TRACKING ──
  if (d.tracksHRV === "yes") {
    const hrv = parseFloat(d.hrvValue);
    let hrvDetail = "Monitor your HRV weekly. Aim for an upward trend during prehabilitation — rising HRV reflects improving autonomic flexibility. A drop in HRV in the days before surgery may indicate overtraining or stress — scale back if this occurs.";
    if (hrv > 0) {
      if (hrv < 20) {
        hrvDetail = `Your current HRV of ${hrv} ms is low and suggests limited autonomic reserve. This makes prehabilitation especially important. Focus on sleep quality, stress reduction (box breathing), and gradual aerobic exercise. Track weekly — even small upward trends are meaningful progress. Discuss your baseline with your physician.`;
      } else if (hrv < 40) {
        hrvDetail = `Your current HRV of ${hrv} ms is below average. Prehabilitation — especially aerobic exercise and sleep optimization — can improve this. Track weekly and aim for an upward trend. A rising HRV during preparation indicates your autonomic nervous system is adapting. If HRV drops in the days before surgery, scale back training intensity.`;
      } else if (hrv < 70) {
        hrvDetail = `Your current HRV of ${hrv} ms is in a moderate range. Continue your current activity level and track weekly during prehabilitation. Aim for a stable or rising trend — this confirms your preparation is working. A sudden drop may indicate overtraining, illness, or stress — scale back if this occurs.`;
      } else {
        hrvDetail = `Your current HRV of ${hrv} ms reflects strong autonomic flexibility. Maintain your current fitness routine and track weekly. Your goal during prehabilitation is to preserve this level or improve it further. Watch for a sustained drop in the week before surgery, which may indicate overtraining or acute stress.`;
      }
    }
    patient.push({ domain: "Self-Tracking", priority: "medium", title: "Track HRV Trend", detail: hrvDetail,
      learnMore: {
        why: "HRV (heart rate variability) measures the variation in milliseconds between consecutive heartbeats and reflects how well your autonomic nervous system adapts to demands. Higher HRV means your nervous system can shift efficiently between sympathetic (stress response) and parasympathetic (recovery) activation — exactly the adaptability that determines how well you tolerate anesthesia induction, hemodynamic shifts during surgery, and the recovery period.",
        evidence: "A 2022 systematic review of 63 studies established preoperative HRV as clinically relevant for predicting perioperative outcomes. Lower RMSSD and HF power independently predicted postoperative pneumonia in lung cancer surgery patients. DFA α1 predicted postoperative atrial fibrillation. Lower total power predicted intraoperative hypotension under general anesthesia. HRV remains depressed for up to 28 days after cardiac surgery (CABG) — making preoperative autonomic reserve a critical buffer. HRV is modifiable through aerobic exercise, sleep optimization, and breathing practice.",
        citations: [
          { text: "Preoperative HRV as predictor of perioperative outcomes: systematic review. J Clin Monit Comput. 2022.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9293802/" },
          { text: "Preoperative HRV predicts postoperative pneumonia in lung cancer surgery. PMC. 2025.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11883988/" },
          { text: "Perioperative HRV in major urologic surgery. Sci Rep. 2024.", url: "https://www.nature.com/articles/s41598-024-62930-2" },
        ],
      },
    });
  }
  patient.push({ domain: "Self-Tracking", priority: "low", title: "Weekly Readiness Check-In", detail: "Track weekly: grip strength (if dynamometer available), walking endurance (timed walk), energy level (1–10), sleep quality (1–10), protein intake adherence. These create accountability and show measurable progress.",
    learnMore: {
      why: "Grip strength is one of the most validated biomarkers in surgical medicine — consistently associated with postoperative complications, hospital length of stay, discharge disposition, and overall mortality. Cardiorespiratory fitness (estimated from walking endurance) is among the strongest single predictors of surgical outcomes. Tracking these weekly gives you objective evidence that your preparation is working — and early warning if something isn't.",
      evidence: "The AHA advocates cardiorespiratory fitness as a clinical vital sign. Each 1.0 mL/kg/min improvement in VO2max is associated with 9–15% improved survival and 21% fewer cardiovascular events. Grip strength is validated across surgical specialties as predicting complications and LOS. A 2024 study confirmed VO2max negatively correlates with frailty scores (r = −0.40, p = 0.03). Wearable device data integrated into frailty indices improved predictive accuracy to 81%.",
      citations: [
        { text: "VO2max, 6-minute walk, and muscle strength correlate with frailty in US veterans. Front Physiol. 2024.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11427282/" },
        { text: "Grip strength: an indispensable biomarker for older adults. PMC. 2019.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6778477/" },
        { text: "Wearable-derived frailty prediction model. PMC. 2022.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9798526/" },
      ],
    },
  });

  // ── PATIENT TRACK: SMOKING CESSATION ──
  if (d.smokingStatus === "current") {
    if (weeks >= 8) {
      patient.push({ domain: "Smoking", priority: "high", title: "Quit Smoking Now — Ideal Window", detail: "You have the ideal time window for cessation. Quitting now significantly reduces pulmonary complications. Ciliary recovery begins in 2–4 weeks, immune and wound healing improvement in 6–8 weeks. Carbon monoxide clears in just 24–48 hours. Ask your physician about nicotine replacement therapy (NRT) or prescription support (varenicline). This is the single most impactful change you can make for your surgical outcome.",
        learnMore: {
          why: "Smoking impairs oxygen delivery at every level of the respiratory chain. Carboxyhemoglobin — formed when carbon monoxide binds hemoglobin — renders up to 5–15% of your blood's oxygen-carrying capacity non-functional. Nicotine causes sustained vasoconstriction, reducing perfusion to healing wound edges. Smoking suppresses the immune surveillance needed to fight perioperative infection and delays every phase of wound healing.",
          evidence: "The good news: many effects begin reversing within hours. Carbon monoxide clears within 24–48 hours of stopping — directly improving tissue oxygenation. Airway reactivity begins improving within 1–2 weeks. Ciliary function recovers in 2–4 weeks. Immune and wound healing improvement requires 6–8 weeks — making your current window ideal. The perioperative period is one of the highest-motivation moments for permanent cessation: studies consistently show higher long-term quit rates when cessation is tied to surgery.",
          citations: [
            { text: "ERAS protocols: smoking cessation as high-quality evidence element. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
            { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
          ],
        },
      });
    } else if (weeks >= 4) {
      patient.push({ domain: "Smoking", priority: "high", title: "Quit Smoking — Meaningful Benefit Still Achievable", detail: `With ${weeks} weeks until surgery, 4 weeks of cessation still significantly reduces complications vs. continued smoking. Carbon monoxide clears immediately (24–48h), airway reactivity improves in 1–2 weeks. Ask about nicotine replacement therapy. If you cannot quit entirely, even reduction helps — but complete cessation is strongly preferred.`,
        learnMore: {
          why: "Every day of cessation creates measurable biological improvement. Within 24–48 hours, carbon monoxide clears and functional hemoglobin increases — your blood can carry more oxygen immediately. Within 1–2 weeks, airway reactivity begins normalizing and cilia in the airways resume their mucociliary clearance function, reducing pulmonary complication risk. Each additional smoke-free week compounds the benefit.",
          evidence: "Even 4 weeks of preoperative cessation significantly reduces wound infection, pulmonary complications, and impaired healing compared to continued smoking. Carbon monoxide normalization within 24–48 hours has direct, measurable effects on tissue oxygenation during surgery and anesthetic drug metabolism. Nicotine replacement therapy (NRT) maintains compliance without the CO and combustion toxin burden.",
          citations: [
            { text: "ERAS protocols: smoking cessation as high-quality evidence element. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
            { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
          ],
        },
      });
    } else {
      patient.push({ domain: "Smoking", priority: "high", title: "Stop Smoking — Even 24–48 Hours Helps", detail: "Even stopping 24–48 hours before surgery is beneficial: carboxyhemoglobin normalizes (from 5–15% down to normal), directly improving tissue oxygenation during surgery. Do NOT smoke the day of surgery. Discuss nicotine replacement therapy with your anesthesiologist. Every smoke-free hour before surgery improves your oxygen delivery.",
        learnMore: {
          why: "Carbon monoxide — the key toxic gas in cigarette smoke — binds hemoglobin with 240 times the affinity of oxygen. In heavy smokers, 5–15% of circulating hemoglobin is bound to CO and rendered non-functional for oxygen delivery. Stopping smoking allows CO to clear and oxyhemoglobin to return to normal within 24–48 hours, directly improving the oxygenation of every tissue — including surgical wound edges — during your operation.",
          evidence: "The immediate, measurable benefit of even brief cessation before surgery is well-established. Carboxyhemoglobin normalization within 24–48 hours provides direct benefit to tissue oxygenation and anesthetic drug metabolism. Nicotine replacement therapy can maintain abstinence without the CO and combustion toxin burden. The ERAS evidence base identifies smoking cessation as one of the highest-quality, most strongly recommended preoperative interventions.",
          citations: [
            { text: "ERAS protocols: smoking cessation — strong recommendation with high-quality evidence. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
            { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
          ],
        },
      });
    }
  } else if (d.smokingStatus === "former_lt8") {
    patient.push({ domain: "Smoking", priority: "medium", title: "Stay Smoke-Free — You're in the Recovery Window", detail: "Great job quitting! You're still in the early recovery window. Continue any NRT you're using. Your airways are healing — ciliary function is recovering and airway reactivity is decreasing. Staying smoke-free through surgery gives you the best possible outcome.",
      learnMore: {
        why: "You have already completed the hardest step. In the first 8 weeks after cessation, your airway is actively remodeling: cilia that were paralyzed by cigarette toxins are resuming mucociliary clearance, airway inflammation is decreasing, and bronchial reactivity is normalizing. Each additional week smoke-free builds more biological resilience before surgery.",
        evidence: "Ciliary function and mucociliary clearance begin recovering within 2–4 weeks of cessation. Airway hyperreactivity decreases progressively over the first 8 weeks. Immune function and wound healing mechanisms continue to improve with extended cessation. Note: in the first 8 weeks after cessation, airway reactivity may remain slightly elevated compared to never-smokers — standard airway management precautions apply and should be communicated to your anesthesiologist.",
        citations: [
          { text: "ERAS protocols: smoking cessation evidence base. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
          { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
        ],
      },
    });
  }

  // ── PATIENT TRACK: ALCOHOL ──
  if (d.alcoholUse === "heavy") {
    patient.push({ domain: "Alcohol", priority: "high", title: "Alcohol Cessation — Critical for Safety", detail: "Heavy alcohol use significantly increases surgical risk: 2–5x higher infection rates, impaired blood clotting, liver function changes, and risk of withdrawal after surgery. Stop drinking at least 4 weeks before surgery. IMPORTANT: If you have a history of withdrawal symptoms (shaking, seizures, DTs), do NOT stop abruptly — you need physician-supervised tapering. Contact your doctor immediately to plan safe cessation.",
      learnMore: {
        why: "Heavy alcohol use disrupts virtually every system involved in surgical recovery. It suppresses immune function (2–5x higher infection rates), impairs platelet function and coagulation (increasing bleeding risk), stresses the liver (affecting how anesthetic drugs are metabolized), and depletes key nutrients: thiamine, folate, and magnesium — all critical for recovery. If alcohol is suddenly unavailable after surgery (while in the hospital or ICU), withdrawal can emerge 6–24 hours after the last drink — becoming life-threatening at the most vulnerable moment.",
        evidence: "Heavy alcohol use is associated with 2–5x higher perioperative infection rates, significantly increased wound complications, immune suppression, hepatic dysfunction altering drug metabolism, and coagulopathy increasing bleeding risk. At least 4 weeks of cessation is needed to meaningfully reduce these risks. The surgical stress mirrors marathon physiology — the same cytokine and immune pathways — and alcohol compromises the body's ability to mount an appropriate response to either.",
        citations: [
          { text: "Systemic response to surgery. Anaesthesia & Intensive Care Medicine. 2023;24(1).", url: "https://www.sciencedirect.com/science/article/abs/pii/S026393192200254X" },
          { text: "ERAS protocols: alcohol cessation element. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
        ],
      },
    });
  } else if (d.alcoholUse === "moderate") {
    patient.push({ domain: "Alcohol", priority: "medium", title: "Reduce and Stop Alcohol Before Surgery", detail: "Moderate alcohol use affects immune function, wound healing, and liver metabolism of anesthetic drugs. Begin reducing intake now and stop completely at least 48 hours before surgery (ideally 2+ weeks). If you find it difficult to cut back, discuss this honestly with your physician — they can help.",
      learnMore: {
        why: "Even moderate alcohol use alters the hepatic cytochrome P450 enzymes responsible for metabolizing many anesthetic agents and medications, potentially causing unpredictable drug responses during and after surgery. Alcohol affects platelet function (reducing the ability to form clots) and modestly impairs immune surveillance in the wound healing window. Stopping 2+ weeks before surgery allows these effects to normalize.",
        evidence: "Alcohol interacts with hepatic enzyme systems that metabolize propofol, fentanyl, benzodiazepines, and other perioperative drugs — potentially requiring anesthesiologists to adjust dosing. Even moderate use is documented in anesthesia notes as affecting drug metabolism. Stopping at least 48 hours before surgery allows platelet function to normalize and reduces acute effects.",
        citations: [
          { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
          { text: "Bisch SP, et al. ERAS guidelines and outcomes: meta-analysis of RCTs. JAMA Netw Open. 2024;7(6):e2418611.", url: "https://pubmed.ncbi.nlm.nih.gov/38888922/" },
        ],
      },
    });
  } else if (d.alcoholUse === "light") {
    patient.push({ domain: "Alcohol", priority: "low", title: "Stop Alcohol ≥48 Hours Before Surgery", detail: "Stop all alcohol at least 48 hours before surgery. Even light alcohol use interacts with anesthetic medications and affects platelet function. This is a straightforward step that helps ensure the safest possible anesthetic.",
      learnMore: {
        why: "Even light alcohol interacts with the hepatic enzyme systems that metabolize anesthetic drugs and affects platelet aggregation (the blood's ability to clot at wound sites). Stopping 48 hours before surgery allows these effects to clear and ensures the most predictable anesthetic response.",
        evidence: "Alcohol is metabolized by cytochrome P450 2E1 (CYP2E1) and other hepatic enzymes — the same pathways used by many anesthetic agents. Even moderate use is documented in anesthesia records as potentially affecting drug metabolism. 48 hours provides sufficient clearance for light use.",
        citations: [
          { text: "Systemic response to surgery. Anaesthesia & Intensive Care Medicine. 2023;24(1).", url: "https://www.sciencedirect.com/science/article/abs/pii/S026393192200254X" },
        ],
      },
    });
  }

  // ── PATIENT TRACK: ANEMIA — NUTRITIONAL SUPPORT ──
  const hasAnemiaCondition = other.includes("Anemia (Hgb <13)");
  const hasAnemiaHgb = hgb !== null && hgb < 13;
  if (hasAnemiaCondition || hasAnemiaHgb) {
    const hgbDisplay = hgb !== null ? ` Your hemoglobin is ${hgb} g/dL.` : "";
    patient.push({ domain: "Anemia", priority: "high", title: "Iron-Rich Diet for Anemia Correction", detail: `Anemia increases your risk of needing a blood transfusion during surgery.${hgbDisplay} Focus on iron-rich foods: red meat, liver, dark leafy greens (spinach, kale), lentils, beans, and fortified cereals. To boost absorption, pair iron-rich foods with vitamin C sources (citrus, bell peppers, tomatoes). Avoid tea, coffee, and calcium supplements within 1 hour of iron-rich meals as they block absorption. Your physician may also prescribe iron supplements or IV iron for faster correction.`,
      learnMore: {
        why: "Anemia reduces the oxygen-carrying capacity of blood. During surgery — when tissues are cut, blood vessels are clamped, and the body's metabolic demands increase — having adequate hemoglobin is critical for every organ receiving enough oxygen. Preoperative anemia is one of the strongest independent predictors of the need for blood transfusion, and transfusion itself carries its own risks: immune reactions, infection transmission, and extended hospital stay.",
        evidence: "Between 30–50% of surgical patients have some degree of nutritional risk, and anemia is frequently unrecognized even in high-income settings. Iron-rich dietary interventions combined with vitamin C for absorption optimization can improve hemoglobin before surgery. When dietary correction is insufficient, physicians can prescribe oral iron or IV iron (ferric carboxymaltose allows single-dose correction). The perioperative target for elective surgery is generally hemoglobin ≥10–13 g/dL depending on expected blood loss.",
        citations: [
          { text: "Correia & Waitzberg. Impact of malnutrition on morbidity, mortality, LOS, and costs. Curr Opin Clin Nutr Metab Care. 2003;6(5):519–523.", url: "" },
          { text: "ERAS protocols: preoperative anemia management — high-quality evidence, strong recommendation. J Robotic Surg. 2025.", url: "https://link.springer.com/article/10.1007/s11701-025-02506-y" },
          { text: "Wang H, et al. Surgical stress response: physiological review. Cureus. 2025.", url: "https://www.cureus.com/articles/437189" },
        ],
      },
    });
  }

  // ══════ PROVIDER TRACK — 34 PATHWAYS ══════

  // ── Pathway-dispatch flags ──
  const hasCADFlag      = cardiac.some(c => ["CAD/Angina", "Prior MI (within 6 months)", "Prior PCI/stent"].includes(c));
  const hasStentFlag    = cardiac.includes("Prior PCI/stent");
  const hasHFFlag       = cardiac.some(c => ["CHF", "HFrEF", "HFpEF"].includes(c));
  const hfTypeResolved  = d.hfType || (cardiac.includes("HFrEF") ? "HFrEF" : cardiac.includes("HFpEF") ? "HFpEF" : cardiac.includes("CHF") ? "HFrEF" : "");
  const hasAFFlag       = cardiac.includes("Arrhythmia/AF") || cardiac.includes("Atrial fibrillation / flutter");
  const hasSevereASSym  = cardiac.includes("Severe aortic stenosis (symptomatic)");
  const hasSevereASAsy  = cardiac.includes("Severe aortic stenosis (asymptomatic)");
  const hasSevereAS     = hasSevereASSym || hasSevereASAsy;
  const hasMechValve    = cardiac.includes("Mechanical valve");
  const hasHCM          = cardiac.includes("Cardiomyopathy/HCM");
  const hasPulmHTN      = cardiac.includes("Pulmonary hypertension");
  const hasStrokeFlag   = cardiac.includes("Prior stroke");
  const hasCIED         = cardiac.includes("Pacemaker/AICD");
  const hasCOPD         = respiratory.includes("COPD/Emphysema");
  const hasOSADx        = respiratory.includes("OSA (diagnosed)");
  const hasOSASus       = respiratory.includes("OSA (suspected/STOP-BANG ≥3)");
  const hasOSAFlag      = hasOSADx || hasOSASus;
  const hasAsthma       = respiratory.includes("Asthma");
  const hasPheoFlag     = endocrine.includes("Pheochromocytoma");
  const hasAdrenal      = endocrine.includes("Adrenal insufficiency / Addison's") || endocrine.includes("Adrenal disease");
  const hasChronicSteroid = endocrine.includes("Chronic steroid use") || hasAdrenal || (d.otherMeds || []).includes("Corticosteroids");
  const hasCirrhosisFlag  = other.includes("Cirrhosis/liver disease");
  const hasCKDFlag        = other.includes("Chronic kidney disease (CKD)") || other.includes("On dialysis") || other.includes("Renal insufficiency/dialysis");
  const onDialysisFlag    = other.includes("On dialysis") || other.includes("Renal insufficiency/dialysis") || d.onDialysis === "yes";
  const hasRAFlag         = other.includes("Rheumatoid arthritis / autoimmune") || other.includes("Rheumatoid arthritis");
  const hasMGFlag         = other.includes("Myasthenia gravis");
  const hasSeizureFlag    = other.includes("Seizure disorder / epilepsy") || other.includes("Seizure disorder");
  const hasCancerFlag     = other.includes("Active cancer/chemo") || surgeryTags.includes("Cancer resection");
  const a1cNum            = d.a1cValue ? parseFloat(d.a1cValue) : null;
  const egfrNum           = d.egfrValue ? parseFloat(d.egfrValue) : null;
  const ferritinNum       = d.ferritinValue ? parseFloat(d.ferritinValue) : null;
  const tsatNum           = d.tsatValue ? parseFloat(d.tsatValue) : null;
  const stopBangNum       = d.stopBang ? parseInt(d.stopBang) : null;
  const cfsNum            = d.cfsScore ? parseInt(d.cfsScore) : null;
  const childPugh         = d.childPughClass || "";
  const biologicMeds      = d.biologicMeds || [];
  const conventionalDMARDs = d.conventionalDMARDs || [];
  const aedMeds           = d.aedMeds || [];
  const chemoWksAgo       = d.chemoWeeksAgo ? parseInt(d.chemoWeeksAgo) : null;

  // Surgery magnitude (derived)
  const majorSurgery   = d.riskCategory === "high" || surgeryTags.some(t => ["Open chest/cardiac", "Vascular", "Cancer resection", "Neurologic"].includes(t));
  const surgeryMagnitude = majorSurgery ? "major" : d.riskCategory === "elevated" ? "moderate" : "minor";

  // Time-keyed detail formatter: sections keyed by window, rendered as newline-separated labeled lines
  const timedDetail = (sections, citation) => {
    const order = ["ge8", "wk47", "wk12", "lt1", "dos", "readiness"];
    const labels = { ge8: "≥8 WK", wk47: "4–7 WK", wk12: "1–2 WK", lt1: "< 1 WK", dos: "DAY OF SURGERY", readiness: "READINESS" };
    const lines = [];
    for (const k of order) if (sections[k]) lines.push(`${labels[k]}: ${sections[k]}`);
    if (citation) lines.push(`Source: ${citation}`);
    return lines.join("\n");
  };

  // ═══ NEW ALERTS ═══
  if (d.cardiacEventMonths === "<3") alerts.push({ type: "danger", text: "Cardiac event < 3 months — elective surgery contraindicated (2024 AHA/ACC Class 1: ≥60 days since MI). Defer or seek urgent cardiology risk-benefit analysis." });
  if (d.strokeMonths === "<3") alerts.push({ type: "danger", text: "Stroke / TIA < 3 months — delay elective surgery ≥3 months (2024 AHA/ACC Class 2a)." });
  if (a1cNum !== null && a1cNum > 9.0) alerts.push({ type: "warning", text: `HbA1c ${a1cNum}% — exceeds 9.0% threshold. Defer elective surgery and optimize glycemic control (ADA 2025). Target ≤ 8.5% for elective.` });
  if (childPugh === "C") alerts.push({ type: "danger", text: "Child-Pugh C cirrhosis — elective surgery contraindicated (mortality >50% if MELD >20). Hepatology consult required; consider TIPS / transplant evaluation before any procedure." });
  if (hasPulmHTN && majorSurgery) alerts.push({ type: "warning", text: "Pulmonary hypertension + major surgery — PH center referral indicated (Class 2a). Invasive monitoring, continue all pulmonary vasodilators, inhaled NO available." });
  if (hasPheoFlag && d.alphaBlockadeStarted === "no") alerts.push({ type: "danger", text: "Pheochromocytoma without alpha-blockade — DO NOT proceed. Alpha-blockade (phenoxybenzamine or doxazosin) required ≥10–14 days preoperatively. Beta-blockade only AFTER alpha." });

  // ───────────────────────────────────────────────
  // SECTION A — CARDIOVASCULAR (Pathways 1–8)
  // ───────────────────────────────────────────────

  // Pathway 1: CAD / Prior MI
  if (hasCADFlag) {
    const mo = d.cardiacEventMonths || "";
    const stent = d.stentType || "";
    const onDAPT = d.onDAPT === "yes";
    let readiness = "≥60 d since MI (Class 1). GDMT optimized. Cardiology clearance documented.";
    if (mo === "<3") readiness = "NOT MET: <3 months from cardiac event. Defer elective surgery.";
    else if (stent === "DES" && mo === "3-6") readiness = "MARGINAL: DES 3–6 mo — elective OK only if time-sensitive; prefer ≥6 mo.";
    else if (stent === "BMS" && mo === "<3") readiness = "NOT MET: BMS <3 mo. Prefer ≥3 mo time-sensitive, ≥6 mo elective.";
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: `CAD / Prior MI — ${mo || "timing unknown"}${stent ? " / " + stent : ""}`,
      detail: timedDetail({
        ge8: "Optimize GDMT: high-intensity statin, BB (continue; do NOT start <7d preop per POISE), aspirin, ACEi/ARB. BNP/NT-proBNP if elevated risk. DASI to replace subjective METs.",
        wk47: "If BNP >92 or NT-proBNP >300 → echo. DASI ≤34 + elevated risk → cardiology consult. Verify stent intervals: BMS ≥3 mo time-sensitive / ≥6 mo elective DES / ≥12 mo ACS. Plan DAPT management.",
        wk12: onDAPT ? "DAPT hold: clopidogrel 5d / prasugrel 7–10d / ticagrelor 3–5d. CONTINUE statin + beta-blocker." : "Continue statin + beta-blocker. Verify antiplatelet plan.",
        dos: "Continue BB + statin. Hold ACEi/ARB if HTN-only (STOP-or-NOT). Postop troponin at 24h and 48h (Class 2b). If MINS: ASA + high-intensity statin; consider dabigatran 110 mg BID (MANAGE); cardiology ≤30 d.",
        readiness,
      }, "2024 AHA/ACC; POISE Lancet 2008; MANAGE Lancet 2018; ASRA 5th Ed 2025"),
    });
  }

  // Pathway 2: Heart Failure
  if (hasHFFlag) {
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: `Heart Failure${hfTypeResolved ? " — " + hfTypeResolved : ""}`,
      detail: timedDetail({
        ge8: hfTypeResolved === "HFrEF" ? "HFrEF quadruple therapy: (1) beta-blocker, (2) ARNI or ACEi/ARB, (3) MRA, (4) SGLT2i (hold 3–4 d preop). Echo if none in 1 yr. BNP/NT-proBNP baseline. Optimize to euvolemia." : "Optimize HFpEF: diuresis to euvolemia, BP control, rate control. Echo within 1 yr. BNP/NT-proBNP trend.",
        wk47: "Re-check BNP trend. Decompensated HF → DEFER until compensated. Confirm echo ≤ 1 year.",
        wk12: "SGLT2i already held (if applicable). Reconfirm euvolemia; avoid fluid overload.",
        dos: "Continue beta-blocker, ARNI/ACEi (HFrEF), statin. SGLT2i held. Monitor ketones. Avoid fluid overload.",
        readiness: "Compensated HF. GDMT stable ≥2 wk. BNP stable/down. Echo documented. Euvolemic.",
      }, "Heidenreich Circulation 2022; 2024 AHA/ACC Periop Guidelines"),
    });
  }

  // Pathway 3: Valvular Heart Disease
  if (hasSevereAS || hasMechValve || hasHCM || cardiac.includes("Valvular disease")) {
    const section = hasSevereASSym
      ? "SEVERE SYMPTOMATIC AS: Valve intervention (SAVR/TAVR) BEFORE elective NCS."
      : hasSevereASAsy
      ? "SEVERE ASYMPTOMATIC AS: Proceed with elevated-risk awareness + cardiology co-management."
      : hasHCM
      ? "HCM: Maintain preload + afterload; avoid tachycardia, hypovolemia, inotropes. Echo within 1 yr."
      : hasMechValve
      ? "MECHANICAL VALVE: Bridge with UFH/LMWH during warfarin hold per ASRA 5th Ed. Target INR pre-bridge <1.5."
      : "VHD: Echo if suspected moderate-severe disease or no echo in 1 yr (Class 1).";
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "Valvular Heart Disease",
      detail: timedDetail({
        ge8: section,
        wk47: "Echo within 1 yr or clinical change (Class 1). Cardiology co-management for severe disease.",
        dos: hasMechValve ? "Resume anticoagulation per ASRA 5th Ed restart windows. Monitor for thromboembolic event." : "Hemodynamic goals per lesion. Avoid tachycardia and hypovolemia in HCM/AS.",
        readiness: "Severity quantified on echo. Appropriate intervention scheduled or documented not indicated.",
      }, "2024 AHA/ACC; Otto Circulation 2021"),
    });
  }

  // Pathway 4: Hypertension — handled via ACEi/ARB card (Pathway 32) + uncontrolled HTN condition flag below
  if (cardiac.includes("Uncontrolled HTN (DBP >110)")) {
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "Uncontrolled Hypertension (DBP >110)",
      detail: timedDetail({
        ge8: "Assess for end-organ damage (fundoscopy, ECG, Cr, urine protein). Optimize antihypertensives — target BP <160/100.",
        wk47: "Continue CCB, BB, clonidine (no abrupt stop). Recheck BP weekly.",
        dos: "SBP ≥180 / DBP ≥110 with EOD → consider deferring (Class 2b). Without EOD → proceed with invasive monitoring.",
        readiness: "BP <180/110 stable; end-organ damage ruled out or stable.",
      }, "2024 AHA/ACC; ESAIC 2025"),
    });
  }

  // Pathway 5: AF / Arrhythmias
  if (hasAFFlag) {
    const rateOK = d.rateControlled === "yes";
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "Atrial Fibrillation / Flutter",
      detail: timedDetail({
        ge8: `Rate control target HR <110 (RACE II). ${rateOK ? "Rate-controlled." : "NOT YET rate-controlled — optimize with BB or CCB."} CHA₂DS₂-VASc for anticoagulation decision.`,
        wk47: "Review anticoag timing per ASRA 5th Ed (warfarin hold 5d, bridge if high risk; DOACs per Pathway 19 — do NOT bridge DOACs).",
        dos: "Continue rate agents perioperatively. Troponin at 24h/48h if elevated-risk NCS. New periop AF: treat triggers, rate control.",
        readiness: "HR <110. CHA₂DS₂-VASc documented. Anticoag timing reconciled with ASRA 5th.",
      }, "ASRA 5th Ed 2025; BRIDGE NEJM 2015"),
    });
  }

  // Pathway 6: Pulmonary HTN
  if (hasPulmHTN) {
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "Pulmonary Hypertension",
      detail: timedDetail({
        ge8: "Severe PH → PH center referral (Class 2a). Continue ALL pulmonary vasodilators (Class 1). Never interrupt IV prostacyclin.",
        wk47: "Echo if none within 1 yr. Right heart cath if functional decline.",
        dos: "Invasive arterial + central monitoring. Avoid hypoxemia, hypercarbia, acidosis. Maintain RV preload. Have inhaled NO available.",
        readiness: "Functional class documented. Vasodilator therapy uninterrupted. PH center plan of care on file.",
      }, "Humbert Eur Heart J 2022"),
    });
  }

  // Pathway 7: Prior Stroke / PVD
  if (hasStrokeFlag || cardiac.includes("Peripheral vascular disease")) {
    const sm = d.strokeMonths || "";
    let readiness = "≥3 mo since stroke (Class 2a). Baseline MAP documented.";
    if (sm === "<3") readiness = "NOT MET: <3 mo since stroke. Defer elective ≥3 months.";
    else if (sm === "3-9") readiness = "MARGINAL: 3–9 mo. Prefer ≥9 mo if elective.";
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "Prior Stroke / Cerebrovascular Disease",
      detail: timedDetail({
        ge8: "Delay elective NCS ≥3 mo post-stroke (Class 2a). Carotid duplex US if symptomatic stenosis or TIA <6 mo.",
        wk47: "Document baseline BP. Avoid MAP <20% below baseline intraoperatively.",
        dos: "BP target: avoid MAP <20% below baseline. Neuro checks q-shift postop.",
        readiness,
      }, "Glance JAMA Surg 2022; 2024 AHA/ACC"),
    });
  }

  // Pathway 8: CIED
  if (hasCIED) {
    provider.push({
      domain: "Cardiac Risk", priority: "high", title: "CIED (Pacemaker / ICD)",
      detail: timedDetail({
        ge8: "Device interrogation within 6–12 mo. Determine pacemaker dependency. Assess EMI risk from planned surgery.",
        wk47: "Coordinate with EP team for reprogramming plan. Confirm magnet availability intraop.",
        dos: "Pacemaker-dependent: asynchronous mode (VOO/DOO) or magnet. ICD: disable tachy-therapies. External defib pads applied. RESTORE therapies before discharge.",
        readiness: "Recent interrogation documented. Reprogram/deactivation plan in anesthesia note. Magnet in OR.",
      }, "2024 AHA/ACC; Crossley Heart Rhythm 2011"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION B — RESPIRATORY (Pathways 9–11)
  // ───────────────────────────────────────────────

  // Pathway 9: COPD
  if (hasCOPD) {
    provider.push({
      domain: "Respiratory", priority: "high", title: "COPD / Emphysema",
      detail: timedDetail({
        ge8: "Continue all inhalers. Optimize LABA + LAMA. Add ICS if eosinophils >300. Smoking cessation ≥4 wk → 23% PPC reduction; ≥8 wk → 47%. PFTs NOT routine (ESAIC 2025) — reserve for lung resection.",
        wk47: "If symptomatic: prednisone 40 mg ×5 d burst. Incentive spirometry 10 breaths q1–2 h.",
        dos: "All inhalers AM. Avoid desflurane. Postop: IS + early mobilization. Opioid-sparing analgesia.",
        readiness: "Symptoms optimized. Inhalers continued. Smoking cessation documented.",
      }, "ESAIC 2025 Eur J Anaesthesiol; GOLD 2025"),
    });
  }

  // Pathway 10: OSA (replaces old generic OSA card)
  if (hasOSAFlag) {
    const sb = stopBangNum;
    const sbBand = sb === null ? "score not entered" : sb <= 2 ? "low (0–2)" : sb <= 4 ? "intermediate (3–4)" : "high (≥5)";
    provider.push({
      domain: "Respiratory", priority: "medium", title: `OSA — STOP-BANG ${sbBand}`,
      detail: timedDetail({
        ge8: hasOSADx ? `Diagnosed OSA: bring CPAP. ${d.cpapAdherent === "no" ? "NON-ADHERENT — reinforce, re-initiate ≥2 wk preop. " : ""}Assess pulm HTN / RV dysfunction.` : "Suspected OSA: STOP-BANG scoring. If ≥3 and ≥4 wk available → sleep study.",
        wk47: sb !== null && sb >= 5 ? "STOP-BANG ≥5: empiric CPAP. Assume OSA for periop planning." : "Reinforce CPAP adherence. Plan postop continuous SpO₂.",
        dos: "Bring CPAP to hospital. Postop: continuous SpO₂, CPAP when not eating, opioid-sparing multimodal analgesia, avoid supine.",
        readiness: hasOSADx ? "CPAP present at hospital; adherence documented." : "STOP-BANG documented; empiric CPAP plan if ≥5.",
      }, "Chung Anesth Analg 2016; Tracy Future Sci OA 2025"),
    });
  }

  // Pathway 10b: Unexplained dyspnea (retained)
  if (respiratory.includes("Unexplained dyspnea")) {
    provider.push({
      domain: "Respiratory", priority: "high", title: "Unexplained Dyspnea",
      detail: timedDetail({
        ge8: "Order BNP/NT-proBNP (Class 2b). If elevated → echo before proceeding. DASI questionnaire for functional capacity.",
        wk47: "PFTs only if needed to assess optimization for lung resection. Optimize bronchodilators if obstructive pattern.",
        dos: "Stratify risk based on workup results. Plan for postop troponin if elevated cardiac risk emerges.",
        readiness: "Etiology identified or ruled out. Cardiology/pulmonology clearance as indicated.",
      }, "2024 AHA/ACC"),
    });
  }

  // Pathway 11: Asthma
  if (hasAsthma) {
    provider.push({
      domain: "Respiratory", priority: "medium", title: "Asthma",
      detail: timedDetail({
        ge8: "Elective surgery only when well-controlled (bronchospasm <2%). Uncontrolled: increase ICS, add LABA.",
        wk47: "Uncontrolled asthma → methylprednisolone 40 mg ×5 d.",
        dos: "Avoid desflurane and histamine-releasing NMBAs. Prefer sevoflurane + rocuronium/sugammadex. Nebulizer in recovery.",
        readiness: "Symptoms controlled, PEF at baseline, no recent exacerbation.",
      }, "GINA 2024"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION C — ENDOCRINE & METABOLIC (Pathways 12–16)
  // ───────────────────────────────────────────────

  // Pathway 12: Diabetes
  if (isDiabetic) {
    const a1cLine = a1cNum !== null
      ? (a1cNum > 9.0 ? `A1C ${a1cNum}% — EXCEEDS 9.0%: DEFER elective surgery.`
        : a1cNum > 8.5 ? `A1C ${a1cNum}% — above 8.5% target; optimize before elective.`
        : `A1C ${a1cNum}% — within target.`)
      : "Order A1C if none in 90 d. Target ≤8.5% for elective; defer if >9.0%.";
    const insulin = d.insulinType || "";
    let insulinLine = "No insulin use documented.";
    if (insulin === "basal") insulinLine = "Basal insulin: reduce 20–25% evening before.";
    else if (insulin === "basal-bolus") insulinLine = "Basal-bolus: basal −20–25%; NPH −50%; HOLD all bolus while NPO.";
    else if (insulin === "pump") insulinLine = "Insulin pump: continue basal ≤1 missed meal. Disconnect >3 h → IV insulin with manual basal rate.";
    provider.push({
      domain: "Endocrine", priority: "high", title: "Diabetes — Perioperative Glucose",
      detail: timedDetail({
        ge8: a1cLine,
        wk47: "Metformin: hold AM (24–48 h if eGFR 30–60). Sulfonylureas: hold AM. DPP-4i: continue. SGLT2i / GLP-1 RA per their pathways.",
        wk12: insulinLine,
        dos: "Glucose target 80–180 mg/dL (ADA 2025). Cancel if >300 + ketones >2.5. Order POC glucose on arrival.",
        readiness: a1cNum !== null && a1cNum > 9.0 ? "NOT MET: A1C >9%." : "A1C ≤8.5%. Medication holds reconciled. Glucose plan documented.",
      }, "ADA 2025; SAMBA Anesth Analg 2024; SPAQI J Clin Anesth 2024"),
    });
  }

  // Pathway 13: GLP-1 RA
  if (hasGLP1) {
    const risk = d.glp1Phase === "yes" || d.glp1GI === "active";
    const weeklyAgent = diabetesMeds.some(m => m.includes("semaglutide") || m.includes("Tirzepatide"));
    provider.push({
      domain: "Medications", priority: "high", title: `GLP-1 RA — ${risk ? "HIGH RISK" : "Standard"}`,
      detail: timedDetail({
        ge8: risk ? "Escalation phase, high dose, weekly agent, active GI symptoms, or gastroparesis: liquid diet ≥24 h before." : "No risk factors: CONTINUE. Standard NPO.",
        wk12: weeklyAgent ? "Weekly agent (semaglutide/tirzepatide): HOLD 7 days before surgery." : "Daily agent: hold day of surgery.",
        dos: d.glp1GI === "active" ? "Active GI symptoms: consider delay. If proceeding: liquid diet, gastric US, RSI if retained solids." : "Standard NPO. Monitor glucose perioperatively.",
        readiness: risk ? "Liquid diet adherence confirmed. Gastric US plan in place." : "Standard readiness.",
      }, "Multi-Society Guidance Surg Endosc 2025; SPAQI BJA 2025"),
    });
  }

  // Pathway 14: SGLT2i
  if (hasSGLT2) {
    provider.push({
      domain: "Medications", priority: "high", title: "SGLT2 Inhibitor",
      detail: timedDetail({
        wk12: "HOLD: empagliflozin / dapagliflozin / canagliflozin ≥3 d. Ertugliflozin ≥4 d (Class I AHA/ACC).",
        dos: "POC β-hydroxybutyrate: <0.6 normal / >1.5 = DKA workup. If DKA: IV fluids + insulin + dextrose.",
        readiness: "Restart only when eating normally AND ketones <0.6. HF exception: shared decision with cardiology.",
      }, "2024 AHA/ACC; Dixit JAMA Surg 2025"),
    });
  }

  // Pathway 15: Pheochromocytoma
  if (hasPheoFlag) {
    const alpha = d.alphaBlockadeStarted || "";
    provider.push({
      domain: "Endocrine", priority: "high", title: "Pheochromocytoma — Preop Alpha-Blockade",
      detail: timedDetail({
        ge8: "Phenoxybenzamine 10 mg BID → titrate to 40 mg BID, OR doxazosin 1–32 mg. START ≥10–14 d before surgery.",
        wk47: "Continue alpha titration to Roizen criteria: no BP >160/90 ×24 h; no orthostatic <80/45; no ST/T changes ×1 wk.",
        wk12: "Beta-blockade ONLY after alpha established (2–3 d later). NEVER beta first. Volume expansion: high-Na diet + IV NS.",
        dos: "Confirm Roizen criteria met. Arterial line + central access. Phentolamine, nitroprusside, esmolol available.",
        readiness: alpha === "no" ? "NOT MET: alpha-blockade not started. DO NOT PROCEED." : "Roizen criteria met. Volume expanded.",
      }, "Endocrine Society 2014; StatPearls NBK589634"),
    });
  }

  // Pathway 16: Stress-Dose Steroids
  if (hasChronicSteroid) {
    const dose = d.steroidDose || "";
    const dur = d.steroidDurationWks || "";
    const needsCoverage = dose === "addisons" || (dose === "ge20" && dur === "ge3") || (dose === "5-20" && dur === "ge3");
    let dosing = "No coverage needed (≤5 mg/d any duration).";
    if (dose === "addisons") dosing = "ALWAYS covers (Addison's/replacement).";
    else if (dose === "ge20" && dur === "ge3") dosing = "Prednisone ≥20 mg/d ≥3 wk: YES coverage.";
    else if (dose === "5-20" && dur === "ge3") dosing = "5–20 mg/d >3 wk (uncertain HPA): CONSIDER coverage.";
    let protocol = "";
    if (needsCoverage) {
      protocol = surgeryMagnitude === "minor"
        ? "Minor: usual dose. Consider hydrocortisone 25 mg IV."
        : surgeryMagnitude === "moderate"
        ? "Moderate: hydrocortisone 50 mg IV induction → 25 mg q8h ×24 h → usual dose."
        : "Major: hydrocortisone 100 mg IV induction → 50 mg q8h ×24–48 h → taper.";
    }
    provider.push({
      domain: "Endocrine", priority: needsCoverage ? "high" : "medium", title: "Stress-Dose Steroid Assessment",
      detail: timedDetail({
        ge8: dosing,
        dos: needsCoverage ? protocol : "Continue usual dose. No stress-dose coverage required.",
        readiness: needsCoverage ? `${surgeryMagnitude.toUpperCase()} surgery dosing protocol documented.` : "No coverage needed.",
      }, "Woodcock Anaesthesia 2020; Bornstein JCEM 2016"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION D — HEMATOLOGIC (Pathways 17–19)
  // ───────────────────────────────────────────────

  // Pathway 17: Anemia — severity-graded (enriched with ferritin/TSAT)
  if (hasAnemiaCondition || hasAnemiaHgb || d.bloodLoss === "significant") {
    const ironKnown = d.ironDeficiency === "yes";
    let ironWorkup = "Order ferritin + TSAT.";
    if (ferritinNum !== null && ferritinNum < 30) ironWorkup = `Ferritin ${ferritinNum} — ABSOLUTE deficiency → IV iron (ferric carboxymaltose 750–1000 mg ≥2–4 wk preop).`;
    else if (ferritinNum !== null && ferritinNum >= 30 && ferritinNum <= 100 && tsatNum !== null && tsatNum < 20) ironWorkup = `Ferritin ${ferritinNum} + TSAT ${tsatNum}% — FUNCTIONAL deficiency → IV iron.`;
    else if (ferritinNum !== null && ferritinNum > 100 && tsatNum !== null && tsatNum >= 20) ironWorkup = `Ferritin ${ferritinNum} + TSAT ${tsatNum}% — iron replete. Investigate B12, folate, CKD, GI bleeding.`;
    else if (ironKnown) ironWorkup = "Known iron deficiency → IV iron 2–4 wk preop (ferric carboxymaltose).";

    let title, sections, priority = "high";
    if (hgb !== null && hgb < 8) {
      title = `Severe Anemia (Hgb ${hgb}) — URGENT`;
      sections = {
        ge8: "Hematology consult. Rule out bleeding. Consider deferring elective surgery.",
        wk47: `${ironWorkup} Consider transfusion to ≥10 (1 unit at a time). EPO if CKD. T&C.`,
        dos: "Confirm blood product availability. T&C ready.",
        readiness: "NOT MET until Hgb ≥10 and etiology addressed.",
      };
    } else if (hgb !== null && hgb < 10) {
      title = `Moderate Anemia (Hgb ${hgb})`;
      sections = {
        ge8: `${ironWorkup} IV iron ≥2–4 wk preop. EPO if CKD.`,
        wk47: "Recheck Hgb 2 wk post-infusion. T&C for major surgery.",
        dos: "Blood products available. Hgb recheck documented.",
        readiness: "Hgb trending up. Etiology addressed.",
      };
    } else if (hgb !== null && hgb < 13) {
      title = `Mild Anemia (Hgb ${hgb})`;
      sections = {
        ge8: weeks >= 6 ? "Oral iron 325 mg daily + vitamin C. Recheck 2–4 wk." : `${ironWorkup} IV iron if <4 wk.`,
        wk47: "T&S for significant expected blood loss. Recheck 2–4 wk.",
        dos: "Hgb recheck if IV iron given.",
        readiness: "Hgb improving; ferritin/TSAT normalized.",
      };
    } else {
      title = "Anemia Management — Obtain Hemoglobin";
      sections = {
        ge8: "Order CBC with iron studies (ferritin, TIBC, TSAT, retic count).",
        readiness: "Hgb measured; severity graded.",
      };
      priority = "medium";
    }
    provider.push({ domain: "Hematologic", priority, title, detail: timedDetail(sections, "ICCAMS Ann Surg 2023; BSH Br J Haematol 2024; TRICC NEJM 1999") });
  }

  // Pathway 18: Sickle Cell
  if (other.includes("Sickle cell disease")) {
    provider.push({
      domain: "Hematologic", priority: "high", title: "Sickle Cell Disease",
      detail: timedDetail({
        ge8: "Hematology co-management. Phenotypically matched blood. Target Hgb 10 (NOT >11). HbS <30% major / <60% minor.",
        wk47: "Plan exchange transfusion timing if HbS target requires.",
        dos: "IV NS 1–1.5 mL/kg/hr evening before. Active warming. SpO₂ >95%. IS q1–2 h. Avoid dehydration, hypothermia, hypoxemia, acidosis.",
        readiness: "Hgb 10, HbS at target, matched units on file, ACS prevention bundle ready.",
      }, "Vichinsky NEJM 1995; Walker Anaesthesia 2021"),
    });
  }

  // Pathway 19: Anticoagulation (ASRA 5th Ed table)
  if (anticoag.length > 0) {
    const crclHint = egfrNum !== null && egfrNum < 50 ? ` Renal-adjusted: eGFR ${egfrNum} — extend DOAC holds (dabigatran: ≥48 h low / ≥120 h high for CrCl 30–49).` : "";
    provider.push({
      domain: "Medications", priority: "high", title: "Anticoagulation — ASRA 5th Ed (2025)",
      detail: timedDetail({
        ge8: `Active agents: ${anticoag.join(", ")}. Reconcile timing with ASRA 5th Ed. "Low dose" / "high dose" replaces prophylactic/therapeutic. Deep plexus now managed as neuraxial.${crclHint}`,
        wk12: "DRUG TIMING (low/high bleed risk): apixaban ≥36/72 h · rivaroxaban ≥24/72 h · dabigatran ≥48/72 h (CrCl ≥50) · LMWH ≥12/24 h · warfarin 5 d (INR <1.5) · clopidogrel 5–7 d · ticagrelor 5 d. DOAC anti-Xa <30 ng/mL or aXa ≤0.1 IU/mL may allow earlier.",
        dos: "Verify INR/anti-Xa as appropriate. Confirm neuraxial timing with anesthesia.",
        readiness: "RESTART: 6 h low / 24 h high for most DOACs; 12/24–72 h LMWH; warfarin per indication.",
      }, "Kopp ASRA 5th Ed Reg Anesth Pain Med 2025 PMID 39880411"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION E — SUBSTANCE USE (Pathways 20–22)
  // ───────────────────────────────────────────────

  // Pathway 20: Smoking (time-keyed)
  if (d.smokingStatus === "current") {
    const cigDay = parseInt(d.cigPerDay) || 0;
    const nrt = cigDay >= 10 ? "21 mg patch" : "14 mg patch";
    const heavy = cigDay >= 20;
    provider.push({
      domain: "Smoking", priority: "high", title: `Smoking Cessation — ${cigDay || "?"} cig/d`,
      detail: timedDetail({
        ge8: `Quit now. NRT ${nrt} + rescue gum/lozenge. Varenicline 1 mg BID ×12 wk. Cessation program referral. Spirometry education. ≥8 wk cessation = 47% PPC reduction. Ciliary recovery 2–4 wk; immune 6–8 wk.`,
        wk47: `Quit now. Same NRT. Assess adherence. Spirometry education. 23% PPC reduction at ≥4 wk.`,
        wk12: `Even 24–48 h helps. NRT patch + gum. No smoking on DOS. COHb normalizes 12–24 h.`,
        dos: "Verify cessation. NRT patch on admission. Incentive spirometer at bedside.",
        readiness: heavy ? `HEAVY (≥20/d): consider PFTs if lung resection, optimize bronchodilators, enhanced postop monitoring.` : "NRT plan documented. Cessation timeline on file.",
      }, "Mills Arch Intern Med 2011; Wong Anesth Analg 2017"),
    });
  } else if (d.smokingStatus === "former_lt8") {
    provider.push({ domain: "Smoking", priority: "medium", title: "Recent Smoking Cessation (<8 wk)", detail: "Patient quit <8 wk ago. Reinforce abstinence, continue NRT if in use. Incentive spirometry education. Airway reactivity remains increased first 8 wk — standard precautions for airway management." });
  }

  // Pathway 21: Alcohol (PAWSS / CIWA-Ar)
  if (d.alcoholUse === "heavy") {
    const withdrawal = d.withdrawalHistory === "yes";
    provider.push({
      domain: "Alcohol", priority: "high", title: withdrawal ? "Heavy Alcohol + Withdrawal History — CRITICAL" : "Heavy Alcohol Use",
      detail: timedDetail({
        ge8: "AUDIT-C score; PAWSS ≥4 = high withdrawal risk (sens 93%). LABS: CMP, CBC, PT/INR, Mg, phosphate, GGT. Thiamine 100 mg PO daily (MANDATORY — prevents Wernicke). Folate 1 mg. MVI. Counsel cessation ≥4 wk (immune + platelet recovery).",
        wk47: "Continue thiamine/folate. Document cessation duration. Addiction medicine referral if unable to abstain.",
        dos: withdrawal ? "PAWSS-triggered benzo prophylaxis protocol. ICU consideration. Addiction medicine/psychiatry consult." : "CIWA-Ar monitoring ×72 h postop. Low threshold for benzo rescue (typical withdrawal 6–24 h after last drink).",
        readiness: `CIWA-Ar dosing: ≤8 none · 9–19 lorazepam 1–2 mg q1h · ≥20 diazepam 10–20 mg IV q15–30 min; phenobarbital rescue. Document prominently in anesthesia note (enzyme induction → ↑ anesthetic/opioid requirements).`,
      }, "Maldonado Alcohol Alcohol 2015; PAWSS Alcohol Alcohol 2014"),
    });
  } else if (d.alcoholUse === "moderate") {
    provider.push({ domain: "Alcohol", priority: "medium", title: "Moderate Alcohol Use", detail: "Counsel cessation ≥2 wk preop. Order CMP for liver screening. Thiamine supplementation. Monitor subclinical withdrawal perioperatively. Document in anesthesia note (may affect drug metabolism)." });
  }

  // Pathway 22: Buprenorphine / Methadone / Naltrexone
  if (hasBup) {
    provider.push({ domain: "Medications", priority: "high", title: "Buprenorphine — CONTINUE", detail: "Do NOT discontinue perioperatively (ASRA/ASA/AAAM/ASAM 2021, reaffirmed 2024–2025). Continue home dose. Full mu-agonists CAN be co-administered. Multimodal: regional, ketamine, NSAIDs, gabapentinoids. Evidence: lower opioid requirements, similar pain scores, lower OUD relapse risk. (Kohan Reg Anesth Pain Med 2021 PMID 34385292)" });
  }
  if (hasMethadone) {
    provider.push({ domain: "Medications", priority: "high", title: "Methadone — Continue", detail: "Continue maintenance dose. If NPO: IV = 50% oral divided q6–8 h. ECG REQUIRED (QTc >500 = TdP risk). Multimodal analgesia." });
  }
  if (hasNaltrexone) {
    const isXR = painMeds.includes("Naltrexone (XR/Vivitrol)");
    provider.push({ domain: "Medications", priority: "high", title: `Naltrexone — HOLD ${isXR ? "30 Days" : "72 h"}`, detail: isXR ? "Extended-release (Vivitrol): hold ≥30 days before elective surgery — allows opioid receptor availability. Emergency: opioid-free strategies (regional, ketamine, dexmedetomidine)." : "Oral naltrexone: hold 72 h before surgery." });
  }

  // ───────────────────────────────────────────────
  // SECTION F — HEPATIC / RENAL / MSK (Pathways 23–25)
  // ───────────────────────────────────────────────

  // Pathway 23: Cirrhosis
  if (hasCirrhosisFlag) {
    const riskLine = childPugh === "A" ? "Child-Pugh A: safe for most surgery."
      : childPugh === "B" ? "Child-Pugh B: increased risk — careful risk-benefit analysis."
      : childPugh === "C" ? "Child-Pugh C: CONTRAINDICATED for elective surgery. Hepatology + transplant evaluation."
      : "Child-Pugh class not provided. MELD <10 low / 10–15 mod / >15 high (avoid elective) / >20 mortality >50% / >25 life-saving only.";
    provider.push({
      domain: "Hepatic", priority: "high", title: `Cirrhosis${childPugh ? " — Child-Pugh " + childPugh : ""}`,
      detail: timedDetail({
        ge8: riskLine + " Hepatology consult for decompensated cirrhosis.",
        wk47: "Coagulopathy: TEG/ROTEM-guided. Platelets <50K → transfuse. Avoid FFP for INR alone. Ascites: paracentesis if tense (albumin 6–8 g/L if >5 L drained). Nutrition: 1.2–1.5 g/kg protein.",
        dos: "TEG/ROTEM available. Ascites decompressed. Nutrition optimized. Ammonia/lactulose plan.",
        readiness: childPugh === "C" ? "NOT MET: Child-Pugh C contraindicated." : "Coagulation, volume, nutrition optimized.",
      }, "ACG Guideline 2025; VOCAL-Penn Mahmud 2020"),
    });
  }

  // Pathway 24: Renal / Dialysis
  if (hasCKDFlag || onDialysisFlag) {
    const drugList = "Avoid: succinylcholine, morphine, meperidine, tramadol. Prefer: cisatracurium + fentanyl/hydromorphone.";
    provider.push({
      domain: "Renal", priority: "high", title: onDialysisFlag ? "Dialysis-Dependent ESRD" : `CKD${egfrNum !== null ? " (eGFR " + egfrNum + ")" : ""}`,
      detail: timedDetail({
        ge8: onDialysisFlag ? "Coordinate with nephrology. Establish optimal dry weight. Confirm access site." : "KDIGO bundle: volume optimization, avoid nephrotoxins (NSAIDs, contrast), normoglycemia, Cr/UOP monitoring.",
        wk47: "Reconcile DOAC hold timing with eGFR (see Pathway 19).",
        wk12: "Medication review: dose-adjust renally-cleared drugs.",
        dos: onDialysisFlag ? "Dialyze within 24 h preop. NO heparin last session. K+ <5.5, Mg ≥2.0 verified. " + drugList : "K+ and Mg verified. Strict fluid balance. " + drugList,
        readiness: onDialysisFlag ? "Dialyzed <24 h. Electrolytes verified. Access protected." : "Baseline renal function documented. Nephrotoxin avoidance plan.",
      }, "ASRA 5th Ed 2025; KDIGO 2012; BigpAK-2 Lancet 2026"),
    });
  }

  // Pathway 25: Rheumatoid Arthritis / Biologics
  if (hasRAFlag || biologicMeds.length > 0) {
    const hasBiologic = biologicMeds.some(m => m !== "None");
    const hasJAK = biologicMeds.some(m => m.includes("JAK"));
    const continueDMARDs = conventionalDMARDs.filter(m => m !== "None").join(", ") || "none listed";
    provider.push({
      domain: "Rheumatologic", priority: "high", title: "Rheumatoid Arthritis / Biologics (ACR/AAHKS 2022)",
      detail: timedDetail({
        ge8: `CONTINUE conventional DMARDs: MTX, HCQ, SSZ, leflunomide, apremilast (${continueDMARDs}).`,
        wk12: hasBiologic ? "WITHHOLD all biologics 1 dosing interval before surgery (TNFi, IL-6i, IL-17i, IL-23i, abatacept, rituximab)." : "No biologics listed.",
        lt1: hasJAK ? "JAK inhibitors: hold ≥3 days." : "",
        dos: "Cervical flex/ext X-rays if symptomatic (AAI in 25%). TMJ/cricoarytenoid assessment. Video laryngoscopy first-line.",
        readiness: `Biologic holds documented. Restart all ~14 d post wound healing.`,
      }, "Goodman Arthritis Care Res 2022 PMID 35718887"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION G — NEURO / CANCER / GERIATRIC / SURGERY-SPECIFIC (Pathways 26–31)
  // ───────────────────────────────────────────────

  // Pathway 26: Myasthenia Gravis
  if (hasMGFlag) {
    provider.push({
      domain: "Neurologic", priority: "high", title: "Myasthenia Gravis",
      detail: timedDetail({
        ge8: "PFTs: FVC <20 mL/kg = high postop ventilatory failure risk. Optimize pyridostigmine, IVIG/PLEX if unstable.",
        wk47: "Neurology co-management. Document MGFA class.",
        dos: `Continue pyridostigmine (PO 60 mg ≈ IV 2 mg — do NOT abruptly stop). NMBA dose: 10–25% normal rocuronium. Sugammadex preferred. Quantitative TOF MANDATORY. AVOID aminoglycosides, Mg, fluoroquinolones. ICU for MGFA III–V or FVC <20.`,
        readiness: "PFT documented. Pyridostigmine continued. Sugammadex available. ICU bed if severe.",
      }, "Daum BJA Educ 2021; StatPearls NBK572091"),
    });
  }

  // Pathway 27: Seizure Disorder
  if (hasSeizureFlag) {
    const aeds = aedMeds.filter(m => m !== "Other").join(", ") || "listed AEDs";
    provider.push({
      domain: "Neurologic", priority: "medium", title: "Seizure Disorder — Continue AEDs",
      detail: timedDetail({
        ge8: `Continue all AEDs (${aeds}). Check phenytoin/valproate levels if applicable.`,
        dos: "AM dose with sip of water. IV conversion if NPO extended: levetiracetam 1:1 PO:IV; fosphenytoin 20 mg PE/kg; valproate 1:1; lacosamide 1:1.",
        readiness: "AED continuation plan documented. AVOID meperidine, tramadol. Resume PO ASAP.",
      }, "AES Status Epilepticus Algorithm"),
    });
  }

  // Pathway 28: Cancer + Chemotherapy
  if (hasCancerFlag) {
    const recentChemo = chemoWksAgo !== null && chemoWksAgo < 3;
    const anthra = d.anthracyclineExposure === "yes";
    provider.push({
      domain: "Oncologic", priority: "high", title: "Cancer / Recent Chemotherapy",
      detail: timedDetail({
        ge8: anthra ? "Anthracycline exposure: echo + GLS + troponin + BNP. LVEF <50% or GLS drop >15% → cardiology. ICIs: troponin baseline + serial (myocarditis 1–2%, mortality 25–40%)." : "HER2 therapy: LVEF + GLS q3 mo if applicable.",
        wk47: "Hematologic recovery: ANC >1.0–1.5, Plt >50 K (>100 K neuro/eye). ≥3–4 wk post-chemo.",
        wk12: "Targeted therapy holds: bevacizumab 6–8 wk, TKIs ≥1 wk, ICIs 1–3 wk.",
        dos: "VTE risk: Khorana ≥2 → thromboprophylaxis. Extended 4 wk LMWH for high-risk cancer surgery.",
        readiness: recentChemo ? "NOT MET: <3 wk post-chemo. Delay for count recovery." : "Counts recovered. Targeted therapy holds confirmed. Cardio-onc clearance if anthra/ICI.",
      }, "ESC 2022 Cardio-Onc Eur Heart J; ASCO VTE JCO 2023"),
    });
  }

  // Pathway 29: Elderly ≥75 / Frailty
  if (age >= 75 || other.includes("Frailty/recent falls") || (cfsNum !== null && cfsNum >= 5)) {
    let cfsLine = "Screen with CFS, mFI, or RAI.";
    if (cfsNum !== null) {
      cfsLine = cfsNum >= 7 ? `CFS ${cfsNum}: GOALS-OF-CARE discussion. Advance directives / DNR.`
        : cfsNum >= 5 ? `CFS ${cfsNum}: geriatric assessment indicated.`
        : `CFS ${cfsNum}: robust.`;
    }
    const miniCogLine = d.miniCogNormal === "no" ? "Mini-Cog ABNORMAL — high delirium risk." : d.miniCogNormal === "yes" ? "Mini-Cog normal." : "Screen with Mini-Cog or MoCA (<26).";
    provider.push({
      domain: "Frailty/Age", priority: "high", title: `Elderly ≥${age >= 75 ? "75" : "65"} / Frailty`,
      detail: timedDetail({
        ge8: `${cfsLine} ${miniCogLine} Polypharmacy review per Beers 2023. Albumin, grip, protein. Advance care planning.`,
        wk47: "Nutritional optimization (1.2–1.5 g/kg protein). Physical prehabilitation if time permits.",
        dos: "ESAIC delirium bundle: orientation cues, sleep hygiene, early mobilization, hydration, sensory aids (glasses/hearing aids). BIS 40–60. AVOID benzos, anticholinergics. Consider dexmedetomidine. Multimodal analgesia.",
        readiness: "Frailty documented. Delirium bundle orders active. Advance directives on file. Routine age-based EKG NOT indicated (ESAIC 2025).",
      }, "Aldecoa Eur J Anaesthesiol 2024; Varley JAMA Surg 2023"),
    });
  }

  // Pathway 30: Joint Replacement
  if (needsImplant) {
    provider.push({
      domain: "Surgery-Specific", priority: "high", title: "Implant / Joint Replacement Pathway",
      detail: timedDetail({
        ge8: "Nasal swab for S. aureus within 30 d of surgery. Universal decolonization: mupirocin 2% nasal BID ×5 d + CHG 4% wash ×3–5 d.",
        wk47: "Anemia target: Hgb ≥13 DOS (Pathway 17). If <13, IV iron ≥2–4 wk preop.",
        wk12: "Review VTE prophylaxis plan: ASA 81 mg BID ×4–6 wk (AAOS/ICM 2018). Elevated risk → LMWH or DOAC. IPC for all.",
        dos: "Confirm decolonization completed. Preop antibiotics timed per SCIP. IPC in OR.",
        readiness: "Swab negative or decolonized. Hgb ≥13. VTE plan documented.",
      }, "AAOS/ICM 2018; AAHKS 2022 VTE Guidelines"),
    });
  }

  // Pathway 31: Vascular Surgery
  if (surgeryTags.includes("Vascular")) {
    provider.push({
      domain: "Surgery-Specific", priority: "high", title: "Vascular Surgery — Highest MACE Risk",
      detail: timedDetail({
        ge8: "Full 2024 AHA/ACC algorithm for ALL patients. RCRI + DASI + BNP (Class 2a). Preop revascularization NOT beneficial (CARP).",
        wk47: "Optimize GDMT: high-intensity statin, aspirin, beta-blocker (continue; do NOT start <7 d preop).",
        dos: "Plan MINS surveillance: hs-cTn at 6–12 h, POD 1, POD 2. Postop ICU/step-down for monitoring.",
        readiness: "Workup complete. MINS surveillance ordered. If MINS detected: ASA + statin; consider dabigatran 110 mg BID (MANAGE); cardiology ≤30 d.",
      }, "CARP NEJM 2004; MANAGE Lancet 2018"),
    });
  }

  // ───────────────────────────────────────────────
  // SECTION H — CROSS-CUTTING (Pathways 32–34)
  // ───────────────────────────────────────────────

  // Pathway 32: ACEi/ARB
  if (cardioMeds.includes("ACE inhibitor") || cardioMeds.includes("ARB")) {
    const hfrefContinue = hfTypeResolved === "HFrEF";
    provider.push({
      domain: "Medications", priority: "high", title: "ACEi / ARB Management",
      detail: timedDetail({
        ge8: hfrefContinue ? "HFrEF: CONTINUE as GDMT (Class 2a)." : "HTN-only: hold 24 h before elevated-risk surgery (Class 2b, STOP-or-NOT).",
        dos: hfrefContinue ? "CONTINUE through surgery." : "Hold morning of surgery. Continue all other antihypertensives.",
        readiness: "RESTART within 48 h postop. CRITICAL: 25% never restarted — document restart order.",
      }, "STOP-or-NOT JAMA 2024; POISE-3 NEJM 2022"),
    });
  }

  // Pathway 33: VTE Prophylaxis (Caprini)
  {
    let caprini = 0;
    if (age >= 75) caprini += 3; else if (age >= 61) caprini += 2; else if (age >= 41) caprini += 1;
    if (hasCancerFlag) caprini += 2;
    if (bmi !== null && bmi >= 25) caprini += 1;
    if (surgeryMagnitude === "major") caprini += 2; else if (surgeryMagnitude === "moderate") caprini += 1;
    if (other.includes("Frailty/recent falls")) caprini += 1;
    if (hasHFFlag) caprini += 1;
    if (hasStrokeFlag) caprini += 5;
    const tier = caprini >= 8 ? "Very High (≥8): Combined pharm+mech + EXTENDED ≤30 d. Cancer → LMWH."
      : caprini >= 5 ? "High (5–7): Combined pharm+mech × hospitalization + 7–10 d."
      : caprini >= 3 ? "Moderate (3–4): Pharm ± mech × hospitalization."
      : caprini >= 1 ? "Low (1–2): Mechanical OR pharm × hospitalization."
      : "Minimal (0): Early ambulation only.";
    provider.push({
      domain: "VTE", priority: caprini >= 5 ? "high" : "medium", title: `VTE Prophylaxis — Caprini ${caprini}`,
      detail: timedDetail({
        ge8: `Score: ${caprini}. ${tier}`,
        dos: "Reconcile timing with ASRA 5th Ed neuraxial intervals. IPC in OR for all patients.",
        readiness: "Caprini documented. Pharm + mech ordered per tier. Duration per tier.",
      }, "Pannucci Mayo Clin Proc 2020; CHEST 2012"),
    });
  }

  // Pathway 34: Delirium Prevention
  if (age >= 65 || d.miniCogNormal === "no" || (cfsNum !== null && cfsNum >= 5)) {
    provider.push({
      domain: "Neurologic", priority: "medium", title: "Delirium Prevention (ESAIC 2024)",
      detail: timedDetail({
        ge8: "Screen: MoCA or Mini-Cog preop. Document baseline cognition. Identify modifiable risks (polypharmacy, sleep, hearing/vision).",
        dos: "Bundle: orientation cues, sleep hygiene, early mobilization, hydration, sensory aids, pain control. BIS 40–60. AVOID benzos/anticholinergics. Consider dexmedetomidine. Multimodal analgesia.",
        readiness: "Bundle orders active. CAM/4AT q8–12 h ×72 h postop.",
      }, "Aldecoa Eur J Anaesthesiol 2024;41:81–108"),
    });
  }

  // ───────────────────────────────────────────────
  // DAY-OF-SURGERY FINAL CHECKLIST
  // ───────────────────────────────────────────────
  {
    const items = [];
    items.push("BASE: Medications held/continued per plan · labs within range · glucose on arrival · K+ for diuretic pts · pregnancy test if applicable · consent signed · resuscitation preferences confirmed.");
    if (hasCADFlag) items.push("CARDIAC: BB continued · statin continued · troponin orders at 24/48 h placed.");
    if (hasHFFlag) items.push("HF: Euvolemic · GDMT reconciled · SGLT2i held if applicable.");
    if (hasSGLT2) items.push("SGLT2i: POC ketones <0.6 verified.");
    if (hasGLP1 && (d.glp1Phase === "yes" || d.glp1GI === "active")) items.push("GLP-1 RA HIGH RISK: Gastric US; RSI plan if retained solids.");
    if (isDiabetic) items.push("DIABETES: A1C on file · insulin pump plan · POC glucose.");
    if (hasChronicSteroid && (d.steroidDose === "addisons" || (d.steroidDose === "ge20" && d.steroidDurationWks === "ge3"))) items.push("STRESS-DOSE STEROID: Hydrocortisone dose per surgery magnitude.");
    if (hasPheoFlag) items.push("PHEO: Roizen criteria met · phentolamine/esmolol available.");
    if (hasAnemiaCondition || hasAnemiaHgb) items.push("ANEMIA: Hgb recheck if IV iron given · blood bank crossmatch confirmed.");
    if (other.includes("Sickle cell disease")) items.push("SICKLE CELL: Hgb 10 / HbS target / matched blood / warming / SpO₂ >95%.");
    if (anticoag.length > 0) items.push("ANTICOAG: Hold timing verified per ASRA 5th · anti-Xa as needed.");
    if (d.smokingStatus === "current") items.push("SMOKING: Cessation verified · NRT on admission · IS at bedside.");
    if (d.alcoholUse === "heavy") items.push("ALCOHOL: Thiamine administered · CIWA-Ar orders · ICU if PAWSS+.");
    if (hasOSAFlag) items.push("OSA: CPAP at bedside · continuous SpO₂ orders.");
    if (hasRAFlag) items.push("RA: Cervical imaging reviewed · VL ready · biologic hold confirmed.");
    if (hasMGFlag) items.push("MG: Sugammadex available · quantitative TOF · ICU bed if MGFA III–V.");
    if (hasSeizureFlag) items.push("SEIZURE: AED AM dose · IV conversion plan.");
    if (hasCIED) items.push("CIED: Reprogram / magnet plan in anesthesia note.");
    if (hasPulmHTN) items.push("PULMONARY HTN: Inhaled NO available · invasive monitoring.");
    if (hasCirrhosisFlag) items.push("CIRRHOSIS: TEG/ROTEM · platelet threshold 50K · albumin/ascites plan.");
    if (onDialysisFlag) items.push("DIALYSIS: Dialyzed <24 h · K+ <5.5 · Mg ≥2.0 · access protected.");
    if (needsImplant) items.push("IMPLANT: Decolonization complete · preop abx per SCIP · IPC in OR.");
    if (surgeryTags.includes("Vascular")) items.push("VASCULAR: MINS surveillance orders placed (hs-cTn 6–12 h, POD 1, 2).");
    if (age >= 65) items.push("GERIATRIC: Delirium bundle · BIS 40–60 · CAM/4AT orders.");
    provider.push({ domain: "Day of Surgery", priority: "medium", title: "DOS Verification Checklist", detail: items.join("\n") });
  }

  return { patient, provider, alerts, riskLevel };
}

// ───────── STEP ILLUSTRATIONS ─────────
function StepIllustration({ type }) {
  const T = SR.teal; const N = SR.navy; const TL = SR.tealLight;
  const defs = {
    walk: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        {/* Shadow */}
        <ellipse cx="55" cy="105" rx="28" ry="5" fill={T} opacity="0.12"/>
        {/* Person walking - stylized */}
        <circle cx="55" cy="18" r="11" fill={T} opacity="0.9"/>
        <path d="M55 29 L53 60" stroke={N} strokeWidth="5" strokeLinecap="round"/>
        {/* Left arm fwd */}
        <path d="M53 38 L36 52" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Right arm back */}
        <path d="M53 38 L70 48" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Left leg fwd */}
        <path d="M53 60 L40 82 L32 100" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Right leg back */}
        <path d="M53 60 L65 80 L72 98" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Ground */}
        <line x1="18" y1="103" x2="92" y2="103" stroke="#DDE5E3" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Motion lines */}
        <line x1="12" y1="46" x2="26" y2="46" stroke={T} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="8"  y1="55" x2="24" y2="55" stroke={T} strokeWidth="2"   strokeLinecap="round" opacity="0.5"/>
        <line x1="12" y1="64" x2="25" y2="64" stroke={T} strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      </svg>
    ),
    walk_prog: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        <ellipse cx="58" cy="105" rx="26" ry="5" fill={T} opacity="0.12"/>
        {/* Faster walk - leaning forward */}
        <circle cx="62" cy="16" r="11" fill={T} opacity="0.9"/>
        <path d="M60 27 L56 58" stroke={N} strokeWidth="5" strokeLinecap="round"/>
        {/* Arms pumping harder */}
        <path d="M57 36 L36 44" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M57 36 L78 42" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Legs more extended */}
        <path d="M56 58 L38 80 L28 100" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M56 58 L70 78 L80 97" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="15" y1="103" x2="95" y2="103" stroke="#DDE5E3" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Stronger motion lines */}
        <line x1="6"  y1="36" x2="24" y2="36" stroke={T} strokeWidth="3"   strokeLinecap="round" opacity="0.75"/>
        <line x1="4"  y1="47" x2="22" y2="47" stroke={T} strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
        <line x1="6"  y1="57" x2="22" y2="57" stroke={T} strokeWidth="2"   strokeLinecap="round" opacity="0.4"/>
        {/* Progress arrow */}
        <path d="M86 22 L99 22" stroke={T} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M94 16 L100 22 L94 28" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    strength: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        <ellipse cx="55" cy="105" rx="28" ry="5" fill={T} opacity="0.12"/>
        {/* Person doing bicep curl */}
        <circle cx="55" cy="18" r="11" fill={T} opacity="0.9"/>
        {/* Body */}
        <path d="M55 29 L55 66" stroke={N} strokeWidth="5" strokeLinecap="round"/>
        {/* Right arm up with weight */}
        <path d="M55 40 L74 34 L76 18" stroke={N} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Dumbbell */}
        <rect x="70" y="10" width="12" height="7" rx="3" fill={T}/>
        <rect x="72" y="10" width="2" height="7" rx="1" fill={N} opacity="0.3"/>
        <rect x="78" y="10" width="2" height="7" rx="1" fill={N} opacity="0.3"/>
        {/* Left arm out */}
        <path d="M55 40 L38 52" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Legs - stance */}
        <path d="M55 66 L44 90 L40 103" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 66 L66 90 L70 103" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="18" y1="105" x2="92" y2="105" stroke="#DDE5E3" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Flex line */}
        <path d="M70 26 Q76 22 78 26" stroke={T} strokeWidth="1.5" fill="none" opacity="0.6"/>
      </svg>
    ),
    hiit: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        <ellipse cx="55" cy="104" rx="26" ry="5" fill={T} opacity="0.12"/>
        {/* Person jumping - airborne */}
        <circle cx="55" cy="14" r="11" fill={T} opacity="0.9"/>
        {/* Body */}
        <path d="M55 25 L55 58" stroke={N} strokeWidth="5" strokeLinecap="round"/>
        {/* Arms spread wide/up */}
        <path d="M55 35 L30 20" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M55 35 L80 20" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Legs spread jumping */}
        <path d="M55 58 L35 74 L30 92" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 58 L75 74 L80 92" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Energy bursts */}
        <path d="M20 46 L10 40 L15 36" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M90 46 L100 40 L95 36" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M22 68 L12 62 L16 56" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65"/>
        <path d="M88 68 L98 62 L94 56" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65"/>
        {/* Sweat drops */}
        <ellipse cx="40" cy="10" rx="3" ry="4" fill={T} opacity="0.4" transform="rotate(-20,40,10)"/>
        <ellipse cx="70" cy="8" rx="2.5" ry="3.5" fill={T} opacity="0.3" transform="rotate(20,70,8)"/>
      </svg>
    ),
    track: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        {/* Clipboard */}
        <rect x="20" y="18" width="70" height="82" rx="8" fill={TL} stroke={N} strokeWidth="2"/>
        <rect x="42" y="10" width="26" height="16" rx="5" fill={N}/>
        {/* Lines */}
        <line x1="32" y1="40" x2="78" y2="40" stroke="#DDE5E3" strokeWidth="1.5"/>
        <line x1="32" y1="52" x2="78" y2="52" stroke="#DDE5E3" strokeWidth="1.5"/>
        <line x1="32" y1="64" x2="78" y2="64" stroke="#DDE5E3" strokeWidth="1.5"/>
        {/* Chart line going up */}
        <polyline points="34,74 46,66 60,58 74,44" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="74" cy="44" r="4" fill={T}/>
        <circle cx="46" cy="66" r="3" fill={T} opacity="0.6"/>
        <circle cx="60" cy="58" r="3" fill={T} opacity="0.8"/>
        {/* Check marks */}
        <path d="M33 84 L37 88 L46 80" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M53 84 L57 88 L66 80" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M72 84 L74 86 L79 82" stroke="#DDE5E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    protein: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        {/* Plate */}
        <circle cx="55" cy="68" r="36" fill={TL} stroke={N} strokeWidth="2"/>
        <circle cx="55" cy="68" r="28" fill="none" stroke="#DDE5E3" strokeWidth="1.5" strokeDasharray="4 3"/>
        {/* Chicken/protein */}
        <ellipse cx="46" cy="72" rx="17" ry="13" fill={T} opacity="0.25" stroke={T} strokeWidth="1.5"/>
        <ellipse cx="46" cy="72" rx="11" ry="8" fill={T} opacity="0.2"/>
        {/* Egg */}
        <ellipse cx="74" cy="64" rx="9" ry="11" fill="#FFFBE6" stroke="#D69E2E" strokeWidth="1.5"/>
        <circle cx="74" cy="64" r="5" fill="#D69E2E" opacity="0.55"/>
        {/* Greens */}
        <path d="M50 60 Q52 50 57 52 Q59 44 64 47 Q67 40 71 45" stroke="#095C4B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Badge */}
        <circle cx="55" cy="20" r="17" fill={N}/>
        <text x="55" y="17" textAnchor="middle" fill={T} fontSize="8" fontWeight="700" fontFamily="DM Sans,sans-serif">PROTEIN</text>
        <text x="55" y="27" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="DM Sans,sans-serif">1.5g/kg</text>
      </svg>
    ),
    sleep: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        {/* Moon + stars background */}
        <path d="M22 30 Q17 20 23 12 Q14 17 14 26 Q14 36 24 38 Q17 32 22 30z" fill={T} opacity="0.75"/>
        <circle cx="38" cy="18" r="2.5" fill={T} opacity="0.5"/>
        <circle cx="52" cy="10" r="2" fill={T} opacity="0.4"/>
        <circle cx="33" cy="10" r="1.5" fill={T} opacity="0.35"/>
        {/* Bed frame */}
        <rect x="14" y="62" width="82" height="34" rx="5" fill={TL} stroke={N} strokeWidth="2"/>
        <rect x="14" y="52" width="82" height="14" rx="5" fill={N}/>
        {/* Pillow */}
        <rect x="20" y="55" width="24" height="10" rx="4" fill={T} opacity="0.55"/>
        {/* Person asleep */}
        <ellipse cx="55" cy="62" rx="20" ry="8" fill="#DDE5E3" stroke={N} strokeWidth="1.5"/>
        <circle cx="38" cy="62" r="7" fill="#DDE5E3" stroke={N} strokeWidth="1.5"/>
        {/* Z letters */}
        <text x="82" y="50" fill={T} fontSize="13" fontWeight="700" opacity="0.85" fontFamily="DM Sans,sans-serif">z</text>
        <text x="90" y="38" fill={T} fontSize="17" fontWeight="700" opacity="0.6" fontFamily="DM Sans,sans-serif">z</text>
        <text x="74" y="28" fill={T} fontSize="21" fontWeight="700" opacity="0.4" fontFamily="DM Sans,sans-serif">z</text>
      </svg>
    ),
    breathing: (
      <svg viewBox="0 0 110 110" width="72" height="72">
        {/* Meditating person */}
        <circle cx="55" cy="22" r="11" fill={T} opacity="0.9"/>
        {/* Body seated */}
        <path d="M55 33 Q55 56 55 65" stroke={N} strokeWidth="5" strokeLinecap="round"/>
        {/* Cross-legged */}
        <path d="M55 65 Q42 74 32 70 Q40 78 55 76" stroke={N} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M55 65 Q68 74 78 70 Q70 78 55 76" stroke={N} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Arms out/down meditative */}
        <path d="M55 44 L34 56" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M55 44 L76 56" stroke={N} strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="33" cy="57" r="5" fill={T} opacity="0.45"/>
        <circle cx="77" cy="57" r="5" fill={T} opacity="0.45"/>
        {/* Breath rings */}
        <path d="M36 14 Q43 8 50 14 Q57 20 64 14 Q71 8 78 14" stroke={T} strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round"/>
        <path d="M40 7 Q47 1 54 7 Q61 13 68 7 Q75 1 82 7" stroke={T} strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return defs[type] || defs.track;
}

// ───────── DETAILED PLAN MODAL ─────────
function DetailedPlanView({ rec, onClose }) {
  const priorityConfig = {
    high:   { label: "Important", color: SR.danger },
    medium: { label: "Recommended", color: SR.warning },
    low:    { label: "Optional", color: SR.teal },
  };
  const p = priorityConfig[rec.priority];

  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
      background: "rgba(27,58,92,0.6)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: SR.white, borderRadius: "20px", maxWidth: "620px", width: "100%",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(27,58,92,0.3)",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 0", position: "sticky", top: 0, background: SR.white, borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div style={{ flex: 1, paddingRight: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: p.color, background: p.color + "18", padding: "3px 10px", borderRadius: "6px", fontFamily: SR.font, letterSpacing: "0.4px" }}>
                  {p.label}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: SR.teal, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: SR.font }}>
                  {rec.domain} · Detailed Plan
                </span>
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: SR.navy, margin: 0, lineHeight: 1.3, fontFamily: SR.font }}>{rec.title}</h2>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${SR.border}`,
              background: SR.white, cursor: "pointer", color: SR.muted, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontFamily: SR.font,
            }}>✕</button>
          </div>
          <div style={{ height: "1px", background: SR.borderLight, marginLeft: "-28px", marginRight: "-28px" }} />
        </div>

        {/* Steps */}
        <div style={{ padding: "20px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: SR.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px", fontFamily: SR.font }}>
            Your Action Steps
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {rec.steps.map((step, i) => (
              <div key={i} style={{
                background: SR.bg, borderRadius: "14px",
                border: `1.5px solid ${SR.borderLight}`,
                overflow: "hidden",
                display: "flex",
              }}>
                {/* Illustration panel */}
                <div style={{
                  width: 110, background: `linear-gradient(145deg, ${SR.tealLight} 0%, #EEF4FF 100%)`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: "6px", padding: "16px 8px",
                  position: "relative", flexShrink: 0,
                }}>
                  {/* Step number badge */}
                  <div style={{
                    position: "absolute", top: 8, left: 8,
                    width: 22, height: 22, borderRadius: "50%",
                    background: SR.navy, color: SR.white,
                    fontSize: "11px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SR.font, boxShadow: "0 2px 6px rgba(27,58,92,0.2)",
                  }}>
                    {i + 1}
                  </div>
                  <StepIllustration type={step.icon} />
                </div>
                {/* Content panel */}
                <div style={{ flex: 1, padding: "18px 20px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: SR.navy, marginBottom: "7px", lineHeight: 1.3, fontFamily: SR.font }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.65, fontFamily: SR.font, marginBottom: step.timing ? "10px" : 0 }}>
                    {step.desc}
                  </div>
                  {step.timing && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: SR.tealLight, padding: "4px 10px", borderRadius: "6px",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={SR.teal} strokeWidth="2.5"/><path d="M12 6v6l4 2" stroke={SR.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: SR.teal, fontFamily: SR.font }}>{step.timing}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Target Banner */}
          {rec.target && (
            <div style={{
              marginTop: "20px",
              background: `linear-gradient(135deg, ${SR.navy} 0%, ${SR.tealDark} 100%)`,
              borderRadius: "14px", padding: "20px 24px",
              display: "flex", alignItems: "center", gap: "18px",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "12px",
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", flexShrink: 0,
              }}>🎯</div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px", fontFamily: SR.font }}>
                  Your Target
                </div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: SR.white, fontFamily: SR.font, lineHeight: 1.3 }}>
                  {rec.target.label}
                </div>
                {rec.target.desc && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: SR.font, marginTop: "3px" }}>
                    {rec.target.desc}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} style={{
            marginTop: "18px", width: "100%", padding: "13px",
            borderRadius: "10px", border: "none",
            background: SR.teal, color: SR.white,
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
            fontFamily: SR.font, letterSpacing: "0.2px",
          }}>Done — Back to Plan</button>
        </div>
      </div>
    </div>
  );
}


const G = "#2ECC9B"; // bright green accent on dark
const B = "#FFFFFF"; // white strokes on navy tile

function IconExercise() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="1" y="10" width="4" height="4" rx="1" fill={G}/><rect x="19" y="10" width="4" height="4" rx="1" fill={G}/><rect x="5" y="8" width="3" height="8" rx="1" fill={B}/><rect x="16" y="8" width="3" height="8" rx="1" fill={B}/><rect x="8" y="11" width="8" height="2" rx="1" fill={B}/></svg>;
}
function IconNutrition() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C9 2 7 5 7 8c0 3 2 4 4 5v7a1 1 0 002 0v-7c2-1 4-2 4-5 0-3-2-6-5-6z" fill={G} opacity="0.35"/><path d="M12 4c-2 0-3 2.5-3 4.5S10 12 12 13s3-2 3-4.5S14 4 12 4z" fill={G}/><line x1="12" y1="13" x2="12" y2="21" stroke={B} strokeWidth="2" strokeLinecap="round"/><path d="M8.5 7.5c0-1 .5-2.5 1.5-3" stroke={B} strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function IconMetabolic() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13h6l-1 9L19 11h-6l1-9z" fill={G} opacity="0.3"/><path d="M13 2L4.5 13h6l-1 9L19 11h-6l1-9z" stroke={B} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}
function IconThermal() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="14" rx="2" fill={G} opacity="0.25"/><circle cx="12" cy="18" r="4" fill={G} opacity="0.3"/><circle cx="12" cy="18" r="3" fill={G}/><rect x="11" y="4" width="2" height="10" rx="1" fill={B}/><rect x="10" y="2" width="4" height="14" rx="2" stroke={B} strokeWidth="1.5"/><circle cx="12" cy="18" r="4" stroke={B} strokeWidth="1.5"/><line x1="16" y1="6" x2="18" y2="6" stroke={B} strokeWidth="1.2" strokeLinecap="round"/><line x1="16" y1="9" x2="18" y2="9" stroke={B} strokeWidth="1.2" strokeLinecap="round"/><line x1="16" y1="12" x2="18" y2="12" stroke={B} strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function IconSleep() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill={G} opacity="0.25"/><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke={B} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="5" r="1" fill={G}/><circle cx="20" cy="8" r="0.7" fill={G}/><circle cx="15" cy="3" r="0.7" fill={G}/></svg>;
}
function IconTracking() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill={G} opacity="0.15"/><polyline points="7,17 10,11 13,14 17,7" stroke={G} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7,17 10,11 13,14 17,7" stroke={B} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="7" r="2" fill={G}/></svg>;
}
function IconSmoking() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="14" width="15" height="4" rx="1.5" fill={G} opacity="0.25"/><rect x="2" y="14" width="15" height="4" rx="1.5" stroke={B} strokeWidth="1.5"/><rect x="2" y="14" width="5" height="4" rx="1" fill={G}/><line x1="19" y1="14" x2="19" y2="18" stroke={B} strokeWidth="1.5" strokeLinecap="round"/><path d="M19 14c0-3-1-4-3-5s-3-2-3-4" stroke={B} strokeWidth="1.3" strokeLinecap="round"/><line x1="3" y1="21" x2="21" y2="3" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"/></svg>;
}
function IconAlcohol() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 2h8l-1 8a4 4 0 01-3 3.8V19h3a1 1 0 010 2H9a1 1 0 010-2h3v-5.2A4 4 0 019 10L8 2z" fill={G} opacity="0.2"/><path d="M8 2h8l-1 8a4 4 0 01-3 3.8V19h3a1 1 0 010 2H9a1 1 0 010-2h3v-5.2A4 4 0 019 10L8 2z" stroke={B} strokeWidth="1.5" strokeLinejoin="round"/><path d="M8.5 6h7" stroke={B} strokeWidth="1.2" strokeLinecap="round"/><line x1="3" y1="21" x2="21" y2="3" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"/></svg>;
}
function IconAnemia() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 5 11 5 15a7 7 0 0014 0c0-4-7-12-7-12z" fill={G} opacity="0.25"/><path d="M12 3C12 3 5 11 5 15a7 7 0 0014 0c0-4-7-12-7-12z" stroke={B} strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 15a3 3 0 003 3" stroke={G} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function IconDefault() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" fill={G} opacity="0.15"/><rect x="5" y="2" width="14" height="20" rx="2" stroke={B} strokeWidth="1.5"/><line x1="9" y1="8" x2="15" y2="8" stroke={B} strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="12" x2="15" y2="12" stroke={B} strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="16" x2="13" y2="16" stroke={B} strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

const DOMAIN_ICONS = {
  "Exercise": IconExercise, "Nutrition": IconNutrition, "Metabolic Prep": IconMetabolic,
  "Thermal": IconThermal, "Stress & Sleep": IconSleep, "Self-Tracking": IconTracking,
  "Smoking": IconSmoking, "Alcohol": IconAlcohol, "Anemia": IconAnemia,
};
const DOMAIN_LABELS = {
  "Exercise": "Get Moving", "Nutrition": "Fuel Up", "Metabolic Prep": "Metabolic Prep",
  "Thermal": "Thermal", "Stress & Sleep": "Rest & Recover", "Self-Tracking": "Track Progress",
  "Smoking": "Quit Smoking", "Alcohol": "Alcohol", "Anemia": "Build Your Blood",
};

function PatientCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const DomainIcon = DOMAIN_ICONS[rec.domain] || IconDefault;
  const domainLabel = DOMAIN_LABELS[rec.domain] || rec.domain;
  const priorityConfig = {
    high:   { label: "Important", color: SR.danger, bg: SR.dangerBg, dot: SR.danger },
    medium: { label: "Recommended", color: SR.warning, bg: SR.warningBg, dot: SR.warning },
    low:    { label: "Optional", color: SR.teal, bg: SR.tealLight, dot: SR.teal },
  };
  const p = priorityConfig[rec.priority];

  const firstDot = rec.detail.indexOf(". ");
  const summary = firstDot > 0 && firstDot < 120 ? rec.detail.slice(0, firstDot + 1) : rec.detail.slice(0, 120) + (rec.detail.length > 120 ? "…" : "");
  const hasMore = rec.detail.length > summary.replace("…", "").length + 5;
  const lm = rec.learnMore;

  return (
    <>
      {showDetailed && rec.steps && <DetailedPlanView rec={rec} onClose={() => setShowDetailed(false)} />}
      <div style={{
        background: SR.white, borderRadius: "12px", marginBottom: "14px",
        border: `1px solid ${SR.borderLight}`, overflow: "hidden",
        boxShadow: SR.cardShadow,
      }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {/* Icon tile — navy bg, green icon */}
          <div style={{
            width: "48px", height: "48px", borderRadius: "10px", background: SR.navy,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 6px rgba(27,58,92,0.2)",
          }}>
            <DomainIcon />
          </div>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "10px", fontWeight: 700, color: p.color, background: p.bg,
                padding: "3px 10px", borderRadius: "6px", fontFamily: SR.font,
                display: "inline-flex", alignItems: "center", gap: "5px", letterSpacing: "0.3px",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.dot, display: "inline-block" }} />
                {p.label}
              </span>
              <span style={{ fontSize: "11px", color: SR.teal, fontWeight: 600, fontFamily: SR.font }}>
                {domainLabel}
              </span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: SR.text, lineHeight: 1.35, marginBottom: "8px", fontFamily: SR.font }}>
              {rec.title}
            </div>
            <div style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.65, fontFamily: SR.font }}>
              {expanded ? rec.detail : summary}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "2px" }}>
              {hasMore && (
                <button onClick={() => setExpanded(!expanded)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "6px 0 0",
                  fontSize: "12px", fontWeight: 600, color: SR.teal, fontFamily: SR.font,
                  display: "inline-flex", alignItems: "center", gap: "4px",
                }}>
                  {expanded ? "Show less ▲" : "Read more ▼"}
                </button>
              )}
              {lm && (
                <button onClick={() => { if (!showLearnMore) track("learn_more_opened", { domain: rec.domain }); setShowLearnMore(!showLearnMore); }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "6px 0 0",
                  fontSize: "12px", fontWeight: 600, color: SR.navy, fontFamily: SR.font,
                  display: "inline-flex", alignItems: "center", gap: "5px",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke={SR.navy} strokeWidth="2"/>
                    <path d="M12 8v1M12 11v5" stroke={SR.navy} strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                  {showLearnMore ? "Hide evidence ▲" : "Learn more ▼"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Learn More — Evidence Panel */}
        {lm && showLearnMore && (
          <div style={{
            margin: "0 16px 16px",
            background: SR.tealLight, borderRadius: "10px",
            border: `1px solid ${SR.teal}22`,
            padding: "16px 18px",
            animation: "fadeIn 0.2s ease",
          }}>
            {/* Why this works */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.navy, fontFamily: SR.font, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Why this works
              </div>
              <p style={{ fontSize: "13px", color: SR.text, lineHeight: 1.65, margin: 0, fontFamily: SR.font }}>
                {lm.why}
              </p>
            </div>
            {/* Evidence */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SR.navy, fontFamily: SR.font, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                What the evidence shows
              </div>
              <p style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.65, margin: 0, fontFamily: SR.font }}>
                {lm.evidence}
              </p>
            </div>
            {/* Citations */}
            {lm.citations && lm.citations.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: SR.navy, fontFamily: SR.font, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Sources
                </div>
                <ol style={{ margin: 0, paddingLeft: "18px" }}>
                  {lm.citations.map((c, i) => (
                    <li key={i} style={{ fontSize: "11px", color: SR.textSecondary, lineHeight: 1.6, marginBottom: "4px", fontFamily: SR.font }}>
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: SR.tealDark, textDecoration: "underline", textDecorationColor: `${SR.teal}55` }}>
                          {c.text}
                        </a>
                      ) : (
                        <span>{c.text}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Detailed Plan CTA — only for recommendations with structured steps */}
        {rec.steps && (
          <div style={{
            padding: "0 20px 16px",
            paddingLeft: "84px", // Align with text content (48px icon + 16px gap + 20px left pad)
          }}>
            <button onClick={() => setShowDetailed(true)} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "9px 18px", borderRadius: "9px", cursor: "pointer",
              border: `1.5px solid ${SR.teal}`,
              background: SR.tealLight, color: SR.teal,
              fontSize: "12px", fontWeight: 700, fontFamily: SR.font,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = SR.teal; e.currentTarget.style.color = SR.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = SR.tealLight; e.currentTarget.style.color = SR.teal; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 12h10M7 8h6M7 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              View Detailed Plan
              <span style={{ opacity: 0.7 }}>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function PlanCard({ rec, color }) {
  const priorityColors = { high: SR.danger, medium: SR.warning, low: SR.success };
  const priorityLabels = { high: "HIGH", medium: "MED", low: "LOW" };
  return (
    <div style={{ border: `1px solid ${SR.borderLight}`, borderLeft: `4px solid ${color}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "12px", background: SR.white, boxShadow: SR.cardShadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: SR.white, background: priorityColors[rec.priority], padding: "2px 10px", borderRadius: "10px", fontFamily: SR.font, letterSpacing: "0.3px" }}>
            {priorityLabels[rec.priority]}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: SR.muted, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: SR.font }}>{rec.domain}</span>
        </div>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: SR.text, marginBottom: "6px", fontFamily: SR.font }}>{rec.title}</div>
      <div style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.65, fontFamily: SR.font }}>
        {rec.detail.includes("\n")
          ? rec.detail.split("\n").map((line, i) => {
              const colonIdx = line.indexOf(":");
              const hasLabel = colonIdx > 0 && colonIdx < 24;
              return (
                <div key={i} style={{ marginBottom: "4px" }}>
                  {hasLabel ? (
                    <>
                      <span style={{ fontWeight: 700, color: SR.text }}>{line.slice(0, colonIdx + 1)}</span>
                      {line.slice(colonIdx + 1)}
                    </>
                  ) : line}
                </div>
              );
            })
          : rec.detail}
      </div>
    </div>
  );
}

function AlertBanner({ alert }) {
  const isDanger = alert.type === "danger";
  return (
    <div style={{
      background: isDanger ? SR.dangerBg : SR.warningBg,
      border: `1px solid ${isDanger ? SR.danger : SR.warning}30`,
      borderLeft: `4px solid ${isDanger ? SR.danger : SR.warning}`,
      borderRadius: "10px", padding: "14px 18px", marginBottom: "10px",
      display: "flex", gap: "12px", alignItems: "flex-start",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: isDanger ? SR.danger : SR.warning,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{ fontSize: "13px", fontWeight: 600, color: SR.text, lineHeight: 1.55, fontFamily: SR.font }}>{alert.text}</span>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   [TRACKING] — Progress Tracking Components
   ═══════════════════════════════════════════════════════════════ */

function CheckableItem({ title, desc, timing, done, doneAt, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0",
      borderBottom: `1px solid ${SR.borderLight}`, cursor: "pointer", minHeight: "44px",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = SR.tealLight; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: "6px", flexShrink: 0, marginTop: "1px",
        border: `2px solid ${done ? SR.teal : SR.border}`,
        background: done ? SR.teal : SR.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {done && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "14px", fontWeight: 600, color: done ? SR.muted : SR.text,
          textDecoration: done ? "line-through" : "none", fontFamily: SR.font,
          lineHeight: 1.4,
        }}>
          {title}
        </div>
        {desc && (
          <div style={{ fontSize: "12px", color: SR.textSecondary, marginTop: "3px", lineHeight: 1.5, fontFamily: SR.font }}>
            {desc}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
          {timing && (
            <span style={{
              fontSize: "10px", fontWeight: 600, color: SR.teal, background: SR.tealLight,
              padding: "2px 8px", borderRadius: "4px", fontFamily: SR.font,
            }}>{timing}</span>
          )}
          {done && doneAt && (
            <span style={{ fontSize: "10px", color: SR.muted, fontFamily: SR.font }}>
              Completed {new Date(doneAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ValueLogger({ config, values, onLog }) {
  const [val, setVal] = useState("");
  const handleLog = () => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;
    onLog({ date: new Date().toISOString().split("T")[0], value: num, unit: config.unit });
    setVal("");
  };
  const recent = (values || []).slice(-5).reverse();
  return (
    <div style={{ padding: "8px 0 4px 34px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: SR.textSecondary, fontFamily: SR.font, whiteSpace: "nowrap" }}>
          {config.label}:
        </span>
        <input type="number" value={val} onChange={e => setVal(e.target.value)}
          placeholder={config.placeholder}
          onKeyDown={e => { if (e.key === "Enter") handleLog(); }}
          style={{
            width: "90px", padding: "5px 8px", borderRadius: "6px", fontSize: "13px",
            border: `1.5px solid ${SR.border}`, fontFamily: SR.font, outline: "none",
          }}
          onFocus={e => { e.target.style.borderColor = SR.teal; }}
          onBlur={e => { e.target.style.borderColor = SR.border; }}
        />
        <span style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>{config.unit}</span>
        <button onClick={handleLog} style={{
          padding: "5px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
          background: SR.teal, color: SR.white, border: "none", cursor: "pointer",
          fontFamily: SR.font,
        }}>Log</button>
      </div>
      {recent.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
          {recent.map((entry, i) => (
            <span key={i} style={{
              fontSize: "10px", color: SR.textSecondary, background: SR.offWhite,
              padding: "2px 8px", borderRadius: "4px", fontFamily: SR.font,
            }}>
              {entry.date}: {entry.value} {entry.unit}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressSummaryBar({ progress, plan }) {
  const { done, total, pct } = computeProgress(progress, plan);
  return (
    <div style={{
      background: SR.white, borderRadius: "12px", padding: "24px",
      border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow,
      marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px" }}>
        <span style={{ fontSize: "36px", fontWeight: 700, color: SR.navy, fontFamily: SR.font }}>{pct}%</span>
        <span style={{ fontSize: "13px", color: SR.textSecondary, fontFamily: SR.font }}>{done} of {total} steps complete</span>
      </div>
      <div style={{
        height: "8px", borderRadius: "4px", background: SR.tealLight,
        overflow: "hidden", marginBottom: "12px",
      }}>
        <div style={{
          height: "100%", borderRadius: "4px", background: SR.teal,
          width: `${pct}%`, transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ fontSize: "13px", color: SR.textSecondary, fontFamily: SR.font, fontStyle: "italic" }}>
        {getMotivationalMessage(pct)}
      </div>
    </div>
  );
}

function ProgressDomainCard({ domain, recs, progress, onToggleStep, onToggleRec, onLogValue }) {
  const DomainIcon = DOMAIN_ICONS[domain] || IconDefault;
  const domainLabel = DOMAIN_LABELS[domain] || domain;
  const logConfig = VALUE_LOG_CONFIG[domain];

  let domainDone = 0, domainTotal = 0;
  recs.forEach(rec => {
    const key = recKey(rec);
    const item = progress.items[key];
    if (rec.steps && rec.steps.length > 0) {
      rec.steps.forEach((_, i) => { domainTotal++; if (item?.steps?.[i]?.done) domainDone++; });
    } else {
      domainTotal++; if (item?.completed) domainDone++;
    }
  });
  const domainPct = domainTotal > 0 ? Math.round((domainDone / domainTotal) * 100) : 0;

  return (
    <div style={{
      background: SR.white, borderRadius: "12px", marginBottom: "16px",
      border: `1px solid ${SR.borderLight}`, overflow: "hidden", boxShadow: SR.cardShadow,
    }}>
      {/* Header */}
      <div style={{
        background: SR.navy, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <DomainIcon />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: SR.white, fontFamily: SR.font }}>{domainLabel}</div>
        </div>
        <span style={{
          fontSize: "12px", fontWeight: 700, color: SR.teal, background: "rgba(13,124,102,0.2)",
          padding: "3px 10px", borderRadius: "6px", fontFamily: SR.font,
        }}>{domainDone}/{domainTotal}</span>
      </div>
      {/* Progress bar */}
      <div style={{ height: "4px", background: SR.tealLight }}>
        <div style={{ height: "100%", background: SR.teal, width: `${domainPct}%`, transition: "width 0.3s ease" }} />
      </div>
      {/* Items */}
      <div style={{ padding: "6px 18px 14px" }}>
        {recs.map((rec, ri) => {
          const key = recKey(rec);
          const item = progress.items[key];
          if (rec.steps && rec.steps.length > 0) {
            return (
              <div key={ri}>
                <div style={{
                  fontSize: "13px", fontWeight: 700, color: SR.navy, padding: "10px 0 4px",
                  fontFamily: SR.font, borderBottom: `1px solid ${SR.borderLight}`,
                }}>{rec.title}</div>
                {rec.steps.map((s, si) => (
                  <div key={si}>
                    <CheckableItem
                      title={s.title}
                      desc={s.desc}
                      timing={s.timing}
                      done={item?.steps?.[si]?.done || false}
                      doneAt={item?.steps?.[si]?.doneAt}
                      onToggle={() => onToggleStep(key, si)}
                    />
                    {si === 0 && logConfig && (
                      <ValueLogger
                        config={logConfig}
                        values={item?.loggedValues}
                        onLog={(entry) => onLogValue(key, entry)}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={ri}>
              <CheckableItem
                title={rec.title}
                desc={rec.detail.length > 100 ? rec.detail.slice(0, 100) + "..." : rec.detail}
                done={item?.completed || false}
                doneAt={item?.completedAt}
                onToggle={() => onToggleRec(key)}
              />
              {logConfig && (
                <ValueLogger
                  config={logConfig}
                  values={item?.loggedValues}
                  onLog={(entry) => onLogValue(key, entry)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressTracker({ plan, data, progress, onToggleStep, onToggleRec, onLogValue, onViewPlan, onReset, session, onSignIn, onSignOut }) {
  const riskColor = { low: SR.success, elevated: SR.warning, high: SR.danger };

  // Group recs by domain
  const domains = {};
  (plan.patient || []).forEach(rec => {
    if (!domains[rec.domain]) domains[rec.domain] = [];
    domains[rec.domain].push(rec);
  });

  return (
    <div style={{ fontFamily: SR.font, background: SR.bg, minHeight: "100vh", paddingTop: "100px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <SRLogo size={38} />
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: SR.navy, margin: 0 }}>
                {data.firstName ? `${data.firstName}'s Progress` : "Your Progress"}
              </h1>
              <p style={{ fontSize: "12px", color: SR.muted, margin: "3px 0 0" }}>
                {data.surgeryType || "Surgery"} • {data.weeksUntil || "?"} weeks out • Risk: <span style={{ fontWeight: 700, color: riskColor[plan.riskLevel] }}>{plan.riskLevel.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button onClick={onViewPlan} style={{
              padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${SR.teal}`, background: SR.white, color: SR.teal,
              fontFamily: SR.font, transition: "all 0.2s",
            }}>View Plan</button>
            <button onClick={onReset} style={{
              padding: "7px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
              border: `1.5px solid ${SR.border}`, background: SR.white, color: SR.muted,
              fontFamily: SR.font, transition: "all 0.2s",
            }}>Start Over</button>
          </div>
        </div>

        <ProgressSummaryBar progress={progress} plan={plan} />

        {Object.keys(domains).map(domain => (
          <ProgressDomainCard
            key={domain}
            domain={domain}
            recs={domains[domain]}
            progress={progress}
            onToggleStep={onToggleStep}
            onToggleRec={onToggleRec}
            onLogValue={onLogValue}
          />
        ))}

        {/* Auth status */}
        {!session ? (
          <div style={{
            background: SR.white, borderRadius: "12px", padding: "16px 20px",
            border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow,
            display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
            marginTop: "20px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={SR.teal} strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={SR.teal} strokeWidth="2" strokeLinecap="round"/></svg>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: SR.navy, fontFamily: SR.font }}>Your progress is session-only</div>
              <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>Sign in to save it across visits.</div>
            </div>
            <button onClick={onSignIn} style={{
              padding: "7px 16px", borderRadius: "8px", background: SR.teal, color: SR.white,
              border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: SR.font,
            }}>Sign in</button>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", marginTop: "20px", fontSize: "12px", color: SR.muted, fontFamily: SR.font,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={SR.teal} strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke={SR.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Progress saved • {session.user.email}
            <button onClick={onSignOut} style={{
              background: "none", border: "none", color: SR.muted, fontSize: "11px",
              cursor: "pointer", fontFamily: SR.font, textDecoration: "underline", padding: 0,
            }}>Sign out</button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", color: SR.muted }}>
          Powered by <span style={{ fontWeight: 700, color: SR.navy }}>SurgeryReady</span> • Health before healthcare
        </div>
      </div>
    </div>
  );
}

function PlanChoiceScreen({ plan, data, progress, onViewPlan, onTrackProgress, session, onSignIn, onSignOut }) {
  const riskColor = { low: SR.success, elevated: SR.warning, high: SR.danger };
  const stats = progress ? computeProgress(progress, plan) : null;
  const hasProgress = stats && stats.done > 0;

  const CardOption = ({ icon, title, subtitle, onClick, accent }) => (
    <div onClick={onClick} style={{
      background: SR.white, borderRadius: "14px", padding: "32px 28px",
      border: `2px solid ${SR.borderLight}`, cursor: "pointer",
      boxShadow: SR.cardShadow, transition: "all 0.25s", textAlign: "center",
      flex: "1 1 280px", minWidth: "240px",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent || SR.teal; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(27,58,92,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = SR.borderLight; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SR.cardShadow; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: "14px", background: accent || SR.teal,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 18px",
      }}>{icon}</div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, fontFamily: SR.font, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: SR.textSecondary, lineHeight: 1.6, fontFamily: SR.font }}>{subtitle}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: SR.font, background: SR.bg, minHeight: "100vh", paddingTop: "100px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <SRLogo size={38} />
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: SR.navy, margin: 0 }}>
              {data.firstName ? `${data.firstName}, your plan is ready` : "Your plan is ready"}
            </h1>
            <p style={{ fontSize: "12px", color: SR.muted, margin: "3px 0 0" }}>
              {data.surgeryType || "Surgery"} • {data.weeksUntil || "?"} weeks out • Risk: <span style={{ fontWeight: 700, color: riskColor[plan.riskLevel] }}>{plan.riskLevel.toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Choice cards */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
          <CardOption
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="white" strokeWidth="2"/><path d="M9 8h6M9 12h6M9 16h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            title="View My Plan"
            subtitle="See your full preparation plan with everything you need to do before surgery."
            onClick={onViewPlan}
            accent={SR.navy}
          />
          <CardOption
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/></svg>}
            title={hasProgress ? "Resume Tracking" : "Track My Progress"}
            subtitle={hasProgress
              ? `You are ${stats.pct}% complete. Pick up where you left off.`
              : "Check off each step as you go. Log your numbers. See how far you have come."
            }
            onClick={onTrackProgress}
            accent={SR.teal}
          />
        </div>

        {/* Auth prompt */}
        {!session ? (
          <div style={{
            background: SR.white, borderRadius: "12px", padding: "18px 22px",
            border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow,
            display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
            marginBottom: "20px",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={SR.teal} strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={SR.teal} strokeWidth="2" strokeLinecap="round"/></svg>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: SR.navy, fontFamily: SR.font }}>Sign in to save your progress</div>
              <div style={{ fontSize: "11px", color: SR.muted, fontFamily: SR.font }}>Track your plan across visits. No password needed.</div>
            </div>
            <button onClick={onSignIn} style={{
              padding: "8px 18px", borderRadius: "8px", background: SR.teal, color: SR.white,
              border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: SR.font,
            }}>Sign in</button>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", marginBottom: "20px", fontSize: "12px", color: SR.muted, fontFamily: SR.font,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={SR.teal} strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke={SR.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Signed in as {session.user.email}
            <button onClick={onSignOut} style={{
              background: "none", border: "none", color: SR.muted, fontSize: "11px",
              cursor: "pointer", fontFamily: SR.font, textDecoration: "underline", padding: 0,
            }}>Sign out</button>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: "10px", color: SR.muted }}>
          Powered by <span style={{ fontWeight: 700, color: SR.navy }}>SurgeryReady</span> • Health before healthcare
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   [PREOP-PAGE] — Pre-Operative Assessment Page
   ═══════════════════════════════════════════════════════════════ */
function PreOpPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => ({
    providerAck: sessionStorage.getItem("sr_provider_ack") === "1" || undefined,
  }));
  const [plan, setPlan] = useState(null);
  const [viewMode, setViewMode] = useState("both");
  const [mode, setMode] = useState(null); // null = choice screen, "view" = plan, "track" = tracking
  const [progress, setProgress] = useState(null);

  // Disclaimer acknowledgment (once per session)
  const [disclaimerAck, setDisclaimerAck] = useState(
    () => sessionStorage.getItem("sr_disclaimer_ack") === "1"
  );
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Auth + persistence state
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [resumeData, setResumeData] = useState(null); // { data, plan, progress, planId }
  const [loadingSession, setLoadingSession] = useState(!!supabase);
  const saveTimerRef = useRef(null);

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) { setLoadingSession(false); return; }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // If user just signed in and we have a plan, save it
      if (s && plan && !planId) {
        savePlanToSupabase(s.user.id, data, plan).then(id => {
          if (id) {
            setPlanId(id);
            if (progress) saveProgressToSupabase(id, progress);
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing plan for authenticated user
  useEffect(() => {
    if (!session || plan || resumeData) return;
    loadLatestPlan(session.user.id).then(result => {
      if (result) setResumeData(result);
    });
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save progress to Supabase (debounced)
  useEffect(() => {
    if (!session || !planId || !progress) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProgressToSupabase(planId, progress);
    }, 1500);
    return () => clearTimeout(saveTimerRef.current);
  }, [progress, planId, session]);

  const update = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const goNext = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  const generate = () => {
    const newPlan = generatePlan(data);
    track("assessment_completed", { role: data.userRole, riskLevel: newPlan.riskLevel });
    setPlan(newPlan);
    setProgress(initProgress(newPlan));
    setMode(null); // show choice screen
    window.scrollTo(0, 0);
    setViewMode(data.userRole === "patient" ? "patient" : data.userRole === "provider" ? "provider" : "both");
    // Save to Supabase if authenticated
    if (session) {
      savePlanToSupabase(session.user.id, data, newPlan).then(id => {
        if (id) setPlanId(id);
      });
    }
  };
  const reset = () => { setStep(0); setData({}); setPlan(null); setMode(null); setProgress(null); setPlanId(null); setResumeData(null); };
  const handleResume = () => {
    if (!resumeData) return;
    setData(resumeData.data);
    setPlan(resumeData.plan);
    setProgress(resumeData.progress.items && Object.keys(resumeData.progress.items).length > 0 ? resumeData.progress : initProgress(resumeData.plan));
    setPlanId(resumeData.planId);
    setMode(null); // show choice screen
    setResumeData(null);
    setViewMode(resumeData.data.userRole === "patient" ? "patient" : resumeData.data.userRole === "provider" ? "provider" : "both");
  };
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setPlanId(null);
    setResumeData(null);
  };

  // Progress tracking handlers
  const handleToggleStep = useCallback((itemKey, stepIndex) => {
    setProgress(prev => {
      if (!prev) return prev;
      const next = { ...prev, items: { ...prev.items }, updatedAt: new Date().toISOString() };
      const item = { ...(next.items[itemKey] || { completed: false, steps: {}, loggedValues: [] }) };
      const steps = { ...item.steps };
      const wasDone = steps[stepIndex]?.done;
      steps[stepIndex] = { done: !wasDone, doneAt: !wasDone ? new Date().toISOString() : null };
      item.steps = steps;
      // Auto-complete if all steps done
      const allDone = Object.values(steps).every(s => s.done);
      item.completed = allDone;
      item.completedAt = allDone ? new Date().toISOString() : null;
      next.items[itemKey] = item;
      return next;
    });
  }, []);

  const handleToggleRec = useCallback((itemKey) => {
    setProgress(prev => {
      if (!prev) return prev;
      const next = { ...prev, items: { ...prev.items }, updatedAt: new Date().toISOString() };
      const item = { ...(next.items[itemKey] || { completed: false, steps: {}, loggedValues: [] }) };
      item.completed = !item.completed;
      item.completedAt = item.completed ? new Date().toISOString() : null;
      next.items[itemKey] = item;
      return next;
    });
  }, []);

  const handleLogValue = useCallback((itemKey, entry) => {
    setProgress(prev => {
      if (!prev) return prev;
      const next = { ...prev, items: { ...prev.items }, updatedAt: new Date().toISOString() };
      const item = { ...(next.items[itemKey] || { completed: false, steps: {}, loggedValues: [] }) };
      item.loggedValues = [...(item.loggedValues || []), entry];
      next.items[itemKey] = item;
      return next;
    });
  }, []);

  const stepComponents = [
    <StepDemographics data={data} update={update} />,
    <StepSurgery data={data} update={update} />,
    <StepMedical data={data} update={update} />,
    <StepMedications data={data} update={update} />,
    <StepFitness data={data} update={update} />,
    <StepNutrition data={data} update={update} />,
  ];

  // ── WELCOME BACK / RESUME ──
  if (!plan && resumeData && !loadingSession) {
    return (
      <div style={{ fontFamily: SR.font, background: SR.bg, minHeight: "100vh", paddingTop: "100px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
            <SRLogo size={38} />
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: SR.navy, margin: 0 }}>Welcome back{resumeData.data.firstName ? `, ${resumeData.data.firstName}` : ""}</h1>
              <p style={{ fontSize: "13px", color: SR.muted, margin: "4px 0 0" }}>
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div style={{
            background: SR.white, borderRadius: "14px", padding: "28px 24px",
            border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow, marginBottom: "16px",
          }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: SR.navy, marginBottom: "6px" }}>
              You have a saved plan
            </div>
            <p style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.6, margin: "0 0 8px" }}>
              {resumeData.data.surgeryType || "Surgery"} preparation plan
              {(() => { const s = computeProgress(resumeData.progress, resumeData.plan); return s.total > 0 ? ` - ${s.pct}% complete (${s.done} of ${s.total} steps)` : ""; })()}
            </p>
            <button onClick={handleResume} style={{
              width: "100%", padding: "13px", borderRadius: "10px",
              background: SR.teal, color: SR.white, border: "none",
              fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: SR.font,
              marginTop: "8px",
            }}>Resume my plan</button>
          </div>
          <button onClick={() => { setResumeData(null); }} style={{
            width: "100%", padding: "13px", borderRadius: "10px",
            background: SR.white, color: SR.textSecondary, border: `1.5px solid ${SR.border}`,
            fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: SR.font,
          }}>Start a new assessment</button>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={handleSignOut} style={{
              background: "none", border: "none", color: SR.muted, fontSize: "12px",
              cursor: "pointer", fontFamily: SR.font, textDecoration: "underline",
            }}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAN CHOICE SCREEN ──
  if (plan && mode === null) {
    const isPatient = data.userRole === "patient" || !data.userRole;
    if (isPatient && plan.patient.length > 0) {
      return (
        <>
          <PlanChoiceScreen
            plan={plan} data={data} progress={progress}
            onViewPlan={() => setMode("view")}
            onTrackProgress={() => setMode("track")}
            session={session}
            onSignIn={() => setShowAuth(true)}
            onSignOut={handleSignOut}
          />
          <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
        </>
      );
    }
    // Provider-only or no patient recs — go straight to plan view
    setMode("view");
  }

  // ── PROGRESS TRACKING ──
  if (plan && mode === "track") {
    return (
      <>
        <ProgressTracker
          plan={plan} data={data} progress={progress}
          onToggleStep={handleToggleStep}
          onToggleRec={handleToggleRec}
          onLogValue={handleLogValue}
          onViewPlan={() => setMode("view")}
          onReset={reset}
          session={session}
          onSignIn={() => setShowAuth(true)}
          onSignOut={handleSignOut}
        />
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  if (plan && mode === "view") {
    const riskBg = { low: SR.tealLight, elevated: SR.warningBg, high: SR.dangerBg };
    const riskColor = { low: SR.success, elevated: SR.warning, high: SR.danger };
    const showPatient = viewMode === "both" || viewMode === "patient";
    const showProvider = viewMode === "both" || viewMode === "provider";

    return (
      <div style={{ fontFamily: SR.font, background: SR.bg, minHeight: "100vh", paddingTop: "100px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* SR Plan Header */}
          <div className="sr-plan-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <SRLogo size={38} />
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: SR.navy, margin: 0 }}>
                  {data.firstName ? `${data.firstName}'s Readiness Plan` : "Your Readiness Plan"}
                </h1>
                <p style={{ fontSize: "12px", color: SR.muted, margin: "3px 0 0" }}>
                  {data.surgeryType || "Surgery"} • {data.weeksUntil || "?"} weeks out • Risk: <span style={{ fontWeight: 700, color: riskColor[plan.riskLevel] }}>{plan.riskLevel.toUpperCase()}</span>
                </p>
              </div>
            </div>
            <div className="sr-plan-buttons" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["both", "patient", "provider"].map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${viewMode === m ? SR.teal : SR.border}`,
                  background: viewMode === m ? SR.teal : SR.white,
                  color: viewMode === m ? SR.white : SR.textSecondary,
                  fontFamily: SR.font, transition: "all 0.2s",
                }}>
                  {m === "both" ? "Both Tracks" : m === "patient" ? "Patient View" : "Provider View"}
                </button>
              ))}
              {(data.userRole === "patient" || !data.userRole) && plan.patient.length > 0 && (
                <button onClick={() => setViewMode("timeline")} style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${viewMode === "timeline" ? SR.teal : SR.border}`,
                  background: viewMode === "timeline" ? SR.teal : SR.white,
                  color: viewMode === "timeline" ? SR.white : SR.textSecondary,
                  fontFamily: SR.font, transition: "all 0.2s",
                }}>
                  My Timeline
                </button>
              )}
              <button onClick={() => {
                const el = document.getElementById("readiness-plan-printable");
                const title = (data.firstName ? data.firstName + "s" : "Your") + " Surgical Readiness Plan - SurgeryReady";
                const w = window.open("", "_blank");
                w.document.write("<html><head><title>" + title + "</title><link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' rel='stylesheet'><style>body{font-family:'DM Sans',sans-serif;color:#1A2B3C;padding:40px;max-width:1000px;margin:0 auto}@media print{body{padding:20px}button,.no-print{display:none!important}}</style></head><body>" + el.innerHTML + "</body></html>");
                w.document.close();
                setTimeout(() => { w.print(); }, 600);
              }} style={{
                padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${SR.teal}`, background: SR.white, color: SR.teal,
                fontFamily: SR.font, transition: "all 0.2s",
              }}>Download PDF</button>
              {(data.userRole === "patient" || !data.userRole) && plan.patient.length > 0 && (
                <button onClick={() => setMode("track")} style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${SR.teal}`, background: SR.teal, color: SR.white,
                  fontFamily: SR.font, transition: "all 0.2s",
                }}>Track Progress</button>
              )}
              <button onClick={reset} style={{
                padding: "7px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
                border: `1.5px solid ${SR.border}`, background: SR.white, color: SR.muted,
                fontFamily: SR.font, transition: "all 0.2s",
              }}>Start Over</button>
            </div>
          </div>

          {/* Personalized greeting */}
          {data.firstName && (
            <div style={{ marginBottom: "20px", padding: "18px 22px", background: SR.white, borderRadius: "12px", border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: SR.navy, fontFamily: SR.font }}>
                Hello {data.firstName}, here is your personalized surgical readiness plan.
              </div>
              <div style={{ fontSize: "13px", color: SR.textSecondary, marginTop: "4px", fontFamily: SR.font }}>
                Based on your profile, we've generated tailored recommendations for both you and your care team.
              </div>
            </div>
          )}

          <div id="readiness-plan-printable">

          {plan.alerts.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: SR.danger, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Critical Alerts</div>
              {plan.alerts.map((a, i) => <AlertBanner key={i} alert={a} />)}
            </div>
          )}

          <div style={{ background: riskBg[plan.riskLevel], border: `1px solid ${riskColor[plan.riskLevel]}30`, borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: riskColor[plan.riskLevel], textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Perioperative Risk: {plan.riskLevel.toUpperCase()}
            </span>
            <span style={{ fontSize: "12px", color: SR.textSecondary, marginLeft: "12px" }}>
              {plan.riskLevel === "low" ? "Standard preoperative pathway. Focus on patient preparation." :
               plan.riskLevel === "elevated" ? "Enhanced evaluation recommended. Consider biomarkers and targeted optimization." :
               "Comprehensive evaluation required. All provider protocols activated. Consider cardiology/specialty consultation."}
            </span>
          </div>

          {viewMode === "timeline" && (
            <TimelineView data={data} plan={plan} />
          )}

          <div className="sr-plan-grid" style={{ display: viewMode === "timeline" ? "none" : "grid", gridTemplateColumns: showPatient && showProvider ? "1fr 1fr" : "1fr", gap: "28px" }}>
            {showPatient && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "12px", borderBottom: `3px solid ${SR.teal}` }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px", background: SR.teal,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3" fill="white"/><path d="M12 10c-3 0-5 2-5 5v4a1 1 0 001 1h8a1 1 0 001-1v-4c0-3-2-5-5-5z" fill="white" opacity="0.7"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: SR.navy }}>Your Preparation Plan</div>
                    <div style={{ fontSize: "11px", color: SR.muted }}>{plan.patient.length} action items</div>
                  </div>
                </div>
                {plan.patient.sort((a, b) => {
                  const p = { high: 0, medium: 1, low: 2 };
                  return p[a.priority] - p[b.priority];
                }).map((r, i) => <PatientCard key={i} rec={r} />)}
              </div>
            )}
            {showProvider && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "12px", borderBottom: `3px solid ${SR.navy}` }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px", background: SR.navy,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v6m0 0v6m0-6h6m-6 0H6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><rect x="3" y="16" width="18" height="5" rx="2" fill="white" opacity="0.7"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: SR.navy }}>Provider Optimization Track</div>
                    <div style={{ fontSize: "11px", color: SR.muted }}>{plan.provider.length} clinical items</div>
                  </div>
                </div>
                {plan.provider.sort((a, b) => {
                  const p = { high: 0, medium: 1, low: 2 };
                  return p[a.priority] - p[b.priority];
                }).map((r, i) => <PlanCard key={i} rec={r} color={SR.providerNavy} />)}
              </div>
            )}
          </div>

          <div style={{ marginTop: "32px", padding: "18px 20px", background: SR.white, borderRadius: "12px", border: `1px solid ${SR.borderLight}` }}>
            <div style={{ fontSize: "11px", color: SR.muted, lineHeight: 1.7, marginBottom: "10px" }}>
              <strong style={{ color: SR.textSecondary }}>Important:</strong> This plan is for informational purposes only and does not constitute medical advice. Always consult your physician, surgeon, and anesthesiologist before making changes to your medications, diet, exercise routine, or other health behaviors. Individual circumstances vary — your care team has information about your health that this tool does not.
            </div>
            <div style={{ fontSize: "11px", color: SR.muted, lineHeight: 1.7, borderTop: `1px solid ${SR.borderLight}`, paddingTop: "10px" }}>
              <strong style={{ color: SR.textSecondary }}>Clinical note:</strong> This tool generates recommendations based on population-level evidence and guidelines (2024 AHA/ACC, ASRA 5th Ed 2025, ESAIC 2025, Multi-Society GLP-1 RA Guidance 2024). It is a clinical decision support tool and does not replace physician judgment or establish a standard of care. The treating physician, surgeon, and anesthesiologist retain full clinical and legal responsibility for all decisions and patient outcomes. All recommendations must be reviewed, verified, and individualized by the responsible clinician. SurgeryReady assumes no liability for clinical outcomes resulting from use of this tool.
            </div>
          </div>
          </div>{/* end readiness-plan-printable */}

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", color: SR.muted }}>
            Powered by <span style={{ fontWeight: 700, color: SR.navy }}>SurgeryReady</span> • Health before healthcare
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SR.font, background: SR.bg, minHeight: "100vh", paddingTop: "100px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* SR Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
          <SRLogo size={40} />
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, lineHeight: 1.2 }}>SurgeryReady</div>
            <div style={{ fontSize: "11px", color: SR.muted, fontWeight: 500, letterSpacing: "0.3px" }}>Health before healthcare™</div>
          </div>
        </div>

        {/* Disclaimer acknowledgment banner */}
        {!disclaimerAck && (
          <div style={{
            background: SR.white, borderRadius: "12px", padding: "22px 24px",
            border: `1px solid ${SR.border}`, boxShadow: SR.cardShadow, marginBottom: "24px",
          }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: SR.navy, marginBottom: "10px", fontFamily: SR.font }}>
              Before you begin
            </div>
            <p style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.7, margin: "0 0 18px", fontFamily: SR.font }}>
              SurgeryReady is a health information tool. The content it provides is for general informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult your physician, surgeon, and anesthesiologist before making any changes to your health behaviors, medications, or preparation routine.
            </p>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={e => setDisclaimerChecked(e.target.checked)}
                style={{ marginTop: "2px", accentColor: SR.teal, width: "16px", height: "16px", flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: "13px", color: SR.text, lineHeight: 1.6, fontFamily: SR.font }}>
                I understand that SurgeryReady provides general health information only and is not a substitute for professional medical advice. I will consult my physician and care team before making any changes.
              </span>
            </label>
            <button
              disabled={!disclaimerChecked}
              onClick={() => { sessionStorage.setItem("sr_disclaimer_ack", "1"); setDisclaimerAck(true); track("assessment_started"); }}
              style={{
                marginTop: "18px", width: "100%", padding: "12px",
                borderRadius: "10px", border: "none", fontFamily: SR.font,
                fontSize: "14px", fontWeight: 600,
                background: disclaimerChecked ? SR.teal : SR.borderLight,
                color: disclaimerChecked ? SR.white : SR.muted,
                cursor: disclaimerChecked ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              Continue to assessment
            </button>
          </div>
        )}

        {/* Numbered Progress Steps + Card + Navigation (only after disclaimer ack) */}
        {disclaimerAck && <>
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const canClick = i <= step;
            return (
              <div key={s} style={{ flex: 1, cursor: canClick ? "pointer" : "default" }} onClick={() => { if (canClick) setStep(i); }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", fontSize: "10px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: done ? SR.teal : active ? SR.navy : "transparent",
                    color: done || active ? SR.white : SR.muted,
                    border: `1.5px solid ${done ? SR.teal : active ? SR.navy : SR.border}`,
                    transition: "all 0.3s",
                  }}>{done ? "✓" : STEP_NUMS[i]}</div>
                  <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: done ? SR.teal : active ? SR.navy : SR.border, transition: "background 0.3s" }} />
                </div>
                <div style={{ fontSize: "10px", color: active ? SR.navy : done ? SR.teal : SR.muted, fontWeight: active ? 700 : 500, textAlign: "left", paddingLeft: "2px" }}>
                  {STEP_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div style={{ background: SR.white, borderRadius: "14px", padding: "32px", border: `1px solid ${SR.borderLight}`, boxShadow: SR.cardShadow }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: SR.navy, margin: "0 0 24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: SR.teal, fontSize: "13px", fontWeight: 700 }}>{STEP_NUMS[step]}</span>
            {STEP_LABELS[step]}
          </h2>
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button onClick={goBack} disabled={step === 0} style={{
            padding: "11px 28px", borderRadius: "10px", border: `1.5px solid ${step === 0 ? SR.borderLight : SR.border}`,
            background: SR.white, color: step === 0 ? SR.border : SR.textSecondary,
            cursor: step === 0 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600,
            fontFamily: SR.font, transition: "all 0.2s",
          }}>Back</button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={step === 0 && data.userRole === "provider" && !data.providerAck}
              style={{
                padding: "11px 32px", borderRadius: "10px", border: "none",
                background: (step === 0 && data.userRole === "provider" && !data.providerAck) ? SR.borderLight : SR.teal,
                color: (step === 0 && data.userRole === "provider" && !data.providerAck) ? SR.muted : SR.white,
                cursor: (step === 0 && data.userRole === "provider" && !data.providerAck) ? "not-allowed" : "pointer",
                fontSize: "14px", fontWeight: 600, fontFamily: SR.font,
                boxShadow: (step === 0 && data.userRole === "provider" && !data.providerAck) ? "none" : "0 2px 8px rgba(13,124,102,0.25)",
                transition: "all 0.2s",
              }}
            >Continue</button>
          ) : (
            <button onClick={generate} style={{
              padding: "11px 32px", borderRadius: "10px", border: "none",
              background: `linear-gradient(135deg, ${SR.navy} 0%, ${SR.tealDark} 100%)`,
              color: SR.white, cursor: "pointer",
              fontSize: "14px", fontWeight: 700, fontFamily: SR.font,
              boxShadow: "0 3px 12px rgba(27,58,92,0.3)", transition: "all 0.2s",
            }}>Generate Readiness Plan</button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "10px", color: SR.muted }}>
          Powered by <span style={{ fontWeight: 700, color: SR.navy }}>SurgeryReady</span> • Health before healthcare™
        </div>
        </>}
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
      <ResponsiveStyles />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
      <Nav currentPage={page} onNavigate={setPage} />
      {pages[page]}
      <Footer />
    </div>
  );
}
