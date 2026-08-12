import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Card, Deck } from '@/types/deck'
import { loadDecks, saveDecks } from '@/lib/storage'

function makeId(): string {
  return crypto.randomUUID()
}

function makeCard(term: string, meaning: string): Card {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    term,
    meaning,
    progress: { status: 'new', lastReviewedAt: null },
    createdAt: now,
  }
}

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>(loadDecks())

  function persist() {
    saveDecks(decks.value)
  }

  function findDeck(deckId: string): Deck | undefined {
    return decks.value.find((deck) => deck.id === deckId)
  }

  function createDeck(name: string): Deck {
    const now = new Date().toISOString()
    const deck: Deck = {
      id: makeId(),
      name,
      cards: [],
      createdAt: now,
      updatedAt: now,
    }
    decks.value.push(deck)
    persist()
    return deck
  }

  function renameDeck(deckId: string, name: string) {
    const deck = findDeck(deckId)
    if (!deck) return
    deck.name = name
    deck.updatedAt = new Date().toISOString()
    persist()
  }

  function deleteDeck(deckId: string) {
    decks.value = decks.value.filter((deck) => deck.id !== deckId)
    persist()
  }

  function addCard(deckId: string, term: string, meaning: string): Card | undefined {
    const deck = findDeck(deckId)
    if (!deck) return undefined
    const card = makeCard(term, meaning)
    deck.cards.push(card)
    deck.updatedAt = new Date().toISOString()
    persist()
    return card
  }

  function addCards(deckId: string, cards: Array<{ term: string; meaning: string }>): Card[] {
    const deck = findDeck(deckId)
    if (!deck) return []
    const newCards = cards.map((c) => makeCard(c.term, c.meaning))
    deck.cards.push(...newCards)
    deck.updatedAt = new Date().toISOString()
    persist()
    return newCards
  }

  function updateCard(deckId: string, cardId: string, term: string, meaning: string) {
    const deck = findDeck(deckId)
    const card = deck?.cards.find((c) => c.id === cardId)
    if (!deck || !card) return
    card.term = term
    card.meaning = meaning
    deck.updatedAt = new Date().toISOString()
    persist()
  }

  function deleteCard(deckId: string, cardId: string) {
    const deck = findDeck(deckId)
    if (!deck) return
    deck.cards = deck.cards.filter((c) => c.id !== cardId)
    deck.updatedAt = new Date().toISOString()
    persist()
  }

  function markCardKnown(deckId: string, cardId: string) {
    const deck = findDeck(deckId)
    const card = deck?.cards.find((c) => c.id === cardId)
    if (!deck || !card) return
    card.progress.status = 'known'
    card.progress.lastReviewedAt = new Date().toISOString()
    deck.updatedAt = new Date().toISOString()
    persist()
  }

  function markCardLearning(deckId: string, cardId: string) {
    const deck = findDeck(deckId)
    const card = deck?.cards.find((c) => c.id === cardId)
    if (!deck || !card) return
    card.progress.status = 'learning'
    card.progress.lastReviewedAt = new Date().toISOString()
    deck.updatedAt = new Date().toISOString()
    persist()
  }

  return {
    decks,
    createDeck,
    renameDeck,
    deleteDeck,
    addCard,
    addCards,
    updateCard,
    deleteCard,
    markCardKnown,
    markCardLearning,
  }
})
