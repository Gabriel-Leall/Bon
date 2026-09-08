import { useEffect, useRef, useState } from 'react'
import { Archive, FileText, Inbox, Pin, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { NoteDetailsSheet } from '@/components/notes/NoteDetailsSheet'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { Note } from '@/lib/notes-domain'
import {
  filterAndSortNotes,
  getNoteMarkerIndex,
  getPostItText,
  splitPinnedNotes,
} from '@/lib/notes-page-domain'
import { cn } from '@/lib/utils'
import { type NotesWorkspaceView, useNotesStore } from '@/store/notes-store'

interface NotesPageProps {
  initialSelectedNoteId?: string
}

const NOTE_MARKERS = [
  'rounded-full bg-primary',
  'rounded-full border-2 border-primary bg-transparent',
  'rounded-sm bg-primary/55',
] as const

const noteDateFormatters = new Map<string, Intl.DateTimeFormat>()

function formatNoteDate(value: string, locale: string) {
  let formatter = noteDateFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    })
    noteDateFormatters.set(locale, formatter)
  }
  return formatter.format(new Date(value))
}

function QuickNoteCapture({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation()
  const createNote = useNotesStore(state => state.createNote)
  const selectNote = useNotesStore(state => state.selectNote)
  const isSaving = useNotesStore(state => state.isSaving)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const focusCapture = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing = ['INPUT', 'TEXTAREA'].includes(target.tagName)
      if (
        event.key.toLowerCase() === 'n' &&
        !editing &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusCapture)
    return () => window.removeEventListener('keydown', focusCapture)
  }, [])

  const handleCreate = async () => {
    const content = draft.trim()
    if (!content) return

    try {
      await createNote(content)
      selectNote(null)
      setDraft('')
      onCreated()
      requestAnimationFrame(() => inputRef.current?.focus())
    } catch (error) {
      toast.error(t('notes.quickCapture.error'), {
        description: String(error),
      })
    }
  }

  return (
    <form
      className="mt-7 flex w-full max-w-3xl items-end gap-3 rounded-2xl border border-border bg-surface p-3 shadow-neu-raised"
      onSubmit={event => {
        event.preventDefault()
        void handleCreate()
      }}
    >
      <label htmlFor="notes-quick-capture" className="sr-only">
        {t('notes.quickCapture.label')}
      </label>
      <textarea
        ref={inputRef}
        id="notes-quick-capture"
        rows={2}
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            void handleCreate()
          }
        }}
        placeholder={t('notes.quickCapture.placeholder')}
        className="min-h-12 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-base leading-6 text-foreground outline-none placeholder:text-foreground-disabled"
      />
      <Button type="submit" size="lg" disabled={!draft.trim() || isSaving}>
        {t('notes.quickCapture.submit')}
      </Button>
    </form>
  )
}

function NoteCard({
  note,
  pinned,
  selected,
  editable,
  onOpen,
  onTogglePinned,
}: {
  note: Note
  pinned: boolean
  selected: boolean
  editable: boolean
  onOpen: () => void
  onTogglePinned: () => void
}) {
  const { t, i18n } = useTranslation()
  const text = getPostItText(note)
  const markerClass = NOTE_MARKERS[getNoteMarkerIndex(note.id)]

  return (
    <article
      className={cn(
        'group relative min-h-44 overflow-hidden rounded-2xl border border-border bg-surface shadow-neu-raised transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-neu-raised-lg motion-reduce:transform-none',
        selected && 'border-primary/65 shadow-focus-card'
      )}
    >
      <span
        aria-hidden="true"
        className="absolute end-0 top-0 size-7 border-b border-s border-border bg-surface-elevated shadow-neu-pressed [clip-path:polygon(0_0,100%_100%,100%_0)]"
      />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-44 w-full flex-col p-5 pe-11 text-start outline-none focus-visible:shadow-focus-input"
        aria-label={t('notes.card.openAria', {
          note: text || t('notes.card.empty'),
        })}
      >
        <span className="mb-4 flex items-center gap-2">
          <span className={cn('size-2.5 shrink-0', markerClass)} />
          {pinned ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Pin className="size-3" />
              {t('notes.card.pinned')}
            </span>
          ) : null}
        </span>
        <span className="line-clamp-6 whitespace-pre-line text-[15px] leading-6 text-foreground">
          {text || t('notes.card.empty')}
        </span>
        <span className="mt-auto pt-5 text-xs text-muted-foreground">
          {formatNoteDate(note.updated_at, i18n.language)}
        </span>
      </button>
      {editable ? (
        <button
          type="button"
          onClick={() => onTogglePinned()}
          aria-label={pinned ? t('notes.detail.unpin') : t('notes.detail.pin')}
          aria-pressed={pinned}
          className="absolute bottom-4 end-4 flex size-8 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated text-muted-foreground shadow-neu-raised-sm outline-none transition-[color,box-shadow,transform] hover:text-primary active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring motion-reduce:transform-none"
        >
          <Pin className="size-3.5" />
        </button>
      ) : null}
    </article>
  )
}

function NotesSection({
  title,
  notes,
  pinnedNoteIds,
  selectedNoteId,
  editable,
  onSelect,
  onTogglePinned,
}: {
  title: string
  notes: Note[]
  pinnedNoteIds: string[]
  selectedNoteId: string | null
  editable: boolean
  onSelect: (id: string) => void
  onTogglePinned: (id: string) => void
}) {
  if (notes.length === 0) return null
  const pinnedIds = new Set(pinnedNoteIds)

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {notes.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            pinned={pinnedIds.has(note.id)}
            selected={selectedNoteId === note.id}
            editable={editable}
            onOpen={() => onSelect(note.id)}
            onTogglePinned={() => onTogglePinned(note.id)}
          />
        ))}
      </div>
    </section>
  )
}

export function NotesPage({ initialSelectedNoteId }: NotesPageProps) {
  const { t } = useTranslation()
  const notes = useNotesStore(state => state.notes)
  const workspaceView = useNotesStore(state => state.workspaceView)
  const selectedNoteId = useNotesStore(state => state.selectedNoteId)
  const isLoading = useNotesStore(state => state.isLoading)
  const isSaving = useNotesStore(state => state.isSaving)
  const pinnedNoteIds = useNotesStore(state => state.pinnedNoteIds)
  const loadNotes = useNotesStore(state => state.loadNotes)
  const setWorkspaceView = useNotesStore(state => state.setWorkspaceView)
  const selectNote = useNotesStore(state => state.selectNote)
  const updateNote = useNotesStore(state => state.updateNote)
  const archiveNote = useNotesStore(state => state.archiveNote)
  const deleteNote = useNotesStore(state => state.deleteNote)
  const restoreNote = useNotesStore(state => state.restoreNote)
  const togglePinnedNote = useNotesStore(state => state.togglePinnedNote)
  const [search, setSearch] = useState('')
  const didSyncInitialNote = useRef(false)

  useEffect(() => {
    let active = true

    void loadNotes().then(() => {
      if (active && !initialSelectedNoteId) {
        useNotesStore.getState().selectNote(null)
      }
    })

    return () => {
      active = false
    }
  }, [initialSelectedNoteId, loadNotes])

  useEffect(() => {
    if (
      didSyncInitialNote.current ||
      !initialSelectedNoteId ||
      !notes.some(note => note.id === initialSelectedNoteId)
    ) {
      return
    }

    didSyncInitialNote.current = true
    selectNote(initialSelectedNoteId)
  }, [initialSelectedNoteId, notes, selectNote])

  const visibleNotes = filterAndSortNotes(notes, search)
  const { pinned, recent } = splitPinnedNotes(
    visibleNotes,
    workspaceView === 'inbox' ? pinnedNoteIds : []
  )
  const selectedNote = notes.find(note => note.id === selectedNoteId) ?? null
  const editable = workspaceView === 'inbox'

  const viewOptions = (['inbox', 'archive', 'trash'] as const).map(value => ({
    value,
    label: t(`notes.views.${value}`),
    icon: value === 'inbox' ? Inbox : value === 'archive' ? Archive : Trash2,
  }))

  const changeWorkspace = async (view: NotesWorkspaceView) => {
    if (view === workspaceView) return

    try {
      await setWorkspaceView(view)
      setSearch('')
    } catch (error) {
      toast.error(t('notes.snackbar.actionFailed'), {
        description: String(error),
      })
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const archivedId = await archiveNote(id)
      selectNote(null)
      toast.success(t('notes.snackbar.archived'), {
        action: {
          label: t('common.undo'),
          onClick: () => void restoreNote(archivedId),
        },
      })
    } catch (error) {
      toast.error(t('notes.snackbar.actionFailed'), {
        description: String(error),
      })
    }
  }

  const handleMoveToTrash = async (id: string) => {
    try {
      const trashedId = await deleteNote(id)
      selectNote(null)
      toast.success(t('notes.snackbar.movedToTrash'), {
        action: {
          label: t('common.undo'),
          onClick: () => void restoreNote(trashedId),
        },
      })
    } catch (error) {
      toast.error(t('notes.snackbar.actionFailed'), {
        description: String(error),
      })
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id)
      selectNote(null)
      toast.success(t('notes.snackbar.restored'))
    } catch (error) {
      toast.error(t('notes.snackbar.actionFailed'), {
        description: String(error),
      })
    }
  }

  const emptyTitle = search.trim()
    ? t('notes.empty.search', { query: search })
    : t(`notes.empty.${workspaceView}`)

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-(--axis-content-max) px-(--axis-page-gutter) pb-12 pt-6 sm:pt-8">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t('notes.pageTitle')}
              </h1>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t('notes.noteCount', { count: notes.length })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('notes.pageDescription')}
            </p>
          </div>

          <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-border-strong bg-surface-sunken px-3 text-muted-foreground shadow-neu-pressed focus-within:border-primary/60 focus-within:shadow-focus-input sm:w-80">
            <Search className="size-4 shrink-0" />
            <span className="sr-only">{t('notes.search.label')}</span>
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t('notes.search.placeholder')}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-disabled"
            />
          </label>
        </header>

        {editable ? <QuickNoteCapture onCreated={() => setSearch('')} /> : null}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <SegmentedControl
            value={workspaceView}
            onValueChange={value =>
              void changeWorkspace(value as NotesWorkspaceView)
            }
            options={viewOptions}
            aria-label={t('notes.views.label')}
          />
          {editable ? (
            <p className="text-xs text-muted-foreground">
              {t('notes.quickCapture.hint')}
            </p>
          ) : null}
        </div>

        {isLoading && notes.length === 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-border bg-surface shadow-neu-raised"
              />
            ))}
          </div>
        ) : visibleNotes.length > 0 ? (
          <>
            {editable ? (
              <NotesSection
                title={t('notes.sections.pinned')}
                notes={pinned}
                pinnedNoteIds={pinnedNoteIds}
                selectedNoteId={selectedNoteId}
                editable
                onSelect={selectNote}
                onTogglePinned={togglePinnedNote}
              />
            ) : null}
            <NotesSection
              title={t(
                editable
                  ? 'notes.sections.recent'
                  : `notes.sections.${workspaceView}`
              )}
              notes={editable ? recent : visibleNotes}
              pinnedNoteIds={pinnedNoteIds}
              selectedNoteId={selectedNoteId}
              editable={editable}
              onSelect={selectNote}
              onTogglePinned={togglePinnedNote}
            />
          </>
        ) : (
          <section className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-6 shadow-neu-raised">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border-strong bg-surface-elevated text-muted-foreground shadow-neu-raised-sm">
              <FileText className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {emptyTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  search.trim()
                    ? 'notes.empty.clearSearchHint'
                    : `notes.empty.${workspaceView}Hint`
                )}
              </p>
            </div>
          </section>
        )}

        {selectedNote ? (
          <NoteDetailsSheet
            key={selectedNote.id}
            note={selectedNote}
            workspaceView={workspaceView}
            isSaving={isSaving}
            pinned={pinnedNoteIds.includes(selectedNote.id)}
            onOpenChange={open => {
              if (!open) selectNote(null)
            }}
            onContentChange={updateNote}
            onTogglePinned={togglePinnedNote}
            onArchive={handleArchive}
            onMoveToTrash={handleMoveToTrash}
            onRestore={handleRestore}
          />
        ) : null}
      </div>
    </div>
  )
}
