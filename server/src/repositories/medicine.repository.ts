import pool from '../db/pool.js'
import type { CreateMedicineDto, UpdateMedicineDto } from '../dto/medicine.dto.js'
import type { MedicineRow } from '../models/medicine.model.js'

export const medicineRepository = {
  async findAll(): Promise<MedicineRow[]> {
    const result = await pool.query<MedicineRow>(
      'SELECT id, name, generic_name, code, caution FROM medicine ORDER BY name'
    )
    return result.rows
  },

  async findById(id: number): Promise<MedicineRow | null> {
    const result = await pool.query<MedicineRow>(
      'SELECT id, name, generic_name, code, caution FROM medicine WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  },

  async create(dto: CreateMedicineDto): Promise<MedicineRow> {
    const result = await pool.query<MedicineRow>(
      `INSERT INTO medicine (name, generic_name, code, caution)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, generic_name, code, caution`,
      [dto.name, dto.genericName ?? null, dto.code, dto.caution]
    )
    return result.rows[0]
  },

  async update(id: number, dto: UpdateMedicineDto): Promise<MedicineRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.name !== undefined) {
      fields.push(`name = $${i++}`)
      values.push(dto.name)
    }
    if (dto.genericName !== undefined) {
      fields.push(`generic_name = $${i++}`)
      values.push(dto.genericName)
    }
    if (dto.code !== undefined) {
      fields.push(`code = $${i++}`)
      values.push(dto.code)
    }
    if (dto.caution !== undefined) {
      fields.push(`caution = $${i++}`)
      values.push(dto.caution)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<MedicineRow>(
      `UPDATE medicine SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, generic_name, code, caution`,
      values
    )
    return result.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM medicine WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
