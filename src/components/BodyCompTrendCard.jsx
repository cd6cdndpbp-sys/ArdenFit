import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { getWeightTarget } from '../utils/trainingPlan'

const MIN_POINTS_FOR_CHART = 3

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const LegendDot = ({ color, label, theme }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color }} />
    <span style={{ color: theme.textMuted }}>{label}</span>
  </span>
)

// Embedded inside the Weight Goal box of TrainingPlanCard.jsx — no outer card chrome or title
// of its own, sized to fit that box's compact footprint rather than a full standalone section.
export default function BodyCompTrendCard({ theme, healthData, height = 120 }) {
  const history      = healthData?.bodyCompHistory ?? []
  const weightTarget = getWeightTarget(healthData?.currentWeight)
  const hasChart      = history.length >= MIN_POINTS_FOR_CHART

  if (!hasChart) {
    return (
      <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', color: theme.textMuted }}>
        Building history — {history.length} {history.length === 1 ? 'reading' : 'readings'} logged so far.
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '10px', marginBottom: '2px' }}>
        <LegendDot color={theme.sparklineHR}  label="Weight" theme={theme} />
        <LegendDot color={theme.sparklineHRV} label="Body Fat" theme={theme} />
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={theme.cardBorder} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 9, fill: theme.textMuted }}
              stroke={theme.cardBorder}
              minTickGap={32}
            />
            <YAxis
              yAxisId="weight"
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 9, fill: theme.textMuted }}
              stroke={theme.cardBorder}
              width={36}
            />
            <YAxis
              yAxisId="bodyFat"
              orientation="right"
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 9, fill: theme.textMuted }}
              stroke={theme.cardBorder}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background:   theme.cardBg,
                border:       `0.5px solid ${theme.cardBorder}`,
                borderRadius: '8px',
                fontSize:     '11px',
              }}
              labelStyle={{ color: theme.textPrimary }}
              labelFormatter={fmtDate}
              formatter={(value, name) => value == null
                ? ['—', name === 'weight' ? 'Weight' : 'Body Fat']
                : name === 'weight' ? [`${value} lbs`, 'Weight'] : [`${value}%`, 'Body Fat']}
              cursor={{ stroke: theme.textMuted }}
            />
            {weightTarget?.targetWeight != null && (
              <ReferenceLine
                yAxisId="weight"
                y={weightTarget.targetWeight}
                stroke={theme.textMuted}
                strokeDasharray="4 4"
              />
            )}
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke={theme.sparklineHR}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="bodyFat"
              type="monotone"
              dataKey="bodyFatPct"
              name="bodyFatPct"
              stroke={theme.sparklineHRV}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
