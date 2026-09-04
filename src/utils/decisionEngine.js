import { getTodaysPlan } from './trainingPlan'
import { crossedStreakMilestoneToday } from './exerciseHistory'

export function runDecisionEngine(healthData) {
  if (!healthData) return null

  const hour          = new Date().getHours()
  const todayComplete = healthData.todayWorkoutComplete === true
  const todayPlan     = getTodaysPlan()

  const _t   = new Date()
  const seed = _t.getFullYear() * 10000 + (_t.getMonth() + 1) * 100 + _t.getDate()
  const idx  = seed % 4

  // sleepLast7 is oldest→newest; reverse so [0] = most recent night
  // Apple Health records sleep with the morning date (session end), so today's entry is last night's completed sleep
  const sleepNights = (healthData.weekSummary?.sleepLast7 ?? []).slice().reverse()

  // 1. SLEEP TIME — highest priority
  if (hour >= 19 || hour < 4) {
    const subtitles = [
      "Wind down time. Sleep is tonight's workout.",
      "Sleep is the workout you can't skip. Go to bed.",
      "Screen off. The recovery starts now.",
      "Your next PR is on the other side of a full night.",
    ]
    return {
      ardenState: 'low_sleep',
      intensity:  0,
      flags:      ['SLEEP_TIME'],
      reasons:    ['Wind-down time — sleep is the priority now.'],
      subtitle:   subtitles[idx],
    }
  }

  // 2. CONSECUTIVE POOR SLEEP — 3+ nights under 6h (checked before single-night so AS6 can fire)
  let poorNights = 0
  for (const { hours } of sleepNights) {
    if (hours != null && hours < 5.5) poorNights++
    else break
  }
  if (poorNights >= 3) {
    const subtitles = [
      `${poorNights} nights of low sleep in a row. Recovery mode today.`,
      `${poorNights} short nights. Your body is keeping score.`,
      `Sleep debt is real. ${poorNights} nights in the red.`,
      `${poorNights} nights under target. Protect tonight.`,
    ]
    return {
      ardenState: 'overtraining',
      intensity:  2,
      flags:      ['POOR_SLEEP_STREAK'],
      reasons:    [`${poorNights} consecutive nights under 5.5h sleep — recovery priority.`],
      subtitle:   subtitles[idx],
    }
  }

  // 3. LAST NIGHT POOR SLEEP — overrides workout completion
  const lastNightSleep = sleepNights[0]?.hours ?? null
  if (lastNightSleep != null && lastNightSleep < 5.5) {
    const subtitles = [
      `Only ${lastNightSleep}h last night. Recovery comes first.`,
      `${lastNightSleep}h isn't enough. Take it easy today.`,
      `Short night. Protect your recovery today.`,
      `Low sleep last night. Your body needs the energy back.`,
    ]
    return {
      ardenState: 'low_sleep',
      intensity:  2,
      flags:      ['POOR_SLEEP'],
      reasons:    [`Only ${lastNightSleep}h sleep last night — recovery priority.`],
      subtitle:   subtitles[idx],
    }
  }

  // 4. ELEVATED RESTING HR — 10%+ above 7-day baseline (same threshold as MetricCards.jsx's
  // own RESTING HR "ELEVATED" badge, not a separately invented number). Maps to off_baseline,
  // not overtraining: this check is only ever reached when #2's POOR_SLEEP_STREAK was false
  // (the function already returned above if it were true), so a standalone elevated reading
  // — with no corroborating sign of accumulated training-load fatigue — reads as "something's
  // off" rather than confirmed overtraining. overtraining stays reserved for the sustained,
  // multi-night signal in #2, which wins by construction whenever both are true.
  const restingHR  = healthData.restingHR ?? null
  const hrBaseline = healthData.hrSevenDayAvg ?? healthData.weekSummary?.hrSevenDayAvg ?? null
  if (restingHR != null && hrBaseline != null && hrBaseline > 0) {
    const elevatedPct = ((restingHR - hrBaseline) / hrBaseline) * 100
    if (elevatedPct >= 10) {
      const subtitles = [
        `Resting HR ${Math.round(elevatedPct)}% above baseline. Worth keeping an eye on.`,
        `HR is up ${Math.round(elevatedPct)}% from baseline. Could be stress, heat, or just an off day.`,
        `Resting HR's off baseline today. Not a training-load thing necessarily — just noting it.`,
        `${Math.round(elevatedPct)}% above your 7-day average HR. Something's off — go easier today.`,
      ]
      return {
        ardenState: 'off_baseline',
        intensity:  4,
        flags:      ['ELEVATED_HR'],
        reasons:    [`Resting HR ${Math.round(elevatedPct)}% above 7-day baseline — off baseline, not confirmed overtraining.`],
        subtitle:   subtitles[idx],
      }
    }
  }

  // 5. LOW HRV — 20%+ below baseline
  const hrvToday = healthData.hrv ?? null
  const hrvTrend = healthData.hrvTrend ?? healthData.weekSummary?.hrvTrend ?? []
  if (hrvToday != null && hrvTrend.length >= 3) {
    const hrvAvg = hrvTrend.reduce((a, b) => a + b, 0) / hrvTrend.length
    const hrvDrop = ((hrvAvg - hrvToday) / hrvAvg) * 100
    if (hrvDrop >= 20) {
      const subtitles = [
        `HRV ${Math.round(hrvDrop)}% below baseline. Dial back today.`,
        `HRV's down. Favor steady over hard today.`,
        `Recovery signal is low. Take the edge off today's session.`,
        `HRV ${Math.round(hrvDrop)}% off baseline — moderate, not max effort.`,
      ]
      return {
        ardenState: 'low_sleep',
        intensity:  4,
        flags:      ['LOW_HRV'],
        reasons:    [`HRV ${Math.round(hrvDrop)}% below 7-day baseline — reduced intensity.`],
        subtitle:   subtitles[idx],
      }
    }
  }

  // 6. STREAK MILESTONE — a just-crossed 7/14/30-day streak. Checked after every recovery/
  // safety signal above (celebrating a milestone shouldn't override a genuine "you need rest"
  // message) but before the routine rest-day/workout-complete states below, since this is a
  // rare, once-a-day-at-most event worth surfacing over the everyday messaging. Same edge-
  // trigger function drives the confetti call in Home.jsx — one check, not two.
  const crossedMilestone = crossedStreakMilestoneToday(healthData.exerciseHistory)
  if (crossedMilestone != null) {
    const subtitles = [
      `${crossedMilestone} days in a row. That's not luck, that's a pattern.`,
      `${crossedMilestone}-day streak. Consistency is compounding.`,
      `${crossedMilestone} days straight. This is what it looks like when it's working.`,
      `${crossedMilestone} in a row — the habit is holding.`,
    ]
    return {
      ardenState: 'streak_milestone',
      intensity:  8,
      flags:      ['STREAK_MILESTONE'],
      reasons:    [`${crossedMilestone}-day streak just reached — first time hitting this milestone.`],
      subtitle:   subtitles[idx],
    }
  }

  // 7. REST DAY
  if (todayPlan?.type === 'rest') {
    const subtitles = [
      "Rest day. Recovery is part of the plan.",
      "Scheduled rest. The adaptation happens today.",
      "Rest day. Don't talk yourself out of it.",
      "Active recovery counts. Today is intentional.",
    ]
    return {
      ardenState: 'rest',
      intensity:  0,
      flags:      ['REST_DAY'],
      reasons:    ['Scheduled rest day — light stretch or full rest.'],
      subtitle:   subtitles[idx],
    }
  }

  // 8. WORKOUT COMPLETE
  if (todayComplete) {
    const subtitles = [
      "Workout logged. That's what consistency looks like.",
      "Done. Every session is a deposit.",
      "Logged. You showed up when it counted.",
      "One more in the bank. That's how it's built.",
    ]
    const postWorkoutState = seed % 2 === 0 ? 'pr' : 'full_intensity'
    return {
      ardenState: postWorkoutState,
      intensity:  10,
      flags:      ['WORKOUT_COMPLETE'],
      reasons:    ["Today's workout is done."],
      subtitle:   subtitles[idx],
    }
  }

  // 9. DEFAULT — ready to train
  const subtitles = [
    "Let's get after it.",
    "Data looks good. Your move.",
    "You've got a window. Use it.",
    "Everything's green. Don't wait.",
  ]
  return {
    ardenState: 'ready',
    intensity:  7,
    flags:      [],
    reasons:    ['Ready to train.'],
    subtitle:   subtitles[idx],
  }
}
