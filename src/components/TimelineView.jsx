import { generateTimeline } from "../data/timeline.js";

// ─── SR Design Tokens (mirrors App.jsx — never cross-import App.jsx) ─────────
const SR = {
  navy:         "#1B3A5C",
  teal:         "#0D7C66",
  tealLight:    "#E6F5F0",
  tealDark:     "#095C4B",
  bg:           "#F8FAFB",
  white:        "#FFFFFF",
  offWhite:     "#F1F5F4",
  border:       "#DDE5E3",
  borderLight:  "#EDF1F0",
  text:         "#1A2B3C",
  textSecondary:"#4A6274",
  muted:        "#7C8E9B",
  warning:      "#B7791F",
  warningBg:    "#FFFFF0",
  cardShadow:   "0 1px 3px rgba(27,58,92,0.06), 0 1px 2px rgba(27,58,92,0.04)",
  font:         "'DM Sans', 'Segoe UI', sans-serif",
};

// ─── Domain color map ─────────────────────────────────────────────────────────
const DOMAIN_COLORS = {
  "Exercise":            "#3B82F6",
  "Nutrition":           "#F59E0B",
  "Carb Loading":        "#F59E0B",
  "Fasting":             "#8B5CF6",
  "Thermal":             "#10B981",
  "Medications":         "#EF4444",
  "Anticoagulants":      "#EF4444",
  "NPO":                 "#EF4444",
  "Labs":                "#6366F1",
  "Cardiac":             "#6366F1",
  "PAT Visit":           "#6366F1",
  "Infection Prevention":"#6366F1",
  "Logistics":           "#6366F1",
  "Blood Availability":  "#6366F1",
  "Check-In":            "#0D7C66",
  "Airway & OSA":        "#0D7C66",
  "Smoking":             "#78716C",
  "Alcohol":             "#78716C",
  "Self-Tracking":       "#78716C",
  "Sleep":               "#0EA5E9",
  "Anemia":              "#EC4899",
};

function domainColor(domain) {
  return DOMAIN_COLORS[domain] || SR.navy;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: "Exercise",    color: "#3B82F6" },
  { label: "Nutrition",   color: "#F59E0B" },
  { label: "Fasting",     color: "#8B5CF6" },
  { label: "Thermal",     color: "#10B981" },
  { label: "Medications", color: "#EF4444" },
  { label: "Labs",        color: "#6366F1" },
  { label: "Smoking / Alcohol", color: "#78716C" },
  { label: "Sleep",       color: "#0EA5E9" },
  { label: "Anemia",      color: "#EC4899" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TimelineView({ data, plan }) {
  // Generate personalized phases — only forward-looking, no past phases
  const phases = generateTimeline(data, plan);

  return (
    <div style={{ fontFamily: SR.font }}>

      {/* Domain legend */}
      <div style={{
        background: SR.offWhite, borderRadius: "10px", padding: "12px 16px",
        marginBottom: "28px", display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center",
      }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: SR.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "4px" }}>
          Domain
        </span>
        {LEGEND_ITEMS.map(({ label, color }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: SR.text, fontFamily: SR.font }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>

      {/* Phase blocks — index 0 is always current, rest are upcoming */}
      {phases.map((phase, index) => {
        const isCurrent = index === 0;
        const isDOS = !!phase.dayOfSurgery;
        const visibleCards = phase.cards.filter(card => card.show(data, plan));

        return (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            isCurrent={isCurrent}
            isDOS={isDOS}
            visibleCards={visibleCards}
            isLast={index === phases.length - 1}
          />
        );
      })}
    </div>
  );
}

// ─── PhaseBlock ───────────────────────────────────────────────────────────────
function PhaseBlock({ phase, isCurrent, isDOS, visibleCards, isLast }) {
  const dotColor   = isCurrent ? SR.teal : SR.navy;
  const dotGlow    = isCurrent ? `0 0 0 3px ${SR.teal}30` : "none";
  const badgeBg    = isCurrent ? SR.teal : SR.navy;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "170px 1px 1fr",
        gap: "0",
        transition: "opacity 0.2s",
      }}
      className="sr-timeline-phase"
    >
      {/* Left column — phase meta */}
      <div style={{
        paddingRight: "24px",
        textAlign: "right",
        paddingTop: "4px",
        paddingBottom: "36px",
      }}>
        <div style={{
          display: "inline-block",
          background: badgeBg,
          color: SR.white,
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: "4px",
          marginBottom: "6px",
          fontFamily: SR.font,
        }}>
          {phase.badge}
        </div>
        <div style={{
          fontSize: "15px",
          fontWeight: 700,
          color: isCurrent ? SR.teal : SR.navy,
          lineHeight: 1.25,
          marginBottom: "3px",
          fontFamily: SR.font,
        }}>
          {phase.timespan}
        </div>
        <div style={{ fontSize: "10px", color: SR.muted, lineHeight: 1.5, fontFamily: SR.font }}>
          {phase.sub}
        </div>
        {isCurrent && (
          <div style={{
            display: "inline-block",
            marginTop: "6px",
            fontSize: "9px",
            fontWeight: 700,
            color: SR.teal,
            background: SR.tealLight,
            padding: "2px 7px",
            borderRadius: "20px",
            letterSpacing: "0.08em",
            fontFamily: SR.font,
          }}>
            START HERE
          </div>
        )}
      </div>

      {/* Center — spine */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: dotColor,
          border: `3px solid ${SR.bg}`,
          boxShadow: `0 0 0 2px ${dotColor}, ${dotGlow}`,
          flexShrink: 0,
          marginTop: "6px",
          zIndex: 2,
        }} />
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: "36px",
            background: `linear-gradient(to bottom, ${SR.navy}60 0%, ${SR.border} 100%)`,
          }} />
        )}
      </div>

      {/* Right column — cards */}
      <div style={{ paddingLeft: "24px", paddingBottom: "36px" }}>
        {/* Phase title */}
        <div style={{
          fontSize: "18px",
          fontWeight: 700,
          color: isDOS ? SR.teal : SR.navy,
          marginBottom: "2px",
          marginTop: "2px",
          fontFamily: SR.font,
          lineHeight: 1.25,
        }}>
          {phase.title}
        </div>
        <div style={{
          fontSize: "12px", color: SR.muted, fontStyle: "italic",
          marginBottom: "14px", fontFamily: SR.font,
        }}>
          {phase.focus}
        </div>

        {/* Milestone callout */}
        {phase.milestone && (
          <div style={{
            display: "flex", gap: "10px",
            background: phase.milestone.isSuccess
              ? `${SR.teal}0D`
              : `${SR.navy}08`,
            border: `1px solid ${phase.milestone.isSuccess ? SR.teal : SR.navy}25`,
            borderRadius: "8px", padding: "12px 14px", marginBottom: "12px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: phase.milestone.isSuccess ? SR.teal : SR.navy,
              flexShrink: 0, marginTop: "5px",
            }} />
            <div style={{ fontSize: "12px", color: SR.text, lineHeight: 1.6, fontFamily: SR.font }}>
              {phase.milestone.text}
            </div>
          </div>
        )}

        {/* Card grid */}
        {visibleCards.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "10px",
          }}>
            {visibleCards.map((card, i) => (
              <TimelineCard
                key={i}
                card={card}
                isDOS={isDOS}
              />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: SR.muted, fontStyle: "italic", fontFamily: SR.font }}>
            No specific actions for your profile in this phase.
          </div>
        )}
      </div>

      {/* Responsive style injected once */}
      <style>{`
        @media (max-width: 640px) {
          .sr-timeline-phase {
            grid-template-columns: 0 1px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── TimelineCard ─────────────────────────────────────────────────────────────
function TimelineCard({ card, isDOS }) {
  const color = isDOS ? SR.teal : domainColor(card.domain);
  const bg    = isDOS ? SR.navy : SR.white;
  const titleColor  = isDOS ? SR.white : SR.navy;
  const detailColor = isDOS ? "rgba(255,255,255,0.65)" : SR.textSecondary;
  const domainColor_ = isDOS ? SR.teal : color;

  return (
    <div style={{
      background: bg,
      borderRadius: "10px",
      padding: "14px 14px 12px",
      borderTop: `3px solid ${color}`,
      boxShadow: SR.cardShadow,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: domainColor_,
        marginBottom: "4px",
        fontFamily: SR.font,
      }}>
        {card.domain}
      </div>
      <div style={{
        fontSize: "13px",
        fontWeight: 700,
        color: titleColor,
        lineHeight: 1.35,
        marginBottom: "6px",
        fontFamily: SR.font,
      }}>
        {card.title}
      </div>
      <div style={{
        fontSize: "11.5px",
        color: detailColor,
        lineHeight: 1.65,
        fontFamily: SR.font,
      }}>
        {card.detail}
      </div>
    </div>
  );
}
