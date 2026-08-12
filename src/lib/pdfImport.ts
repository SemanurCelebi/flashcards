export interface VocabPair {
  term: string
  meaning: string
}

interface PdfTextItem {
  str: string
  transform: number[]
  width: number
}

interface PositionedItem {
  str: string
  x: number
  xEnd: number
  y: number
}

const Y_TOLERANCE = 2
const MIN_GAP = 0.5

function isTextItem(item: unknown): item is PdfTextItem {
  if (typeof item !== 'object' || item === null) return false
  const v = item as Record<string, unknown>
  return typeof v.str === 'string' && Array.isArray(v.transform) && typeof v.width === 'number'
}

function toPositionedItems(items: unknown[]): PositionedItem[] {
  const positioned: PositionedItem[] = []
  for (const item of items) {
    if (!isTextItem(item)) continue
    if (item.str.trim() === '') continue
    const x = item.transform[4] ?? 0
    const y = item.transform[5] ?? 0
    positioned.push({ str: item.str, x, xEnd: x + item.width, y })
  }
  return positioned
}

function clusterLines(items: PositionedItem[]): PositionedItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const clusters: Array<{ y: number; items: PositionedItem[] }> = []
  for (const item of sorted) {
    const cluster = clusters.find((candidate) => Math.abs(candidate.y - item.y) <= Y_TOLERANCE)
    if (cluster) {
      cluster.items.push(item)
    } else {
      clusters.push({ y: item.y, items: [item] })
    }
  }
  return clusters.map((cluster) => cluster.items.sort((a, b) => a.x - b.x))
}

function joinItems(items: PositionedItem[]): string {
  let text = ''
  let prevXEnd: number | null = null
  for (const item of items) {
    if (prevXEnd !== null && item.x - prevXEnd > MIN_GAP) {
      text += ' '
    }
    text += item.str
    prevXEnd = item.xEnd
  }
  return text.trim()
}

/** Splits a line of positioned items into term/meaning at its single largest x-gap. */
function splitByLargestXGap(line: PositionedItem[]): VocabPair | null {
  if (line.length < 2) return null

  let maxGap = -Infinity
  let splitAt = -1
  for (let i = 1; i < line.length; i++) {
    const gap = line[i]!.x - line[i - 1]!.xEnd
    if (gap > maxGap) {
      maxGap = gap
      splitAt = i
    }
  }
  if (splitAt === -1 || maxGap <= MIN_GAP) return null

  const term = joinItems(line.slice(0, splitAt))
  const meaning = joinItems(line.slice(splitAt))
  if (!term || !meaning) return null
  return { term, meaning }
}

/**
 * Fallback for plain strings with no positional data: split on the first
 * tab, otherwise on the widest run of 2+ spaces.
 */
export function splitTermMeaningFromText(line: string): VocabPair | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  if (trimmed.includes('\t')) {
    const tabIndex = trimmed.indexOf('\t')
    const term = trimmed.slice(0, tabIndex).trim()
    const meaning = trimmed.slice(tabIndex + 1).trim()
    if (term && meaning) return { term, meaning }
  }

  const gapPattern = /\s{2,}/g
  let widest: { index: number; length: number } | null = null
  let match: RegExpExecArray | null
  while ((match = gapPattern.exec(trimmed))) {
    if (!widest || match[0].length > widest.length) {
      widest = { index: match.index, length: match[0].length }
    }
  }
  if (!widest) return null

  const term = trimmed.slice(0, widest.index).trim()
  const meaning = trimmed.slice(widest.index + widest.length).trim()
  if (!term || !meaning) return null
  return { term, meaning }
}

/** Reconstructs lines from a page's text content and splits each into a term/meaning pair. */
export function extractVocabPairsFromTextContent(textContent: { items: unknown[] }): VocabPair[] {
  const lines = clusterLines(toPositionedItems(textContent.items))
  const pairs: VocabPair[] = []
  for (const line of lines) {
    const pair = splitByLargestXGap(line) ?? splitTermMeaningFromText(joinItems(line))
    if (pair) pairs.push(pair)
  }
  return pairs
}

let workerConfigured = false

// pdfjs-dist requires full-browser APIs (e.g. DOMMatrix) at import time, so it's
// loaded lazily here rather than at module scope to keep this file importable in tests.
async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist')
  if (!workerConfigured) {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    workerConfigured = true
  }
  return pdfjsLib
}

/** Loads a single-column, one-pair-per-line PDF and extracts term/meaning pairs from every page. */
export async function extractVocabPairsFromPdf(file: File): Promise<VocabPair[]> {
  const pdfjsLib = await loadPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pairs: VocabPair[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    pairs.push(...extractVocabPairsFromTextContent(textContent))
  }
  return pairs
}
