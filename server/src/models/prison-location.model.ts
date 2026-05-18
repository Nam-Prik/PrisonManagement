// ── DB row types ─────────────────────────────────────────────

export interface PrisonLocationRow {
  id: number
  name: string
  code: string
  purpose: string
  max_capacity: number
}

// ── Clean API types ───────────────────────────────────────────

export interface PrisonLocation {
  id: number
  name: string
  code: string
  purpose: string
  maxCapacity: number
}

// ── Mappers ──────────────────────────────────────────────────

export const toPrisonLocation = (row: PrisonLocationRow): PrisonLocation => ({
  id: row.id,
  name: row.name,
  code: row.code,
  purpose: row.purpose,
  maxCapacity: row.max_capacity,
})
