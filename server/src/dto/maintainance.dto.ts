import { z } from 'zod'

const MAINT_STATUSES = [
  'Reported',
  'Pending Approval',
  'Scheduled',
  'In progress',
  'On Hold',
  'Done',
  'Cancelled',
] as const

const LaborItemSchema = z.object({
  maintainerId: z.number().int().positive(),
  laborTask: z.string(), // optional description — empty string is valid
})

export const CreateMaintainanceSchema = z.object({
  prisonLocationId: z.number().int().positive(),
  maintainanceDate: z.string().date('Expected YYYY-MM-DD'),
  maintainanceCost: z.number().int().positive(),
  status: z.enum(MAINT_STATUSES),
  laborItems: z.array(LaborItemSchema).min(1, 'At least one labor item is required'),
})

export type CreateMaintainanceDto = z.infer<typeof CreateMaintainanceSchema>

// Update replaces the full record (including labor items)
export const UpdateMaintainanceSchema = CreateMaintainanceSchema
export type UpdateMaintainanceDto = CreateMaintainanceDto
