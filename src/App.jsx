import { useState, useEffect, useRef } from "react";
 
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  rot: "#e8212b",
  rotDark: "#c01820",
  rotLight: "#ff3d46",
  weiss: "#ffffff",
  schwarz: "#0a0a0a",
  grau100: "#f5f5f5",
  grau200: "#e8e8e8",
  grau400: "#999999",
  grau600: "#555555",
  grau800: "#222222",
  gelb: "#f5c518",
  blau: "#1a6fd4",
};
 
// ─── SQUAD DATA (static) ───────────────────────────────────────────────────────
const SQUAD = {
  Tor: [
    { nr: 1, name: "Maria Luisa Grohs", nation: "DE" },
    { nr: 18, name: "Viktoria Schnaderbeck", nation: "AT" },
    { nr: 30, name: "Janina Leitzig", nation: "DE" },
  ],
  Abwehr: [
    { nr: 2, name: "Giulia Gwinn", nation: "DE" },
    { nr: 3, name: "Glódís Perla Viggósdóttir", nation: "IS" },
    { nr: 4, name: "Sarai Linder", nation: "DE" },
    { nr: 5, name: "Magdalena Eriksson", nation: "SE" },
    { nr: 14, name: "Franziska Carl", nation: "DE" },
    { nr: 23, name: "Jovana Damnjanović", nation: "RS" },
    { nr: 32, name: "Alexia Putellas", nation: "ES" },
  ],
  Mittelfeld: [
    { nr: 6, name: "Lina Magull", nation: "DE" },
    { nr: 8, name: "Sydney Lohmann", nation: "DE" },
    { nr: 10, name: "Klara Bühl", nation: "DE" },
    { nr: 16, name: "Georgia Stanway", nation: "GB-ENG" },
    { nr: 17, name: "Linda Dallmann", nation: "DE" },
    { nr: 19, name: "Carolin Simon", nation: "DE" },
    { nr: 22, name: "Weronika Zawistowska", nation: "PL" },
  ],
  Sturm: [
    { nr: 7, name: "Viviane Asseyi", nation: "FR" },
    { nr: 9, name: "Lea Schüller", nation: "DE" },
    { nr: 11, name: "Pernille Harder", nation: "DK" },
    { nr: 20, name: "Jovana Damnjanović", nation: "RS" },
    { nr: 25, name: "Sandie Toletti", nation: "FR" },
  ],
};
 
// ─── FLAG HELPER ──────────────────────────────────────────────────────────────
const FLAG = { DE: "🇩🇪", AT: "🇦🇹", SE: "🇸🇪", IS: "🇮🇸", RS: "🇷🇸", ES: "🇪🇸", FR: "🇫🇷", DK: "🇩🇰", PL: "🇵🇱", "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿" };
 
// ─── VEREIN DATA ──────────────────────────────────────────────────────────────
const VEREIN = {
  gründung: 1970,
  meisterschaften: 10,
  pokalsiege: 7,
  clTitel: 1,
  stadion: "FC Bayern Campus",
  kapazität: 2500,
  cheftrainerin: "Alexander Straus",
};
 
// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icon = {
  countdown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  spielplan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  ticker: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  tabelle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  kader: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  verein: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
};
 
// ─── COUNTDOWN TAB ────────────────────────────────────────────────────────────
function CountdownTab({ dark, nextMatch }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
 
  useEffect(() => {
    if (!nextMatch) return;
    const tick = () => {
      const diff = new Date(nextMatch.MatchDateTimeUTC) - new Date();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextMatch]);
 
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
 
  const pad = (n) => String(n).padStart(2, "0");
 
  const Unit = ({ val, label }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
      <div style={{
        fontSize: 64, fontWeight: 900, lineHeight: 1,
        color: T.weiss, fontFamily: "Inter, sans-serif",
        letterSpacing: "-2px",
      }}>{pad(val)}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", marginTop: 8, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* HERO */}
      <div style={{ background: T.rot, padding: "48px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 16 }}>Nächstes Spiel</div>
        {nextMatch ? (
          <div style={{ fontSize: 22, fontWeight: 800, color: T.weiss, textTransform: "uppercase", letterSpacing: "-0.5px", marginBottom: 32 }}>
            {nextMatch.Team1?.ShortName} vs {nextMatch.Team2?.ShortName}
          </div>
        ) : (
          <div style={{ fontSize: 22, fontWeight: 800, color: T.weiss, textTransform: "uppercase", letterSpacing: "-0.5px", marginBottom: 32 }}>Kein Spiel geplant</div>
        )}
        {/* Digits row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          <Unit val={timeLeft.d} label="Tage" />
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 48, fontWeight: 900, lineHeight: 1, paddingTop: 2 }}>:</div>
          <Unit val={timeLeft.h} label="Std" />
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 48, fontWeight: 900, lineHeight: 1, paddingTop: 2 }}>:</div>
          <Unit val={timeLeft.m} label="Min" />
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 48, fontWeight: 900, lineHeight: 1, paddingTop: 2 }}>:</div>
          <Unit val={timeLeft.s} label="Sek" />
        </div>
      </div>
      {/* Match info card */}
      {nextMatch && (
        <div style={{ margin: 24, background: card, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.grau400, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Details</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: fg }}>
            {new Date(nextMatch.MatchDateTimeUTC).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </div>
          <div style={{ fontSize: 14, color: T.grau400, marginTop: 4 }}>
            {new Date(nextMatch.MatchDateTimeUTC).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </div>
          {nextMatch.MatchResults?.length > 0 === false && (
            <div style={{ marginTop: 12, fontSize: 13, color: T.grau600 }}>
              {nextMatch.Group?.GroupOrderID}. Spieltag · FLYERALARM Frauen-Bundesliga
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
// ─── SPIELPLAN TAB ────────────────────────────────────────────────────────────
function SpielplanTab({ dark, matches, nextMatch }) {
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
  const sub = dark ? T.grau400 : T.grau600;
 
  const isNext = (m) => nextMatch && m.MatchID === nextMatch.MatchID;
  const isDone = (m) => m.MatchIsFinished;
  const isBayern = (m) =>
    m.Team1?.ShortName?.includes("Bayern") || m.Team2?.ShortName?.includes("Bayern");
 
  const bayernMatches = matches.filter(isBayern);
 
  const ResultStripe = ({ m }) => {
    if (!isDone(m)) return null;
    const r = m.MatchResults?.find((r) => r.ResultTypeID === 2) || m.MatchResults?.[0];
    if (!r) return null;
    const g1 = r.PointsTeam1, g2 = r.PointsTeam2;
    const bayernHome = m.Team1?.ShortName?.includes("Bayern");
    const bayernGoals = bayernHome ? g1 : g2;
    const oppGoals = bayernHome ? g2 : g1;
    const won = bayernGoals > oppGoals;
    const draw = bayernGoals === oppGoals;
    const color = won ? "#22c55e" : draw ? T.gelb : T.rot;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: fg }}>{g1} : {g2}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: won ? "#22c55e" : draw ? T.gelb : T.rot, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {won ? "Sieg" : draw ? "Remis" : "Niederlage"}
        </span>
      </div>
    );
  };
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", paddingBottom: 32 }}>
      <div style={{ background: T.rot, padding: "32px 24px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 8 }}>Saison 2024/25</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.weiss, textTransform: "uppercase", letterSpacing: "-1px" }}>Spielplan</div>
      </div>
      <div style={{ padding: "16px 24px 0" }}>
        {bayernMatches.length === 0 && (
          <div style={{ color: sub, fontSize: 14, marginTop: 24, textAlign: "center" }}>Lade Spielplan…</div>
        )}
        {bayernMatches.map((m) => (
          <div key={m.MatchID} style={{
            background: card,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 12,
            borderLeft: isNext(m) ? `4px solid ${T.rot}` : "4px solid transparent",
            position: "relative",
          }}>
            {isNext(m) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: T.rot, animation: "pulse 1.4s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.rot, textTransform: "uppercase", letterSpacing: "0.1em" }}>Nächstes Spiel</span>
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {new Date(m.MatchDateTimeUTC).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}
              {" · "}
              {new Date(m.MatchDateTimeUTC).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: fg, letterSpacing: "-0.3px" }}>
              {m.Team1?.TeamName} – {m.Team2?.TeamName}
            </div>
            <ResultStripe m={m} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
 
// ─── LIVE TICKER TAB ──────────────────────────────────────────────────────────
function TickerTab({ dark, liveMatch }) {
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
  const sub = dark ? T.grau400 : T.grau600;
 
  if (!liveMatch) {
    return (
      <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <div style={{ background: T.rot, padding: "32px 24px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 8 }}>Live</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.weiss, textTransform: "uppercase", letterSpacing: "-1px" }}>Ticker</div>
        </div>
        <div style={{ padding: 24, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: card, margin: "32px auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 28 }}>📺</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: fg }}>Kein laufendes Spiel</div>
          <div style={{ fontSize: 14, color: sub, marginTop: 8 }}>Der Ticker ist aktiv, sobald ein Spiel läuft.</div>
        </div>
      </div>
    );
  }
 
  const r = liveMatch.MatchResults?.find((r) => r.ResultTypeID === 2) || liveMatch.MatchResults?.[0];
  const g1 = r?.PointsTeam1 ?? 0;
  const g2 = r?.PointsTeam2 ?? 0;
 
  const events = liveMatch.Goals || [];
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", paddingBottom: 32 }}>
      {/* Scoreboard hero */}
      <div style={{ background: T.rot, padding: "32px 24px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 16 }}>Live</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{liveMatch.Team1?.ShortName}</div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: T.weiss, letterSpacing: "-2px", padding: "0 16px" }}>{g1}:{g2}</div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{liveMatch.Team2?.ShortName}</div>
          </div>
        </div>
        {/* Stats band */}
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          {[["Tore", g1, g2], ["Spiel", liveMatch.Group?.GroupOrderID + ". ST", ""]].map(([label, v1, v2]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.weiss, marginTop: 2 }}>{v1}{v2 !== "" ? ` · ${v2}` : ""}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Event feed */}
      <div style={{ padding: "16px 24px 0" }}>
        {events.length === 0 && (
          <div style={{ color: sub, fontSize: 14, marginTop: 24, textAlign: "center" }}>Noch keine Ereignisse</div>
        )}
        {[...events].reverse().map((ev, i) => {
          const isGoal = true; // all events here are goals from API
          return (
            <div key={i} style={{
              background: isGoal ? T.rot : card,
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: isGoal ? "rgba(255,255,255,0.7)" : sub, minWidth: 36 }}>{ev.MatchMinute}'</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isGoal ? T.weiss : fg }}>
                    ⚽ {ev.GoalGetterName}
                  </div>
                  <div style={{ fontSize: 13, color: isGoal ? "rgba(255,255,255,0.7)" : sub, marginTop: 2 }}>
                    {ev.ScoreTeam1}:{ev.ScoreTeam2} · {ev.IsPenalty ? "Elfmeter" : ev.IsOwnGoal ? "Eigentor" : "Tor"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
// ─── TABELLE TAB ──────────────────────────────────────────────────────────────
function TabelleTab({ dark, table }) {
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
  const sub = dark ? T.grau400 : T.grau600;
 
  const bayernEntry = table.find((t) => t.ShortName?.includes("Bayern") || t.TeamName?.includes("Bayern"));
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", paddingBottom: 32 }}>
      {/* Hero */}
      <div style={{ background: T.rot, padding: "32px 24px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 8 }}>Frauen-Bundesliga</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: T.weiss, letterSpacing: "-3px" }}>
            {bayernEntry?.Points ?? "–"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", paddingBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Punkte</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          FC Bayern München · Platz {bayernEntry?.TablePosition ?? "–"}
        </div>
      </div>
 
      {/* Table */}
      <div style={{ padding: "16px 24px 0" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 32px 32px 32px 40px", gap: 8, padding: "8px 12px", marginBottom: 4 }}>
          {["#", "Team", "Sp", "T", "S", "Pkt"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: sub, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: h === "Team" ? "left" : "center" }}>{h}</div>
          ))}
        </div>
        {table.map((t) => {
          const isBayern = t.ShortName?.includes("Bayern") || t.TeamName?.includes("Bayern");
          return (
            <div key={t.TeamInfoId} style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 32px 32px 32px 40px",
              gap: 8,
              padding: "12px",
              borderRadius: 10,
              marginBottom: 4,
              background: isBayern ? T.rot : card,
              alignItems: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isBayern ? T.weiss : sub, textAlign: "center" }}>{t.TablePosition}</div>
              <div style={{ fontSize: 14, fontWeight: isBayern ? 800 : 600, color: isBayern ? T.weiss : fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.ShortName || t.TeamName}
              </div>
              <div style={{ fontSize: 13, color: isBayern ? "rgba(255,255,255,0.8)" : sub, textAlign: "center" }}>{t.Matches}</div>
              <div style={{ fontSize: 13, color: isBayern ? "rgba(255,255,255,0.8)" : sub, textAlign: "center" }}>{t.Goals}</div>
              <div style={{ fontSize: 13, color: isBayern ? "rgba(255,255,255,0.8)" : sub, textAlign: "center" }}>{t.Won}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: isBayern ? T.weiss : fg, textAlign: "center" }}>{t.Points}</div>
            </div>
          );
        })}
        {table.length === 0 && (
          <div style={{ color: sub, fontSize: 14, textAlign: "center", marginTop: 24 }}>Lade Tabelle…</div>
        )}
      </div>
    </div>
  );
}
 
// ─── KADER TAB ────────────────────────────────────────────────────────────────
function KaderTab({ dark }) {
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
  const sub = dark ? T.grau400 : T.grau600;
 
  const PlayerCard = ({ p }) => (
    <div style={{
      background: card,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 8,
    }}>
      {/* Sport card SVG */}
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
        <rect width="40" height="48" rx="6" fill={T.rot}/>
        <rect x="4" y="4" width="32" height="40" rx="4" fill={T.rotDark}/>
        <text x="20" y="30" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter">{p.nr}</text>
        <rect x="8" y="36" width="24" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: fg }}>{p.name}</div>
        <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>
          {FLAG[p.nation] || "🏳"} #{p.nr}
        </div>
      </div>
    </div>
  );
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", paddingBottom: 32 }}>
      <div style={{ background: T.rot, padding: "32px 24px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 8 }}>Saison 2024/25</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: T.weiss, textTransform: "uppercase", letterSpacing: "-2px", lineHeight: 1 }}>KADER</div>
      </div>
      <div style={{ padding: "16px 24px 0" }}>
        {Object.entries(SQUAD).map(([pos, players]) => (
          <div key={pos}>
            <div style={{ fontSize: 30, fontWeight: 900, color: fg, textTransform: "uppercase", letterSpacing: "-1px", margin: "24px 0 12px" }}>{pos}</div>
            {players.map((p) => <PlayerCard key={p.nr} p={p} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── VEREIN TAB ───────────────────────────────────────────────────────────────
function VereinTab({ dark }) {
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const card = dark ? T.grau800 : T.grau100;
  const sub = dark ? T.grau400 : T.grau600;
 
  const StatBlock = ({ label, value }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 48, fontWeight: 900, color: T.weiss, letterSpacing: "-2px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>{label}</div>
    </div>
  );
 
  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", paddingBottom: 32 }}>
      {/* Hero with stats flush */}
      <div style={{ background: T.rot, padding: "32px 24px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 8 }}>FC Bayern München Frauen</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.weiss, textTransform: "uppercase", letterSpacing: "-1px", marginBottom: 32 }}>Der Verein</div>
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 24, paddingBottom: 32 }}>
          <StatBlock label="Meisterschaften" value={VEREIN.meisterschaften} />
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)", margin: "0 20px" }} />
          <StatBlock label="Pokalsiege" value={VEREIN.pokalsiege} />
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)", margin: "0 20px" }} />
          <StatBlock label="CL-Titel" value={VEREIN.clTitel} />
        </div>
      </div>
 
      {/* Info cards */}
      <div style={{ padding: "16px 24px 0" }}>
        {[
          ["Gegründet", VEREIN.gründung],
          ["Heimstadion", VEREIN.stadion],
          ["Kapazität", VEREIN.kapazität.toLocaleString("de-DE") + " Plätze"],
          ["Cheftrainer", VEREIN.cheftrainerin],
          ["Liga", "FLYERALARM Frauen-Bundesliga"],
        ].map(([label, val]) => (
          <div key={label} style={{ background: card, borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: sub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: fg }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("countdown");
  const [matches, setMatches] = useState([]);
  const [table, setTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);
 
  const fetchData = async () => {
    try {
      const [matchRes, tableRes] = await Promise.all([
        fetch("https://api.openligadb.de/getmatchdata/dfb-frauen/2024"),
        fetch("https://api.openligadb.de/getbltable/dfb-frauen/2024"),
      ]);
      const [matchData, tableData] = await Promise.all([matchRes.json(), tableRes.json()]);
      setMatches(Array.isArray(matchData) ? matchData : []);
      setTable(Array.isArray(tableData) ? tableData : []);
    } catch (e) {
      console.error("OpenLigaDB fetch error:", e);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(pollRef.current);
  }, []);
 
  // Derived state
  const now = new Date();
  const futureMatches = matches.filter((m) => new Date(m.MatchDateTimeUTC) > now && !m.MatchIsFinished);
  const nextMatch = futureMatches.sort((a, b) => new Date(a.MatchDateTimeUTC) - new Date(b.MatchDateTimeUTC))[0] || null;
  const liveMatch = matches.find((m) => !m.MatchIsFinished && new Date(m.MatchDateTimeUTC) <= now && new Date(m.MatchDateTimeUTC) > new Date(now - 120 * 60000)) || null;
 
  const bg = dark ? T.schwarz : T.weiss;
  const fg = dark ? T.weiss : T.schwarz;
  const navBg = dark ? T.grau800 : T.grau100;
 
  const TABS = [
    { id: "countdown", label: "Countdown", icon: Icon.countdown },
    { id: "spielplan", label: "Spielplan", icon: Icon.spielplan },
    { id: "ticker", label: "Live", icon: Icon.ticker },
    { id: "tabelle", label: "Tabelle", icon: Icon.tabelle },
    { id: "kader", label: "Kader", icon: Icon.kader },
    { id: "verein", label: "Verein", icon: Icon.verein },
  ];
 
  return (
    <div style={{
      maxWidth: 430,
      margin: "0 auto",
      background: bg,
      minHeight: "100vh",
      position: "relative",
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        background: T.rot,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>FC Bayern</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.weiss, letterSpacing: "-0.5px", textTransform: "uppercase" }}>Frauen</div>
        </div>
        {loading && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Lädt…</div>
        )}
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 20,
            padding: "8px 14px",
            cursor: "pointer",
            color: T.weiss,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
          }}
          aria-label="Dark/Light Mode"
        >
          {dark ? Icon.sun : Icon.moon}
          {dark ? "Hell" : "Dunkel"}
        </button>
      </header>
 
      {/* Content */}
      <main style={{ flex: 1 }}>
        {tab === "countdown" && <CountdownTab dark={dark} nextMatch={nextMatch} />}
        {tab === "spielplan" && <SpielplanTab dark={dark} matches={matches} nextMatch={nextMatch} />}
        {tab === "ticker" && <TickerTab dark={dark} liveMatch={liveMatch} />}
        {tab === "tabelle" && <TabelleTab dark={dark} table={table} />}
        {tab === "kader" && <KaderTab dark={dark} />}
        {tab === "verein" && <VereinTab dark={dark} />}
      </main>
 
      {/* Bottom Nav */}
      <nav style={{
        background: navBg,
        borderTop: `1px solid ${dark ? T.grau800 : T.grau200}`,
        display: "flex",
        position: "sticky",
        bottom: 0,
        zIndex: 100,
      }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "10px 4px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                color: active ? T.rot : (dark ? T.grau400 : T.grau600),
                borderTop: active ? `2px solid ${T.rot}` : "2px solid transparent",
              }}
              aria-label={t.label}
            >
              {t.icon}
              <span style={{ fontSize: 9, fontWeight: active ? 800 : 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}