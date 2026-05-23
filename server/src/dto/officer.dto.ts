import { z } from 'zod'

export const ReportDateRangeSchema = z
  .object({
    startDate: z.string().date('Expected YYYY-MM-DD'),
    endDate: z.string().date('Expected YYYY-MM-DD'),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  })

export type ReportDateRangeDto = z.infer<typeof ReportDateRangeSchema>

export const OfficerRoutineQuerySchema = z.object({
  officerCode: z.string().optional().default('*'),
})

export type OfficerRoutineQueryDto = z.infer<typeof OfficerRoutineQuerySchema>
