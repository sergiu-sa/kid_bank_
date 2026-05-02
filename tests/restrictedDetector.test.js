import { describe, it, expect } from 'vitest'
import { detect } from '../src/js/scanner/restrictedDetector.js'

const categories = {
  'en:alcoholic-beverages': 'Alcoholic beverage',
  'en:energy-drinks': 'Energy drink',
  'en:no-sugar': 'No sugar (test only)'
}

const keywords = ['vodka', 'beer', 'snus', 'red bull']

describe('restrictedDetector.detect', () => {
  it('returns not-restricted for an empty product', () => {
    expect(detect({ name: '', categoryTags: [], labelTags: [] }, { categories, keywords }))
      .toEqual({ restricted: false, reason: null })
  })

  it('flags by categoryTags match with pretty reason', () => {
    expect(detect(
      { name: 'Anything', categoryTags: ['en:alcoholic-beverages'], labelTags: [] },
      { categories, keywords }
    )).toEqual({ restricted: true, reason: 'Alcoholic beverage' })
  })

  it('flags by labelTags match', () => {
    expect(detect(
      { name: 'Anything', categoryTags: [], labelTags: ['en:energy-drinks'] },
      { categories, keywords }
    )).toEqual({ restricted: true, reason: 'Energy drink' })
  })

  it('falls back to keyword match when tags miss', () => {
    expect(detect(
      { name: 'Vodka Premium 700ml', categoryTags: [], labelTags: [] },
      { categories, keywords }
    )).toEqual({ restricted: true, reason: 'Matched keyword: vodka' })
  })

  it('does NOT match a keyword as a substring (whole-word boundary)', () => {
    expect(detect(
      { name: 'Snusbar Cookies', categoryTags: [], labelTags: [] },
      { categories, keywords }
    )).toEqual({ restricted: false, reason: null })
  })
})
