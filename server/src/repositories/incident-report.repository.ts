import pool from '../db/pool.js'
import type {
  IncidentByOfficerRow,
  InvolvedPrisonerByLocationRow,
  TopPrisonerIncidentRow,
} from '../models/incident-report.model.js'

export const incidentReportRepository = {
  // Report 1: all incidents documented by a specific officer
  async findIncidentsByOfficer(officerId: number): Promise<IncidentByOfficerRow[]> {
    const result = await pool.query<IncidentByOfficerRow>(
      `SELECT pi.id AS incident_id,
              pi.incident_datetime AS incident_datetime,
              pi.description AS description,
              EXTRACT(DAYS FROM (CURRENT_DATE - pi.incident_datetime))::int AS days_since_incident,
              pl.name AS location_name,
              p.code AS prisoner_code,
              pr.first_name AS prisoner_first_name,
              pr.last_name AS prisoner_last_name
       FROM PrisonerIncidents pi
       JOIN PrisonLocation pl ON pi.prison_location_id = pl.id
       LEFT JOIN InvolvedPrisoner ip ON pi.id = ip.prisoner_incicent_id
       LEFT JOIN Prisoner p ON ip.prisoner_id = p.id
       LEFT JOIN Person pr ON p.person_id = pr.id
       WHERE pi.reporting_officer_id = $1
       ORDER BY pi.incident_datetime DESC`,
      [officerId]
    )
    return result.rows
  },

  // Report 2: all prisoners involved in incidents at a specific location
  async findInvolvedPrisonersByLocation(
    locationId: number
  ): Promise<InvolvedPrisonerByLocationRow[]> {
    const result = await pool.query<InvolvedPrisonerByLocationRow>(
      `SELECT p.code AS prisoner_code,
              pr.first_name AS prisoner_first_name,
              pr.last_name AS prisoner_last_name,
              pi.incident_datetime AS incident_datetime,
              p.evaluation_score AS evaluation_score,
              CASE
                WHEN p.evaluation_score < 40 THEN 'High Risk / Requires Escort'
                WHEN p.evaluation_score BETWEEN 40 AND 75 THEN 'Monitor closely'
                ELSE 'Standard Protocol'
              END AS risk_alert,
              EXTRACT(DAYS FROM (CURRENT_DATE - pi.incident_datetime))::int AS days_ago
       FROM Prisoner p
       JOIN InvolvedPrisoner ip ON p.id = ip.prisoner_id
       JOIN PrisonerIncidents pi ON ip.prisoner_incicent_id = pi.id
       JOIN PrisonLocation pl ON pi.prison_location_id = pl.id
       JOIN Person pr ON p.person_id = pr.id
       WHERE pl.id = $1
       ORDER BY pi.incident_datetime DESC`,
      [locationId]
    )
    return result.rows
  },

  // Report 3: prisoner with most incidents at each location within a date range
  async findTopPrisonerIncidentsByLocation(
    startDate: string,
    endDate: string
  ): Promise<TopPrisonerIncidentRow[]> {
    const result = await pool.query<TopPrisonerIncidentRow>(
      `SELECT DISTINCT ON (pl.name)
              pl.name AS location_name,
              pr.code AS prisoner_code,
              p.first_name AS prisoner_first_name,
              p.last_name AS prisoner_last_name,
              COUNT(pi.id)::int AS total_actions_taken
       FROM PrisonLocation pl
       JOIN PrisonerIncidents pi ON pl.id = pi.prison_location_id
       LEFT JOIN InvolvedPrisoner ip ON pi.id = ip.prisoner_incicent_id
       LEFT JOIN Prisoner pr ON ip.prisoner_id = pr.id
       LEFT JOIN Person p ON pr.person_id = p.id
       WHERE pi.incident_datetime BETWEEN $1 AND $2
       GROUP BY pl.name, pr.code, p.first_name, p.last_name
       ORDER BY pl.name, total_actions_taken DESC`,
      [startDate, endDate]
    )
    return result.rows
  },
}
