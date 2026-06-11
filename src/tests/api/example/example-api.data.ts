/* eslint-disable sonarjs/no-hardcoded-passwords */
import { CreateActivityRequest } from '@rest/activities/activities.utils'

export const credentials = {
  username: 'polz_Hranilishe_auto',
  password: '12345678',
  accessTokenExpiresIn: 1440,
}

export const createActivityRequest = new CreateActivityRequest({ id: 1, title: 'Write tests', dueDate: '2026-06-11T08:00:00.000Z', completed: false })
