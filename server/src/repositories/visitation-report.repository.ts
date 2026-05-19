import pool from '../db/pool.js'
import type {
  VisitationAnalysisFilters,
  VisitationAnalysisRow,
  VisitationLogFilters,
  VisitationLogRow,
  VisitorPrisonerRelationshipRow,
  VisitorRelationshipFilters,
} from '../models/visitation-report.model.js'

export const visitationReportRepository = {
  // Report 1: Visitor-Prisoner Relationship Summary
  async findVisitorRelationship(
    filters: VisitorRelationshipFilters
  ): Promise<VisitorPrisonerRelationshipRow[]> {
    let query = `
      SELECT 
        p.first_name AS visitor_first_name, 
        p.last_name AS visitor_last_name, 
        p.gender, 
        p.contact_no, 
        p.blood_type, 
        pr.code AS prisoner_code, 
        COUNT(v.id) AS total_visits
      FROM Person p
      JOIN VisitmentLineItem vli ON vli.person_id = p.id
      JOIN Visitment v ON v.id = vli.visitment_id
      JOIN Prisoner pr ON pr.id = v.prisoner_id
    `
    const conditions: string[] = []
    const params: unknown[] = []

    if (filters.visitorFirstName) {
      params.push(`%${filters.visitorFirstName}%`)
      conditions.push(`p.first_name ILIKE $${params.length}`)
    }
    if (filters.visitorLastName) {
      params.push(`%${filters.visitorLastName}%`)
      conditions.push(`p.last_name ILIKE $${params.length}`)
    }
    if (filters.prisonerCode) {
      params.push(`%${filters.prisonerCode}%`)
      conditions.push(`pr.code ILIKE $${params.length}`)
    }
    if (filters.gender && filters.gender !== 'All') {
      params.push(filters.gender)
      conditions.push(`p.gender = $${params.length}`)
    }
    if (filters.bloodType && filters.bloodType !== 'All') {
      params.push(filters.bloodType)
      conditions.push(`p.blood_type = $${params.length}`)
    }
    if (filters.status && filters.status !== 'All') {
      params.push(filters.status)
      conditions.push(`v.status = $${params.length}`)
    }
    if (filters.dateFrom) {
      params.push(filters.dateFrom)
      conditions.push(`v.visitment_date >= $${params.length}`)
    }
    if (filters.dateTo) {
      params.push(filters.dateTo)
      conditions.push(`v.visitment_date <= $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += `
      GROUP BY p.id, p.first_name, p.last_name, p.gender, p.contact_no, p.blood_type, pr.code
      ORDER BY total_visits DESC, p.first_name, p.last_name
    `

    const result = await pool.query<VisitorPrisonerRelationshipRow>(query, params)
    return result.rows
  },

  // Report 2: Prisoner Visitation Logs
  async findVisitationLogs(filters: VisitationLogFilters): Promise<VisitationLogRow[]> {
    let query = `
      SELECT 
        pr.code AS prisoner_code, 
        v.visitment_date, 
        v.duration, 
        v.description, 
        p.first_name AS visitor_first_name, 
        p.last_name AS visitor_last_name
      FROM Visitment v
      JOIN Prisoner pr ON pr.id = v.prisoner_id
      JOIN VisitmentLineItem vli ON vli.visitment_id = v.id
      JOIN Person p ON p.id = vli.person_id
    `
    const conditions: string[] = []
    const params: unknown[] = []

    if (filters.prisonerCode) {
      params.push(`%${filters.prisonerCode}%`)
      conditions.push(`pr.code ILIKE $${params.length}`)
    }
    if (filters.visitorFirstName) {
      params.push(`%${filters.visitorFirstName}%`)
      conditions.push(`p.first_name ILIKE $${params.length}`)
    }
    if (filters.visitorLastName) {
      params.push(`%${filters.visitorLastName}%`)
      conditions.push(`p.last_name ILIKE $${params.length}`)
    }
    if (filters.status && filters.status !== 'All') {
      params.push(filters.status)
      conditions.push(`v.status = $${params.length}`)
    }
    if (filters.dateFrom) {
      params.push(filters.dateFrom)
      conditions.push(`v.visitment_date >= $${params.length}`)
    }
    if (filters.dateTo) {
      params.push(filters.dateTo)
      conditions.push(`v.visitment_date <= $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY pr.code, v.visitment_date DESC`

    const result = await pool.query<VisitationLogRow>(query, params)
    return result.rows
  },

  // Report 3: Prisoner Visitation Support Analysis
  async findVisitationAnalysis(
    filters: VisitationAnalysisFilters
  ): Promise<VisitationAnalysisRow[]> {
    const params: unknown[] = []

    // Subqueries for stats
    let visitStatsFilter = "WHERE v.status = 'completed'"
    let visitorStatsFilter = "WHERE v.status = 'completed'"

    if (filters.dateFrom) {
      params.push(filters.dateFrom)
      const pIdx = params.length
      visitStatsFilter += ` AND v.visitment_date >= $${pIdx}`
      visitorStatsFilter += ` AND v.visitment_date >= $${pIdx}`
    }
    if (filters.dateTo) {
      params.push(filters.dateTo)
      const pIdx = params.length
      visitStatsFilter += ` AND v.visitment_date <= $${pIdx}`
      visitorStatsFilter += ` AND v.visitment_date <= $${pIdx}`
    }

    let query = `
      WITH visit_stats AS (
        SELECT 
          v.prisoner_id,
          COUNT(*) AS total_completed_visits,
          SUM(v.duration) AS total_visitation_duration,
          ROUND(AVG(v.duration), 2) AS avg_duration_per_visit
        FROM Visitment v
        ${visitStatsFilter}
        GROUP BY v.prisoner_id
      ),
      visitor_stats AS (
        SELECT 
          v.prisoner_id,
          COUNT(DISTINCT vli.person_id) AS unique_visitor_count
        FROM Visitment v
        JOIN VisitmentLineItem vli ON vli.visitment_id = v.id
        ${visitorStatsFilter}
        GROUP BY v.prisoner_id
      )
      SELECT 
        pr.code AS prisoner_code, 
        pe.first_name AS prisoner_first_name, 
        pe.last_name AS prisoner_last_name, 
        pr.evaluation_score,
        COALESCE(vs.total_completed_visits, 0) AS total_completed_visits,
        COALESCE(vs.total_visitation_duration, 0) AS total_visitation_duration,
        COALESCE(vs.avg_duration_per_visit, 0) AS avg_duration_per_visit,
        COALESCE(vst.unique_visitor_count, 0) AS unique_visitor_count
      FROM Prisoner pr
      JOIN Person pe ON pe.id = pr.person_id
      LEFT JOIN visit_stats vs ON vs.prisoner_id = pr.id
      LEFT JOIN visitor_stats vst ON vst.prisoner_id = pr.id
    `
    const conditions: string[] = []

    if (filters.prisonerCode) {
      params.push(`%${filters.prisonerCode}%`)
      conditions.push(`pr.code ILIKE $${params.length}`)
    }
    if (filters.prisonerFirstName) {
      params.push(`%${filters.prisonerFirstName}%`)
      conditions.push(`pe.first_name ILIKE $${params.length}`)
    }
    if (filters.prisonerLastName) {
      params.push(`%${filters.prisonerLastName}%`)
      conditions.push(`pe.last_name ILIKE $${params.length}`)
    }
    if (filters.scoreFrom !== undefined) {
      params.push(filters.scoreFrom)
      conditions.push(`pr.evaluation_score >= $${params.length}`)
    }
    if (filters.scoreTo !== undefined) {
      params.push(filters.scoreTo)
      conditions.push(`pr.evaluation_score <= $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY total_visitation_duration DESC, unique_visitor_count DESC`

    const result = await pool.query<VisitationAnalysisRow>(query, params)
    return result.rows
  },
}
