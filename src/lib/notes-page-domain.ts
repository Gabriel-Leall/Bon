import type { Note } from '@/lib/notes-domain'

const MARKDOWN_DECORATION = /(^|\s)(#{1,6}|>|[-*+] |\d+\. )/gm
const INLINE_MARKDOWN = /([*_~`]{1,3})/g
const MARKDOWN_LINK = /\[([^\]]+)]\([^)]+\)/g

export function getPostItText(note: Note) {
  const content = note.content.trim() || note.title?.trim() || ''

  return content
    .replace(MARKDOWN_LINK, '$1')
    .replace(MARKDOWN_DECORATION, '$1')
    .replace(INLINE_MARKDOWN, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function filterAndSortNotes(notes: Note[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return notes
    .filter(note => {
      if (!normalizedQuery) return true
      return `${note.title ?? ''} ${getPostItText(note)}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    })
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
}

export function splitPinnedNotes(notes: Note[], pinnedNoteIds: string[]) {
  const pinnedIds = new Set(pinnedNoteIds)
  return {
    pinned: notes.filter(note => pinnedIds.has(note.id)),
    recent: notes.filter(note => !pinnedIds.has(note.id)),
  }
}

export function getNoteMarkerIndex(noteId: string, markerCount = 3) {
  if (markerCount <= 1) return 0
  const hash = Array.from(noteId).reduce(
    (total, character) => total + (character.codePointAt(0) ?? 0),
    0
  )
  return hash % markerCount
}
