/**
 * admin-auth.ts
 * Auth utilities — reads credentials from env vars.
 */

export const SESSION_COOKIE = 'portfolio_admin_session'
export const OTP_COOKIE     = 'portfolio_admin_otp'

export function generateToken(username: string): string {
  const payload = { username, ts: Date.now() }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    const isExpired = Date.now() - decoded.ts > 24 * 60 * 60 * 1000
    if (isExpired) return false
    const adminUsername = process.env.ADMIN_USERNAME
    return decoded.username === adminUsername
  } catch {
    return false
  }
}
