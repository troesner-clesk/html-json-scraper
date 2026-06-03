import Papa from 'papaparse'

/**
 * Pure data-shaping for the Link Checker export menu.
 * No DOM/clipboard/file side effects live here so the logic stays unit-testable;
 * the component owns clipboard writes and file downloads.
 */

export interface ExportRow {
  targetUrl: string
  status: number | string
  statusText: string
  sourceUrl: string
  isInternal: boolean
  isBroken: boolean
  domainStatus?: string
  domainError?: string
}

export interface ExportSelection {
  internal: boolean
  external: boolean
  onlyBroken: boolean
}

export type ExportFormat = 'tsv' | 'csv' | 'json' | 'txt'

export const FORMAT_META: Record<ExportFormat, { mime: string; ext: string }> =
  {
    tsv: { mime: 'text/tab-separated-values', ext: 'tsv' },
    csv: { mime: 'text/csv', ext: 'csv' },
    json: { mime: 'application/json', ext: 'json' },
    txt: { mime: 'text/plain', ext: 'txt' },
  }

/**
 * Selected set = (Internal? ∪ External?) ∩ (onlyBroken ? broken : all).
 * Returns [] when neither scope is selected.
 */
export function selectExportRows(
  rows: ExportRow[],
  selection: ExportSelection,
): ExportRow[] {
  return rows.filter((r) => {
    const inScope =
      (selection.internal && r.isInternal) ||
      (selection.external && !r.isInternal)
    if (!inScope) return false
    if (selection.onlyBroken && !r.isBroken) return false
    return true
  })
}

function toTable(rows: ExportRow[]): Record<string, string | number>[] {
  return rows.map((r) => ({
    'Target URL': r.targetUrl,
    Status: r.status,
    'Status Text': r.statusText,
    'Source URL': r.sourceUrl,
    'Domain Status': r.domainStatus ?? '',
    'Domain Error': r.domainError ?? '',
    Type: r.isInternal ? 'Internal' : 'External',
  }))
}

export function serializeExportRows(
  rows: ExportRow[],
  format: ExportFormat,
): string {
  if (rows.length === 0) return ''

  switch (format) {
    case 'csv':
      return Papa.unparse(toTable(rows), { newline: '\n' })
    case 'tsv':
      return Papa.unparse(toTable(rows), { newline: '\n', delimiter: '\t' })
    case 'json':
      return JSON.stringify(
        rows.map((r) => ({
          target: r.targetUrl,
          status: r.status,
          statusText: r.statusText,
          source: r.sourceUrl,
          domainStatus: r.domainStatus ?? '',
          domainError: r.domainError ?? '',
          type: r.isInternal ? 'Internal' : 'External',
        })),
        null,
        2,
      )
    case 'txt':
      return [...new Set(rows.map((r) => r.targetUrl))].join('\n')
  }
}
