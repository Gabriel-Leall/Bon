import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { commands } from '@/lib/tauri-bindings'
import { NOTES_PIN_STORAGE_KEY, useNotesStore } from '@/store/notes-store'
import { fireEvent, render, screen, waitFor } from '@/test/test-utils'
import { NotesPage } from './NotesPage'

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getNotesVaultInfo: vi.fn(),
    getNotesWorkspaceTree: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    archiveNote: vi.fn(),
    deleteNote: vi.fn(),
    restoreNote: vi.fn(),
    listNoteAnnotations: vi.fn(),
  },
  unwrapResult: vi.fn(
    (result: { status: 'ok' | 'error'; data?: unknown; error?: string }) => {
      if (result.status === 'ok') return result.data
      throw new Error(result.error ?? 'Command failed')
    }
  ),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const note = {
  id: 'inbox/call-ana.md',
  path: 'inbox/call-ana.md',
  title: 'Call Ana',
  content: 'Call Ana tomorrow morning.',
  created_at: '2026-09-08T09:00:00.000Z',
  updated_at: '2026-09-08T10:00:00.000Z',
  word_count: 4,
  tags: [],
  wiki_links: [],
  has_attachments: false,
  excerpt: 'Call Ana tomorrow morning.',
}

const archivedNote = {
  ...note,
  id: 'archive/old-idea.md',
  path: 'archive/old-idea.md',
  title: 'Old idea',
  content: 'Old idea kept for later.',
}

const originalTogglePinnedNote = useNotesStore.getState().togglePinnedNote

describe('NotesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    window.localStorage.clear()

    vi.mocked(commands.getNotesVaultInfo).mockResolvedValue({
      status: 'ok',
      data: {
        path: 'C:\\Users\\Gabriel\\Documents\\Axis Notes',
        is_default: true,
      },
    })
    vi.mocked(commands.getNotesWorkspaceTree).mockImplementation(
      async workspace => ({
        status: 'ok' as const,
        data: {
          workspace,
          items:
            workspace === 'archive'
              ? [{ kind: 'note' as const, note: archivedNote }]
              : workspace === 'trash'
                ? []
                : [{ kind: 'note' as const, note }],
        },
      })
    )
    vi.mocked(commands.createNote).mockResolvedValue({
      status: 'ok',
      data: {
        ...note,
        id: 'inbox/buy-coffee.md',
        path: 'inbox/buy-coffee.md',
        title: 'Buy coffee',
        content: 'Buy coffee',
      },
    })
    vi.mocked(commands.updateNote).mockResolvedValue({
      status: 'ok',
      data: note,
    })
    vi.mocked(commands.listNoteAnnotations).mockResolvedValue({
      status: 'ok',
      data: [],
    })

    useNotesStore.setState({
      vaultInfo: null,
      vaultError: null,
      pendingMigrationSourcePath: null,
      workspaceView: 'inbox',
      tree: null,
      notes: [],
      searchResults: null,
      selectedNoteId: null,
      searchQuery: '',
      selectedTag: null,
      isSaving: false,
      isLoading: false,
      isSearching: false,
      annotations: [],
      selectedAnnotationId: null,
      annotationsPanelOpen: false,
      isLoadingAnnotations: false,
      pinnedNoteIds: [],
      togglePinnedNote: originalTogglePinnedNote,
    })
  })

  it('presents notes as a quick post-it mural instead of a vault editor', async () => {
    render(<NotesPage />)

    expect(await screen.findByText('Call Ana tomorrow morning.')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeVisible()
    expect(screen.getByText('1 note')).toBeVisible()
    expect(screen.queryByText('Local vault')).not.toBeInTheDocument()
    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  it('captures a note with a useful title without opening a full editor', async () => {
    const user = userEvent.setup()
    render(<NotesPage />)

    await screen.findByText('Call Ana tomorrow morning.')
    await user.type(
      screen.getByRole('textbox', { name: 'New note text' }),
      'Buy coffee'
    )
    await user.click(screen.getByRole('button', { name: 'Save note' }))

    await waitFor(() => {
      expect(commands.createNote).toHaveBeenCalledWith({
        title: 'Buy coffee',
        content: 'Buy coffee',
        folder: null,
      })
    })
    expect(
      screen.queryByRole('dialog', { name: 'Quick note' })
    ).not.toBeInTheDocument()
  })

  it('persists pinning and moves the note into the pinned group', async () => {
    const togglePinnedNote = vi.fn(originalTogglePinnedNote)
    useNotesStore.setState({ togglePinnedNote })
    render(<NotesPage />)

    await screen.findByRole('button', { name: 'Pin' })
    await waitFor(() => {
      expect(useNotesStore.getState().selectedNoteId).toBeNull()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Pin' }))

    await waitFor(() => {
      expect(togglePinnedNote).toHaveBeenCalledWith(note.id)
      expect(useNotesStore.getState().pinnedNoteIds).toEqual([note.id])
      expect(window.localStorage.getItem(NOTES_PIN_STORAGE_KEY)).toBe(
        JSON.stringify([note.id])
      )
    })
    expect(screen.getByRole('heading', { name: 'Pinned' })).toBeVisible()
  })

  it('opens a focused side sheet and edits the reminder in place', async () => {
    const user = userEvent.setup()
    render(<NotesPage />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Open note: Call Ana tomorrow morning.',
      })
    )

    const editor = screen.getByRole('textbox', { name: 'Reminder' })
    expect(screen.getByRole('dialog', { name: 'Quick note' })).toBeVisible()
    await user.clear(editor)
    await user.type(editor, 'Call Ana at ten.')

    expect(useNotesStore.getState().notes[0]?.content).toBe('Call Ana at ten.')
  })

  it('keeps archived notes available as a read-only lifecycle view', async () => {
    const user = userEvent.setup()
    render(<NotesPage />)

    await screen.findByText('Call Ana tomorrow morning.')
    await user.click(screen.getByRole('radio', { name: 'Archived' }))

    expect(await screen.findByText('Old idea kept for later.')).toBeVisible()
    expect(commands.getNotesWorkspaceTree).toHaveBeenCalledWith('archive')
    expect(
      screen.queryByRole('button', { name: 'Pin' })
    ).not.toBeInTheDocument()
  })
})
