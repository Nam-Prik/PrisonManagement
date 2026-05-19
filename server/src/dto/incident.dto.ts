import { z } from 'zod'

export const CreateIncidentSchema = z.object({
  incidentDatetime: z.string().min(1, 'Incident datetime is required'),
  description: z.string().max(255).optional(),
  prisonLocationId: z.number().int().positive('Location is required'),
  reportingOfficerId: z.number().int().positive('Reporting officer is required'),
  involvedPrisonerIds: z.array(z.number().int().positive()).default([]),
})

export type CreateIncidentDto = z.infer<typeof CreateIncidentSchema>

export const UpdateIncidentSchema = CreateIncidentSchema
export type UpdateIncidentDto = CreateIncidentDto
