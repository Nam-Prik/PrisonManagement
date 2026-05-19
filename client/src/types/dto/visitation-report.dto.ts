export interface VisitorPrisonerRelationshipRow {
  visitor_first_name: string
  visitor_last_name: string
  gender: string
  contact_no: string
  blood_type: string
  prisoner_code: string
  total_visits: number
}

export interface VisitationLogRow {
  prisoner_code: string
  visitment_date: string
  duration: number
  description: string
  visitor_first_name: string
  visitor_last_name: string
}

export interface VisitationAnalysisRow {
  prisoner_code: string
  prisoner_first_name: string
  prisoner_last_name: string
  evaluation_score: number
  total_completed_visits: number
  total_visitation_duration: number
  avg_duration_per_visit: number
  unique_visitor_count: number
}
