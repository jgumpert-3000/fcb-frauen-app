import { useState, useEffect, useRef, useCallback } from "react";

const ROT = "#e8212b";
// Etwas dunkleres Rot für Hero-Hintergründe → Weiß erzielt 4.83:1 (WCAG AA)
const HERO_BG = "#d91f2a";
// Barrierefreie Badge-Farben (alle mit Weißtext ≥ 6:1)
const BADGE = {
  W: { bg:"#166534", text:"#fff", label:"SIEG" },
  L: { bg:"#991b1b", text:"#fff", label:"NIED." },
  D: { bg:"#92400e", text:"#fff", label:"UNENT." },
};
const LIGA = "fbl1";
const SAISON = "2025";
const BAYERN_TEAM_ID = 6063;
const POLL_MS = 30_000;

const KADER = {
  Tor: [
    { nr: 1,  name: "Ena Mahmutović",    nat: "BA", age: 22 },
    { nr: 12, name: "Maria Luisa Grohs", nat: "DE", age: 27 },
    { nr: 25, name: "Meike Doerge",      nat: "DE", age: 26 },
  ],
  Abwehr: [
    { nr: 3,  name: "Glodis Viggosdottir", nat: "IS", age: 28 },
    { nr: 5,  name: "Giulia Gwinn",        nat: "DE", age: 25 },
    { nr: 14, name: "Magdalena Eriksson",  nat: "SE", age: 31 },
    { nr: 16, name: "Sydney Lohmann",      nat: "DE", age: 24 },
    { nr: 22, name: "Sarai Linder",        nat: "DE", age: 22 },
    { nr: 33, name: "Arianna Caruso",      nat: "IT", age: 26 },
  ],
  Mittelfeld: [
    { nr: 6,  name: "Lena Oberdorf",   nat: "DE", age: 23 },
    { nr: 8,  name: "Georgia Stanway", nat: "EN", age: 26 },
    { nr: 10, name: "Carolin Simon",   nat: "DE", age: 31 },
    { nr: 17, name: "Sarah Zadrazil",  nat: "AT", age: 32 },
    { nr: 18, name: "Linda Dallmann",  nat: "DE", age: 30 },
    { nr: 19, name: "Saki Kumagai",    nat: "JP", age: 34 },
    { nr: 21, name: "Pernille Harder", nat: "DK", age: 32 },
  ],
  Sturm: [
    { nr: 7,  name: "Jovana Damnjanović", nat: "RS", age: 24 },
    { nr: 9,  name: "Lea Schüller",      nat: "DE", age: 27 },
    { nr: 11, name: "Klara Bühl",        nat: "DE", age: 24 },
    { nr: 20, name: "Weronika Grzesiak",  nat: "PL", age: 22 },
  ],
};

const POS_COLOR = { Tor:"#e8212b", Abwehr:"#1a6fc4", Mittelfeld:"#2ea84e", Sturm:"#e8a000" };
const FLAG = { DE:"DE", AT:"AT", EN:"EN", DK:"DK", SE:"SE", IS:"IS", JP:"JP", IT:"IT", RS:"RS", PL:"PL", BA:"BA" };

const VEREIN_STATS = [
  { label: "Gegründet",      value: "1900", sub: "FC Bayern Muenchen e.V." },
  { label: "Meisterschaften", value: "11x",  sub: "Frauen-Bundesliga" },
  { label: "Stadion",         value: "SAP",  sub: "Garden (bis 7.500)" },
];

const isBayern = (m) => m.team1?.teamId === BAYERN_TEAM_ID || m.team2?.teamId === BAYERN_TEAM_ID;

const getScore = (m) => {
  if (!m.matchIsFinished) return null;
  const end = m.matchResults?.find((r) => r.resultTypeID === 2);
  if (!end) return null;
  return { t1: end.pointsTeam1, t2: end.pointsTeam2 };
};

const isSieg = (m) => {
  const sc = getScore(m);
  if (!sc) return null;
  const home = m.team1?.teamId === BAYERN_TEAM_ID;
  const bg = home ? sc.t1 : sc.t2;
  const gg = home ? sc.t2 : sc.t1;
  return bg > gg ? "W" : bg < gg ? "L" : "D";
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString("de-DE", { weekday:"short", day:"2-digit", month:"2-digit" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("de-DE", { hour:"2-digit", minute:"2-digit" });
const timeUntil = (iso) => {
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return null;
  return { d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) };
};
const pad = (n) => String(n).padStart(2,"0");
const API = "https://api.openligadb.de";

async function fetchAllBayernMatches() {
  const group = await fetch(API+"/getcurrentgroup/"+LIGA).then(r=>r.json());
  const reqs = Array.from({length:group.groupOrderID},(_,i)=>fetch(API+"/getmatchdata/"+LIGA+"/"+SAISON+"/"+(i+1)).then(r=>r.json()));
  return (await Promise.all(reqs)).flat().filter(isBayern);
}
async function fetchTable() { return fetch(API+"/getbltable/"+LIGA+"/"+SAISON).then(r=>r.json()); }
async function fetchCurrentMatches() {
  const group = await fetch(API+"/getcurrentgroup/"+LIGA).then(r=>r.json());
  return fetch(API+"/getmatchdata/"+LIGA+"/"+SAISON+"/"+group.groupOrderID).then(r=>r.json());
}

const ICONS = {
  countdown:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  spielplan:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  ticker:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>),
  tabelle:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>),
  kader:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  verein:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
};
const NAV = [{id:"countdown",label:"Nächstes"},{id:"spielplan",label:"Spielplan"},{id:"ticker",label:"Live"},{id:"tabelle",label:"Tabelle"},{id:"kader",label:"Kader"},{id:"verein",label:"Verein"}];

export default function App() {
  const [dark,setDark] = useState(true);
  const [tab,setTab] = useState("countdown");
  const [matches,setMatches] = useState([]);
  const [table,setTable] = useState([]);
  const [tickerMatches,setTickerMatches] = useState([]);
  const [loading,setLoading] = useState(true);
  const [cd,setCd] = useState(null);
  const [filterWb,setFilterWb] = useState("Alle");
  const cdRef = useRef(null);
  const pollRef = useRef(null);

  const C = dark ? {
    bg:"#0d0d0d",bg2:"#141414",card:"#1a1a1a",card2:"#222",border:"#2a2a2a",
    text:"#f5f5f5",text2:"#aaa",text3:"#999",
    // Kartenrand-Indikatoren (nicht-Text): ≥3:1 auf #1a1a1a
    sieg_b:"#22c55e",nied_b:"#f87171",unent_b:"#fbbf24",
  } : {
    bg:"#f5f4f2",bg2:"#ede9e4",card:"#ffffff",card2:"#f0ede8",border:"#d8d0c8",
    text:"#111",text2:"#555",text3:"#555",
    // Kartenrand-Indikatoren (nicht-Text): ≥3:1 auf #fff
    sieg_b:"#16a34a",nied_b:"#dc2626",unent_b:"#d97706",
  };

  const loadAll = useCallback(async () => {
    try {
      const [ms,tbl,cur] = await Promise.all([fetchAllBayernMatches(),fetchTable(),fetchCurrentMatches()]);
      setMatches(ms.sort((a,b)=>new Date(a.matchDateTime)-new Date(b.matchDateTime)));
      setTable(tbl);
      setTickerMatches(cur);
    } catch(e) { console.error("API:",e); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadAll(); pollRef.current=setInterval(loadAll,POLL_MS); return ()=>clearInterval(pollRef.current); },[loadAll]);

  const nextMatch = matches.find(m=>!m.matchIsFinished && new Date(m.matchDateTime)>new Date());

  useEffect(()=>{
    if(!nextMatch){setCd(null);return;}
    const tick=()=>setCd(timeUntil(nextMatch.matchDateTime));
    tick(); cdRef.current=setInterval(tick,1000);
    return ()=>clearInterval(cdRef.current);
  },[nextMatch?.matchID]);

  const filteredMatches = matches.filter(m=>filterWb==="Alle"||m.leagueName?.includes(filterWb));

  const S = {
    heroBlock:{background:HERO_BG,padding:"28px 20px 32px"},
    // heroLabel: voll weißer Text → 4.83:1 auf HERO_BG (WCAG AA ✓)
    heroLabel:{fontSize:11,fontWeight:700,letterSpacing:2,color:"#fff",textTransform:"uppercase",marginBottom:8},
    card:{background:C.card,border:"1px solid "+C.border,borderRadius:10},
    sectionLabel:{fontSize:11,fontWeight:700,letterSpacing:2,color:C.text2,textTransform:"uppercase",marginBottom:14},
    navBtn:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"10px 4px 8px",background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:a?700:500,letterSpacing:0.5,fontFamily:"inherit",borderRadius:4}),
    navIcon:(a)=>({color:a?ROT:C.text3}),        // Icon: non-text → 3:1 reicht (ROT 4.11:1 ✅)
    navLabel:(a)=>({color:a?C.text:C.text3}),    // Text: a=C.text 15:1 ✅, inaktiv C.text3 6.47:1 ✅
  };

  const renderCountdown = () => {
    const past = matches.filter(m=>m.matchIsFinished).slice(-5).reverse();
    const bp = table.find(t=>t.teamInfoId===BAYERN_TEAM_ID);
    return (
      <div>
        <div style={S.heroBlock}>
          <div style={S.heroLabel}>Nächstes Spiel</div>
          <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:8}}>NÄCHSTES</div>
          {nextMatch ? <>
            <div style={{fontSize:13,color:"#fff",marginBottom:2}}>
              {nextMatch.team1.teamId===BAYERN_TEAM_ID?"FCB vs "+nextMatch.team2.shortName:nextMatch.team1.shortName+" vs FCB"} · {fmtDate(nextMatch.matchDateTime)} {fmtTime(nextMatch.matchDateTime)}
            </div>
            <div style={{fontSize:11,color:"#fff",marginBottom:0}}>{nextMatch.group?.groupName}</div>
            {cd ? (
              <div
                aria-live="off"
                aria-label={`Noch ${cd.d} Tage, ${cd.h} Stunden, ${cd.m} Minuten`}
                style={{display:"flex",gap:0,marginTop:20}}
              >
                {[{v:pad(cd.d),l:"Tage"},{v:pad(cd.h),l:"Std"},{v:pad(cd.m),l:"Min"},{v:pad(cd.s),l:"Sek"}].map(({v,l},i)=>(
                  <div key={i} aria-hidden="true" style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid rgba(255,255,255,0.2)":"none"}}>
                    <div style={{fontSize:48,fontWeight:800,color:"#fff",lineHeight:1}}>{v}</div>
                    <div style={{fontSize:10,fontWeight:600,color:"#fff",letterSpacing:1.5,textTransform:"uppercase",marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
            ) : <div style={{color:"#fff",marginTop:16,fontSize:14}}>Spiel läuft!</div>}
          </> : <div style={{color:"#fff",marginTop:8,fontSize:14}}>Keine kommenden Spiele</div>}
        </div>
        {bp && <div style={{background:C.card2,borderBottom:"1px solid "+C.border,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.text2}}>Bundesliga</div>
          <div style={{marginLeft:"auto",display:"flex",gap:20}}>
            {[{v:"1.",l:"Platz"},{v:bp.points,l:"Pkt"},{v:bp.won+"/"+bp.draw+"/"+bp.lost,l:"S/U/N"}].map(({v,l})=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:C.text}}>{v}</div>
                <div style={{fontSize:10,color:C.text2,fontWeight:600,letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>}
        <div style={{padding:"20px 20px 8px"}}>
          <div style={S.sectionLabel}>Letzte Spiele</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {past.map(m=>{
              const sc=getScore(m),res=isSieg(m),isHome=m.team1.teamId===BAYERN_TEAM_ID;
              const gegner=isHome?m.team2.shortName:m.team1.shortName;
              const bs=sc?(isHome?sc.t1:sc.t2):"-",gs=sc?(isHome?sc.t2:sc.t1):"-";
              const badge=BADGE[res]||BADGE.D;
              return <div key={m.matchID} style={{...S.card,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,borderLeft:"4px solid "+badge.bg}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{isHome?"FCB":gegner} {bs}:{gs} {isHome?gegner:"FCB"}</div>
                  <div style={{fontSize:11,color:C.text2,marginTop:2}}>{fmtDate(m.matchDateTime)} · {m.group?.groupName}</div>
                </div>
                <div style={{background:badge.bg,borderRadius:5,padding:"3px 8px",fontSize:11,fontWeight:800,color:badge.text}}>
                  {badge.label}
                </div>
              </div>;
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSpielplan = () => {
    const now=new Date();
    const upcoming=filteredMatches.filter(m=>!m.matchIsFinished&&new Date(m.matchDateTime)>now);
    const past=filteredMatches.filter(m=>m.matchIsFinished).reverse();
    const MatchCard=({m,isNext})=>{
      const sc=getScore(m),res=isSieg(m),isHome=m.team1.teamId===BAYERN_TEAM_ID;
      const gegner=isHome?m.team2.shortName:m.team1.shortName;
      const bs=sc?(isHome?sc.t1:sc.t2):null,gs=sc?(isHome?sc.t2:sc.t1):null;
      const badge=res?BADGE[res]:null;
      const leftBorder=isNext?ROT:badge?badge.bg:C.border;
      return <div style={{...S.card,padding:"13px 14px",borderLeft:"4px solid "+leftBorder}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:6,gap:8}}>
          <div style={{fontSize:11,fontWeight:600,color:C.text2}}>{m.group?.groupName}</div>
          {isNext&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:ROT,animation:"pulse 1.5s infinite"}} aria-hidden="true"/>
            <span style={{fontSize:11,fontWeight:700,color:ROT}}>NÄCHSTES</span>
          </div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>
              {isHome?<><strong>FC Bayern</strong>{" – "+gegner}</>:<>{gegner+" – "}<strong>FC Bayern</strong></>}
            </div>
            <div style={{fontSize:11,color:C.text2,marginTop:3}}>{fmtDate(m.matchDateTime)} · {fmtTime(m.matchDateTime)}</div>
          </div>
          {sc!==null && badge
            ?<div style={{background:badge.bg,borderRadius:7,padding:"4px 12px",minWidth:52,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:badge.text,lineHeight:1}}>{bs}:{gs}</div>
              <div style={{fontSize:10,fontWeight:800,color:badge.text,letterSpacing:1}}>{badge.label}</div>
            </div>
            :sc!==null
              ?<div style={{background:C.card2,border:"1px solid "+C.border,borderRadius:7,padding:"4px 12px",minWidth:52,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:C.text,lineHeight:1}}>{bs}:{gs}</div>
              </div>
              :<div style={{background:C.card2,border:"1px solid "+C.border,borderRadius:7,padding:"4px 12px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:700,color:C.text2}}>{fmtTime(m.matchDateTime)}</div>
              </div>
          }
        </div>
      </div>;
    };
    return <div style={{padding:"0 0 20px"}}>
      <div style={S.heroBlock}>
        <div style={S.heroLabel}>Frauen-Bundesliga 2025/26</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:8}}>SPIELPLAN</div>
        <div style={{fontSize:12,color:"#fff"}}>{filteredMatches.length} Spiele</div>
      </div>
      <div style={{padding:"12px 20px 10px",background:C.bg2,borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",gap:8}}>
          {["Alle","Frauen-Bundesliga"].map(wb=>(
            <button
              key={wb}
              onClick={()=>setFilterWb(wb)}
              aria-pressed={filterWb===wb}
              style={{background:filterWb===wb?ROT:C.card,border:"1px solid "+(filterWb===wb?ROT:C.border),borderRadius:20,padding:"5px 14px",color:filterWb===wb?"#fff":C.text2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}
            >{wb}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"20px 20px 0"}}>
        {upcoming.length>0&&<><div style={S.sectionLabel}>Kommende Spiele</div><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{upcoming.map((m,i)=><MatchCard key={m.matchID} m={m} isNext={i===0}/>)}</div></>}
        {past.length>0&&<><div style={S.sectionLabel}>Ergebnisse</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{past.map(m=><MatchCard key={m.matchID} m={m} isNext={false}/>)}</div></>}
        {loading&&<div style={{textAlign:"center",color:C.text2,padding:24}}>Lade Daten…</div>}
      </div>
    </div>;
  };

  const renderTicker = () => {
    const bayernLive=tickerMatches.filter(m=>!m.matchIsFinished&&m.matchResults?.length>0).find(isBayern);
    return <div>
      <div style={S.heroBlock}>
        <div style={S.heroLabel}>{bayernLive?"FCB LIVE":"Aktueller Spieltag"}</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:8}}>{bayernLive?"LIVE":"SPIELTAG"}</div>
        {bayernLive
          ?<div style={{fontSize:13,color:"#fff"}}>{bayernLive.team1.shortName+" "+(getScore(bayernLive)?.t1??0)+":"+(getScore(bayernLive)?.t2??0)+" "+bayernLive.team2.shortName+" · "+bayernLive.group?.groupName}</div>
          :<div style={{fontSize:12,color:"#fff"}}>{tickerMatches[0]?.group?.groupName||"-"}</div>
        }
      </div>
      <div style={{padding:"20px 20px"}}>
        <div style={S.sectionLabel}>Alle Spiele</div>
        <div aria-live="polite" aria-label="Spieltag-Ergebnisse" style={{display:"flex",flexDirection:"column",gap:8}}>
          {tickerMatches.map(m=>{
            const sc=getScore(m),isBay=isBayern(m);
            return <div key={m.matchID} style={{...S.card,padding:"12px 14px",borderLeft:"4px solid "+(isBay?ROT:C.border)}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:isBay?800:600,color:C.text}}>{m.team1.shortName+" - "+m.team2.shortName}</div>
                  <div style={{fontSize:11,color:C.text2,marginTop:2}}>{fmtTime(m.matchDateTime)}{m.matchIsFinished?" - Abgepfiffen":""}{!m.matchIsFinished&&m.matchResults?.length>0?" - Läuft":""}</div>
                </div>
                {sc!==null?<div style={{fontSize:18,fontWeight:900,color:C.text}}>{sc.t1+":"+sc.t2}</div>:<div style={{fontSize:13,color:C.text2}}>{fmtTime(m.matchDateTime)}</div>}
              </div>
              {isBay&&m.goals?.length>0&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border}}>
                {m.goals.map(g=><div key={g.goalID} style={{fontSize:12,color:C.text2,padding:"2px 0",display:"flex",gap:6}}>
                  <span style={{background:HERO_BG,color:"#fff",fontWeight:700,fontSize:12,padding:"1px 5px",borderRadius:4}}>{g.matchMinute+"'"}</span>
                  <span>{g.goalGetterName}</span>
                  {g.isPenalty&&<span style={{color:C.text3}}>(E)</span>}
                  {g.isOwnGoal&&<span style={{color:C.text3}}>(ET)</span>}
                  <span style={{marginLeft:"auto",fontWeight:700}}>{g.scoreTeam1+":"+g.scoreTeam2}</span>
                </div>)}
              </div>}
            </div>;
          })}
        </div>
      </div>
    </div>;
  };

  const renderTabelle = () => {
    const br=table.find(t=>t.teamInfoId===BAYERN_TEAM_ID);
    return <div>
      <div style={S.heroBlock}>
        <div style={S.heroLabel}>1. Frauen-Bundesliga 2025/26</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:8}}>TABELLE</div>
        {br&&<div style={{display:"flex",gap:20}}>
          {[{v:"1.",l:"Platz"},{v:br.points,l:"Punkte"},{v:br.won,l:"Siege"},{v:br.goals+":"+br.opponentGoals,l:"Tore"}].map(({v,l})=>(
            <div key={l}><div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{v}</div><div style={{fontSize:10,color:"#fff",fontWeight:600,letterSpacing:1}}>{l}</div></div>
          ))}
        </div>}
      </div>
      <div style={{padding:"20px 20px"}}>
        <div style={{display:"flex",alignItems:"center",padding:"0 10px 8px",borderBottom:"1px solid "+C.border}}>
          <div style={{width:28,fontSize:10,fontWeight:700,color:C.text3}}>#</div>
          <div style={{flex:1,fontSize:10,fontWeight:700,color:C.text3,letterSpacing:1}}>TEAM</div>
          {["SP","S","U","N","Tore","Pkt"].map(h=><div key={h} style={{width:h==="Tore"?44:28,textAlign:"center",fontSize:10,fontWeight:700,color:C.text3}}>{h}</div>)}
        </div>
        {table.map((t,i)=>{
          const isBay=t.teamInfoId===BAYERN_TEAM_ID;
          return <div key={t.teamInfoId} style={{display:"flex",alignItems:"center",padding:"9px 10px",borderBottom:"1px solid "+C.border,background:isBay?(dark?"rgba(232,33,43,0.12)":"rgba(232,33,43,0.06)"):"transparent"}}>
            <div style={{width:28,fontSize:14,fontWeight:isBay?800:500,color:isBay?C.text:C.text2}}>{i+1}</div>
            <div style={{flex:1,fontSize:13,fontWeight:isBay?800:500,color:C.text}}>{isBay?"FC Bayern":t.shortName}</div>
            {[t.matches,t.won,t.draw,t.lost,t.goals+":"+t.opponentGoals,t.points].map((v,j)=>(
              <div key={j} style={{width:j===4?44:28,textAlign:"center",fontSize:j===5?14:12,fontWeight:j===5?(isBay?900:700):400,color:j===5?C.text:C.text2}}>{v}</div>
            ))}
          </div>;
        })}
      </div>
    </div>;
  };

  const renderKader = () => (
    <div>
      <div style={S.heroBlock}>
        <div style={S.heroLabel}>Saison 2025/26</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1}}>KADER</div>
        <div style={{fontSize:12,color:"#fff",marginTop:4}}>{Object.values(KADER).flat().length+" Spielerinnen"}</div>
      </div>
      <div style={{padding:"20px 20px"}}>
        {Object.entries(KADER).map(([pos,players])=>(
          <div key={pos} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:6,height:24,background:POS_COLOR[pos],borderRadius:3}}/>
              <div style={{fontSize:16,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:1}}>{pos}</div>
              <div style={{fontSize:12,color:C.text2,marginLeft:"auto"}}>{players.length}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {players.map(p=>(
                <div key={p.nr} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderLeft:"3px solid "+POS_COLOR[pos]}}>
                  <div style={{width:36,height:36,borderRadius:8,background:dark?"rgba(255,255,255,0.05)":C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:POS_COLOR[pos],flexShrink:0}}>{p.nr}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.text2,marginTop:1}}>{pos+" - "+p.age+" J."}</div>
                  </div>
                  <div style={{fontSize:13,color:C.text2,fontWeight:600}}>{FLAG[p.nat]||""}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVerein = () => (
    <div>
      <div style={S.heroBlock}>
        <div style={S.heroLabel}>FC Bayern München Frauen</div>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:8}}>VEREIN</div>
        <div style={{display:"flex",gap:0}}>
          {VEREIN_STATS.map(({label,value,sub},i)=>(
            <div key={label} style={{flex:1,borderRight:i<2?"1px solid rgba(255,255,255,0.2)":"none",paddingRight:16,paddingLeft:i>0?16:0}}>
              <div style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1}}>{value}</div>
              <div style={{fontSize:10,fontWeight:700,color:"#fff",letterSpacing:1.5,textTransform:"uppercase",marginTop:4}}>{label}</div>
              <div style={{fontSize:10,color:"#fff",marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"20px 20px"}}>
        <div style={S.sectionLabel}>Über den Verein</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Heimstadion","FC Bayern Campus, München"],["Trainer","Alexander Straus"],["Präsident","Herbert Hainer"],["Vereinsfarben","Rot & Weiss"],["Liga","1. Frauen-Bundesliga"],["Website","fcbayern.com/frauen"]].map(([k,v])=>(
            <div key={k} style={{...S.card,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,color:C.text2,fontWeight:600}}>{k}</div>
              <div style={{fontSize:13,color:C.text,fontWeight:700}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTab = () => {
    if (loading) return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:12}}>
        <div style={{width:32,height:32,border:"3px solid "+C.border,borderTopColor:ROT,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        <div style={{fontSize:12,color:C.text2,letterSpacing:1}}>LADE DATEN...</div>
      </div>
    );
    switch(tab) {
      case "countdown": return renderCountdown();
      case "spielplan": return renderSpielplan();
      case "ticker":    return renderTicker();
      case "tabelle":   return renderTabelle();
      case "kader":     return renderKader();
      case "verein":    return renderVerein();
      default:          return null;
    }
  };

  const focusCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.7);}}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
    /* WCAG 2.4.7 – sichtbarer Fokusindikator */
    :focus-visible{outline:3px solid #fff;outline-offset:2px;border-radius:4px;}
    /* Skip-Link */
    .skip-link{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
    .skip-link:focus{position:fixed;top:8px;left:50%;transform:translateX(-50%);width:auto;height:auto;background:#fff;color:#000;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:700;z-index:9999;outline:3px solid ${ROT};}
  `;

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <style>{focusCSS}</style>

      {/* Skip-Link für Tastaturnutzer (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>

      <header role="banner" style={{background:ROT,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Dekoratives Logo – für Screenreader ausgeblendet */}
          <div aria-hidden="true" style={{width:28,height:28,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:ROT}}>FCB</div>
          <span style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:0.5}}>Bayern Frauen</span>
        </div>
        <button
          onClick={()=>setDark(d=>!d)}
          aria-label={dark?"Zu hellem Design wechseln":"Zu dunklem Design wechseln"}
          aria-pressed={dark}
          style={{background:"rgba(255,255,255,0.15)",border:"2px solid transparent",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}
        >
          {dark?"Hell":"Dunkel"}
        </button>
      </header>

      <main id="main-content" style={{paddingBottom:80,overflowX:"hidden"}}>
        {renderTab()}
      </main>

      <nav
        role="navigation"
        aria-label="Hauptnavigation"
        style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.bg2,borderTop:"1px solid "+C.border,display:"flex",zIndex:100}}
      >
        {NAV.map(({id,label})=>(
          <button
            key={id}
            onClick={()=>setTab(id)}
            aria-label={label}
            aria-current={tab===id?"page":undefined}
            style={S.navBtn(tab===id)}
          >
            <span aria-hidden="true" style={S.navIcon(tab===id)}>{ICONS[id]}</span>
            <span style={S.navLabel(tab===id)}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}