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

        const getMetric = (name) => metrics.find(m => m.name === name)

        const sleep = getMetric('sleep_analysis')
        const sleepData = sleep?.data?.[sleep.data.length - 1] || null
        console.log('raw sleepData:', sleepData)

        const restingHR = getMetric('resting_heart_rate')
        const restingHRValue = restingHR?.data?.[restingHR.data.length - 1]?.qty || null

        const hrv = getMetric('heart_rate_variability')
        const hrvValue = hrv?.data?.[hrv.data.length - 1]?.qty || null

        const steps = getMetric('step_count')
        const today = new Date().toISOString().split('T')[0]
        const stepsToday = steps?.data
          ?.filter(d => d.date?.startsWith(today))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const hrTrend = restingHR?.data?.slice(-7).map(d => d.qty) || []
        const hrvTrend = hrv?.data?.slice(-7).map(d => d.qty) || []

        const activeEnergy = getMetric('active_energy')
        const activEnergyToday = activeEnergy?.data
          ?.filter(d => d.date?.startsWith(today))
          ?.reduce((sum, d) => sum + (d.qty || 0), 0) || 0

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
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
          const dateStr = d.toISOString().split('T')[0]
          const dayMins = exerciseMinutes?.data
            ?.filter(e => e.date?.startsWith(dateStr))
            ?.reduce((sum, e) => sum + (e.qty || 0), 0) || 0
          exerciseLast7.push({ date: dateStr, mins: Math.round(dayMins) })
        }

        let streak = 0
        for (let i = exerciseLast7.length - 2; i >= 0; i--) {
          if (exerciseLast7[i].mins >= 5) streak++
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
          exerciseLast7,
          streak,
          respiratoryRate: respiratoryRateValue ? Math.round(respiratoryRateValue * 10) / 10 : null,
          respiratoryTrend,
          hrSevenDayAvg,
          distanceToday: Math.round(distanceToday * 10) / 10,
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
