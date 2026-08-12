import { describe, expect, it } from 'vitest'
import { extractVocabPairsFromTextContent, splitTermMeaningFromText } from './pdfImport'

function makeItem(str: string, x: number, y: number, width: number) {
  return { str, transform: [1, 0, 0, 1, x, y], width }
}

describe('splitTermMeaningFromText', () => {
  it('splits on the widest run of 2+ spaces, keeping parentheticals on their side', () => {
    expect(splitTermMeaningFromText('benieuwd (naar)  meraklı')).toEqual({
      term: 'benieuwd (naar)',
      meaning: 'meraklı',
    })
    expect(splitTermMeaningFromText('beren (de beer)  ayılar (ayı)')).toEqual({
      term: 'beren (de beer)',
      meaning: 'ayılar (ayı)',
    })
  })

  it('prefers a tab delimiter over spaces', () => {
    expect(splitTermMeaningFromText('hond\tdog (animal)')).toEqual({
      term: 'hond',
      meaning: 'dog (animal)',
    })
  })

  it('returns null when there is no usable delimiter', () => {
    expect(splitTermMeaningFromText('just one phrase')).toBeNull()
    expect(splitTermMeaningFromText('')).toBeNull()
  })
})

describe('extractVocabPairsFromTextContent', () => {
  it('reconstructs lines from clustered items and splits at the largest x-gap', () => {
    const textContent = {
      items: [
        // Line 1, y=700: "benieuwd (naar)" <big gap> "meraklı"
        makeItem('benieuwd', 0, 700, 50),
        makeItem('(naar)', 54, 700, 40),
        makeItem('meraklı', 140, 700, 50),
        // Line 2, y=650: "beren (de beer)" <big gap> "ayılar (ayı)"
        makeItem('beren', 0, 650, 35),
        makeItem('(de', 39, 650, 25),
        makeItem('beer)', 68, 650, 35),
        makeItem('ayılar', 150, 650, 45),
        makeItem('(ayı)', 199, 650, 35),
      ],
    }

    expect(extractVocabPairsFromTextContent(textContent)).toEqual([
      { term: 'benieuwd (naar)', meaning: 'meraklı' },
      { term: 'beren (de beer)', meaning: 'ayılar (ayı)' },
    ])
  })

  it('groups items into lines by y-position, ignoring x-ordering in the source array', () => {
    const textContent = {
      items: [
        makeItem('meraklı', 140, 700, 50),
        makeItem('benieuwd', 0, 700, 50),
        makeItem('(naar)', 54, 700, 40),
      ],
    }

    expect(extractVocabPairsFromTextContent(textContent)).toEqual([
      { term: 'benieuwd (naar)', meaning: 'meraklı' },
    ])
  })

  it('skips lines that have no gap to split on', () => {
    const textContent = {
      items: [makeItem('Vocabulary List', 0, 700, 90)],
    }

    expect(extractVocabPairsFromTextContent(textContent)).toEqual([])
  })
})
