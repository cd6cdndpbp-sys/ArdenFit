# ArdenFit — Claude Instructions

## Project overview

ArdenFit is a React + Vite mobile-first PWA fitness dashboard for Joma — a beginner-level walker building toward the 2027 Marine Corps Marathon. The app reads Apple Health data from a local Node server (`server.js`) at port 3001, stores workout logs and races in localStorage, and applies a 5-phase MCM training plan.

**User constraints (always respect these in workout/plan logic):**
- No overhead movements, no jumping, no explosive movements
- Treadmill walk max speed: 3.6 mph
- Beginner fitness level — recovery matters more than volume

## Architecture

```
src/
  hooks/         useHealthData, useTheme, useDecision
  utils/         decisionEngine, trainingPlan, workoutGenerator, workoutLogger, raceManager
  themes/        timeThemes.js — 4 time periods × light/dark = 8 theme variants
  components/    BottomRow, DashboardHeader, MetricCards, TrainingPlanCard, WeeklySummary, WorkoutHistory
  pages/         Home, WorkoutView, RaceManager
server.js        Express — GET/POST /api/health, merges health-data.json on POST
```

## Styling rules

**No CSS framework.** All styles are inline JS objects passed via `style={{}}`.

Use `index.css` only for things that require media queries — responsive layout, show/hide at breakpoints. Never put visual design (colors, spacing, typography) in `index.css`.

Breakpoint: `600px`. Mobile is `max-width: 600px`, desktop is `min-width: 601px`.

When a layout difference is driven by screen size, use a CSS class + media query rather than an inline `isMobile` ternary. Never compute `isMobile` with `window.innerWidth` inline.

## Theming

Every component that renders color or background receives `theme` as a prop. Never hardcode colors that belong to the theme — use `theme.accent`, `theme.cardBg`, `theme.textPrimary`, `theme.textMuted`, `theme.cardBorder`, `theme.bgSecondary`, `theme.badgeGood`, `theme.badgeWarn`, `theme.badgeNormal`, etc.

`useTheme()` in `src/hooks/useTheme.js` returns the active theme. It combines time-of-day (morning/afternoon/evening/night) with system color scheme (light/dark) via `getTimeTheme(hour, colorScheme)` from `src/themes/timeThemes.js`.

Theme transitions: `'background-color 1.5s ease, border-color 1.5s ease'`. Use this constant (`CARD_TRANSITION`) rather than writing it inline each time.

## Date strings — always use local time

**Never use `new Date().toISOString().split('T')[0]` anywhere in this codebase.** It returns UTC and produces the wrong date in US timezones before midnight UTC (roughly before 8pm ET). This bug has appeared three times: steps filter in `useHealthData`, workout log writer in `WorkoutView`, and a stored localStorage entry in `workoutLogger`.

Always construct date strings from local time:
```js
const d = new Date()
const localDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
```

This applies everywhere: filtering health metrics, stamping workout logs, comparing dates in localStorage, building `last7Days` arrays — anywhere a calendar date string is needed.

## Health data

Date format from Apple Health: `'2026-05-29 09:12:00 -0400'` — timezone-offset strings, not UTC.

Filter by date using `.startsWith(localDate)` with the local date string above.

## Key data flows

- `useHealthData` → fetches from server, computes `weekSummary`, polls every 5 minutes
- `useDecision` → runs `decisionEngine` on health data, returns `{ ardenState, intensity, flags, reasons }`
- `getTodaysPlan()` in `trainingPlan.js` → returns today's training plan entry (`type: 'walk' | 'strength' | 'rest'`)
- `workoutGenerator.js` → checks `getTodaysPlan()` first; rest days → Active Recovery, walk days → Treadmill Walk, else → strength generator
- Workout completion: `WorkoutView` navigates to `/` with `{ state: { justCompleted: true } }` — Home reads `location.state?.justCompleted` for celebration state

## localStorage keys

- `ardenfit_workout_log` — workout logs (read/write via `workoutLogger.js`)
- `ardenfit_races` — race entries (read/write via `raceManager.js`)

## Server

`server.js` runs on port 3001, bound to `0.0.0.0` (accessible on LAN at `192.168.1.221:3001`).

POST `/api/health` merges incoming metrics into `health-data.json` by metric name, deduplicates data entries by `d.date`. Never overwrites existing data — only extends it.

## What not to do

- Don't add comments explaining what code does — name things clearly instead
- Don't add error handling for internal code paths that can't fail
- Don't introduce abstractions or helpers for one-off logic
- Don't touch `health-data.json` — it's live data, not a fixture
- Don't leave `console.log` debug statements in committed code
- Don't use `justify-content: space-between` on flex card containers — use `gap` so content stacks from the top
