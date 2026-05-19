import pool from '../db/pool.js'
import type {
  MedicinePrescriptionExperienceRow,
  NurseWorkloadPercentageRow,
  TreatmentExperienceRow,
} from '../models/treatment-report.model.js'

export const treatmentReportRepository = {
  async findTreatmentExperience(
    startDate: string,
    endDate: string
  ): Promise<TreatmentExperienceRow[]> {
    const result = await pool.query<TreatmentExperienceRow>(
      `SELECT
         t.id,
         t.prisoner_id,
         t.nurse_id,
         t.diagnose_date,
         pe.first_name AS prisoner_first_name,
         pe.last_name AS prisoner_last_name,
         pne.first_name AS nurse_first_name,
         pne.last_name AS nurse_last_name,
         t.description
       FROM treatment t
       JOIN prisoner p ON p.id = t.prisoner_id
       JOIN person pe ON pe.id = p.person_id
       JOIN nurse n ON n.id = t.nurse_id
       JOIN person pne ON pne.id = n.person_id
       WHERE t.diagnose_date >= $1
         AND t.diagnose_date <= $2
       ORDER BY t.diagnose_date DESC`,
      [startDate, endDate]
    )
    return result.rows
  },

  async findMedicinePrescriptionExperience(
    caution: string
  ): Promise<MedicinePrescriptionExperienceRow[]> {
    const result = await pool.query<MedicinePrescriptionExperienceRow>(
      `SELECT
         m.code,
         m.name,
         m.generic_name,
         COUNT(*) AS usage_count,
         m.caution
       FROM medicationprescription mp
       JOIN medicine m ON m.id = mp.medicine_id
       WHERE m.caution LIKE $1
       GROUP BY m.name, m.generic_name, m.code, m.caution
       ORDER BY m.code ASC, m.name ASC`,
      [`%${caution}%`]
    )
    return result.rows
  },

  async findNurseWorkloadPercentage(): Promise<NurseWorkloadPercentageRow[]> {
    const result = await pool.query<NurseWorkloadPercentageRow>(
      `SELECT
         pe.first_name,
         pe.last_name,
         ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS workload_percentage
       FROM treatment t
       JOIN nurse n ON n.id = t.nurse_id
       JOIN person pe ON pe.id = n.person_id
       GROUP BY pe.first_name, pe.last_name
       ORDER BY workload_percentage DESC, pe.first_name ASC, pe.last_name ASC`
    )
    return result.rows
  },
}
