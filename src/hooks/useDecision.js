import { useMemo } from 'react'
import useHealthData from './useHealthData'
import { runDecisionEngine } from '../utils/decisionEngine'

const useDecision = () => {
  const { healthData } = useHealthData()
  return useMemo(() => runDecisionEngine(healthData), [healthData])
}

export default useDecision
