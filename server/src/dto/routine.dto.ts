import { z } from 'zod'

export const ROUTINE_TYPES = [
  'Patrol',
  'Guard Post',
  'Inspection',
  'Inmate Escort',
  'Cell Search',
  'Tower Watch',
  'Recreation Supervision',
  'Cafeteria Duty',
  'Perimeter Check',
] as const

export const CreateRoutineSchema = z.object({
  routineName: z.string().min(1, 'Routine name is required'),
  prisonLocationId: z.number().int().positive('Location is required'),
  routinesScheduleDate: z.string(), // ISO Date string (YYYY-MM-DD)
  type: z.enum(ROUTINE_TYPES),
  officerIds: z.array(z.number().int()).default([]),
})

export const UpdateRoutineSchema = CreateRoutineSchema.partial()

export type CreateRoutineDto = z.infer<typeof CreateRoutineSchema>
export type UpdateRoutineDto = z.infer<typeof UpdateRoutineSchema>
