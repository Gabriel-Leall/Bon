'use client'

import {
  lazy,
  Suspense,
  useId,
  type ComponentProps,
  type ReactNode,
} from 'react'

const CartesianGrid = lazy(() =>
  import('recharts').then(module => ({ default: module.CartesianGrid }))
)
const Line = lazy(() =>
  import('recharts').then(module => ({ default: module.Line }))
)
const LineChart = lazy(() =>
  import('recharts').then(module => ({ default: module.LineChart }))
)
const ResponsiveContainer = lazy(() =>
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
)
const XAxis = lazy(() =>
  import('recharts').then(module => ({ default: module.XAxis }))
)

type ThemeColors = {
  light?: string[]
  dark?: string[]
}

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode
    colors?: ThemeColors
  }
>

type ChartProps = ComponentProps<typeof LineChart>
type XAxisProps = ComponentProps<typeof XAxis>
type LineType = ComponentProps<typeof Line>['type']
type LineAnimationEasing =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear'

type EndValueLabelOptions<TData extends Record<string, unknown>> = {
  className?: string
  fill?: string
  fontSize?: number
  fontWeight?: number | string
  offsetX?: number
  offsetY?: number
  textAnchor?: 'start' | 'middle' | 'end'
  formatter?: (value: unknown, payload: TData, dataKey: string) => ReactNode
}

interface LineLabelProps {
  index?: number | string
  x?: number | string
  y?: number | string
  value?: unknown
  payload?: Record<string, unknown>
}

interface EvilLineChartProps<TData extends Record<string, unknown>> {
  chartConfig: ChartConfig
  data: TData[]
  xDataKey?: keyof TData & string
  className?: string
  chartProps?: ChartProps
  xAxisProps?: XAxisProps
  curveType?: LineType
  tickGap?: number
  animationMode?: 'enabled' | 'disabled'
  strokeWidthByDataKey?: Partial<Record<string, number>>
  strokeDasharrayByDataKey?: Partial<Record<string, string>>
  animationBeginByDataKey?: Partial<Record<string, number>>
  animationDurationByDataKey?: Partial<Record<string, number>>
  animationEasingByDataKey?: Partial<Record<string, LineAnimationEasing>>
  endValueLabels?: Partial<Record<string, EndValueLabelOptions<TData>>>
}

function SeriesGradient({
  chartId,
  dataKey,
  colors,
}: {
  chartId: string
  dataKey: string
  colors: string[]
}) {
  const stops = colors.length > 0 ? colors : ['currentColor']

  return (
    <linearGradient
      id={`${chartId}-colors-${dataKey}`}
      x1="0"
      y1="0"
      x2="1"
      y2="0"
    >
      {stops.map((color, index) => (
        <stop
          key={`${color}-${index}`}
          offset={`${stops.length === 1 ? 0 : (index / (stops.length - 1)) * 100}%`}
          stopColor={color}
        />
      ))}
      {stops.length === 1 ? (
        <stop offset="100%" stopColor={stops[0]} />
      ) : null}
    </linearGradient>
  )
}

function EndValueLabel<TData extends Record<string, unknown>>({
  data,
  dataKey,
  options,
  label,
}: {
  data: TData[]
  dataKey: string
  options?: EndValueLabelOptions<TData>
  label: LineLabelProps
}) {
  if (!options || Number(label.index) !== data.length - 1) return null

  const payload = (label.payload ?? data.at(-1) ?? {}) as TData
  const x = Number(label.x)
  const y = Number(label.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  const value = label.value ?? payload[dataKey]
  const displayValue = options.formatter
    ? options.formatter(value, payload, dataKey)
    : value

  return (
    <text
      x={x + (options.offsetX ?? 10)}
      y={y + (options.offsetY ?? -8)}
      className={options.className}
      fill={options.fill ?? 'currentColor'}
      fontSize={options.fontSize ?? 12}
      fontWeight={options.fontWeight ?? 600}
      textAnchor={options.textAnchor ?? 'start'}
    >
      {displayValue as ReactNode}
    </text>
  )
}

function ChartSeries<TData extends Record<string, unknown>>({
  chartId,
  chartConfig,
  data,
  curveType,
  animationMode,
  strokeWidthByDataKey,
  strokeDasharrayByDataKey,
  animationBeginByDataKey,
  animationDurationByDataKey,
  animationEasingByDataKey,
  endValueLabels,
}: Omit<EvilLineChartProps<TData>, 'xDataKey' | 'className' | 'chartProps' | 'xAxisProps' | 'tickGap'> & {
  chartId: string
}) {
  return Object.keys(chartConfig).map(dataKey => (
    <Line
      key={dataKey}
      type={curveType}
      dataKey={dataKey}
      stroke={`url(#${chartId}-colors-${dataKey})`}
      strokeWidth={strokeWidthByDataKey?.[dataKey] ?? 1}
      strokeDasharray={strokeDasharrayByDataKey?.[dataKey]}
      dot={false}
      activeDot={false}
      isAnimationActive={animationMode !== 'disabled'}
      animationBegin={animationBeginByDataKey?.[dataKey] ?? 0}
      animationDuration={animationDurationByDataKey?.[dataKey] ?? 1200}
      animationEasing={animationEasingByDataKey?.[dataKey] ?? 'ease'}
      label={label => (
        <EndValueLabel
          data={data}
          dataKey={dataKey}
          options={endValueLabels?.[dataKey]}
          label={label as LineLabelProps}
        />
      )}
    />
  ))
}

export function EvilLineChart<TData extends Record<string, unknown>>({
  chartConfig,
  data,
  xDataKey,
  className,
  chartProps,
  xAxisProps,
  curveType = 'linear',
  tickGap = 8,
  animationMode = 'enabled',
  strokeWidthByDataKey,
  strokeDasharrayByDataKey,
  animationBeginByDataKey,
  animationDurationByDataKey,
  animationEasingByDataKey,
  endValueLabels,
}: EvilLineChartProps<TData>) {
  const chartId = useId().replace(/:/g, '')

  return (
    <div className={className}>
      <Suspense fallback={<div className="h-full w-full" aria-hidden="true" />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart accessibilityLayer data={data} {...chartProps}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            {xDataKey ? (
              <XAxis
                dataKey={xDataKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={tickGap}
                {...xAxisProps}
              />
            ) : null}
            <ChartSeries
              chartId={chartId}
              chartConfig={chartConfig}
              data={data}
              curveType={curveType}
              animationMode={animationMode}
              strokeWidthByDataKey={strokeWidthByDataKey}
              strokeDasharrayByDataKey={strokeDasharrayByDataKey}
              animationBeginByDataKey={animationBeginByDataKey}
              animationDurationByDataKey={animationDurationByDataKey}
              animationEasingByDataKey={animationEasingByDataKey}
              endValueLabels={endValueLabels}
            />
            <defs>
              {Object.entries(chartConfig).map(([dataKey, config]) => (
                <SeriesGradient
                  key={dataKey}
                  chartId={chartId}
                  dataKey={dataKey}
                  colors={config.colors?.light ?? config.colors?.dark ?? []}
                />
              ))}
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </Suspense>
    </div>
  )
}
