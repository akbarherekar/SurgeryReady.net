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
              <button key={r.value} onClick={() => update("userRole", r.value)} style={{
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
    { key: "cardiac", label: "Cardiovascular", items: ["CAD/Angina", "CHF", "Valvular disease", "Arrhythmia/AF", "Pacemaker/AICD", "Cardiomyopathy/HCM", "Prior MI (within 6 months)", "Prior PCI/stent", "Peripheral vascular disease", "Prior stroke", "Uncontrolled HTN (DBP >110)"] },
    { key: "respiratory", label: "Respiratory", items: ["COPD/Emphysema", "Asthma", "OSA (diagnosed)", "OSA (suspected/STOP-BANG ≥3)", "Unexplained dyspnea"] },
    { key: "endocrine", label: "Endocrine / Metabolic", items: ["Type 1 Diabetes", "Type 2 Diabetes", "HbA1c > 8", "Insulin pump", "Pheochromocytoma", "Adrenal disease"] },
    { key: "other", label: "Other", items: ["Cirrhosis/liver disease", "Renal insufficiency/dialysis", "Anemia (Hgb <13)", "Bleeding disorder", "Sickle cell disease", "Seizure disorder", "Myasthenia gravis", "Rheumatoid arthritis", "Down syndrome", "Active cancer/chemo", "History of MH", "Difficult airway history", "Frailty/recent falls"] },
  ];
  const showCigPerDay = data.smokingStatus === "current";
  const showAlcoholSub = data.alcoholUse === "moderate" || data.alcoholUse === "heavy";
  return (
    <>
      {categories.map(cat => (
        <Field key={cat.key} label={cat.label}>
          <MultiChip options={cat.items} selected={data[cat.key] || []} onChange={v => update(cat.key, v)} />
        </Field>
      ))}

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
      });
    }
  } else {
    patient.push({ domain: "Exercise", priority: "high", title: "Exercise — Physician Clearance Required", detail: "Active cardiac conditions detected (recent MI or uncontrolled HTN). Do NOT begin exercise program without explicit physician clearance. Gentle ambulation may be acceptable — discuss with your care team." });
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
  });

  if (surgeryTags.includes("Cancer resection") || other.includes("Active cancer/chemo")) {
    patient.push({ domain: "Nutrition", priority: "high", title: "Immunonutrition Recommended", detail: "Cancer surgery patients benefit from preoperative immunonutrition (arginine, omega-3, nucleotides) for minimum 5–7 days before surgery. Evidence: 54% reduction in infectious complications (OR 0.46). Discuss with your surgical team about starting Impact Advanced Recovery or equivalent formula." });
  }

  patient.push({ domain: "Nutrition", priority: "medium", title: "Preoperative Carbohydrate Loading", detail: "Day before surgery: 800 mL carbohydrate-rich clear drink in the evening. Morning of surgery: 400 mL carbohydrate drink 2–3 hours before (confirm with anesthesia team). This reduces insulin resistance, anxiety, and hunger. Do NOT fast from midnight — modern evidence supports carb loading per ERAS protocols." });

  // ── PATIENT TRACK: FASTING / METABOLIC ──
  const isDiabetic = endocrine.some(e => e.includes("Diabetes") || e.includes("HbA1c"));
  if (!isDiabetic && weeks >= 3) {
    patient.push({ domain: "Metabolic Prep", priority: "medium", title: "Consider Strategic Intermittent Fasting", detail: "If not already practicing: consider 14:10 or 16:8 time-restricted eating starting 3+ weeks before surgery. This activates AMPK/SIRT1/autophagy pathways that precondition cells against surgical stress. STOP fasting 3 days before surgery and switch to carbohydrate loading. NOTE: This is a directional recommendation based on strong preclinical evidence; human surgical RCTs are still emerging." });
  } else if (isDiabetic) {
    patient.push({ domain: "Metabolic Prep", priority: "low", title: "Fasting Protocol — Not Recommended", detail: "Given diabetes/metabolic conditions, strategic fasting is NOT recommended without close endocrine supervision. Focus instead on blood glucose optimization and carbohydrate loading per ERAS protocol." });
  }

  // ── PATIENT TRACK: THERMAL ──
  const thermalContraindicated = cardiac.includes("CAD/Angina") || cardiac.includes("Prior MI (within 6 months)") || cardiac.includes("Uncontrolled HTN (DBP >110)") || cardiac.includes("Cardiomyopathy/HCM");
  if (!thermalContraindicated && weeks >= 4) {
    const currentThermal = d.thermalHabits || [];
    if (currentThermal.includes("None") || currentThermal.length === 0) {
      patient.push({ domain: "Thermal", priority: "low", title: "Consider Gradual Thermal Conditioning", detail: "If accessible and cleared by physician: begin with short sauna sessions (10 min at moderate temperature) or cool (not ice cold) water exposure. Build gradually over weeks. Heat exposure upregulates HSPs and Nrf2 pathways; cold trains autonomic flexibility. This is an emerging area — no surgical outcome RCTs exist yet." });
    } else {
      patient.push({ domain: "Thermal", priority: "low", title: "Continue Thermal Conditioning", detail: "Continue your current sauna/cold exposure practice through preparation. Reduce intensity in the final 3 days before surgery. Evidence supports HSP upregulation (heat) and autonomic flexibility training (cold) as relevant to surgical stress tolerance." });
    }
  } else if (thermalContraindicated) {
    patient.push({ domain: "Thermal", priority: "medium", title: "Thermal Conditioning — Contraindicated", detail: "Active cardiac conditions detected. Sauna and cold exposure are NOT recommended given risk of hemodynamic instability. Focus preparation on gentle exercise, nutrition, and stress reduction." });
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
  });

  // ── PATIENT TRACK: SELF-TRACKING ──
  if (d.tracksHRV === "yes") {
    patient.push({ domain: "Self-Tracking", priority: "medium", title: "Track HRV Trend", detail: "Monitor your HRV weekly. Aim for an upward trend during prehabilitation — rising HRV reflects improving autonomic flexibility. A drop in HRV in the days before surgery may indicate overtraining or stress — scale back if this occurs." });
  }
  patient.push({ domain: "Self-Tracking", priority: "low", title: "Weekly Readiness Check-In", detail: "Track weekly: grip strength (if dynamometer available), walking endurance (timed walk), energy level (1–10), sleep quality (1–10), protein intake adherence. These create accountability and show measurable progress." });

  // ── PATIENT TRACK: SMOKING CESSATION ──
  if (d.smokingStatus === "current") {
    if (weeks >= 8) {
      patient.push({ domain: "Smoking", priority: "high", title: "Quit Smoking Now — Ideal Window", detail: "You have the ideal time window for cessation. Quitting now significantly reduces pulmonary complications. Ciliary recovery begins in 2–4 weeks, immune and wound healing improvement in 6–8 weeks. Carbon monoxide clears in just 24–48 hours. Ask your physician about nicotine replacement therapy (NRT) or prescription support (varenicline). This is the single most impactful change you can make for your surgical outcome." });
    } else if (weeks >= 4) {
      patient.push({ domain: "Smoking", priority: "high", title: "Quit Smoking — Meaningful Benefit Still Achievable", detail: `With ${weeks} weeks until surgery, 4 weeks of cessation still significantly reduces complications vs. continued smoking. Carbon monoxide clears immediately (24–48h), airway reactivity improves in 1–2 weeks. Ask about nicotine replacement therapy. If you cannot quit entirely, even reduction helps — but complete cessation is strongly preferred.` });
    } else {
      patient.push({ domain: "Smoking", priority: "high", title: "Stop Smoking — Even 24–48 Hours Helps", detail: "Even stopping 24–48 hours before surgery is beneficial: carboxyhemoglobin normalizes (from 5–15% down to normal), directly improving tissue oxygenation during surgery. Do NOT smoke the day of surgery. Discuss nicotine replacement therapy with your anesthesiologist. Every smoke-free hour before surgery improves your oxygen delivery." });
    }
  } else if (d.smokingStatus === "former_lt8") {
    patient.push({ domain: "Smoking", priority: "medium", title: "Stay Smoke-Free — You're in the Recovery Window", detail: "Great job quitting! You're still in the early recovery window. Continue any NRT you're using. Your airways are healing — ciliary function is recovering and airway reactivity is decreasing. Staying smoke-free through surgery gives you the best possible outcome." });
  }

  // ── PATIENT TRACK: ALCOHOL ──
  if (d.alcoholUse === "heavy") {
    patient.push({ domain: "Alcohol", priority: "high", title: "Alcohol Cessation — Critical for Safety", detail: "Heavy alcohol use significantly increases surgical risk: 2–5x higher infection rates, impaired blood clotting, liver function changes, and risk of withdrawal after surgery. Stop drinking at least 4 weeks before surgery. IMPORTANT: If you have a history of withdrawal symptoms (shaking, seizures, DTs), do NOT stop abruptly — you need physician-supervised tapering. Contact your doctor immediately to plan safe cessation." });
  } else if (d.alcoholUse === "moderate") {
    patient.push({ domain: "Alcohol", priority: "medium", title: "Reduce and Stop Alcohol Before Surgery", detail: "Moderate alcohol use affects immune function, wound healing, and liver metabolism of anesthetic drugs. Begin reducing intake now and stop completely at least 48 hours before surgery (ideally 2+ weeks). If you find it difficult to cut back, discuss this honestly with your physician — they can help." });
  } else if (d.alcoholUse === "light") {
    patient.push({ domain: "Alcohol", priority: "low", title: "Stop Alcohol ≥48 Hours Before Surgery", detail: "Stop all alcohol at least 48 hours before surgery. Even light alcohol use interacts with anesthetic medications and affects platelet function. This is a straightforward step that helps ensure the safest possible anesthetic." });
  }

  // ── PATIENT TRACK: ANEMIA — NUTRITIONAL SUPPORT ──
  const hasAnemiaCondition = other.includes("Anemia (Hgb <13)");
  const hasAnemiaHgb = hgb !== null && hgb < 13;
  if (hasAnemiaCondition || hasAnemiaHgb) {
    const hgbDisplay = hgb !== null ? ` Your hemoglobin is ${hgb} g/dL.` : "";
    patient.push({ domain: "Anemia", priority: "high", title: "Iron-Rich Diet for Anemia Correction", detail: `Anemia increases your risk of needing a blood transfusion during surgery.${hgbDisplay} Focus on iron-rich foods: red meat, liver, dark leafy greens (spinach, kale), lentils, beans, and fortified cereals. To boost absorption, pair iron-rich foods with vitamin C sources (citrus, bell peppers, tomatoes). Avoid tea, coffee, and calcium supplements within 1 hour of iron-rich meals as they block absorption. Your physician may also prescribe iron supplements or IV iron for faster correction.` });
  }

  // ══════ PROVIDER TRACK ══════

  // ── MEDICATIONS ──
  if (cardioMeds.includes("ACE inhibitor") || cardioMeds.includes("ARB")) {
    provider.push({ domain: "Medications", priority: "high", title: "ACE-I/ARB: Consider Withholding", detail: "2024 AHA/ACC Class 2b: Consider withholding ACE inhibitor/ARB on the morning of surgery to reduce intraoperative hypotension. Continue all other antihypertensives. No change to K+ monitoring for diuretic patients." });
  }
  if (hasGLP1) {
    const risk = d.glp1Phase === "yes" || d.glp1GI === "active" ? "HIGH-RISK" : "Standard";
    provider.push({ domain: "Medications", priority: "high", title: `GLP-1 RA Management — ${risk}`, detail: risk === "HIGH-RISK"
      ? "Escalation phase or active GI symptoms. Liquid diet 24h before surgery. Point-of-care gastric ultrasound on DOS. If retained gastric contents: rapid sequence induction or delay. Chart review with anesthesiologist required."
      : "Stable dose, no GI symptoms — most patients may continue GLP-1 RA. Standard NPO guidelines apply. Monitor blood glucose perioperatively." });
  }
  if (hasSGLT2) {
    provider.push({ domain: "Medications", priority: "high", title: "SGLT2 Inhibitor: HOLD 3–4 Days Before Surgery", detail: "Discontinue empagliflozin/dapagliflozin/canagliflozin 3–4 days before elective surgery. Order point-of-care ketones on DOS. Monitor for euglycemic DKA perioperatively. Ensure adequate hydration. Restart only when eating and drinking normally. (2024 AHA/ACC & ESAIC 2025)" });
  }
  if (hasBup) {
    provider.push({ domain: "Medications", priority: "high", title: "Buprenorphine: CONTINUE Through Surgery", detail: "Do NOT discontinue buprenorphine perioperatively (ASRA/ASA/AAAM/ASAM consensus, reaffirmed 2024–2025). Continue home dose. Evidence: lower opioid requirements, similar pain scores, lower OUD relapse risk. Supplement with multimodal analgesia (regional, ketamine, acetaminophen, NSAIDs)." });
  }
  if (hasMethadone) {
    provider.push({ domain: "Medications", priority: "high", title: "Methadone: Continue Maintenance Dose", detail: "Continue methadone through surgery. If NPO: IV methadone at half the oral dose divided q6–12h. Order EKG for QTc monitoring. Multimodal analgesia approach." });
  }
  if (hasNaltrexone) {
    const isXR = painMeds.includes("Naltrexone (XR/Vivitrol)");
    provider.push({ domain: "Medications", priority: "high", title: `Naltrexone: HOLD ${isXR ? "30 Days" : "3 Days"} Before Surgery`, detail: isXR ? "Extended-release naltrexone (Vivitrol): must be held 30 days before elective surgery to allow opioid receptor availability for intraoperative/postoperative analgesia." : "Oral naltrexone: hold 3 days (72 hours) before surgery." });
  }
  if (anticoag.length > 0) {
    provider.push({ domain: "Medications", priority: "high", title: "Anticoagulation Management per ASRA 5th Ed (2025)", detail: `Active anticoagulants: ${anticoag.join(", ")}. Use ASRA 5th Edition drug-specific timing for neuraxial and deep plexus blocks (now managed like neuraxial). Consider anti-Xa calibrated assays for DOACs which may allow earlier procedures. Note: "low dose" and "high dose" replace old "prophylactic/therapeutic" terminology. Verify renal function (CrCl) for DOAC clearance timing.` });
  }

  // ── CARDIAC RISK ──
  if (riskLevel === "elevated" || riskLevel === "high") {
    provider.push({ domain: "Cardiac Risk", priority: "high", title: "2024 AHA/ACC Stepwise Algorithm", detail: `Risk level: ${riskLevel.toUpperCase()}. Use validated risk calculators (RCRI, ACS-NSQIP, MICA). Administer DASI questionnaire for functional capacity (replaces subjective METs). For poor functional capacity + elevated risk: consider BNP/NT-proBNP (Class 2b) before stress testing (downgraded to Class 2b from 2a). BNP <92 or NT-proBNP <300 suggests lower risk.` });
  }
  if (cardiac.includes("Pacemaker/AICD")) {
    provider.push({ domain: "Cardiac Risk", priority: "high", title: "CIED Management", detail: "Preoperative device interrogation required. Coordinate with EP team for reprogramming plan and magnet availability. Ensure deactivation/reactivation protocol established before surgery." });
  }

  // ── RESPIRATORY ──
  if (respiratory.includes("OSA (diagnosed)") || respiratory.includes("OSA (suspected/STOP-BANG ≥3)")) {
    provider.push({ domain: "Respiratory", priority: "medium", title: "OSA Management", detail: "Instruct patient to bring PAP/CPAP to hospital. For diagnosed OSA: assess for complications (pulmonary HTN, RV dysfunction). For suspected (STOP-BANG ≥3): consider formal sleep study referral if time permits. Plan for postoperative continuous pulse oximetry. If STOP-BANG ≥5: consider preoperative CPAP initiation." });
  }
  if (respiratory.includes("Unexplained dyspnea")) {
    provider.push({ domain: "Respiratory", priority: "high", title: "Evaluate Unexplained Dyspnea", detail: "Consider BNP/NT-proBNP (Class 2b). If elevated, echocardiography before proceeding. Administer DASI questionnaire. PFTs only if needed to assess optimization for lung resection. Optimize bronchodilator therapy if obstructive component suspected." });
  }

  // ── ENDOCRINE ──
  if (isDiabetic) {
    provider.push({ domain: "Endocrine", priority: "high", title: "Perioperative Glucose Management", detail: `Order A1C if none in 90 days. Intraoperative glucose target: 140–180 mg/dL (STS/ERAS). Assess for GLP-1 RA and SGLT2i use. Order insulin subset in preop orders. For insulin pump patients: consider endocrine consult and follow institutional pump protocol.` });
  }

  // ── HEMATOLOGIC: SEVERITY-GRADED ANEMIA ──
  if (hasAnemiaCondition || hasAnemiaHgb || d.bloodLoss === "significant") {
    const ironDeficient = d.ironDeficiency === "yes";
    const ironAppend = ironDeficient ? " IV iron is first-line (oral iron has poor bioavailability and insufficient time preoperatively). Ferric carboxymaltose allows single-dose correction." : "";
    if (hgb !== null && hgb < 8) {
      provider.push({ domain: "Hematologic", priority: "high", title: `Severe Anemia (Hgb ${hgb} g/dL) — URGENT`, detail: `DANGER: Hgb < 8 g/dL. Urgent hematology consult. Consider preoperative transfusion to Hgb ≥10. Order iron studies (ferritin, TIBC, serum iron, reticulocyte count), B12, folate. Rule out active blood loss. Consider deferring elective surgery. Type and crossmatch.${ironAppend}` });
    } else if (hgb !== null && hgb < 10) {
      provider.push({ domain: "Hematologic", priority: "high", title: `Moderate Anemia (Hgb ${hgb} g/dL)`, detail: `Order iron studies (ferritin, TIBC, serum iron, reticulocyte count), B12, folate. If iron-deficient: IV iron (ferric carboxymaltose or iron sucrose) 2–4 weeks preop. Consider hematology referral. Consider EPO if renal etiology contributing. Recheck Hgb 2 weeks post IV iron. Type and crossmatch for significant expected blood loss.${ironAppend}` });
    } else if (hgb !== null && hgb < 13) {
      provider.push({ domain: "Hematologic", priority: "high", title: `Mild Anemia (Hgb ${hgb} g/dL)`, detail: `Order iron studies (ferritin, TIBC, serum iron). Ferritin <30 or TSAT <20% = confirmed iron deficiency → IV iron 2–4 weeks preop. Ferritin 30–100 with low TSAT = functional deficiency → IV iron also recommended. Iron-replete: investigate other causes (chronic disease, B12/folate, renal). Type and screen for significant expected blood loss.${ironAppend}` });
    } else {
      provider.push({ domain: "Hematologic", priority: "high", title: "Anemia Management — Obtain Hemoglobin", detail: `Anemia indicated but no hemoglobin value entered. Order CBC with iron studies (ferritin, TIBC, serum iron). Treat confirmed iron deficiency with IV iron 2–4 weeks preop. Consider anemia clinic referral per institutional protocol. Recommend obtaining hemoglobin for severity grading.${ironAppend}` });
    }
  }
  if (other.includes("Sickle cell disease")) {
    provider.push({ domain: "Hematologic", priority: "high", title: "Sickle Cell Protocol", detail: "Order BMP, CBC, reticulocyte count, HbS. Target Hb ≥10 g/dL and HbS <30%. Phenotypically matched blood for any transfusion. Coordinate with hematology." });
  }

  // ── AGE / FRAILTY ──
  if (age >= 75 || other.includes("Frailty/recent falls")) {
    provider.push({ domain: "Frailty/Age", priority: "high", title: "Frailty Screening & Geriatric Optimization", detail: "Screen with validated tool (Clinical Frailty Scale, mFI, or RAI). Frailty is stronger predictor than age alone. Assess delirium risk (CAM). Cognitive screening. Advance care planning/DNR discussion. Consider perioperative geriatrics consult. Routine age-based EKG is NOT supported by evidence (ESAIC 2025)." });
  }

  // ── SURGERY-SPECIFIC ──
  if (needsImplant) {
    provider.push({ domain: "Surgery-Specific", priority: "medium", title: "MRSA/MSSA Screening & Decolonization", detail: "Order nasal swab for MRSA/MSSA PCR screening. Prescribe mupirocin nasal ointment + CHG bathing per institutional decolonization protocol for implant/foreign body procedures." });
  }
  if (surgeryTags.includes("Vascular")) {
    provider.push({ domain: "Surgery-Specific", priority: "high", title: "Vascular Surgery — Elevated Risk Protocol", detail: "Vascular surgery remains elevated-risk category. Biomarker-based risk stratification (BNP/NT-proBNP) especially valuable. Plan postoperative troponin surveillance for MINS detection." });
  }

  // ── PROVIDER: SMOKING CESSATION PROTOCOL ──
  if (d.smokingStatus === "current") {
    const cigDay = parseInt(d.cigPerDay) || 0;
    const nrtDose = cigDay >= 10 ? "21mg patch" : "14mg patch";
    let smokingDetail = `Prescribe NRT: ${nrtDose} plus rescue gum/lozenge as needed. Consider varenicline (start 1–2 weeks before quit date, 12-week course) or bupropion. Refer to cessation program if timeline permits. Preoperative incentive spirometry education for ALL current smokers. Plan postoperative respiratory monitoring and aggressive pulmonary toilet.`;
    if (cigDay >= 20) {
      smokingDetail += " HEAVY SMOKER: consider PFTs if lung resection planned, optimize bronchodilators, higher NRT dose may be needed, plan enhanced postoperative pulmonary monitoring.";
    }
    provider.push({ domain: "Smoking", priority: "high", title: "Smoking Cessation Protocol", detail: smokingDetail });
  } else if (d.smokingStatus === "former_lt8") {
    provider.push({ domain: "Smoking", priority: "medium", title: "Recent Smoking Cessation — Reinforce", detail: "Patient quit <8 weeks ago. Reinforce abstinence, continue NRT if in use. Order incentive spirometry education. Note: airway reactivity remains increased in first 8 weeks after cessation — standard precautions for airway management." });
  }

  // ── PROVIDER: ALCOHOL PROTOCOL ──
  if (d.alcoholUse === "heavy") {
    let alcoholDetail = "LABS: CMP (LFTs), CBC with diff (thrombocytopenia, macrocytosis), PT/INR, magnesium, phosphate. Consider prealbumin. SUPPLEMENTS: Thiamine 100mg PO daily (mandatory — prevents Wernicke), folate 1mg daily, multivitamin.";
    if (d.withdrawalHistory === "yes") {
      alcoholDetail += " WITHDRAWAL HISTORY POSITIVE: DANGER. Order PAWSS score. Benzo-based prophylaxis protocol. CIWA-Ar monitoring. May require ICU postoperatively. Addiction medicine/psychiatry consult mandatory.";
    } else {
      alcoholDetail += " Order CIWA-Ar monitoring ×72h postoperatively. Low threshold for benzo rescue. Withdrawal typically 6–24h after last drink.";
    }
    alcoholDetail += " Counsel cessation ≥4 weeks preop. Addiction medicine referral if unable to abstain. Document prominently in anesthesia note (enzyme induction → higher anesthetic/opioid requirements).";
    provider.push({ domain: "Alcohol", priority: "high", title: "Heavy Alcohol Use — Perioperative Protocol", detail: alcoholDetail });
  } else if (d.alcoholUse === "moderate") {
    provider.push({ domain: "Alcohol", priority: "medium", title: "Moderate Alcohol Use — Evaluation & Counseling", detail: "Counsel cessation ≥2 weeks preoperatively. Order CMP for liver screening. Consider thiamine supplementation. Monitor for subclinical withdrawal perioperatively. Document alcohol use in anesthesia note (may affect drug metabolism)." });
  }

  // ── DAY-OF-SURGERY ──
  let dosItems = "Verify: medications held/continued per plan, labs within acceptable range, blood glucose on arrival, K+ for diuretic patients, pregnancy test if applicable, CPAP brought (if OSA), ketones checked (if was on SGLT2i), all consult clearances documented, resuscitation preferences confirmed.";
  if (d.smokingStatus === "current") dosItems += " SMOKING: verify cessation status, NRT plan documented for admission, incentive spirometer at bedside.";
  if (d.alcoholUse === "heavy") dosItems += " ALCOHOL: verify cessation duration, withdrawal risk plan active, thiamine administered, CIWA-Ar orders placed if indicated.";
  if (d.withdrawalHistory === "yes") dosItems += " WITHDRAWAL: CIWA-Ar orders verified, benzodiazepine protocol ready, ICU bed available if needed.";
  if ((hasAnemiaCondition || hasAnemiaHgb) && hgb !== null) dosItems += " ANEMIA: Hgb recheck if IV iron given, blood product availability confirmed with blood bank.";
  provider.push({ domain: "Day of Surgery", priority: "medium", title: "DOS Verification Checklist", detail: dosItems });

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
            {hasMore && (
              <button onClick={() => setExpanded(!expanded)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "6px 0 0",
                fontSize: "12px", fontWeight: 600, color: SR.teal, fontFamily: SR.font,
                display: "inline-flex", alignItems: "center", gap: "4px",
              }}>
                {expanded ? "Show less ▲" : "Read more ▼"}
              </button>
            )}
          </div>
        </div>
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
      <div style={{ fontSize: "13px", color: SR.textSecondary, lineHeight: 1.65, fontFamily: SR.font }}>{rec.detail}</div>
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
   [PREOP-PAGE] — Pre-Operative Assessment Page
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
  const generate = () => {
    setPlan(generatePlan(data)); window.scrollTo(0, 0);
    setViewMode(data.userRole === "patient" ? "patient" : data.userRole === "provider" ? "provider" : "both");
  };
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
              <button onClick={() => {
                const el = document.getElementById("readiness-plan-printable");
                const w = window.open("", "_blank");
                w.document.write(`<html><head><title>${data.firstName ? data.firstName + "'s" : "Your"} Surgical Readiness Plan - SurgeryReady</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'DM Sans',sans-serif;color:#1A2B3C;padding:40px;max-width:1000px;margin:0 auto}@media print{body{padding:20px}button,.no-print{display:none!important}}</style></head><body>${el.innerHTML}<script>setTimeout(()=>{window.print();},500)<\/script></body></html>`);
                w.document.close();
              }} style={{
                padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${SR.teal}`, background: SR.white, color: SR.teal,
                fontFamily: SR.font, transition: "all 0.2s",
              }}>Download PDF</button>
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

          <div className="sr-plan-grid" style={{ display: "grid", gridTemplateColumns: showPatient && showProvider ? "1fr 1fr" : "1fr", gap: "28px" }}>
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
            <div style={{ fontSize: "11px", color: SR.muted, lineHeight: 1.7 }}>
              <strong style={{ color: SR.textSecondary }}>Disclaimer:</strong> This tool generates recommendations based on current evidence and guidelines (2024 AHA/ACC, ASRA 5th Ed 2025, ESAIC 2025, Multi-Society GLP-1 RA Guidance 2024). It is a clinical decision support prototype and does not replace physician judgment. All recommendations should be reviewed and individualized by the treating physician and anesthesiologist.
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

        {/* Numbered Progress Steps */}
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
            <button onClick={goNext} style={{
              padding: "11px 32px", borderRadius: "10px", border: "none",
              background: SR.teal, color: SR.white, cursor: "pointer",
              fontSize: "14px", fontWeight: 600, fontFamily: SR.font,
              boxShadow: "0 2px 8px rgba(13,124,102,0.25)", transition: "all 0.2s",
            }}>Continue</button>
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
