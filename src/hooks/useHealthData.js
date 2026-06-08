import { useState, useEffect } from 'react'

const useHealthData = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = window.location.hostname === 'localhost'
          ? 'http://localhost:3001/api/health'
          : 'http://192.168.1.221:3001/api/health'
        const res = await fetch(API_URL)
        const json = await res.json()
        const metrics = json.data?.metrics || []
        const workouts = json.data?.workouts || []
        const _wm = metrics.find(m => m.name === 'weight_body_mass')

        const getMetric = (name) => metrics.find(m => m.name === name)

        const sleep = getMetric('sleep_analysis')
        const sleepData = sleep?.data?.[sleep.data.length - 1] || null

        const restingHR_metric = getMetric('resting_heart_rate')
        const restingHRValue = restingHR_metric?.data?.[restingHR_metric.data.length - 1]?.qty || null

        const hrv = getMetric('heart_rate_variability')
        const hrvValue = hrv?.data?.[hrv.data.length - 1]?.qty || null

        const steps = getMetric('step_count')
        const _now = new Date()
        const localToday = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`
        const today = localToday
        const stepsToday = steps?.data
          ?.filter(d => d.date?.startsWith(localToday))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const hrTrend = restingHR_metric?.data?.slice(-7).map(d => d.qty) || []
        const hrvTrend = hrv?.data?.slice(-7).map(d => d.qty) || []

        const activeEnergy = getMetric('active_energy')
        const activEnergyToday = activeEnergy?.data
          ?.filter(d => d.date?.startsWith(today))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`
        const activeEnergyYesterday = activeEnergy?.data
          ?.filter(d => d.date?.startsWith(yesterdayStr))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const exerciseMinutes = getMetric('apple_exercise_time')
        const exerciseToday = exerciseMinutes?.data
          ?.filter(d => d.date?.startsWith(today))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const exerciseLast7 = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          const dayMins = exerciseMinutes?.data
            ?.filter(e => e.date?.startsWith(dateStr))
            ?.reduce((sum, e) => sum + (e.qty || 0), 0) || 0
          exerciseLast7.push({ date: dateStr, mins: Math.round(dayMins) })
        }

        const exerciseHistory = []
        for (let i = 29; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          const dayMins = exerciseMinutes?.data
            ?.filter(e => e.date?.startsWith(dateStr))
            ?.reduce((sum, e) => sum + (e.qty || 0), 0) || 0
          exerciseHistory.push({ date: dateStr, mins: Math.round(dayMins) })
        }

        let streak = 0
        const todayMins = exerciseHistory.find(d => d.date === today)?.mins || 0
        let startIndex = todayMins >= 15
          ? exerciseHistory.length - 1
          : exerciseHistory.length - 2
        for (let i = startIndex; i >= 0; i--) {
          if (exerciseHistory[i].mins >= 15) streak++
          else break
        }

        const respiratoryRate = getMetric('respiratory_rate')
        const respiratoryRateValue = respiratoryRate?.data
          ?.[respiratoryRate.data.length - 1]?.qty || null
        const respiratoryTrend = respiratoryRate?.data?.slice(-7).map(d => d.qty) || []

        const hrSevenDayAvg = hrTrend.length > 0
          ? Math.round(hrTrend.reduce((a, b) => a + b, 0) / hrTrend.length)
          : null

        const walkingDistance = getMetric('walking_running_distance')
        const distanceToday = walkingDistance?.data
          ?.filter(d => d.date?.startsWith(today))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const weightMetric = getMetric('weight_body_mass')
        const latestWeight = weightMetric?.data?.[weightMetric.data.length - 1]?.qty ?? null

        // ── 7-DAY SUMMARY ────────────────────────────────────────

        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          last7Days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
        }

        const last7Set = new Set(last7Days)
        const qualifyingWorkoutPaces = workouts
          .filter(w => {
            if (!w.name?.match(/walk|run/i)) return false
            if (!w.distance?.qty || w.distance.qty <= 0) return false
            if (!w.duration || w.duration <= 600) return false
            const workoutDate = w.start?.split(' ')[0]
            return last7Set.has(workoutDate)
          })
          .map(w => {
            const distanceMiles = w.distance.units === 'km'
              ? w.distance.qty * 0.621371
              : w.distance.qty
            const durationMins = w.duration / 60
            return durationMins / distanceMiles
          })
        const avgPaceMinPerMile = qualifyingWorkoutPaces.length >= 2
          ? qualifyingWorkoutPaces.reduce((a, b) => a + b, 0) / qualifyingWorkoutPaces.length
          : null

        const distanceLast7 = last7Days.map(date => {
          const dayMiles = walkingDistance?.data
            ?.filter(d => d.date?.startsWith(date))
            ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0
          return { date, miles: Math.round(dayMiles * 100) / 100 }
        })

        // Sleep last 7 nights
        const sleepLast7 = last7Days.map(date => {
          const entry = sleep?.data?.find(d => d.date?.startsWith(date))
          return { date, hours: entry?.totalSleep ? Math.round(entry.totalSleep * 10) / 10 : null }
        })
        const sleepValues = sleepLast7.map(d => d.hours).filter(Boolean)
        const avgSleepWeek = sleepValues.length > 0
          ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10
          : null
        const nightsUnder6 = sleepValues.filter(h => h < 5.5).length

        // Steps last 7 days
        const stepsLast7 = last7Days.map(date => {
          const daySteps = steps?.data
            ?.filter(d => d.date?.startsWith(date))
            ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0
          return { date, steps: Math.round(daySteps) }
        })
        const avgStepsWeek = Math.round(
          stepsLast7.reduce((sum, d) => sum + d.steps, 0) / 7
        )

        // Resting HR last 7 days
        const hrLast7 = last7Days.map(date => {
          const entry = restingHR_metric?.data?.find(d => d.date?.startsWith(date))
          return { date, hr: entry?.qty || null }
        }).filter(d => d.hr)
        const avgHRWeek = hrLast7.length > 0
          ? Math.round(hrLast7.reduce((sum, d) => sum + d.hr, 0) / hrLast7.length)
          : null

        // HRV last 7 days
        const hrvLast7 = last7Days.map(date => {
          const entry = hrv?.data?.find(d => d.date?.startsWith(date))
          return { date, hrv: entry?.qty ? Math.round(entry.qty) : null }
        }).filter(d => d.hrv)
        const avgHRVWeek = hrvLast7.length > 0
          ? Math.round(hrvLast7.reduce((sum, d) => sum + d.hrv, 0) / hrvLast7.length)
          : null

        // Active energy last 7 days
        const activeEnergyLast7 = last7Days.map(date => {
          const dayKcal = activeEnergy?.data
            ?.filter(d => d.date?.startsWith(date))
            ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0
          return { date, kcal: Math.round(dayKcal) }
        })
        const avgActiveEnergyWeek = Math.round(
          activeEnergyLast7.reduce((sum, d) => sum + d.kcal, 0) / 7
        )
        const totalActiveEnergyWeek = activeEnergyLast7.reduce((sum, d) => sum + d.kcal, 0)

        // Workouts this Mon-Sun week from Apple Health (>= 20 exercise minutes)
        const _dow = _now.getDay()
        const _mondayOffset = _dow === 0 ? -6 : 1 - _dow
        const _monday = new Date(_now)
        _monday.setDate(_now.getDate() + _mondayOffset)
        const currentWeekDays = []
        for (let i = 0; i < 7; i++) {
          const d = new Date(_monday)
          d.setDate(_monday.getDate() + i)
          currentWeekDays.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
        }
        const workoutsThisWeek = currentWeekDays.filter(date => {
          const dayMins = exerciseMinutes?.data
            ?.filter(e => e.date?.startsWith(date))
            ?.reduce((sum, e) => sum + (e.qty || 0), 0) || 0
          return dayMins >= 20
        }).length

        // Sleep trend vs prior week
        const prior7Days = []
        for (let i = 13; i >= 7; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          prior7Days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
        }
        const priorSleepValues = prior7Days.map(date => {
          const entry = sleep?.data?.find(d => d.date?.startsWith(date))
          return entry?.totalSleep || null
        }).filter(Boolean)
        const avgSleepPriorWeek = priorSleepValues.length > 0
          ? Math.round((priorSleepValues.reduce((a, b) => a + b, 0) / priorSleepValues.length) * 10) / 10
          : null
        const sleepTrendDirection = avgSleepPriorWeek
          ? avgSleepWeek > avgSleepPriorWeek ? 'up' : avgSleepWeek < avgSleepPriorWeek ? 'down' : 'flat'
          : 'flat'

        setHealthData({
          sleep: {
            total: sleepData?.totalSleep ? Math.round(sleepData.totalSleep * 10) / 10 : null,
            deep:  sleepData?.deep  ? Math.round(sleepData.deep  * 60) : null,
            core:  sleepData?.core  ? Math.round(sleepData.core  * 60) : null,
            rem:   sleepData?.rem   ? Math.round(sleepData.rem   * 60) : null,
            awake: sleepData?.awake ? Math.round(sleepData.awake * 60) : null,
          },
          restingHR: restingHRValue,
          hrTrend,
          hrv: hrvValue != null ? Math.round(hrvValue) : null,
          hrvTrend,
          steps: Math.round(stepsToday),
          activeEnergyToday: Math.round(activEnergyToday),
          activeEnergyYesterday: Math.round(activeEnergyYesterday),
          exerciseToday: Math.round(exerciseToday),
          todayExerciseMinutes: Math.round(exerciseToday),
          todayWorkoutComplete: exerciseToday >= 20,
          exerciseLast7,
          streak,
          respiratoryRate: respiratoryRateValue ? Math.round(respiratoryRateValue * 10) / 10 : null,
          respiratoryTrend,
          hrSevenDayAvg,
          distanceToday: Math.round(distanceToday * 10) / 10,
          distanceLast7,
          avgPaceMinPerMile,
          currentWeight: latestWeight ? Math.round(latestWeight * 10) / 10 : null,
          workoutsThisWeek,
          weekSummary: {
            avgSleep:           avgSleepWeek,
            nightsUnder6,
            sleepTrend:         sleepTrendDirection,
            sleepLast7,
            avgSteps:           avgStepsWeek,
            stepsLast7,
            avgHR:              avgHRWeek,
            hrLast7,
            avgHRV:             avgHRVWeek,
            hrvLast7,
            avgActiveEnergy:    avgActiveEnergyWeek,
            totalActiveEnergy:  totalActiveEnergyWeek,
            activeEnergyLast7,
            workoutsCompleted:  workoutsThisWeek,
            workoutsPlanned:    5,
          },
        })
      } catch (err) {
        console.error('Failed to fetch health data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { healthData, loading }
}

export default useHealthData
