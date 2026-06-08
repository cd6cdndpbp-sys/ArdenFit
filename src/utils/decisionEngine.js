import { getTodaysPlan } from './trainingPlan'

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

  // 4. REST DAY
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

  // 5. WORKOUT COMPLETE
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

  // 6. DEFAULT — ready to train
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
