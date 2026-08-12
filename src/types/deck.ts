export interface CardProgress {
  status: 'new' | 'learning' | 'known'
  lastReviewedAt: string | null
}

export interface Card {
  id: string
  term: string
  meaning: string
  progress: CardProgress
  createdAt: string
}

export interface Deck {
  id: string
  name: string
  cards: Card[]
  createdAt: string
  updatedAt: string
}
