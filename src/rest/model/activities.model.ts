import { z } from 'zod'

/**
 * GET /api/v1/Activities
 * Retrieve a list of all activities.
 *
 * No request body.
 *
 * Response 200: ActivitiesResponse
 *   - [].id        – activity identifier
 *   - [].title     – activity title
 *   - [].dueDate   – due date in ISO-8601 format
 *   - [].completed – whether the activity is completed
 */

export const ActivitySchema = z.strictObject({
  id: z.number(),
  title: z.string(),
  dueDate: z.string(),
  completed: z.boolean(),
})

export type Activity = z.infer<typeof ActivitySchema>

export const ActivitiesResponseSchema = z.array(ActivitySchema)

export type ActivitiesResponse = z.infer<typeof ActivitiesResponseSchema>
