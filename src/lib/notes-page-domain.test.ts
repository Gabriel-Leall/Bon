import { describe, expect, it } from 'vitest'
import type { Note } from '@/lib/notes-domain'
import {
  filterAndSortNotes,
  getNoteMarkerIndex,
  getPostItText,
  splitPinnedNotes,
} from './notes-page-domain'

const note = (overrides: Partial<Note>): Note => ({
  id: 'note-1',
  title: 'Untitled',
  content: '',
  created_at: '2026-09-08T10:00:00.000Z',
  updated_at: '2026-09-08T10:00:00.000Z',
  word_count: 0,
  ...overrides,
})

describe('notes page domain', () => {
  it('turns stored Markdown into readable post-it text', () => {
    expect(
      getPostItText(
        note({
          content: '# Comprar\n- Café\n- [Leite](https://example.com)',
        })
      )
    ).toBe('Comprar\nCafé\nLeite')
  })

  it('falls back to the file-backed title for empty legacy notes', () => {
    expect(getPostItText(note({ title: 'Lembrar depois' }))).toBe(
      'Lembrar depois'
    )
  })

  it('filters locally and keeps the latest notes first', () => {
    const notes = [
      note({ id: 'old', content: 'Comprar café' }),
      note({
        id: 'new',
        content: 'Ligar para Ana',
        updated_at: '2026-09-08T12:00:00.000Z',
      }),
    ]

    expect(filterAndSortNotes(notes, '').map(item => item.id)).toEqual([
      'new',
      'old',
    ])
    expect(filterAndSortNotes(notes, 'café').map(item => item.id)).toEqual([
      'old',
    ])
  })

  it('keeps pinned notes ahead of the recent mural', () => {
    const notes = [note({ id: 'one' }), note({ id: 'two' })]
    const groups = splitPinnedNotes(notes, ['two'])

    expect(groups.pinned.map(item => item.id)).toEqual(['two'])
    expect(groups.recent.map(item => item.id)).toEqual(['one'])
  })

  it('assigns a stable marker without randomizing the note surface', () => {
    expect(getNoteMarkerIndex('note-42')).toBe(getNoteMarkerIndex('note-42'))
    expect(getNoteMarkerIndex('note-42')).toBeLessThan(3)
  })
})
