# Design enhancements — scoping pass (Sept 2 2026)

Investigation only. Nothing here was installed or implemented — bundle sizes below are
from published registry/Bundlephobia data (queried live, not guessed), not a local install.
This is a planning doc for review, not a build queue.

Current bundle budget context: recharts (added earlier this session) took the production
bundle from 232.94 KB → 600.22 KB uncompressed (+367.28 KB) and 72.96 KB → 181.05 KB gzip
(+108.09 KB). That's the scale any of the three below would be judged against.

---

## 1. react-activity-calendar — workout consistency heatmap

**Bundle cost (Bundlephobia, v3.2.1, checked live):**
- Package's own main chunk: 6.05 KB gzip (14.48 KB min)
- A secondary chunk Bundlephobia reports alongside it: 17.03 KB gzip (46.6 KB min) —
  this is pulled in because the package depends on **date-fns** and **@floating-ui/react**
  as real dependencies, not peer/dev deps. Combined realistic cost is closer to **~23 KB
  gzip**, not the ~6 KB the main-chunk number alone suggests. React is a peer dependency
  (already satisfied).

**Lighter alternative worth noting:** the visual is just a grid of colored day-cells by
intensity — the same shape as `WeeklySummary.jsx`'s existing hand-rolled
`SlimSleepSparkline` (inline `<div>` bars, no library, ~35 lines). A heatmap grid is
comparable complexity — a hand-rolled version would cost **0 KB** and avoid pulling in
date-fns/floating-ui for something this app doesn't otherwise need. Given the codebase's
established convention (no chart library existed until this session's recharts decision,
and that was for a genuinely complex dual-axis trend line — this is a simpler visual), I'd
flag the hand-rolled route as worth considering over the dependency, though that's a
build-time decision, not something to resolve in scoping.

**Data available today:** `getWorkoutLogs()` in `src/utils/workoutLogger.js` already
returns `[{date, completed, ...}]` per logged session — the exact shape needed. New
aggregation required: group logs by date, count/roll up multiple same-day sessions (rare
but possible), map to the library's expected `{date, count, level}` shape (or, for a
hand-rolled version, straight to a 0–4 intensity bucket). Light aggregation, not a new
data pipeline — comparable to what `useHealthData.js` already does for `sleepLast7`/
`stepsLast7`.

**Where it would live:** `WeeklySummary.jsx` ("THIS WEEK" card) is the natural home given
its existing sleep-bars sparkline sits right there and workouts-this-week is already one
of its stats — but a 7-day-wide calendar heatmap really wants more history (12+ weeks) to
be useful, which would crowd that card's current compact layout. A new dedicated card
(sibling to `WeeklySummary` in `Home.jsx`'s `.plan-week-row`, or its own full-width row)
is the better fit if the goal is a real multi-month consistency view rather than a
same-week stat.

**Effort estimate: Small–Medium.** New aggregation function in `workoutLogger.js` or
`useHealthData.js` (small), new card component matching the existing dark/light theme
convention (small), wiring into `Home.jsx` (trivial). If the library is used as-is,
integration is the easy part; the ~23 KB dependency cost is the real tradeoff, not the
code.

---

## 2. Framer Motion — state transitions, not decoration

**Bundle cost (Bundlephobia, v13.1.1 checked; registry confirms 13.2.0 is current latest,
package not deprecated):**
- Full `import { motion } from 'framer-motion'`: **62.05 KB gzip** (185.3 KB min) — this
  pulls in the whole animation engine (`motion-dom` alone is ~328 KB unpacked).
- The library's own documented `LazyMotion` + `m` + `domAnimation` pattern: **~4.6 KB
  gzip** for the initial import, with the `domAnimation` feature set (~15 KB total)
  loaded separately/lazily. That's the tree-shaking path the task asked about — it exists
  and is well-documented, but it's opt-in: naive imports (`motion.div`, etc.) get the full
  62 KB, not a shrunk version. Using the small path constrains you to `LazyMotion`'s API
  shape (`<m.div>` instead of `<motion.div>`), which is a real (if small) discipline cost
  on top of the bundle cost.
- Note: the project has rebranded to "Motion" (motion.dev, `motion` package name), with
  `framer-motion` maintained as the React-specific, still-current package. Either name
  gets you the same code today.

**Concrete transitions worth animating (found in code, not hypothetical):**
1. **Arden character state swap** (`DashboardHeader.jsx:131-142`) — `ARDEN_IMAGES[ardenState]`
   currently hard-swaps a plain `<img src>` with zero transition between the six states
   (rest/ready/pr/full_intensity/low_sleep/overtraining, i.e. AS1–6). This is the single
   best fit for Framer Motion's actual strength (`AnimatePresence` + `motion.img` crossfade)
   — a state machine swap, not decoration.
2. **Steps count-up** (`MetricCards.jsx:98`, `StepsCard`) — `{s.toLocaleString()}` is a
   plain text node, updates instantly on each 5-minute health-data poll.
3. **Current weight count-up** (`TrainingPlanCard.jsx:206`) — `{currentWeight} lbs`, same
   pattern.
   For #2/#3: Framer Motion can do this (`useSpring`/`useMotionValue` driving a
   `motion.span`), but a count-up is also entirely achievable with a ~15-line
   `requestAnimationFrame` hook and zero dependencies — worth flagging since these two are
   the *weakest* justification for pulling in the library if Arden's crossfade (#1) turns
   out to be the only thing actually wanted.

**Effort estimate: Medium.** #1 touches one component and is a clean, contained win.
#2/#3 touch two more components each but are simple once the pattern is set up. The real
cost driver is the bundle-size decision (full import vs. LazyMotion discipline), not the
component count.

---

## 3. canvas-confetti — milestone celebrations

**Bundle cost (Bundlephobia, v1.9.4, checked live): 4.25 KB gzip (10.49 KB min), zero
dependencies.** Confirms the library's own "a few KB" claim — this one checks out exactly
as advertised, no surprises.

**Concrete trigger conditions found in existing code:**
1. **Streak milestone** — `streak` is already computed in `useHealthData.js` (counts
   consecutive days with ≥15 exercise minutes) and passed through to `WeeklySummary.jsx`.
   Firing confetti at round numbers (7/14/30/60/100 days) needs new logic: comparing
   today's streak to the last-celebrated milestone, gated by a `localStorage` flag so it
   fires once per crossing, not once per render/reload — same pattern already used for the
   one-time race-data migration flag in `raceManager.js` (`ardenfit_races_cleared_2026_09`).
2. **First sub-155 lb reading** — `getWeightTarget()` in `trainingPlan.js` already exposes
   the flat 155 lb target and `lbsRemaining === 0`/`'Goal reached!'` logic exists in
   `TrainingPlanCard.jsx`. "First time" detection needs a one-time `localStorage` flag,
   same pattern as above — the comparison itself is already computed, just not persisted
   as a one-time event.
3. **Workout completion** — already has a real celebration hook: `WorkoutView.jsx`
   navigates to `/` with `{state: {justCompleted: true}}`, and `Home.jsx`'s `celebrating`
   boolean already flips `ardenState` to `'pr'` for 5 seconds with a text subtitle change.
   This is the natural integration point to *extend* with confetti (it already fires on
   every completion, so pairing it with a milestone check from #1/#2 — rather than firing
   confetti on every single workout — is what would keep it feeling like a celebration
   instead of noise).

**Effort estimate: Small.** The trigger *detection* logic (one-time flags per milestone)
is the only genuinely new code; the confetti call itself is a single import + function
call at the point `celebrating` already exists. This is the cheapest of the three to both
build and to bundle.
