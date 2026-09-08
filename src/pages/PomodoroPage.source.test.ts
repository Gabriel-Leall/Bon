import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Focus page visual contract', () => {
  it('presents Pomodoro as a Focus mode on semantic layered surfaces', () => {
    const source = readFileSync(resolve('src/pages/PomodoroPage.tsx'), 'utf8')
    const styles = readFileSync(resolve('src/App.css'), 'utf8')

    expect(source).toContain("t('pomodoro.pageTitle')")
    expect(source).toContain("t('pomodoro.mode.pomodoro')")
    expect(source).toContain('bg-surface p-5 shadow-neu-raised')
    expect(source).toContain('bg-surface-sunken')
    expect(source).toContain('shadow-neu-pressed')
    expect(source).toContain('aspect-square w-full max-w-sm')
    expect(source).toContain('pathLength={100}')
    expect(source).toContain('strokeDashoffset={progressOffset}')
    expect(source).toContain('timer-progress-orbit')
    expect(source).toContain('data-running={isRunning}')
    expect(source).toContain(
      'const elapsedSeconds = Math.max(0, totalDuration - timeRemaining)'
    )
    expect(source).toContain(
      'const orbitAngle = elapsedSeconds * TIMER_ORBIT_DEGREES_PER_SECOND'
    )
    expect(source).toContain("'--timer-orbit-angle': `${orbitAngle}deg`")
    expect(styles).toContain(
      'transform: rotate(var(--timer-orbit-angle, 0deg))'
    )
    expect(styles).not.toContain('animation: timer-progress-orbit')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).not.toContain('transition-[width]')
    expect(source).not.toContain('gradient')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('blue-500')
    expect(source).not.toContain('shadow-2xl')
    expect(source).not.toContain('bg-card/')
  })
})
