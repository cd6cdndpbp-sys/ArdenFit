import { getTodaysPlan } from './trainingPlan'

const EXERCISES = {
  lowerBody: [
    {
      name: 'Glute Bridge',
      sets: 3, reps: 12, rest: 60, weight: 'bodyweight',
      formCue: 'Drive through heels, squeeze glutes at the top',
      easier: 'Reduce range — only lift hips halfway',
      harder: 'Hold 5lb dumbbell on hips',
      safetyNote: null
    },
    {
      name: 'Wall Squat',
      sets: 3, reps: 10, rest: 60, weight: 'bodyweight',
      formCue: 'Back flat against wall, feet shoulder-width',
      easier: 'Reduce depth — only go to comfortable range',
      harder: 'Hold 5lb dumbbells at sides',
      safetyNote: 'Hold wall briefly when standing if balance feels off'
    },
    {
      name: 'Side-Lying Hip Abduction',
      sets: 3, reps: 15, rest: 45, weight: 'band',
      formCue: 'Keep hips stacked, controlled movement up and down',
      easier: 'Remove band, bodyweight only',
      harder: 'Add resistance band above knees',
      safetyNote: null
    },
    {
      name: 'Seated Calf Raise',
      sets: 3, reps: 15, rest: 45, weight: 'bodyweight',
      formCue: 'Full range — heels down then up onto toes',
      easier: 'Reduce reps to 10',
      harder: 'Hold 5lb dumbbells on thighs',
      safetyNote: null
    },
    {
      name: 'Heel Slide',
      sets: 3, reps: 12, rest: 45, weight: 'bodyweight',
      formCue: 'Lying flat, slide heel toward glutes slowly',
      easier: 'Reduce range of motion',
      harder: 'Add resistance band above knee',
      safetyNote: null
    },
  ],
  upperBody: [
    {
      name: 'Seated Row (Band)',
      sets: 3, reps: 12, rest: 60, weight: 'band',
      formCue: 'Pull elbows straight back, squeeze shoulder blades',
      easier: 'Use lighter band or less tension',
      harder: 'Pause 2 seconds at the peak of each rep',
      safetyNote: null
    },
    {
      name: 'Bicep Curl',
      sets: 3, reps: 12, rest: 45, weight: '5lb dumbbells',
      formCue: 'Elbows stay at sides, controlled down',
      easier: 'Use band instead of dumbbells',
      harder: 'Slow the lowering phase to 3 seconds',
      safetyNote: null
    },
    {
      name: 'Tricep Kickback',
      sets: 3, reps: 12, rest: 45, weight: '5lb dumbbells',
      formCue: 'Hinge forward slightly, extend arm straight back',
      easier: 'Use band instead of dumbbells',
      harder: 'Pause 1 second fully extended',
      safetyNote: null
    },
    {
      name: 'Lateral Raise to 45° Only',
      sets: 2, reps: 10, rest: 60, weight: '5lb dumbbells',
      formCue: 'Stop at hip height — never go above shoulder',
      easier: 'Use band, reduce range further',
      harder: 'Slow the lowering phase to 3 seconds',
      safetyNote: '⚠ Stop at hip height only — never above shoulder'
    },
    {
      name: 'Seated Chest Press (Band)',
      sets: 3, reps: 12, rest: 60, weight: 'band',
      formCue: 'Keep elbows below shoulder height throughout',
      easier: 'Reduce band tension',
      harder: 'Pause 2 seconds fully extended',
      safetyNote: 'Keep elbows below shoulder height at all times'
    },
  ],
  core: [
    {
      name: 'Dead Bug',
      sets: 3, reps: 8, rest: 45, weight: 'bodyweight',
      formCue: 'Lower back stays flat on floor the entire time',
      easier: 'Move one limb at a time instead of opposite pairs',
      harder: 'Add 3 second hold at full extension',
      safetyNote: null
    },
    {
      name: 'Bird Dog',
      sets: 3, reps: 8, rest: 45, weight: 'bodyweight',
      formCue: 'Hips stay square to floor, move slowly',
      easier: 'Extend arm only, keep knee down',
      harder: 'Hold 3 seconds fully extended',
      safetyNote: 'Use mat for knee comfort'
    },
    {
      name: 'Seated Core Twist (Band)',
      sets: 3, reps: 10, rest: 45, weight: 'band',
      formCue: 'Rotate from core, not shoulders',
      easier: 'No band, hands clasped in front',
      harder: 'Increase band tension',
      safetyNote: null
    },
  ],
  flexibility: [
    { name: 'Hip Flexor Stretch',       duration: 30, instruction: '30 sec each side — lunge position, back knee on mat' },
    { name: 'Seated Hamstring Stretch', duration: 30, instruction: '30 sec each side — seated, reach toward foot' },
    { name: 'Doorway Chest Stretch',    duration: 30, instruction: '30 sec — forearms on doorframe, lean forward gently' },
    { name: 'Seated Spinal Twist',      duration: 30, instruction: '30 sec each side — seated, rotate gently' },
    { name: 'Calf Stretch',             duration: 30, instruction: '30 sec each side — hands on wall, step back' },
  ],
}

const WEEKLY_SPLIT = {
  1: { type: 'Lower Body Strength',          exercises: ['lowerBody', 'core'] },
  2: { type: 'Treadmill Walk',               exercises: ['cardio'] },
  3: { type: 'Upper Body + Core',            exercises: ['upperBody', 'core'] },
  4: { type: 'Treadmill Walk + Flexibility', exercises: ['cardio', 'flexibility'] },
  5: { type: 'Full Body Circuit',            exercises: ['lowerBody', 'upperBody', 'core'] },
  6: { type: 'Long Walk',                    exercises: ['cardio'] },
  0: { type: 'Rest + Flexibility',           exercises: ['flexibility'] },
}

export function generateWorkout(decision, dayOfWeek) {
  const planToday = getTodaysPlan()

  const recoveryFlags = ['POOR_SLEEP', 'POOR_SLEEP_STREAK']
  const isRecovery = decision?.flags?.some(f => recoveryFlags.includes(f))

  if (isRecovery) {
    return {
      type:      'Active Recovery',
      duration:  15,
      intensity: decision?.intensity ?? 2,
      warmup:    [],
      exercises: [],
      cardio:    null,
      cooldown:  EXERCISES.flexibility,
      coachNote: decision?.reasons?.[0] ?? 'Recovery day — light stretching only.',
      flags:     decision?.flags ?? [],
    }
  }

  if (planToday?.type === 'rest') {
    return {
      type:      'Active Recovery',
      duration:  15,
      intensity: decision?.intensity || 3,
      warmup:    [],
      exercises: [],
      cardio:    null,
      cooldown:  EXERCISES.flexibility,
      coachNote: 'Rest day per training plan. Light stretching only.',
      flags:     ['REST_DAY'],
    }
  }

  if (planToday?.type === 'walk') {
    return {
      type:      'Treadmill Walk',
      duration:  Math.round(planToday.distance / 3.1 * 60),
      intensity: decision?.intensity || 6,
      warmup: [
        { name: 'Gentle March in Place', duration: 2, instruction: '2 min slow, hands on wall if needed' },
      ],
      exercises: [],
      cardio: {
        duration:    Math.round(planToday.distance / 3.1 * 60),
        speed:       planToday.speed,
        instruction: `${planToday.distance} mile ${planToday.label.toLowerCase()} at ${planToday.speed}. Stay conversational — if you can't talk, slow down.`,
      },
      cooldown:  EXERCISES.flexibility.slice(0, 3),
      coachNote: `${planToday.label} · ${planToday.distance} miles`,
      flags:     [],
    }
  }

  if (planToday?.type === 'run') {
    // Long runs and race day are distance-based with no fixed pace (per plan — pace isn't
    // restricted); RUN_PACE_ESTIMATE_MIN_PER_MILE only estimates a duration for display/logging.
    const RUN_PACE_ESTIMATE_MIN_PER_MILE = 15
    const isLongRun = planToday.distance != null
    const duration  = isLongRun
      ? Math.round(planToday.distance * RUN_PACE_ESTIMATE_MIN_PER_MILE)
      : planToday.durationMin

    const intervalNote = planToday.runWalkRatio
      ? `Run/walk ${planToday.runWalkRatio} intervals.`
      : 'Continuous running — take walk breaks if you need them.'
    const stridesNote = planToday.strides ? ' Finish with a few relaxed strides.' : ''

    return {
      type:      planToday.raceDay ? 'Race Day' : planToday.label,
      duration,
      intensity: decision?.intensity || 6,
      runWalkRatio: planToday.runWalkRatio ?? null, // carried through so WorkoutView can log continuous-vs-interval
      warmup: [
        { name: 'Gentle March in Place', duration: 2, instruction: '2 min slow, hands on wall if needed' },
      ],
      exercises: [],
      cardio: {
        duration,
        speed:       null,
        instruction: isLongRun
          ? `${planToday.distance} mile ${planToday.label.toLowerCase()}. ${intervalNote} Stay conversational — pace is your call.`
          : `${planToday.durationMin} min ${planToday.label.toLowerCase()}. ${intervalNote} Stay conversational — pace is your call.${stridesNote}`,
      },
      cooldown:  EXERCISES.flexibility.slice(0, 3),
      coachNote: planToday.raceDay
        ? '🏁 Race day — 10-Mile Tune-Up. Trust the training.'
        : `${planToday.label}${isLongRun ? ` · ${planToday.distance} miles` : ` · ${planToday.durationMin} min`}`,
      flags:     planToday.raceDay ? ['RACE_DAY'] : [],
    }
  }

  // Race Build's Tue/Thu strength days are driven directly by phase data (strengthGroup),
  // not the generic day-of-week WEEKLY_SPLIT table below — that table stays untouched for
  // every other phase's strength days.
  if (planToday?.type === 'strength' && planToday.strengthGroup) {
    const intensity = decision?.intensity || 7
    const setsMultiplier = intensity >= 8 ? 1 : intensity >= 5 ? 0.67 : 0.33
    const scaleExercise = (ex) => ({ ...ex, sets: Math.max(1, Math.round(ex.sets * setsMultiplier)) })

    const groupExercises = planToday.strengthGroup === 'A'
      ? [...EXERCISES.lowerBody.slice(0, 3), ...EXERCISES.core.slice(0, 2)]
      : [...EXERCISES.upperBody.slice(0, 3), ...EXERCISES.core.slice(0, 2)]

    return {
      type:      planToday.label,
      duration:  planToday.duration,
      intensity,
      warmup: [
        { name: 'Gentle March in Place', duration: 2, instruction: '2 min — slow, controlled, hands on wall if needed' },
        { name: 'Ankle Circles',         duration: 1, instruction: '30 sec each foot — seated is fine' },
      ],
      exercises: groupExercises.map(scaleExercise),
      cardio:    null,
      cooldown:  EXERCISES.flexibility,
      coachNote: planToday.label,
      flags:     decision?.flags || [],
    }
  }

  const intensity = decision?.intensity || 7
  const split = WEEKLY_SPLIT[dayOfWeek]

  const setsMultiplier = intensity >= 8 ? 1 : intensity >= 5 ? 0.67 : 0.33

  const scaleExercise = (ex) => ({
    ...ex,
    sets: Math.max(1, Math.round(ex.sets * setsMultiplier)),
  })

  let exercises = []
  split.exercises.forEach(group => {
    if (group === 'cardio' || group === 'flexibility') return
    exercises = [...exercises, ...EXERCISES[group].slice(0, 3).map(scaleExercise)]
  })

  const hasCardio = split.exercises.includes('cardio')
  const cardioDuration = intensity >= 8 ? 30 : intensity >= 5 ? 20 : 10
  const cardio = hasCardio ? {
    duration: cardioDuration,
    speed: '3.0–3.5 mph',
    instruction: `${cardioDuration} min easy treadmill walk. Stay comfortable — you should be able to hold a conversation.`,
  } : null

  const cooldown = EXERCISES.flexibility

  const warmup = [
    { name: 'Gentle March in Place', duration: 2, instruction: '2 min — slow, controlled, hands on wall if needed' },
    { name: 'Ankle Circles',         duration: 1, instruction: '30 sec each foot — seated is fine' },
    { name: 'Seated Hip Circles',    duration: 1, instruction: '30 sec each direction — loosens hips before lower body work' },
    { name: 'Shoulder Rolls',        duration: 1, instruction: '30 sec forward, 30 sec backward' },
  ]

  const exerciseTime = exercises.reduce((sum, ex) => {
    return sum + (ex.sets * (ex.reps * 3 + ex.rest))
  }, 0) / 60
  const totalDuration = Math.round(5 + exerciseTime + (cardio ? cardio.duration : 0) + 5)

  return {
    type: split.type,
    duration: totalDuration,
    intensity,
    warmup,
    exercises,
    cardio,
    cooldown,
    coachNote: decision?.reasons?.[0] || null,
    flags: decision?.flags || [],
  }
}
