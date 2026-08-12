export interface CardProgress {
  status: 'new' | 'learning' | 'known'
  /** Leitner-lite box, 1-3. Higher means more consistently known. */
  box: number
  lastReviewedAt: string | null
}

export interface Card {
  id: string
  term: string
  meaning: string
  notes?: string
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
