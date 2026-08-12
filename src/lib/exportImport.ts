import type { Card, CardProgress, Deck } from '@/types/deck'

function isCardProgress(value: unknown): value is CardProgress {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    (v.status === 'new' || v.status === 'learning' || v.status === 'known') &&
    (v.lastReviewedAt === null || typeof v.lastReviewedAt === 'string')
  )
}

function isCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.term === 'string' &&
    typeof v.meaning === 'string' &&
    typeof v.createdAt === 'string' &&
    isCardProgress(v.progress)
  )
}

function isDeck(value: unknown): value is Deck {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string' &&
    Array.isArray(v.cards) &&
    v.cards.every(isCard)
  )
}

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'deck'
}

export function exportDeck(deck: Deck): void {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${sanitizeFilename(deck.name)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importDeckFile(file: File): Promise<Deck> {
  const text = await file.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }

  if (!isDeck(parsed)) {
    throw new Error('File does not match the expected deck format.')
  }

  // Regenerate ids so the imported deck can't collide with an existing one in the store.
  return {
    ...parsed,
    id: crypto.randomUUID(),
    cards: parsed.cards.map((card) => ({ ...card, id: crypto.randomUUID() })),
  }
}
