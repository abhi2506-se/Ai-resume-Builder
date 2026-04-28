import { NextResponse } from 'next/server'
import { getAdminCredentials } from '@/lib/credentials-store'
import { SESSION_COOKIE, OTP_COOKIE, generateToken } from '@/lib/admin-auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password, otp } = body

    const admin = getAdminCredentials()

    if (!admin.username || !admin.password) {
      return NextResponse.json(
        { error: 'Admin credentials not set in environment variables' },
        { status: 500 }
      )
    }

    const credentialsValid =
      username === admin.username && password === admin.password

    if (!credentialsValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      )
    }

    // Step 1: credentials OK, OTP not yet provided
    if (!otp) {
      const email = process.env.ADMIN_EMAIL || admin.username || ''
      const masked = email.replace(/(.{2})(.*)(@.*)/, (_: string, a: string, b: string, c: string) =>
        a + '*'.repeat(Math.max(1, b.length)) + c
      )
      return NextResponse.json({
        success: false,
        needsOtp: true,
        maskedEmail: masked,
        message: 'Credentials verified. Please verify with OTP.',
      })
    }

    // Step 2: verify OTP from cookie
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const otpCookie = cookieStore.get(OTP_COOKIE)?.value

    if (!otpCookie) {
      return NextResponse.json(
        { success: false, message: 'OTP expired or not requested. Please try again.' },
        { status: 401 }
      )
    }

    let payload: { otpHash: string; email: string; expiry: number }
    try {
      payload = JSON.parse(Buffer.from(otpCookie, 'base64').toString())
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP session. Please request a new OTP.' },
        { status: 401 }
      )
    }

    if (Date.now() > payload.expiry) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      )
    }

    const { createHash } = await import('crypto')
    const secret = process.env.SESSION_SECRET || 'portfolio-admin-otp-secret-2024'
    const inputHash = createHash('sha256').update(otp.trim() + secret).digest('hex')

    if (inputHash !== payload.otpHash) {
      return NextResponse.json(
        { success: false, message: 'Incorrect OTP. Please check your email and try again.' },
        { status: 401 }
      )
    }

    // OTP correct: create session
    const token = generateToken(admin.username)
    const res = NextResponse.json({ success: true })

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    // Clear OTP cookie
    res.cookies.set(OTP_COOKIE, '', { maxAge: 0, path: '/' })

    return res
  } catch (error) {
    console.error('[admin/login]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
