import { z } from 'zod'

const irregularityTypeValues = [
  'MissingPrisoner',
  'ItemLost',
  'ProhibitedItem',
  'ContrabandFound',
  'Assault',
  'RiotAttempt',
  'Vandalism',
  'EscapeAttempt',
  'MedicalEmergency',
] as const

const severityValues = ['None', 'Low', 'Medium', 'High', 'Critical', 'Fatal'] as const

export const CreateIrregularitySchema = z.object({
  type: z.enum(irregularityTypeValues),
  description: z.string().optional(),
  severity: z.enum(severityValues),
})

export type CreateIrregularityDto = z.infer<typeof CreateIrregularitySchema>

export const UpdateIrregularitySchema = CreateIrregularitySchema.partial()

export type UpdateIrregularityDto = z.infer<typeof UpdateIrregularitySchema>
