import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameDay,
  isSameMonth,
  isValid,
  isWithinInterval,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  sub,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Button } from '@/components/button-1'
import { Material } from '@/components/material-1'
import { Input } from '@/components/input'
import { Select } from '@/components/select-1'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { useClickOutside } from '@/components/use-click-outside'
import clsx from 'clsx'
import { enUS } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

const ClockIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.75 4h-1.5v4.25l3.3 2.47.9-1.2-2.7-2.02V4Z"
      className="fill-gray-1000"
    />
  </svg>
)

const ArrowBottomIcon = ({ className }: { className?: string }) => (
  <svg
    height="16"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width="16"
    className={clsx('fill-gray-1000', className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m2 5 6 6 6-6-1-1-5 5-5-5-1 1Z"
    />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m11 2-6 6 6 6 1-1-5-5 5-5-1-1Z"
      className="fill-gray-700"
    />
  </svg>
)

const ArrowRightIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m5 2 6 6-6 6-1-1 5-5-5-5 1-1Z"
      className="fill-gray-700"
    />
  </svg>
)

const CalendarIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5.5V2h5V.5H12V2h3.5v11.5A2.5 2.5 0 0 1 13 16H3a2.5 2.5 0 0 1-2.5-2.5V2H4V.5h1.5ZM2 3.5V6h12V3.5H2Zm0 4v6c0 .6.4 1 1 1h10c.6 0 1-.4 1-1v-6H2Z"
    />
  </svg>
)

const ClearIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m3 2 5 5 5-5 1 1-5 5 5 5-1 1-5-5-5 5-1-1 5-5-5-5 1-1Z"
    />
  </svg>
)

const parseRelativeDate = (input: string) => {
  const regex = /(\d+)\s*(day|week|month|year|hour)s?/i
  const match = input.match(regex)

  if (!match) {
    return null
  }

  const valuePart = match[1]
  const unitPart = match[2]
  if (!valuePart || !unitPart) {
    return null
  }

  const value = parseInt(valuePart, 10)
  const unit = unitPart.toLowerCase() + 's'

  const now = new Date()
  const start = startOfDay(sub(now, { [unit]: value }))
  const end = endOfDay(now)

  return {
    [input]: { text: input, start, end },
  }
}

const parseFixedRange = (input: string) => {
  const rangePattern = /(.+)\s*[-–]\s*(.+)/

  const match = input.match(rangePattern)
  if (!match) {
    return parseExactDate(input)
  }

  const [, startStr, endStr] = match
  if (!startStr || !endStr) {
    return null
  }

  const possibleFormats = ['d MMM yyyy', 'd MMM', 'yyyy-MM-dd']

  for (const format of possibleFormats) {
    const now = new Date()
    const year = now.getFullYear()

    const start = parse(startStr, format, now, { locale: enUS })
    const end = parse(endStr, format, now, { locale: enUS })

    const finalStart = isValid(start) ? startOfDay(start) : null
    const finalEnd = isValid(end) ? endOfDay(end) : null

    if (finalStart && finalEnd) {
      if (format === 'd MMM') {
        finalStart.setFullYear(year)
        finalEnd.setFullYear(year)
      }
      return {
        [input]: { text: input, start: finalStart, end: finalEnd },
      }
    }
  }

  return null
}

const parseExactDate = (input: string) => {
  const now = new Date()
  const currentYear = now.getFullYear()

  const dateFormats = ['d MMM yyyy', 'd MMM', 'yyyy-MM-dd']

  for (const format of dateFormats) {
    const date = parse(input.trim(), format, now, { locale: enUS })

    if (isValid(date)) {
      if (format === 'd MMM') {
        date.setFullYear(currentYear)
      }

      return {
        [input]: {
          text: input,
          start: startOfDay(date),
          end: endOfDay(date),
        },
      }
    }
  }

  return null
}

const parseDateInput = (input: string) => {
  const relative = parseRelativeDate(input)
  if (relative) return relative

  const fixedRange = parseFixedRange(input)
  if (fixedRange) return fixedRange

  const exact = parseExactDate(input)
  if (exact) return exact

  return null
}

const filterPresets = (
  obj: Record<string, { text: string; start: Date; end: Date }>,
  search: string
) => {
  if (!search) {
    return obj
  }

  const searchWords = search.toLowerCase().split('-').filter(Boolean)

  const filtered = Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      const keyLower = value.text.toLowerCase()
      return searchWords.every(word => keyLower.includes(word))
    })
  )

  if (Object.entries(filtered).length > 0) {
    return filtered
  }

  const parsed = parseDateInput(search)
  if (parsed) {
    return parsed
  }

  const numberMatch = search.match(/\d+/)
  if (!numberMatch) {
    return {}
  }

  const n = parseInt(numberMatch[0], 10)
  const now = new Date()

  return {
    [`last-${n}-days`]: {
      text: `Last ${n} Days`,
      start: startOfDay(subDays(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-weeks`]: {
      text: `Last ${n} Weeks`,
      start: startOfDay(subWeeks(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-months`]: {
      text: `Last ${n} Months`,
      start: startOfDay(subMonths(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-years`]: {
      text: `Last ${n} Years`,
      start: startOfDay(subYears(now, n)),
      end: endOfDay(now),
    },
  }
}

const formatDateRange = (start: Date, end: Date, timezone: string) => {
  const isStartMidnight = isEqual(start, startOfDay(start))
  const isEndEOD = isEqual(end, endOfDay(end))
  const sameDay = isSameDay(start, end)

  const formatSingle = (date: Date) =>
    formatInTimeZone(
      date,
      timezone,
      isStartMidnight ? 'EEE, MMM d' : 'EEE, MMM d, HH:mm'
    )

  const formatMonth = (date: Date) => formatInTimeZone(date, timezone, 'MMM')
  const formatDay = (date: Date) => formatInTimeZone(date, timezone, 'd')
  const formatYear = (date: Date) => formatInTimeZone(date, timezone, 'yy')

  const formatDateWithTimeIfNeeded = (date: Date, showTime: boolean) =>
    formatInTimeZone(date, timezone, showTime ? 'MMM d, HH:mm' : 'MMM d')

  if (sameDay) {
    return formatSingle(start)
  }

  const sameMonth =
    formatMonth(start) === formatMonth(end) &&
    formatYear(start) === formatYear(end)
  const sameYear = formatYear(start) === formatYear(end)

  const startHasTime = !isStartMidnight
  const endHasTime = !isEndEOD

  if (startHasTime || endHasTime) {
    const startFormatted = formatDateWithTimeIfNeeded(start, startHasTime)
    const endFormatted = formatDateWithTimeIfNeeded(end, endHasTime)
    return `${startFormatted} - ${endFormatted}`
  }

  if (sameMonth) {
    return `${formatMonth(start)} ${formatDay(start)} - ${formatDay(end)}`
  }

  if (sameYear) {
    return `${formatMonth(start)} ${formatDay(start)} - ${formatMonth(end)} ${formatDay(end)}`
  }

  return `${formatMonth(start)} ${formatDay(start)} '${formatYear(start)} - ${formatMonth(end)} ${formatDay(end)} '${formatYear(end)}`
}

const typeRelativeTimes = [
  {
    text: '45m',
    start: subMinutes(new Date(), 45),
    end: new Date(),
  },
  {
    text: '12 hours',
    start: subHours(new Date(), 12),
    end: new Date(),
  },
  {
    text: '10d',
    start: startOfDay(subDays(new Date(), 10)),
    end: endOfDay(new Date()),
  },
  {
    text: '2 weeks',
    start: startOfDay(subWeeks(new Date(), 2)),
    end: endOfDay(new Date()),
  },
  {
    text: 'last month',
    start: startOfDay(subMonths(new Date(), 1)),
    end: endOfDay(new Date()),
  },
  {
    text: 'yesterday',
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  },
  {
    text: 'today',
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  },
]
const typeFixedTimes = [
  {
    text: 'Jan 1',
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 1)),
  },
  {
    text: 'Jan 1 - Jan 2',
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 2)),
  },
  {
    text: '1/1',
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 1)),
  },
  {
    text: '1/1 - 1/2',
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 2)),
  },
]

interface CalendarComboboxProps {
  stacked: boolean
  compact: boolean
  value: RangeValue | null
  onChange: (date: RangeValue | null) => void
  presets: Record<
    string,
    {
      text: string
      start: Date
      end: Date
    }
  >
  presetIndex?: number
}

interface CalendarPreset {
  text: string
  start: Date
  end: Date
}

function rangesMatch(value: RangeValue | null, preset: CalendarPreset | null) {
  return Boolean(
    value?.start &&
    value.end &&
    preset &&
    preset.start.getTime() === value.start.getTime() &&
    preset.end.getTime() === value.end.getTime()
  )
}

function findCurrentPreset(
  value: RangeValue | null,
  presets: Record<string, CalendarPreset>
) {
  if (!value?.start || !value.end) return null
  return (
    Object.values(presets).find(preset => rangesMatch(value, preset)) ?? null
  )
}

function CalendarPresetMenu({
  compact,
  filteredPresets,
  inputValue,
  isOpen,
  onSelect,
}: {
  compact: boolean
  filteredPresets: Record<string, CalendarPreset>
  inputValue: string
  isOpen: boolean
  onSelect: (preset: CalendarPreset) => void
}) {
  const entries = Object.entries(filteredPresets)

  return (
    <Material
      type="menu"
      className={clsx(
        'absolute z-50 top-12 left-0',
        compact ? 'w-full' : 'grid grid-cols-2 w-[200%]',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none duration-200'
      )}
    >
      <ul className="p-2 border-r border-r-gray-200">
        {entries.length ? (
          entries.map(([key, preset]) => (
            <li key={key}>
              <button
                type="button"
                className="flex h-9 w-full cursor-pointer items-center rounded-md px-2 font-sans text-sm text-gray-1000 hover:bg-gray-alpha-300 active:bg-gray-alpha-300"
                onClick={() => onSelect(preset)}
              >
                {preset.text}
              </button>
            </li>
          ))
        ) : (
          <li className="flex items-center cursor-pointer px-2 w-full h-9 rounded-md hover:bg-gray-alpha-300 active:bg-gray-alpha-300 font-sans text-sm text-gray-1000">
            {inputValue}
          </li>
        )}
      </ul>
      {!compact ? (
        <div className="p-4 pr-7.5">
          <div className="font-sans text-gray-900 text-sm">
            Type relative times
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {typeRelativeTimes.map(preset => (
              <button
                type="button"
                key={preset.text}
                className="font-mono text-[13px] text-gray-1000 px-1.5 h-5 inline-flex items-center bg-accents-2 border-none rounded cursor-pointer"
                onClick={() => onSelect(preset)}
              >
                {preset.text}
              </button>
            ))}
          </div>
          <div className="font-sans text-gray-900 text-sm mt-4">
            Type fixed times
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {typeFixedTimes.map(preset => (
              <button
                type="button"
                key={preset.text}
                className="font-mono text-[13px] text-gray-1000 px-1.5 h-5 inline-flex items-center bg-accents-2 border-none rounded cursor-pointer"
                onClick={() => onSelect(preset)}
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </Material>
  )
}

function getCalendarComboboxClasses({
  collapseInput,
  compact,
  currentPresetIsValue,
  isOpen,
  stacked,
}: {
  collapseInput: boolean
  compact: boolean
  currentPresetIsValue: boolean
  isOpen: boolean
  stacked: boolean
}) {
  return {
    root: twMerge(
      clsx(
        'inline-block text-sm font-sans',
        compact ? 'w-45 absolute left-9.5' : 'w-62.5 relative',
        compact && !isOpen && 'pl-35',
        compact && (isOpen || currentPresetIsValue) && 'pl-0'
      )
    ),
    input: clsx(
      'pl-2 placeholder:text-gray-1000! placeholder:opacity-100!',
      collapseInput && 'w-0! px-0!'
    ),
    suffix: clsx('cursor-pointer', collapseInput && 'w-10 !px-0'),
    wrapper: clsx(
      'hover:z-10',
      stacked && !compact && 'rounded-b-none',
      !stacked && !compact && 'rounded-r-none',
      compact && 'rounded-l-none',
      (isOpen || (compact && currentPresetIsValue)) && 'z-10'
    ),
  }
}

const CalendarCombobox = ({
  stacked,
  compact,
  value,
  onChange,
  presets,
  presetIndex,
}: CalendarComboboxProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  const currentPreset = findCurrentPreset(value, presets)
  const currentPresetIsValue = rangesMatch(value, currentPreset)
  const collapseInput = compact && !isOpen && !currentPresetIsValue
  const classes = getCalendarComboboxClasses({
    collapseInput,
    compact,
    currentPresetIsValue,
    isOpen,
    stacked,
  })

  // Synchronize input value when value prop changes
  const [prevValue, setPrevValue] = useState(value)
  if (
    value?.start?.getTime() !== prevValue?.start?.getTime() ||
    value?.end?.getTime() !== prevValue?.end?.getTime()
  ) {
    setPrevValue(value)
    setInputValue(currentPreset?.text ?? '')
  }

  const onFocus = () => {
    setIsOpen(true)
  }

  const onChangeInputValue = (val: string) => {
    setInputValue(val)
  }

  const onClick = (preset: { text: string; start: Date; end: Date }) => {
    setInputValue(preset.text)
    onChange({ start: preset.start, end: preset.end })
    setIsOpen(false)
  }

  const filteredPresets = filterPresets(presets, inputValue)

  useClickOutside(ref, () => setIsOpen(false))

  useEffect(() => {
    const array = Object.entries(presets)
    if (
      presetIndex !== undefined &&
      presetIndex >= 0 &&
      presetIndex < array.length
    ) {
      const preset = array[presetIndex]?.[1]
      if (!preset) return

      onChange({
        start: preset.start,
        end: preset.end,
      })
    }
  }, [presetIndex, presets, onChange])

  return (
    <div ref={ref} className={classes.root}>
      <Input
        prefix={compact ? undefined : <ClockIcon />}
        prefixStyling={'pl-2.5'}
        suffix={
          <ArrowBottomIcon
            className={clsx('duration-200', isOpen && 'rotate-180')}
          />
        }
        suffixStyling={classes.suffix}
        placeholder="Select Period"
        onFocus={onFocus}
        value={inputValue}
        onChange={onChangeInputValue}
        wrapperClassName={classes.wrapper}
        className={classes.input}
      />
      <CalendarPresetMenu
        compact={compact}
        filteredPresets={filteredPresets}
        inputValue={inputValue}
        isOpen={isOpen}
        onSelect={onClick}
      />
    </div>
  )
}

export interface RangeValue {
  start: Date | null
  end: Date | null
}

interface CalendarProps {
  allowClear?: boolean
  compact?: boolean
  isDocsPage?: boolean
  stacked?: boolean
  horizontalLayout?: boolean
  showTimeInput?: boolean
  popoverAlignment?: 'start' | 'center' | 'end'
  value: RangeValue | null
  onChange: (date: RangeValue | null) => void
  presets?: Record<
    string,
    {
      text: string
      start: Date
      end: Date
    }
  >
  presetIndex?: number
  minValue?: Date
  maxValue?: Date
}

function orderRange(
  first: Date | null | undefined,
  second: Date | null | undefined
) {
  if (!first || !second) return { start: null, end: null }
  return first <= second
    ? { start: first, end: second }
    : { start: second, end: first }
}

function CalendarMonthGrid({
  currentDate,
  days,
  hoverDate,
  isSelecting,
  maxValue,
  minValue,
  value,
  onDateClick,
  onDateHover,
}: {
  currentDate: Date
  days: Date[]
  hoverDate: Date | null
  isSelecting: boolean
  maxValue: Date | null
  minValue: Date | null
  value: RangeValue | null
  onDateClick: (day: Date) => void
  onDateHover: (day: Date) => void
}) {
  const committedRange = orderRange(value?.start, value?.end)
  const hoverRange = orderRange(value?.start, hoverDate)

  return (
    <>
      <div className="grid grid-cols-7 text-center text-xs text-gray-900 uppercase mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
          <div key={`${label}-${index}`}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 items-center gap-y-2">
        {days.map(day => {
          const isStart = Boolean(value?.start && isSameDay(day, value.start))
          const isEnd = Boolean(value?.end && isSameDay(day, value.end))
          const currentHover = Boolean(
            hoverDate && isSelecting && isSameDay(day, hoverDate)
          )
          const isInCommittedRange = Boolean(
            committedRange.start &&
            committedRange.end &&
            isWithinInterval(day, committedRange as { start: Date; end: Date })
          )
          const isInHoverRange = Boolean(
            isSelecting &&
            hoverRange.start &&
            hoverRange.end &&
            isWithinInterval(day, hoverRange as { start: Date; end: Date })
          )
          const isInRange = isInCommittedRange || isInHoverRange
          const isAllowedDate =
            (!minValue || day >= minValue) && (!maxValue || day <= maxValue)

          return (
            <button
              type="button"
              key={day.toString()}
              disabled={!isAllowedDate}
              className={clsx(
                'flex items-center justify-center text-sm text-center rounded transition',
                isSameMonth(day, currentDate) && isAllowedDate
                  ? 'bg-background-100 text-gray-1000'
                  : 'bg-background-100 text-gray-700',
                !isAllowedDate && 'opacity-30 grayscale',
                isInRange &&
                  !isStart &&
                  !isEnd &&
                  !currentHover &&
                  'bg-accents-2! rounded-none',
                isAllowedDate ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
              onMouseEnter={() => isAllowedDate && onDateHover(day)}
              onClick={() => isAllowedDate && onDateClick(day)}
            >
              <span
                className={clsx(
                  'h-8 w-8 flex items-center justify-center rounded',
                  (isStart || isEnd || currentHover) &&
                    isAllowedDate &&
                    ' bg-gray-1000! text-background-100!',
                  !isStart &&
                    !isEnd &&
                    !currentHover &&
                    isAllowedDate &&
                    'hover:text-gray-1000 hover:border hover:border-gray-alpha-500',
                  currentHover &&
                    isAllowedDate &&
                    ' shadow-focus-calendar-date!'
                )}
              >
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function CalendarDateTimeControls({
  endDate,
  endDateError,
  endTime,
  endTimeError,
  horizontalLayout,
  selectedTimezone,
  showTimeInput,
  startDate,
  startDateError,
  startTime,
  startTimeError,
  timezones,
  onApply,
  onEndDateChange,
  onEndTimeChange,
  onStartDateChange,
  onStartTimeChange,
  onTimezoneChange,
}: {
  endDate: string
  endDateError: boolean
  endTime: string
  endTimeError: boolean
  horizontalLayout: boolean
  selectedTimezone: string
  showTimeInput: boolean
  startDate: string
  startDateError: boolean
  startTime: string
  startTimeError: boolean
  timezones: { value: string; label: string }[]
  onApply: () => void
  onEndDateChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onTimezoneChange: (value: string) => void
}) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2',
        horizontalLayout
          ? 'justify-between'
          : 'mt-3 -mx-3 px-3 pt-2.5 border-t border-gray-alpha-100'
      )}
    >
      <div className="flex flex-col gap-2">
        <CalendarDateTimeField
          label="Start"
          date={startDate}
          dateError={startDateError}
          time={startTime}
          timeError={startTimeError}
          showTimeInput={showTimeInput}
          onDateChange={onStartDateChange}
          onTimeChange={onStartTimeChange}
        />
        <CalendarDateTimeField
          label="End"
          date={endDate}
          dateError={endDateError}
          time={endTime}
          timeError={endTimeError}
          showTimeInput={showTimeInput}
          onDateChange={onEndDateChange}
          onTimeChange={onEndTimeChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-medium flex flex-col">
          <Button
            type="secondary"
            size="small"
            suffix={<span className="mt-1 text-xs">↵</span>}
            onClick={onApply}
          >
            Apply
          </Button>
        </div>
        <div className="w-fit self-center">
          <Select
            size="xsmall"
            variant="ghost"
            options={timezones}
            value={selectedTimezone}
            onChange={event => onTimezoneChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function CalendarDateTimeField({
  label,
  date,
  dateError,
  time,
  timeError,
  showTimeInput,
  onDateChange,
  onTimeChange,
}: {
  label: string
  date: string
  dateError: boolean
  time: string
  timeError: boolean
  showTimeInput: boolean
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
}) {
  return (
    <div>
      <div className="text-[13px] text-gray-900 capitalize">{label}</div>
      <div className="grid grid-cols-3 gap-2 mt-1">
        <div className={showTimeInput ? 'col-span-2' : 'col-span-3'}>
          <Input
            size="small"
            value={date}
            onChange={onDateChange}
            error={dateError}
          />
        </div>
        {showTimeInput ? (
          <Input
            size="small"
            value={time}
            onChange={onTimeChange}
            error={timeError}
          />
        ) : null}
      </div>
    </div>
  )
}

function getCalendarPresentationClasses({
  compact,
  horizontalLayout,
  popoverAlignment,
  presets,
  stacked,
}: {
  compact: boolean
  horizontalLayout: boolean
  popoverAlignment: 'start' | 'center' | 'end'
  presets: boolean
  stacked: boolean
}) {
  return {
    controls: clsx(
      presets && 'flex',
      presets && stacked && 'flex-col',
      compact && 'w-55'
    ),
    trigger: clsx(
      'justify-start! focus:border-transparent! focus:shadow-focus-input!',
      presets && !stacked && !compact && 'rounded-l-none -ml-px',
      presets && stacked && !compact && 'rounded-t-none -mt-px',
      presets && compact && 'rounded-r-none -mr-px',
      compact ? 'w-45 gap-1.5' : 'w-62.5'
    ),
    popover: twMerge(
      clsx(
        'p-3 font-sans absolute top-12 z-10',
        horizontalLayout ? 'w-115.5' : 'w-70',
        presets && !stacked && !compact && 'left-62.5',
        presets && stacked && 'top-22',
        popoverAlignment === 'center' && 'left-31.25 -translate-x-1/2',
        popoverAlignment === 'end' && 'left-62.5 -translate-x-full'
      )
    ),
    popoverContent: clsx(horizontalLayout && 'flex gap-5'),
  }
}

function CalendarTrigger({
  allowClear,
  classes,
  compact,
  presets,
  presetIndex,
  selectedTimezone,
  stacked,
  value,
  onChange,
  onOpenChange,
}: Pick<
  CalendarProps,
  | 'allowClear'
  | 'compact'
  | 'presets'
  | 'presetIndex'
  | 'stacked'
  | 'value'
  | 'onChange'
> & {
  classes: ReturnType<typeof getCalendarPresentationClasses>
  selectedTimezone: string
  onOpenChange: () => void
}) {
  return (
    <div className={classes.controls}>
      {presets ? (
        <CalendarCombobox
          stacked={stacked ?? false}
          compact={compact ?? false}
          presets={presets}
          value={value}
          onChange={onChange}
          presetIndex={presetIndex}
        />
      ) : null}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Button
            className={classes.trigger}
            prefix={<CalendarIcon />}
            type="secondary"
            onClick={onOpenChange}
          >
            <div className="truncate pr-4">
              {value?.start
                ? formatDateRange(
                    value.start,
                    value.end ?? value.start,
                    selectedTimezone
                  )
                : 'Select Date Range'}
            </div>
          </Button>
          {allowClear && value?.start ? (
            <Button
              aria-label="Clear input value"
              svgOnly
              variant="unstyled"
              className="absolute right-0 top-1/2 -translate-y-1/2 fill-gray-700 hover:fill-gray-1000"
              onClick={() => onChange(null)}
            >
              <ClearIcon />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function CalendarPopover({
  calendarRef,
  classes,
  currentDate,
  days,
  endDate,
  endDateError,
  endTime,
  endTimeError,
  horizontalLayout,
  hoverDate,
  isSelecting,
  maxValue,
  minValue,
  selectedTimezone,
  showTimeInput,
  startDate,
  startDateError,
  startTime,
  startTimeError,
  timezones,
  value,
  onApply,
  onDateClick,
  onDateHover,
  onEndDateChange,
  onEndTimeChange,
  onNextMonth,
  onPreviousMonth,
  onStartDateChange,
  onStartTimeChange,
  onTimezoneChange,
}: {
  calendarRef: RefObject<HTMLDivElement | null>
  classes: ReturnType<typeof getCalendarPresentationClasses>
  currentDate: Date
  days: Date[]
  endDate: string
  endDateError: boolean
  endTime: string
  endTimeError: boolean
  horizontalLayout: boolean
  hoverDate: Date | null
  isSelecting: boolean
  maxValue: Date | null
  minValue: Date | null
  selectedTimezone: string
  showTimeInput: boolean
  startDate: string
  startDateError: boolean
  startTime: string
  startTimeError: boolean
  timezones: { value: string; label: string }[]
  value: RangeValue | null
  onApply: () => void
  onDateClick: (day: Date) => void
  onDateHover: (day: Date) => void
  onEndDateChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  onNextMonth: () => void
  onPreviousMonth: () => void
  onStartDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onTimezoneChange: (value: string) => void
}) {
  return (
    <Material ref={calendarRef} type="menu" className={classes.popover}>
      <div className={classes.popoverContent}>
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm text-gray-1000 font-medium">
              {formatInTimeZone(currentDate, selectedTimezone, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-0.5">
              <Button variant="unstyled" onClick={onPreviousMonth}>
                <ArrowLeftIcon />
              </Button>
              <Button variant="unstyled" onClick={onNextMonth}>
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
          <CalendarMonthGrid
            currentDate={currentDate}
            days={days}
            hoverDate={hoverDate}
            isSelecting={isSelecting}
            maxValue={maxValue}
            minValue={minValue}
            value={value}
            onDateClick={onDateClick}
            onDateHover={onDateHover}
          />
        </div>
        <CalendarDateTimeControls
          endDate={endDate}
          endDateError={endDateError}
          endTime={endTime}
          endTimeError={endTimeError}
          horizontalLayout={horizontalLayout}
          selectedTimezone={selectedTimezone}
          showTimeInput={showTimeInput}
          startDate={startDate}
          startDateError={startDateError}
          startTime={startTime}
          startTimeError={startTimeError}
          timezones={timezones}
          onApply={onApply}
          onEndDateChange={onEndDateChange}
          onEndTimeChange={onEndTimeChange}
          onStartDateChange={onStartDateChange}
          onStartTimeChange={onStartTimeChange}
          onTimezoneChange={onTimezoneChange}
        />
      </div>
    </Material>
  )
}

function CalendarPresentation({
  allowClear,
  compact,
  currentDate,
  days,
  endDate,
  endDateError,
  endTime,
  endTimeError,
  horizontalLayout,
  hoverDate,
  isOpen,
  isSelecting,
  maxValue,
  minValue,
  popoverAlignment,
  presets,
  presetIndex,
  selectedTimezone,
  showTimeInput,
  stacked,
  startDate,
  startDateError,
  startTime,
  startTimeError,
  timezones,
  value,
  calendarRef,
  onApply,
  onChange,
  onDateClick,
  onDateHover,
  onEndDateChange,
  onEndTimeChange,
  onNextMonth,
  onOpenChange,
  onPreviousMonth,
  onStartDateChange,
  onStartTimeChange,
  onTimezoneChange,
}: CalendarProps & {
  currentDate: Date
  days: Date[]
  endDate: string
  endDateError: boolean
  endTime: string
  endTimeError: boolean
  hoverDate: Date | null
  isOpen: boolean
  isSelecting: boolean
  selectedTimezone: string
  startDate: string
  startDateError: boolean
  startTime: string
  startTimeError: boolean
  timezones: { value: string; label: string }[]
  calendarRef: RefObject<HTMLDivElement | null>
  onApply: () => void
  onDateClick: (day: Date) => void
  onDateHover: (day: Date) => void
  onEndDateChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  onNextMonth: () => void
  onOpenChange: () => void
  onPreviousMonth: () => void
  onStartDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onTimezoneChange: (value: string) => void
}) {
  const normalizedMinValue = minValue ? startOfDay(minValue) : null
  const normalizedMaxValue = maxValue ? endOfDay(maxValue) : null
  const classes = getCalendarPresentationClasses({
    compact: compact ?? false,
    horizontalLayout: horizontalLayout ?? false,
    popoverAlignment: popoverAlignment ?? 'start',
    presets: Boolean(presets),
    stacked: stacked ?? false,
  })

  return (
    <div className="relative">
      <CalendarTrigger
        allowClear={allowClear}
        classes={classes}
        compact={compact}
        presets={presets}
        presetIndex={presetIndex}
        selectedTimezone={selectedTimezone}
        stacked={stacked}
        value={value}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
      {isOpen ? (
        <CalendarPopover
          calendarRef={calendarRef}
          classes={classes}
          currentDate={currentDate}
          days={days}
          endDate={endDate}
          endDateError={endDateError}
          endTime={endTime}
          endTimeError={endTimeError}
          horizontalLayout={horizontalLayout ?? false}
          hoverDate={hoverDate}
          isSelecting={isSelecting}
          maxValue={normalizedMaxValue}
          minValue={normalizedMinValue}
          selectedTimezone={selectedTimezone}
          showTimeInput={showTimeInput ?? true}
          startDate={startDate}
          startDateError={startDateError}
          startTime={startTime}
          startTimeError={startTimeError}
          timezones={timezones}
          value={value}
          onApply={onApply}
          onDateClick={onDateClick}
          onDateHover={onDateHover}
          onEndDateChange={onEndDateChange}
          onEndTimeChange={onEndTimeChange}
          onNextMonth={onNextMonth}
          onPreviousMonth={onPreviousMonth}
          onStartDateChange={onStartDateChange}
          onStartTimeChange={onStartTimeChange}
          onTimezoneChange={onTimezoneChange}
        />
      ) : null}
    </div>
  )
}

function getCalendarMonthDays(currentDate: Date) {
  const days: Date[] = []
  let day = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
  const finalDay = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  while (day <= finalDay) {
    days.push(day)
    day = addDays(day, 1)
  }
  return days
}

function getDateSelection(
  day: Date,
  isSelecting: boolean,
  value: RangeValue | null
) {
  if (!isSelecting || !value?.start) {
    return {
      value: { start: startOfDay(day), end: null },
      selecting: true,
    }
  }

  const range = orderRange(day, value.start)
  return {
    value: {
      start: startOfDay(range.start ?? day),
      end: endOfDay(range.end ?? day),
    },
    selecting: false,
  }
}

function parseCalendarFields({
  endDate,
  endTime,
  selectedTimezone,
  startDate,
  startTime,
}: {
  endDate: string
  endTime: string
  selectedTimezone: string
  startDate: string
  startTime: string
}) {
  const parsedFields = {
    startDate: parse(startDate, 'MMM dd, yyyy', new Date()),
    startTime: parse(startTime, 'HH:mm', new Date()),
    endDate: parse(endDate, 'MMM dd, yyyy', new Date()),
    endTime: parse(endTime, 'HH:mm', new Date()),
  }
  const errors = {
    startDate: !isValid(parsedFields.startDate),
    startTime: !isValid(parsedFields.startTime),
    endDate: !isValid(parsedFields.endDate),
    endTime: !isValid(parsedFields.endTime),
  }
  const hasError = Object.values(errors).some(Boolean)
  if (hasError) return { errors, value: null }

  return {
    errors,
    value: {
      start: fromZonedTime(
        parse(`${startDate} ${startTime}`, 'MMM d, yyyy HH:mm', new Date()),
        selectedTimezone
      ),
      end: fromZonedTime(
        parse(`${endDate} ${endTime}`, 'MMM d, yyyy HH:mm', new Date()),
        selectedTimezone
      ),
    },
  }
}

function getCalendarInputValues(
  value: RangeValue | null,
  selectedTimezone: string
) {
  const now = new Date()
  return {
    startDate: formatInTimeZone(
      value?.start ?? now,
      selectedTimezone,
      'MMM dd, yyyy'
    ),
    startTime: formatInTimeZone(
      value?.start ?? startOfDay(now),
      selectedTimezone,
      'HH:mm'
    ),
    endDate: formatInTimeZone(
      value?.end ?? now,
      selectedTimezone,
      'MMM dd, yyyy'
    ),
    endTime: formatInTimeZone(
      value?.end ?? endOfDay(now),
      selectedTimezone,
      'HH:mm'
    ),
  }
}

function calendarSyncChanged(
  previous: {
    value: RangeValue | null
    selectedTimezone: string
    isOpen: boolean
  },
  next: {
    value: RangeValue | null
    selectedTimezone: string
    isOpen: boolean
  }
) {
  return (
    previous.value?.start?.getTime() !== next.value?.start?.getTime() ||
    previous.value?.end?.getTime() !== next.value?.end?.getTime() ||
    previous.selectedTimezone !== next.selectedTimezone ||
    previous.isOpen !== next.isOpen
  )
}

export const Calendar = ({
  allowClear = false,
  compact = false,
  isDocsPage: _isDocsPage = false,
  stacked = false,
  horizontalLayout = false,
  showTimeInput = true,
  popoverAlignment = 'start',
  value,
  onChange,
  presets,
  presetIndex,
  minValue,
  maxValue,
}: CalendarProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const timezones = [
    {
      value: 'UTC',
      label: 'UTC',
    },
    {
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
      label: `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
    },
  ]
  const [selectedTimezone, setSelectedTimezone] = useState(
    () => timezones[1]?.value ?? timezones[0]?.value ?? 'UTC'
  )
  const [startDate, setStartDate] = useState<string>(() =>
    formatInTimeZone(
      value?.start || new Date(),
      selectedTimezone,
      'MMM dd, yyyy'
    )
  )
  const [startTime, setStartTime] = useState<string>(() =>
    formatInTimeZone(
      startOfDay(value?.start || new Date()),
      selectedTimezone,
      'HH:mm'
    )
  )
  const [endDate, setEndDate] = useState<string>(() =>
    formatInTimeZone(value?.end || new Date(), selectedTimezone, 'MMM dd, yyyy')
  )
  const [endTime, setEndTime] = useState<string>(() =>
    formatInTimeZone(
      endOfDay(value?.end || new Date()),
      selectedTimezone,
      'HH:mm'
    )
  )
  const [startDateError, setStartDateError] = useState<boolean>(false)
  const [startTimeError, setStartTimeError] = useState<boolean>(false)
  const [endDateError, setEndDateError] = useState<boolean>(false)
  const [endTimeError, setEndTimeError] = useState<boolean>(false)
  const calendarRef = useRef<HTMLDivElement | null>(null)
  const normalizedMinValue = minValue ? startOfDay(minValue) : null
  const normalizedMaxValue = maxValue ? endOfDay(maxValue) : null

  useClickOutside(calendarRef, () => setIsOpen(false))

  useEffect(() => {
    const closeCalendar = () => setIsOpen(false)
    window.addEventListener('resize', closeCalendar)
    window.addEventListener('scroll', closeCalendar)

    return () => {
      window.removeEventListener('resize', closeCalendar)
      window.removeEventListener('scroll', closeCalendar)
    }
  }, [])

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const daysArray = getCalendarMonthDays(currentDate)

  const handleDateClick = (day: Date) => {
    const selection = getDateSelection(day, isSelecting, value)
    onChange(selection.value)
    setIsSelecting(selection.selecting)
    setHoverDate(selection.selecting ? day : null)
    if (!selection.selecting) setIsOpen(false)
  }

  const handleMouseEnter = (day: Date) => {
    if (isSelecting && value?.start && !value.end) {
      setHoverDate(day)
    }
  }

  if ((!value?.start || value.end) && (isSelecting || hoverDate)) {
    setIsSelecting(false)
    setHoverDate(null)
  }

  const onApply = () => {
    const result = parseCalendarFields({
      endDate,
      endTime,
      selectedTimezone,
      startDate,
      startTime,
    })
    setStartDateError(result.errors.startDate)
    setStartTimeError(result.errors.startTime)
    setEndDateError(result.errors.endDate)
    setEndTimeError(result.errors.endTime)
    if (result.value) onChange(result.value)
  }

  const [prevValueSync, setPrevValueSync] = useState({
    value,
    selectedTimezone,
    isOpen,
  })
  const nextSync = { value, selectedTimezone, isOpen }
  if (calendarSyncChanged(prevValueSync, nextSync)) {
    const inputs = getCalendarInputValues(value, selectedTimezone)
    setPrevValueSync(nextSync)
    setStartDate(inputs.startDate)
    setStartTime(inputs.startTime)
    setEndDate(inputs.endDate)
    setEndTime(inputs.endTime)
  }

  return (
    <CalendarPresentation
      allowClear={allowClear}
      compact={compact}
      currentDate={currentDate}
      days={daysArray}
      endDate={endDate}
      endDateError={endDateError}
      endTime={endTime}
      endTimeError={endTimeError}
      horizontalLayout={horizontalLayout}
      hoverDate={hoverDate}
      isOpen={isOpen}
      isSelecting={isSelecting}
      maxValue={normalizedMaxValue ?? undefined}
      minValue={normalizedMinValue ?? undefined}
      popoverAlignment={popoverAlignment}
      presets={presets}
      presetIndex={presetIndex}
      selectedTimezone={selectedTimezone}
      showTimeInput={showTimeInput}
      stacked={stacked}
      startDate={startDate}
      startDateError={startDateError}
      startTime={startTime}
      startTimeError={startTimeError}
      timezones={timezones}
      value={value}
      calendarRef={calendarRef}
      onApply={onApply}
      onChange={onChange}
      onDateClick={handleDateClick}
      onDateHover={handleMouseEnter}
      onEndDateChange={setEndDate}
      onEndTimeChange={setEndTime}
      onNextMonth={nextMonth}
      onOpenChange={() => setIsOpen(previous => !previous)}
      onPreviousMonth={prevMonth}
      onStartDateChange={setStartDate}
      onStartTimeChange={setStartTime}
      onTimezoneChange={setSelectedTimezone}
    />
  )
}
