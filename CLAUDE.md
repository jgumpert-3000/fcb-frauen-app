# CLAUDE.md — FCB Frauen App

Dieses Dokument ist das Projektgedächtnis für Claude Code.
Lies es vollständig bevor du Änderungen machst.

---

## Was ist diese App?

Eine persönliche Progressive Web App (PWA) für FC Bayern München Frauen.
Sie zeigt Spielplan, Live-Ticker, Tabelle, Kader und Vereinsinfos.
Die App läuft im Browser und kann auf dem Homescreen installiert werden.

**Zielgruppe:** Privat, ein Nutzer (Jochen). Keine Backend-Infrastruktur, kein Login.

---

## Stack & Warum

| Technologie | Warum |
|---|---|
| React + Vite | Schnell aufgesetzt, kein Build-Overhead für eine kleine App |
| Kein CSS-Framework | Weniger Abhängigkeiten, volle Kontrolle. **Nicht nachträglich einführen ohne Absprache.** |
| Inline-CSS (React style props) | Historisch so gewachsen. Nachteil: Redesigns sind aufwändig. Vorteil: Alles in einer Datei. |
| Kein TypeScript | Bewusste Entscheidung für diese Projektgröße. Nicht einführen. |
| openligadb.de API | Kostenlos, keine Auth, zuverlässig für die Bundesliga. Muss immer erhalten bleiben. |
| PWA (manifest + service worker) | App kann auf Mobilgerät installiert werden |

---

## Unveränderliche Regeln

Diese Regeln gelten **immer**, auch wenn der Nutzer etwas anderes zu wollen scheint.

### 1. OpenLiga-Verbindung bleibt erhalten
Die App ist wertlos ohne Live-Daten. Alle API-Aufrufe müssen funktionieren.
- API-Basis: `https://api.openligadb.de`
- Liga: `fbl1` (1. Frauen-Bundesliga)
- Saison: Konstante `SAISON` — **jedes Jahr manuell aktualisieren** (siehe unten)
- Bayern Team-ID: `6063` — nicht ändern
- Poll-Intervall: 30 Sekunden — nicht aggressiver machen (API-Fair-Use)

**Vor jedem API-bezogenen Commit testen:**
```
https://api.openligadb.de/getcurrentgroup/fbl1
https://api.openligadb.de/getbltable/fbl1/2025
```

### 2. WCAG 2.1 AA — immer einhalten
Jede Änderung muss die Kontrastanforderungen erfüllen.

**Kontrastwerte der aktuellen Farben (einhalten):**

| Farbe | Verwendung | Hintergrund | Ratio | Min |
|---|---|---|---|---|
| `#fff` auf `HERO_BG #d91f2a` | Hero-Text | rot | 5.02:1 | ≥4.5 ✅ |
| `#fff` (BADGE.W) auf `#166534` | Sieg-Badge | grün | 7.13:1 | ≥4.5 ✅ |
| `#fff` (BADGE.L) auf `#991b1b` | Nied-Badge | rot | 8.31:1 | ≥4.5 ✅ |
| `#fff` (BADGE.D) auf `#92400e` | Unent-Badge | braun | 7.09:1 | ≥4.5 ✅ |
| `#f5f5f5` auf `#1a1a1a` | Haupttext (dark) | card | 15.96:1 | ≥4.5 ✅ |
| `#aaa` auf `#1a1a1a` | Sekundärtext (dark) | card | 7.49:1 | ≥4.5 ✅ |
| `#999` auf `#141414` | Nav-inaktiv (dark) | nav | 6.47:1 | ≥4.5 ✅ |
| `#22c55e` auf `#1a1a1a` | Sieg-Rand (dark) | card | 7.64:1 | ≥3.0 ✅ |
| `#111` auf `#f5f4f2` | Haupttext (light) | bg | hoch | ≥4.5 ✅ |

**Faustregeln:**
- `ROT (#e8212b)` darf NUR als Hintergrundfarbe oder für nicht-Text-Elemente verwendet werden. Als Textfarbe auf dunklen Karten = ❌ (3.88:1, zu wenig)
- `HERO_BG (#d91f2a)` ist die einzig korrekte Hintergrundfarbe für rote Hero-Blöcke
- Nie `rgba(255,255,255,x)` mit x < 1 für Text — volle Deckkraft verwenden
- Neue Farben immer prüfen: https://webaim.org/resources/contrastchecker/

**ARIA — immer vorhanden:**
- Buttons: `aria-label` wenn kein sichtbarer Text
- Aktiver Nav-Tab: `aria-current="page"`
- Toggle-Buttons: `aria-pressed`
- Dekorative Icons/Elemente: `aria-hidden="true"`
- Live-Daten: `aria-live="polite"`
- Fokus-Indikator: `:focus-visible` ist in der globalen CSS definiert, nicht entfernen

### 3. Kein Breaking der PWA
- `public/manifest.json` nicht löschen oder umbenennen
- `public/sw.js` (Service Worker) bei Cache-Änderungen aktualisieren
- `theme-color` in `index.html` bleibt `#e8212b`

---

## Design-System

### Farben
```js
ROT      = "#e8212b"  // Bayern-Rot — nur für Akzente, nicht als Textfarbe auf dunkel
HERO_BG  = "#d91f2a"  // Rot für Hero-Hintergründe (WCAG-korrigiert)

BADGE.W  = { bg:"#166534", text:"#fff", label:"SIEG" }
BADGE.L  = { bg:"#991b1b", text:"#fff", label:"NIED." }
BADGE.D  = { bg:"#92400e", text:"#fff", label:"UNENT." }

POS_COLOR = { Tor:"#e8212b", Abwehr:"#1a6fc4", Mittelfeld:"#2ea84e", Sturm:"#e8a000" }
```

### Typografie (Designsprache)
Die App hat einen klaren visuellen Rhythmus — bitte beibehalten:

| Element | Größe | Gewicht | Verwendung |
|---|---|---|---|
| Hero-Headline | 44px | 900 | Jeder Tab hat eine (`KADER`, `TABELLE`, etc.) |
| Hero-Label | 11px | 700 | Kleine Kategorie-Beschriftung über der Headline |
| Hero-Subtext | 12–13px | 400 | Details unter der Headline |
| Countdown-Zahlen | 48px | 800 | Nur im Countdown-Tab |
| Kartentext | 13px | 700 | Spielname, Spielername |
| Sekundärtext | 11px | 400–600 | Datum, Spieltag, Zusatzinfos |
| Section-Label | 11px | 700 | „LETZTE SPIELE" etc., uppercase, letterSpacing:2 |

### Abstände (aktuell nicht systematisiert)
Häufig verwendete Werte: `8px, 12px, 14px, 16px, 20px, 24px, 28px, 32px`
Hero-Padding: `28px 20px 32px` (Standard, nicht abweichen)
Content-Padding: `20px 20px` (Standard nach Hero-Block)

---

## Architektur

### Aktuelle Struktur (Stand: April 2025)
```
src/
  App.jsx      ← gesamte App in einer Datei (~500 Zeilen)
  App.css      ← Vite-Boilerplate, wird kaum genutzt
  index.css    ← Reset only (box-sizing, margin, font-family)
  main.jsx     ← React-Einstiegspunkt
public/
  manifest.json
  sw.js
  icon-192.png, icon-512.png
```

### Bekannte Architektur-Schwäche
Alles in einer Datei mit Inline-CSS macht Redesigns aufwändig. Das ist gewachsen und war beim Start kein Problem. Wenn Redesigns häufiger werden, lohnt sich:
1. Design-Tokens als eigene Datei (`src/tokens.js`)
2. Komponenten auslagern (`MatchCard`, `HeroBlock`, `Badge`)

**Diese Refactoring-Entscheidung erst mit dem Nutzer besprechen**, nicht eigeninitiativ machen.

---

## Manuell zu pflegende Daten

Diese Dinge ändern sich in der Realität, aber nicht automatisch im Code:

### Jedes Jahr (Saisonstart ~Juli/August)
```js
// App.jsx, Zeile 13
const SAISON = "2025";  // → auf "2026" ändern, dann testen!
```
Auch prüfen: Ändert sich `LIGA` ("fbl1")? Unwahrscheinlich, aber möglich.

### Bei Kader-Änderungen (Transfers, Verletzungen)
```js
// App.jsx, KADER-Konstante (~Zeile 17–46)
// Spielerinnen hinzufügen/entfernen/umbenennen
// Trikotnummern können sich ändern
// Altersangaben jährlich aktualisieren
```

### Vereinsdaten bei Änderungen
```js
// App.jsx, VEREIN_STATS (~Zeile 51–55)
// Meisterschaften, Stadionname etc. bei Bedarf
```

---

## Häufige Fehlerquellen

### API gibt leere Daten zurück
- `SAISON` stimmt nicht mit der laufenden Saison überein
- API-Endpoint geändert → prüfen: https://api.openligadb.de/swagger
- `groupOrderID` liegt außerhalb des gültigen Bereichs

### PWA-Cache zeigt alte Version
- Service Worker cached aggressiv. Nach Deployments:
  `public/sw.js` → Cache-Version erhöhen (z.B. `v1` → `v2`)

### Kontrast-Fehler nach Designänderungen
- Nie ROT (`#e8212b`) als Textfarbe auf dunklen Karten verwenden
- Immer Kontrast prüfen bevor committing

### Sonderzeichen in Spielernamen
- Commit `32d5132` hat das schon einmal gefixt
- `ć`, `ö`, `ü`, `ā` etc. korrekt in UTF-8 speichern
- Nie Textinhalte mit `replace()` "bereinigen"

---

## Vor jedem Commit prüfen

```
☐ App läuft lokal ohne Fehler (npm run dev)
☐ Alle 6 Tabs sind sichtbar und funktionieren
☐ Dark Mode und Hell Mode funktionieren beide
☐ Neue Farben/Texte auf Kontrast geprüft
☐ Keine console.error-Meldungen (außer API-Timeouts)
☐ ARIA-Attribute bei neuen interaktiven Elementen gesetzt
☐ OpenLiga-API antwortet noch korrekt
```

---

## Was Claude NICHT eigeninitiativ tun soll

- Kein CSS-Framework einführen (Tailwind, Bootstrap etc.)
- Kein TypeScript einführen
- Keine neue npm-Abhängigkeiten hinzufügen ohne Absprache
- Kein Refactoring in Komponenten ohne Absprache
- Nicht die PWA-Dateien löschen oder umbenennen
- Nicht die API-Polling-Rate unter 30 Sekunden setzen
- Keine Daten persistent speichern (localStorage etc.) ohne Absprache
- Nicht auf `main` pushen ohne den Nutzer zu fragen

---

## Gute Fragen für neue Anfragen

Wenn eine Anfrage unklar ist, vor der Umsetzung fragen:

1. **Soll es in Dark Mode und Hell Mode funktionieren?** (Standard: ja)
2. **Ist das eine temporäre Änderung oder permanent?** (beeinflusst Commit-Strategie)
3. **Soll die OpenLiga-Verbindung davon betroffen sein?** (wenn ja: vorsichtig)
4. **Gibt es einen Designvorschlag oder soll Claude entscheiden?** (Nutzer bevorzugt Vorschläge)

---

## Deployment

| Umgebung | URL |
|---|---|
| Produktion | https://fcb-frauen-app.vercel.app |
| Vercel-Projekt | https://vercel.com/jgumpert-3000s-projects/fcb-frauen-app |

**Workflow:** Jeder `git push` auf `main` löst automatisch ein Vercel-Deployment aus.
Kein manueller Deploy-Schritt nötig. Status unter dem Vercel-Link prüfbar.

Vercel-Projekt-ID: `prj_rYlIrsYs2o6cNpqBOkyDqLbdkXu8`
Team: `jgumpert-3000s-projects` (`team_51jhPohum8Yg8U3z7RDUm49P`)

---

## Entwicklung starten

```bash
npm run dev        # Dev-Server auf http://localhost:5173
npm run build      # Produktions-Build
npm run preview    # Build lokal testen
```

Node/npm Pfad auf diesem Mac: `/usr/local/bin/node`, `/usr/local/bin/npm`
(nicht im Standard-PATH — bei Bedarf `export PATH="$PATH:/usr/local/bin"`)
