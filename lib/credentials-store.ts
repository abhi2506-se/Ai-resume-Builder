/**
 * credentials-store.ts
 * Reads admin credentials from environment variables.
 */

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin@portfolio123',
  }
}
