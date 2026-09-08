import { Archive, Copy, Pin, PinOff, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Note } from '@/lib/notes-domain'
import type { NotesWorkspaceView } from '@/store/notes-store'

interface NoteDetailsSheetProps {
  note: Note
  workspaceView: NotesWorkspaceView
  isSaving: boolean
  pinned: boolean
  onOpenChange: (open: boolean) => void
  onContentChange: (id: string, content: string) => void
  onTogglePinned: (id: string) => void
  onArchive: (id: string) => Promise<void>
  onMoveToTrash: (id: string) => Promise<void>
  onRestore: (id: string) => Promise<void>
}

const updatedAtFormatters = new Map<string, Intl.DateTimeFormat>()

function formatUpdatedAt(value: string, locale: string) {
  let formatter = updatedAtFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    updatedAtFormatters.set(locale, formatter)
  }
  return formatter.format(new Date(value))
}

export function NoteDetailsSheet({
  note,
  workspaceView,
  isSaving,
  pinned,
  onOpenChange,
  onContentChange,
  onTogglePinned,
  onArchive,
  onMoveToTrash,
  onRestore,
}: NoteDetailsSheetProps) {
  const { t, i18n } = useTranslation()
  const [draft, setDraft] = useState(note.content)
  const editable = workspaceView === 'inbox'
  const updatedLabel = formatUpdatedAt(note.updated_at, i18n.language)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      toast.success(t('notes.detail.copied'))
    } catch (error) {
      toast.error(t('notes.snackbar.actionFailed'), {
        description: String(error),
      })
    }
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-surface p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-10 pe-7">
            <div className="min-w-0">
              <SheetTitle>{t('notes.detail.title')}</SheetTitle>
              <SheetDescription className="mt-1">
                {editable
                  ? t('notes.detail.activeDescription')
                  : t(`notes.detail.${workspaceView}Description`)}
              </SheetDescription>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {updatedLabel}
            </span>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {editable ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={pinned}
                onClick={() => onTogglePinned(note.id)}
              >
                {pinned ? (
                  <PinOff className="size-4" />
                ) : (
                  <Pin className="size-4" />
                )}
                {pinned ? t('notes.detail.unpin') : t('notes.detail.pin')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
            >
              <Copy className="size-4" />
              {t('notes.detail.copy')}
            </Button>
          </div>

          <label
            htmlFor="note-quick-content"
            className="mb-2 text-sm font-medium text-foreground"
          >
            {t('notes.detail.contentLabel')}
          </label>
          <textarea
            id="note-quick-content"
            value={draft}
            readOnly={!editable}
            onChange={event => {
              const content = event.target.value
              setDraft(content)
              onContentChange(note.id, content)
            }}
            className="min-h-64 flex-1 resize-none rounded-2xl border border-border-strong bg-surface-sunken p-5 text-base leading-7 text-foreground shadow-neu-pressed outline-none placeholder:text-foreground-disabled focus-visible:border-primary/60 focus-visible:shadow-focus-input read-only:cursor-default"
            placeholder={t('notes.detail.placeholder')}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {editable
              ? isSaving
                ? t('notes.detail.saving')
                : t('notes.detail.saved')
              : t('notes.detail.readonly')}
          </p>
        </div>

        <SheetFooter className="flex-row border-t border-border px-6 py-5">
          {editable ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onArchive(note.id)}
              >
                <Archive className="size-4" />
                {t('notes.detail.archive')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void onMoveToTrash(note.id)}
              >
                <Trash2 className="size-4" />
                {t('notes.detail.moveToTrash')}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => void onRestore(note.id)}>
              <RotateCcw className="size-4" />
              {t('notes.detail.restore')}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
