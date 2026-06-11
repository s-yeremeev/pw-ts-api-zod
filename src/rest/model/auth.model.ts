import { z } from 'zod'

/**
 * POST /api/v2/auth/refresh
 * Obtain a new access token using a refresh token.
 *
 * Request body: RefreshTokenRequest
 *   - refreshToken (required): refresh token obtained during authorization.
 *
 * Response 200: AccessTokenResponse
 *   - data.authToken.accessToken       – new access token (or temporary token for MFA challenge)
 *   - data.authToken.accessTokenExpiresIn – expiry in minutes
 *   - data.authToken.refreshToken      – new refresh token
 *   - data.authToken.refreshTokenExpiresAt – ISO-8601 datetime when refresh token expires
 *   - data.authToken.login             – user login
 *   - data.authToken.userFullName      – full name of the user
 *   - data.challengeRequired           – true when an MFA challenge is required
 *   - data.phoneNumber                 – phone number used for MFA contact
 *   - data.state                       – CSRF-prevention state parameter
 */

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>

export const AuthTokenSchema = z.object({
  accessToken: z.string().optional(),
  accessTokenExpiresIn: z.number().optional(),
  login: z.string().optional(),
  refreshToken: z.string().optional(),
  refreshTokenExpiresAt: z.string().optional(),
  userFullName: z.string().optional(),
})

export type AuthToken = z.infer<typeof AuthTokenSchema>

export const AccessTokenSchema = z.object({
  authToken: AuthTokenSchema,
  challengeRequired: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  state: z.string().optional(),
})

export type AccessToken = z.infer<typeof AccessTokenSchema>

export const AccessTokenResponseSchema = z.object({
  data: AccessTokenSchema,
})

export type AccessTokenResponse = z.infer<typeof AccessTokenResponseSchema>

/**
 * POST /api/v2/auth/token
 * Obtain an access token by validating user credentials (username + password).
 *
 * Request body: AuthorizeRequest
 *   - username (required): username of the user attempting to authenticate.
 *   - password (required): password credential associated with the user account.
 *   - captchaSolution (optional): solution to a CAPTCHA challenge if required.
 *   - serviceToken (optional): service-specific token for service-to-service auth.
 *
 * Response 200: AccessTokenResponse (same shape as /api/v2/auth/refresh)
 */

export const AuthorizeRequestSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
  captchaSolution: z.string().optional(),
  serviceToken: z.string().optional(),
})

export type AuthorizeRequest = z.infer<typeof AuthorizeRequestSchema>
