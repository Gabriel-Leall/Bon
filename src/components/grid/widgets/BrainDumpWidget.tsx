import { useState, useEffect } from 'react'
import { Brain, ArrowUpRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotesStore } from '@/store/notes-store'
import { WidgetCard } from '../WidgetCard'

interface BrainDumpWidgetProps {
  onNavigateToNotes?: (selectedNoteId?: string) => void
}

export function BrainDumpWidget({ onNavigateToNotes }: BrainDumpWidgetProps) {
  const { t } = useTranslation()

  const notes = useNotesStore(state => state.notes)
  const workspaceView = useNotesStore(state => state.workspaceView)
  const loadWidgetNotes = useNotesStore(state => state.loadWidgetNotes)
  const createNote = useNotesStore(state => state.createNote)
  const updateNote = useNotesStore(state => state.updateNote)
  const selectNote = useNotesStore(state => state.selectNote)

  const [currentIndex, setCurrentIndex] = useState(0)
  const widgetNotes = workspaceView === 'inbox' ? notes : []

  useEffect(() => {
    loadWidgetNotes()
  }, [loadWidgetNotes])

  const currentNote = widgetNotes[currentIndex] ?? null

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (widgetNotes.length === 0) {
      timeoutId = setTimeout(() => setCurrentIndex(0), 0)
    } else if (currentIndex > widgetNotes.length - 1) {
      timeoutId = setTimeout(() => setCurrentIndex(widgetNotes.length - 1), 0)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentIndex, widgetNotes.length])

  async function handleCreateNote() {
    try {
      const id = await createNote('')
      selectNote(id)
      setCurrentIndex(0)
    } catch {
      // Keep widget responsive if create fails.
    }
  }

  function navigateUp() {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  function navigateDown() {
    if (widgetNotes.length === 0) return
    setCurrentIndex(prev => Math.min(widgetNotes.length - 1, prev + 1))
  }

  const handleOpenPage = () => {
    if (currentNote) {
      selectNote(currentNote.id)
      onNavigateToNotes?.(currentNote.id)
    } else {
      onNavigateToNotes?.()
    }
  }

  function handleContentChange(content: string) {
    if (currentNote) {
      updateNote(currentNote.id, content)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.ctrlKey) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      navigateUp()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      navigateDown()
    }
  }

  return (
    <WidgetCard
      title={t('widgets.brainDump.title')}
      icon={Brain}
      contentClassName="overflow-hidden p-0"
      headerActions={
        <>
          <button
            type="button"
            onClick={handleOpenPage}
            className="flex size-6 items-center justify-center rounded-md border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:bg-accent hover:text-accent-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none"
            aria-label={t('widgets.brainDump.openNotesAria')}
          >
            <ArrowUpRight className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => void handleCreateNote()}
            className="flex size-6 items-center justify-center rounded-md border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:bg-accent hover:text-accent-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none"
            aria-label={t('widgets.brainDump.newNoteAria')}
          >
            <Plus className="size-3" />
          </button>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <textarea
          value={currentNote?.content ?? ''}
          onChange={e => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('widgets.brainDump.placeholder')}
          aria-label={t('widgets.brainDump.editorAria')}
          spellCheck={false}
          className="m-2 min-h-0 flex-1 resize-none rounded-lg border border-border-strong bg-surface-sunken p-3 font-sans text-base leading-relaxed text-foreground shadow-neu-pressed placeholder:text-muted-foreground outline-none focus-visible:shadow-focus-input"
        />

        <div className="flex shrink-0 items-center justify-between border-t border-border bg-surface-elevated px-3 py-1">
          <span className="text-muted-foreground font-mono text-xs">
            {t('widgets.brainDump.notesCount', { count: widgetNotes.length })}
          </span>
          {widgetNotes.length > 0 && (
            <span className="text-muted-foreground font-mono text-xs">
              {currentIndex + 1}/{widgetNotes.length}
            </span>
          )}
        </div>
      </div>
    </WidgetCard>
  )
}
