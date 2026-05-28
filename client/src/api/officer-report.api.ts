import type {
  IrregularityListItem,
  IrregularitySummaryItem,
  OfficerRoutineItem,
} from '../types/dto/officer-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const listIrregularities = async (
  startDate: string,
  endDate: string
): Promise<IrregularityListItem[]> => {
  const { data } = await http.get<ApiResponse<IrregularityListItem[]>>(
    '/officer-reports/irregularities',
    { params: { startDate, endDate } }
  )
  return data.data
}

export const getOfficerRoutines = async (officerCode?: string): Promise<OfficerRoutineItem[]> => {
  const params = officerCode && officerCode !== '*' ? { officerCode } : {}
  const { data } = await http.get<ApiResponse<OfficerRoutineItem[]>>('/officer-reports/routines', {
    params,
  })
  return data.data
}

export const getIrregularitiesSummary = async (
  startDate: string,
  endDate: string
): Promise<IrregularitySummaryItem[]> => {
  const { data } = await http.get<ApiResponse<IrregularitySummaryItem[]>>(
    '/officer-reports/irregularities/summary',
    { params: { startDate, endDate } }
  )
  return data.data
}
