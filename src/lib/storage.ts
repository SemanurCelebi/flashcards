import type { Deck } from '@/types/deck'

const STORAGE_KEY = 'flashcards.decks.v1'

export function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDecks(decks: Deck[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
    return true
  } catch {
    return false
  }
}
