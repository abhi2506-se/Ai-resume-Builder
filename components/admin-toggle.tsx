'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, LogIn, ChevronUp } from 'lucide-react'

export function AdminToggle() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const content = (
    <>
      {/* Backdrop — only when open */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* The toggle container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {/* Popup menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                background: 'rgba(15,23,42,0.98)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                padding: '8px',
                minWidth: '200px',
              }}
            >
              {/* Header */}
              <div style={{ padding: '8px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '4px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  ⚙️ Admin Panel
                </p>
              </div>

              {/* Login link */}
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogIn style={{ width: 15, height: 15, color: '#34d399', flexShrink: 0 }} />
                Admin Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main floating button */}
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: open
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(135deg, #2563eb, #06b6d4)',
            boxShadow: open
              ? '0 8px 32px rgba(99,102,241,0.5), 0 0 0 2px rgba(99,102,241,0.2)'
              : '0 8px 32px rgba(37,99,235,0.45), 0 0 0 2px rgba(37,99,235,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          title="Admin Panel"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X style={{ width: 20, height: 20, color: 'white' }} />
              </motion.div>
            ) : (
              <motion.div key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Settings style={{ width: 18, height: 18, color: 'white' }} />
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1 }}>ADMIN</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Small arrow hint when closed */}
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2 }}
              style={{
                position: 'absolute',
                bottom: '60px',
                right: '6px',
                background: 'rgba(37,99,235,0.9)',
                borderRadius: '8px',
                padding: '3px 8px',
                fontSize: '10px',
                color: 'white',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <ChevronUp style={{ width: 10, height: 10, display: 'inline', marginRight: 2 }} />
              Admin
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )

  return createPortal(content, document.body)
}
