export function runDecisionEngine(healthData) {
  if (!healthData) return null

  const { sleep, restingHR, hrv, hrTrend, hrvTrend, steps } = healthData

  const result = {
    ardenState: 'ready',
    intensity: 10,
    workoutType: 'Full session',
    subtitle: "Let's get after it.",
    todayPlan: 'Full intensity',
    tomorrowWorkout: 'Check back tomorrow',
    flags: [],
    reasons: [],
  }

  // ── SLEEP CHECK ──────────────────────────────────────────
  const sleepHrs = sleep?.total || 0

  if (sleepHrs < 4) {
    result.ardenState = 'overtraining'
    result.intensity = 0
    result.workoutType = 'No workout'
    result.subtitle = 'Under 4 hours of sleep. Rest is the workout today.'
    result.todayPlan = 'No workout'
    result.flags.push('CRITICAL_SLEEP')
    result.reasons.push(`Only ${sleepHrs}h sleep — no training today`)
    return result
  }

  if (sleepHrs < 5) {
    result.ardenState = 'low_sleep'
    result.intensity = 3
    result.workoutType = 'Active recovery only'
    result.subtitle = 'Low sleep. Easy walk or light stretch only.'
    result.todayPlan = '20 min easy walk'
    result.flags.push('LOW_SLEEP')
    result.reasons.push(`${sleepHrs}h sleep — recovery day only`)
    return result
  }

  if (sleepHrs < 6) {
    result.ardenState = 'low_sleep'
    result.intensity = Math.max(1, result.intensity - 4)
    result.flags.push('REDUCED_SLEEP')
    result.reasons.push(`${sleepHrs}h sleep — intensity reduced 40%`)
  }

  if (sleepHrs < 7) {
    result.intensity = Math.max(1, result.intensity - 2)
    result.reasons.push(`${sleepHrs}h sleep — moderate intensity only`)
  }

  // ── RESTING HR CHECK ─────────────────────────────────────
  if (hrTrend && hrTrend.length >= 3) {
    const sevenDayAvg = hrTrend.reduce((a, b) => a + b, 0) / hrTrend.length
    const currentHR = restingHR
    const elevatedPct = ((currentHR - sevenDayAvg) / sevenDayAvg) * 100

    if (elevatedPct >= 10) {
      result.ardenState = 'overtraining'
      result.intensity = Math.max(1, result.intensity - 5)
      result.flags.push('ELEVATED_HR')
      result.reasons.push(`Resting HR ${Math.round(elevatedPct)}% above 7-day avg — active recovery only`)
      result.subtitle = 'Resting HR is elevated. Your body is working hard — back off today.'
      result.todayPlan = 'Active recovery'
    }
  }

  // ── HRV CHECK ────────────────────────────────────────────
  if (hrvTrend && hrvTrend.length >= 3) {
    const hrvAvg = hrvTrend.reduce((a, b) => a + b, 0) / hrvTrend.length
    const currentHRV = hrv
    const hrvDrop = ((hrvAvg - currentHRV) / hrvAvg) * 100
    const hrvRise = ((currentHRV - hrvAvg) / hrvAvg) * 100

    if (hrvDrop >= 20) {
      result.intensity = Math.max(1, result.intensity - 3)
      result.flags.push('LOW_HRV')
      result.reasons.push(`HRV ${Math.round(hrvDrop)}% below baseline — reduced intensity`)
    }

    if (hrvRise >= 10 && sleepHrs >= 7) {
      result.ardenState = 'full_intensity'
      result.intensity = 10
      result.flags.push('HIGH_HRV')
      result.reasons.push(`HRV above baseline + good sleep — green light for hard session`)
      result.subtitle = 'HRV up, sleep solid. Green light — push today.'
      result.todayPlan = 'Full intensity'
    }
  }

  // ── FINAL STATE ASSIGNMENT ───────────────────────────────
  if (result.flags.length === 0) {
    if (sleepHrs >= 7) {
      result.ardenState = 'full_intensity'
      result.subtitle = "Data looks good. Full session today."
      result.todayPlan = 'Full intensity'
    } else {
      result.ardenState = 'ready'
      result.subtitle = "Moderate sleep. Good enough — let's move."
      result.todayPlan = 'Moderate intensity'
    }
  }

  // ── INTENSITY → ARDEN STATE FALLBACK ────────────────────
  if (!result.flags.includes('HIGH_HRV') &&
      !result.flags.includes('ELEVATED_HR') &&
      !result.flags.includes('CRITICAL_SLEEP') &&
      !result.flags.includes('LOW_SLEEP')) {
    if (result.intensity <= 4) result.ardenState = 'low_sleep'
    else if (result.intensity <= 7) result.ardenState = 'ready'
    else result.ardenState = 'full_intensity'
  }

  // ── SUBTITLE BY INTENSITY ────────────────────────────────
  if (result.intensity <= 5 && result.intensity > 3) {
    result.subtitle = "Data says take it easy today. Moderate session only."
    result.ardenState = 'low_sleep'
  } else if (result.intensity <= 7 && result.intensity > 5) {
    result.subtitle = "Decent data. Solid session, don't push the ceiling."
    result.ardenState = 'ready'
  }

  return result
}
