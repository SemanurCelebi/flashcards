import type { Card, CardProgress } from '@/types/deck'

export const MIN_BOX = 1
export const MAX_BOX = 3

/** Bumps a card up a box (capped at MAX_BOX); box 3 counts as known. */
export function markKnown(progress: CardProgress): CardProgress {
  const box = Math.min(MAX_BOX, progress.box + 1)
  return {
    box,
    status: box >= MAX_BOX ? 'known' : 'learning',
    lastReviewedAt: new Date().toISOString(),
  }
}

/** Resets a card back to box 1 for more practice. */
export function markLearning(progress: CardProgress): CardProgress {
  return {
    box: MIN_BOX,
    status: 'learning',
    lastReviewedAt: new Date().toISOString(),
  }
}

/** Orders cards for a study session, surfacing lower boxes (less mastered) first. */
export function buildStudyQueue(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => a.progress.box - b.progress.box)
}
