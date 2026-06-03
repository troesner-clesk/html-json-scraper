import { describe, expect, it } from 'vitest'
import {
  type ExportRow,
  selectExportRows,
  serializeExportRows,
} from '../link-export'

const rows: ExportRow[] = [
  {
    targetUrl: 'https://a.com/1',
    status: 200,
    statusText: 'OK',
    sourceUrl: 'https://a.com',
    isInternal: true,
    isBroken: false,
  },
  {
    targetUrl: 'https://a.com/2',
    status: 404,
    statusText: 'Not Found',
    sourceUrl: 'https://a.com',
    isInternal: true,
    isBroken: true,
  },
  {
    targetUrl: 'https://ext.com/x',
    status: 200,
    statusText: 'OK',
    sourceUrl: 'https://a.com',
    isInternal: false,
    isBroken: false,
  },
  {
    targetUrl: 'https://ext.com/y',
    status: 500,
    statusText: 'Server Error',
    sourceUrl: 'https://a.com',
    isInternal: false,
    isBroken: true,
  },
]

describe('selectExportRows', () => {
  it('returns only internal rows when external is off', () => {
    const r = selectExportRows(rows, {
      internal: true,
      external: false,
      onlyBroken: false,
    })
    expect(r.map((x) => x.targetUrl)).toEqual([
      'https://a.com/1',
      'https://a.com/2',
    ])
  })

  it('returns only external rows when internal is off', () => {
    const r = selectExportRows(rows, {
      internal: false,
      external: true,
      onlyBroken: false,
    })
    expect(r.map((x) => x.targetUrl)).toEqual([
      'https://ext.com/x',
      'https://ext.com/y',
    ])
  })

  it('returns all rows when both scopes are on', () => {
    const r = selectExportRows(rows, {
      internal: true,
      external: true,
      onlyBroken: false,
    })
    expect(r).toHaveLength(4)
  })

  it('restricts to broken rows within the scope when onlyBroken is on', () => {
    const r = selectExportRows(rows, {
      internal: true,
      external: true,
      onlyBroken: true,
    })
    expect(r.map((x) => x.targetUrl)).toEqual([
      'https://a.com/2',
      'https://ext.com/y',
    ])
  })

  it('combines scope and broken filter (external + broken only)', () => {
    const r = selectExportRows(rows, {
      internal: false,
      external: true,
      onlyBroken: true,
    })
    expect(r.map((x) => x.targetUrl)).toEqual(['https://ext.com/y'])
  })

  it('returns an empty array when no scope is selected', () => {
    const r = selectExportRows(rows, {
      internal: false,
      external: false,
      onlyBroken: false,
    })
    expect(r).toEqual([])
  })
})

describe('serializeExportRows', () => {
  const all = selectExportRows(rows, {
    internal: true,
    external: true,
    onlyBroken: false,
  })

  it('csv has a header row that includes the Type column', () => {
    const csv = serializeExportRows(all, 'csv')
    const header = csv.split('\n')[0]
    expect(header).toContain('Target URL')
    expect(header).toContain('Type')
  })

  it('csv labels rows Internal / External in the Type column', () => {
    const csv = serializeExportRows(all, 'csv')
    expect(csv).toContain('Internal')
    expect(csv).toContain('External')
  })

  it('tsv is tab-separated and carries the Type header', () => {
    const header = serializeExportRows(all, 'tsv').split('\n')[0]
    expect(header).toContain('\t')
    expect(header).toContain('Type')
  })

  it('json is a parseable array carrying the type field', () => {
    const parsed = JSON.parse(serializeExportRows(all, 'json'))
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(4)
    expect(parsed[0]).toMatchObject({ type: 'Internal' })
    expect(parsed[2]).toMatchObject({ type: 'External' })
  })

  it('txt is a newline-separated list of unique target URLs', () => {
    const withDupes = [...all, all[0]]
    const txt = serializeExportRows(withDupes, 'txt')
    expect(txt).toBe(
      [
        'https://a.com/1',
        'https://a.com/2',
        'https://ext.com/x',
        'https://ext.com/y',
      ].join('\n'),
    )
  })

  it('returns an empty string for empty input', () => {
    expect(serializeExportRows([], 'csv')).toBe('')
    expect(serializeExportRows([], 'txt')).toBe('')
  })
})
