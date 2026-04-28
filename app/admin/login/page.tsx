'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Loader2, Mail, KeyRound, CheckCircle2, ArrowLeft, Sparkles, Rocket, LayoutDashboard } from 'lucide-react'

type Step = 'credentials' | 'otp' | 'success'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/dashboard'

  const [step, setStep] = useState<Step>('credentials')
  const [form, setForm] = useState({ username: '', password: '' })
  const [otp, setOtp] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => setMounted(true), [])

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  // Step 1: verify credentials → get needsOtp back
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please fill in both fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.needsOtp) {
        setMaskedEmail(data.maskedEmail || '')
        setStep('otp')
      } else if (data.success) {
        setStep('success')
        setTimeout(() => router.push(redirect), 2800)
      } else {
        setError(data.message || 'Invalid credentials.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Send OTP email
  const handleSendOtp = async () => {
    if (countdown > 0) return
    setSendingOtp(true)
    setError('')
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setCountdown(60)
      } else {
        setError(data.message || 'Failed to send OTP.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Step 2: verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, otp }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
        setTimeout(() => router.push(redirect), 2800)
      } else {
        setError(data.message || 'Invalid OTP.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  // ─── SUCCESS ANIMATION SCREEN ───────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center relative z-10 max-w-md w-full"
        >
          {/* Animated checkmark ring */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-emerald-500/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border-4 border-emerald-400/50"
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.5 }}
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-emerald-400"
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 70,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 70,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 0.8, delay: 0.7 + i * 0.05, ease: 'easeOut' }}
                style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Login Successful!</h1>
            <p className="text-emerald-400 font-semibold mb-1">Welcome back, Admin 👋</p>
            <p className="text-white/40 text-sm mb-8">Setting up your dashboard…</p>
          </motion.div>

          {/* Progress steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-6"
          >
            {[
              { icon: Shield, label: 'Credentials verified', done: true, delay: 0.9 },
              { icon: KeyRound, label: 'Session initialized', done: true, delay: 1.1 },
              { icon: LayoutDashboard, label: 'Loading admin panel', done: true, delay: 1.3 },
              { icon: Rocket, label: 'Onboarding to dashboard…', done: false, delay: 1.5 },
            ].map(({ icon: Icon, label, done, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay }}
                className="flex items-center gap-3"
              >
                <div className={`p-1.5 rounded-lg ${done ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                  <Icon className={`w-3.5 h-3.5 ${done ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
                <span className="text-sm text-white/70 flex-1">{label}</span>
                {done ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.2, type: 'spring' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, delay: 0.5, ease: 'easeInOut' }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-xs text-white/20 mt-3"
          >
            Redirecting to Admin Dashboard…
          </motion.p>
        </motion.div>
      </div>
    )
  }
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {['credentials', 'otp'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30' :
                (i === 0 && step === 'otp') ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'
              }`}>
                {i === 0 && step === 'otp' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < 1 && <div className={`w-8 h-0.5 transition-all ${step === 'otp' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-4 shadow-lg shadow-blue-500/30"
            >
              {step === 'credentials' ? <Shield className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />}
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {step === 'credentials' ? 'Admin Portal' : 'Email Verification'}
            </h1>
            <p className="text-sm text-white/40">
              {step === 'credentials'
                ? 'Enter your credentials to continue'
                : maskedEmail ? `OTP will be sent to ${maskedEmail}` : 'Verify your identity'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ─── STEP 1: Credentials ─────────────────────────────────── */}
            {step === 'credentials' && (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : 'Continue →'}
                </button>
              </motion.form>
            )}

            {/* ─── STEP 2: OTP ─────────────────────────────────────────── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Get OTP button */}
                {!otpSent ? (
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <Mail className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-white/60">
                        We&apos;ll send a 6-digit OTP to your registered email address.
                      </p>
                      {maskedEmail && (
                        <p className="text-xs text-white/40 mt-1 font-mono">{maskedEmail}</p>
                      )}
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Sending OTP…</> : <><Mail className="w-4 h-4" />Get OTP on Email</>}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-green-400 text-sm">OTP sent! Check your email inbox.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                        placeholder="000000"
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
                        autoFocus
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button type="submit" disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : <><KeyRound className="w-4 h-4" />Verify & Login</>}
                    </button>

                    <button type="button" onClick={handleSendOtp} disabled={countdown > 0 || sendingOtp}
                      className="w-full text-sm text-white/40 hover:text-white/60 disabled:cursor-not-allowed transition-colors py-1">
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : sendingOtp ? 'Sending…' : 'Resend OTP'}
                    </button>
                  </form>
                )}

                {/* Back */}
                <button onClick={() => { setStep('credentials'); setError(''); setOtp(''); setOtpSent(false) }}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors mx-auto">
                  <ArrowLeft className="w-3 h-3" /> Back to credentials
                </button>

                <AnimatePresence>
                  {error && !otpSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          ← <a href="/" className="hover:text-white/40 transition-colors underline underline-offset-2">Back to Portfolio</a>
        </p>
      </motion.div>
    </div>

}
