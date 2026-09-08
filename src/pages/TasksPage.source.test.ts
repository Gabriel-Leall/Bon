import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = readFileSync(resolve('src/pages/TasksPage.tsx'), 'utf8')
const detailsSource = readFileSync(
  resolve('src/components/tasks/TaskDetailsSheet.tsx'),
  'utf8'
)

describe('TasksPage surface contract', () => {
  it('uses the four canonical execution filters', () => {
    expect(pageSource).toContain(
      "['today', 'upcoming', 'undated', 'completed']"
    )
    expect(pageSource).toContain('<SegmentedControl')
  })

  it('keeps quick creation compact and makes its date explicit', () => {
    expect(pageSource).toContain('tasks-quick-add')
    expect(pageSource).toContain('<Popover')
    expect(pageSource).toContain("t('tasks.quickAdd.dateAria'")
    expect(pageSource).toContain('getTaskViewForDueDate(quickDueDate, today)')
    expect(pageSource).toContain('max-w-3xl')
    expect(pageSource).not.toContain('KanbanPage')
    expect(pageSource).not.toContain('NewTaskModal')
  })

  it('moves optional task management and focus into the context sheet', () => {
    expect(pageSource).toContain('<TaskDetailsSheet')
    expect(detailsSource).toContain('<Sheet')
    expect(detailsSource).toContain("t('tasks.detail.startFocus')")
    expect(detailsSource).toContain('startContextualFocus(task.id)')
  })

  it('uses semantic surfaces without decorative gradients', () => {
    expect(pageSource).not.toContain('gradient')
    expect(detailsSource).not.toContain('gradient')
    expect(pageSource).not.toContain('bg-white')
    expect(detailsSource).not.toContain('bg-white')
  })
})
