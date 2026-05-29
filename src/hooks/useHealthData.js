import { useState, useEffect } from 'react'

const useHealthData = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health')
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
