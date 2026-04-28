'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Upload, FileText, Zap, Target, CheckCircle, AlertCircle, TrendingUp,
  Download, Loader2, ArrowRight, Sparkles, Building2, ChevronDown,
  User, Mail, Phone, MapPin, Linkedin, Github, Plus, Trash2, X,
  BarChart2, Star, Award, BookOpen, Briefcase, Code2,
  RefreshCw, Eye, Copy, Check, ArrowLeft, Brain, Rocket, Shield,
  ChevronUp, Globe, Clock, PenTool, FileDown
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'analyze' | 'build'
type Step = 'info' | 'experience' | 'skills' | 'preview'

interface ATSResult {
  overallScore: number
  breakdown: { keywords: number; formatting: number; sections: number; impact: number }
  foundKeywords: string[]
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  verdict: string
  atsCompatible: boolean
  sectionAnalysis: { summary: number; experience: number; skills: number; education: number }
  experienceLevel: string
  estimatedYOE: number
  topSkills: string[]
  personalizedTips: string[]
}

interface ExpEntry { title: string; company: string; period: string; location: string; bullets: string[] }
interface EduEntry { degree: string; school: string; year: string; gpa?: string }
interface ProjEntry { name: string; tech: string; description: string }

interface ResumeData {
  name: string; email: string; phone: string; location: string
  linkedin: string; github: string; website: string
  summary: string; skills: string; yearsExp: number; targetRole: string
  experience: ExpEntry[]; education: EduEntry[]; projects: ProjEntry[]
  certifications: string; achievements: string
}

interface GeneratedResume {
  summary: string; skills: string[]; experience: ExpEntry[]
  education: EduEntry[]; projects: ProjEntry[]
  certifications: string[]; estimatedScore: number; keywordsAdded: string[]
}

// ── Company list ──────────────────────────────────────────────────────────────
const COMPANIES = [
  { id: 'google', name: 'Google', logo: '🔍', color: '#4285F4' },
  { id: 'amazon', name: 'Amazon', logo: '🛒', color: '#FF9900' },
  { id: 'microsoft', name: 'Microsoft', logo: '🪟', color: '#00A4EF' },
  { id: 'meta', name: 'Meta', logo: '🌐', color: '#0866FF' },
  { id: 'netflix', name: 'Netflix', logo: '🎬', color: '#E50914' },
  { id: 'apple', name: 'Apple', logo: '🍎', color: '#555' },
  { id: 'linkedin', name: 'LinkedIn', logo: '💼', color: '#0A66C2' },
  { id: 'infosys', name: 'Infosys', logo: '🏢', color: '#007CC3' },
  { id: 'techmahindra', name: 'Tech Mahindra', logo: '🔷', color: '#E31E26' },
  { id: 'tcs', name: 'TCS', logo: '🌟', color: '#0052CC' },
  { id: 'wipro', name: 'Wipro', logo: '💡', color: '#341c75' },
  { id: 'ibm', name: 'IBM', logo: '🔵', color: '#006699' },
  { id: 'accenture', name: 'Accenture', logo: '🔺', color: '#A100FF' },
  { id: 'deloitte', name: 'Deloitte', logo: '🟢', color: '#86BC25' },
  { id: 'oracle', name: 'Oracle', logo: '🔴', color: '#F80000' },
  { id: 'salesforce', name: 'Salesforce', logo: '☁️', color: '#00A1E0' },
  { id: 'startup', name: 'Top Startups', logo: '🚀', color: '#8B5CF6' },
]

const defaultData: ResumeData = {
  name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '',
  summary: '', skills: '', yearsExp: 2, targetRole: '',
  experience: [{ title: '', company: '', period: '', location: '', bullets: ['', ''] }],
  education: [{ degree: '', school: '', year: '', gpa: '' }],
  projects: [{ name: '', tech: '', description: '' }],
  certifications: '', achievements: '',
}

// ── Animated score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, color = '#10b981' }: { score: number; size?: number; color?: string }) {
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const c = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }} />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central"
        transform={`rotate(90,${size/2},${size/2})`} fill={c}
        fontSize={size > 100 ? 26 : 18} fontWeight="800">{score}</text>
      <text x="50%" y="65%" textAnchor="middle" dominantBaseline="central"
        transform={`rotate(90,${size/2},${size/2})`} fill="rgba(255,255,255,0.4)"
        fontSize={size > 100 ? 11 : 9} fontWeight="500">ATS SCORE</text>
    </svg>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }} />
      </div>
    </div>
  )
}

// ── Company selector ──────────────────────────────────────────────────────────
function CompanySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = COMPANIES.find(c => c.id === value)
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm hover:border-white/20 transition-all">
        <div className="flex items-center gap-2">
          {selected ? (
            <><span className="text-xl">{selected.logo}</span>
              <span className="font-semibold text-white">{selected.name}</span></>
          ) : <><Building2 className="w-4 h-4 text-slate-500" /><span className="text-slate-400">Select target company…</span></>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 top-full mt-2 w-full bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto p-2 grid grid-cols-1 gap-1">
              {COMPANIES.map(co => (
                <button key={co.id} onClick={() => { onChange(co.id); setOpen(false) }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${value === co.id ? 'bg-white/10' : 'hover:bg-white/[0.04]'}`}>
                  <span className="text-xl">{co.logo}</span>
                  <span className="text-sm font-medium text-white">{co.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── PDF text extractor (client-side) ─────────────────────────────────────────
async function extractTextFromFile(file: File): Promise<string> {
  if (file.name.endsWith('.txt')) return file.text()
  // For PDF/DOCX: read as text (works for plain-text PDFs)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string || '')
    reader.onerror = () => resolve('')
    reader.readAsText(file)
  })
}

// ── Download helpers ──────────────────────────────────────────────────────────
function buildResumeHTML(data: ResumeData, gen: GeneratedResume): string {
  const skills = gen.skills.join(' • ')
  const expHtml = gen.experience.map(e => `
    <div class="exp-block">
      <div class="exp-header"><div><strong>${e.title}</strong> — ${e.company}</div><span>${e.period}</span></div>
      <div class="exp-location">${e.location || ''}</div>
      <ul>${e.bullets.filter(Boolean).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>`).join('')
  const eduHtml = gen.education.map(e => `
    <div class="edu-block">
      <div class="exp-header"><div><strong>${e.degree}</strong>, ${e.school}</div><span>${e.year}</span></div>
      ${e.gpa ? `<div class="exp-location">GPA: ${e.gpa}</div>` : ''}
    </div>`).join('')
  const projHtml = gen.projects.map(p => `
    <div class="proj-block"><strong>${p.name}</strong> <span class="tech">[${p.tech}]</span><div>${p.description}</div></div>`).join('')
  const certHtml = gen.certifications?.length ? `<section><h2>Certifications</h2><p>${gen.certifications.join(' | ')}</p></section>` : ''

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${data.name} — Resume</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Georgia', serif; font-size:11pt; color:#1a1a1a; max-width:750px; margin:0 auto; padding:40px 30px; line-height:1.5; }
  header { border-bottom:2.5px solid #1a1a1a; padding-bottom:12px; margin-bottom:20px; }
  h1 { font-size:22pt; font-weight:700; letter-spacing:-0.5px; }
  .contact { font-size:9pt; color:#444; margin-top:6px; display:flex; flex-wrap:wrap; gap:12px; }
  .contact a { color:#1a6fbf; text-decoration:none; }
  h2 { font-size:11pt; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #1a1a1a; margin:18px 0 10px; padding-bottom:4px; }
  section { margin-bottom:16px; }
  p.summary { font-size:10.5pt; color:#222; line-height:1.6; }
  .skills { font-size:10pt; color:#333; }
  .exp-block { margin-bottom:12px; }
  .exp-header { display:flex; justify-content:space-between; font-size:10.5pt; }
  .exp-location { font-size:9.5pt; color:#555; margin-bottom:4px; }
  ul { padding-left:16px; }
  ul li { font-size:10pt; margin-bottom:3px; color:#222; }
  .edu-block { margin-bottom:8px; }
  .proj-block { margin-bottom:8px; font-size:10pt; }
  .tech { font-size:9pt; color:#555; }
  @media print { body { padding:20px; } }
</style>
</head><body>
<header>
  <h1>${data.name}</h1>
  <div class="contact">
    ${data.email ? `<span>${data.email}</span>` : ''}
    ${data.phone ? `<span>${data.phone}</span>` : ''}
    ${data.location ? `<span>${data.location}</span>` : ''}
    ${data.linkedin ? `<a href="${data.linkedin}">LinkedIn</a>` : ''}
    ${data.github ? `<a href="${data.github}">GitHub</a>` : ''}
    ${data.website ? `<a href="${data.website}">${data.website}</a>` : ''}
  </div>
</header>
${gen.summary ? `<section><h2>Professional Summary</h2><p class="summary">${gen.summary}</p></section>` : ''}
${skills ? `<section><h2>Skills</h2><p class="skills">${skills}</p></section>` : ''}
${gen.experience?.length ? `<section><h2>Work Experience</h2>${expHtml}</section>` : ''}
${gen.education?.length ? `<section><h2>Education</h2>${eduHtml}</section>` : ''}
${gen.projects?.length ? `<section><h2>Projects</h2>${projHtml}</section>` : ''}
${certHtml}
${data.achievements ? `<section><h2>Achievements</h2><p>${data.achievements}</p></section>` : ''}
</body></html>`
}

function buildResumePlainText(data: ResumeData, gen: GeneratedResume): string {
  const line = '─'.repeat(60)
  let txt = `${data.name.toUpperCase()}\n${line}\n`
  const contacts = [data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean)
  txt += contacts.join(' | ') + '\n\n'
  if (gen.summary) txt += `PROFESSIONAL SUMMARY\n${line}\n${gen.summary}\n\n`
  if (gen.skills?.length) txt += `SKILLS\n${line}\n${gen.skills.join(' • ')}\n\n`
  if (gen.experience?.length) {
    txt += `WORK EXPERIENCE\n${line}\n`
    gen.experience.forEach(e => {
      txt += `${e.title} | ${e.company} | ${e.period}\n${e.location || ''}\n`
      e.bullets.filter(Boolean).forEach(b => { txt += `  • ${b}\n` })
      txt += '\n'
    })
  }
  if (gen.education?.length) {
    txt += `EDUCATION\n${line}\n`
    gen.education.forEach(e => { txt += `${e.degree} — ${e.school} (${e.year})${e.gpa ? ` | GPA: ${e.gpa}` : ''}\n` })
    txt += '\n'
  }
  if (gen.projects?.length) {
    txt += `PROJECTS\n${line}\n`
    gen.projects.forEach(p => { txt += `${p.name} [${p.tech}]\n${p.description}\n\n` })
  }
  if (gen.certifications?.length) txt += `CERTIFICATIONS\n${line}\n${gen.certifications.join('\n')}\n`
  return txt
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function ResumePageInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'analyze')
  const [company, setCompany] = useState('google')
  const [targetRole, setTargetRole] = useState('')

  // Analyzer state
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')

  // Builder state
  const [step, setStep] = useState<Step>('info')
  const [formData, setFormData] = useState<ResumeData>(defaultData)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedResume | null>(null)
  const [buildError, setBuildError] = useState('')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [showPreviewHtml, setShowPreviewHtml] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [])

  const handleFileSelect = async (f: File) => {
    setResumeFile(f); setAtsResult(null); setAnalyzeError('')
    const text = await extractTextFromFile(f)
    setResumeText(text)
  }

  const handleAnalyze = async () => {
    if (!resumeText && !resumeFile) { setAnalyzeError('Please upload a resume file first.'); return }
    if (!company) { setAnalyzeError('Please select a target company.'); return }
    setAnalyzing(true); setAnalyzeError(''); setAtsResult(null)
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', resumeText, company, targetRole }),
      })
      const data = await res.json()
      if (data.result) setAtsResult(data.result)
      else setAnalyzeError(data.error || 'Analysis failed. Please try again.')
    } catch { setAnalyzeError('Network error. Please try again.') }
    finally { setAnalyzing(false) }
  }

  const handleGenerate = async () => {
    if (!formData.name || !formData.email) { setBuildError('Please fill in at least your name and email.'); return }
    setGenerating(true); setBuildError(''); setGenerated(null)
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', resumeData: formData, company, targetRole }),
      })
      const data = await res.json()
      if (data.result) { setGenerated(data.result); setStep('preview') }
      else setBuildError(data.error || 'Generation failed. Please try again.')
    } catch { setBuildError('Network error. Please try again.') }
    finally { setGenerating(false) }
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedSection(key)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const downloadPDF = () => {
    if (!generated || !formData.name) return
    const html = buildResumeHTML(formData, generated)
    const win = window.open('', '_blank')!
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const downloadHTML = () => {
    if (!generated) return
    downloadFile(buildResumeHTML(formData, generated), `${formData.name.replace(/\s+/g, '_')}_Resume.html`, 'text/html')
  }

  const downloadTXT = () => {
    if (!generated) return
    downloadFile(buildResumePlainText(formData, generated), `${formData.name.replace(/\s+/g, '_')}_Resume.txt`, 'text/plain')
  }

  const scoreColor = atsResult
    ? atsResult.overallScore >= 80 ? '#10b981' : atsResult.overallScore >= 60 ? '#f59e0b' : '#ef4444'
    : '#10b981'

  const selectedCo = COMPANIES.find(c => c.id === company)

  return (
    <div className="min-h-screen bg-[#060912] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-px h-40 bg-gradient-to-b from-blue-500/40 to-transparent" />
        <div className="absolute top-0 left-0 h-px w-40 bg-gradient-to-r from-blue-500/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-40 bg-gradient-to-t from-purple-500/40 to-transparent" />
        <div className="absolute bottom-0 right-0 h-px w-40 bg-gradient-to-l from-purple-500/40 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#060912]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Portfolio
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">AI Resume Studio</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">BETA</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Powered by Claude AI</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Free Forever</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-sm text-blue-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered • 90+ ATS Score • {COMPANIES.length} Companies
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            <span className="text-white">Land Your Dream</span><br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Job with AI
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Analyze your resume against top MNC ATS systems or build an AI-optimized resume from scratch. Get 90+ ATS scores guaranteed.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex gap-2 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl w-fit mx-auto mb-10">
          {([
            { id: 'analyze', icon: Target, label: 'ATS Analyzer', desc: 'Score your resume' },
            { id: 'build', icon: PenTool, label: 'Resume Builder', desc: 'Build from scratch' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}>
              <t.icon className="w-4 h-4" />
              <div className="text-left">
                <div>{t.label}</div>
                <div className={`text-[10px] font-normal ${tab === t.id ? 'text-white/60' : 'text-slate-600'}`}>{t.desc}</div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* ── ANALYZER TAB ── */}
        <AnimatePresence mode="wait">
          {tab === 'analyze' && (
            <motion.div key="analyze" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-8">
              {/* Left: Upload + settings */}
              <div className="space-y-5">
                {/* Company + role */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" /> Target Company & Role
                  </h3>
                  <CompanySelector value={company} onChange={setCompany} />
                  <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                    placeholder="Target role (e.g. Senior Software Engineer)"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>

                {/* Upload */}
                <div
                  ref={dropRef}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`bg-white/[0.03] border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    resumeFile ? 'border-green-500/40 bg-green-500/[0.03]' : 'border-white/10 hover:border-blue-500/40'
                  }`}
                  onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <AnimatePresence mode="wait">
                    {resumeFile ? (
                      <motion.div key="file" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                          <FileText className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{resumeFile.name}</p>
                          <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB • Click to change</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto">
                          <Upload className="w-7 h-7 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Drop your resume here</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, TXT • or click to browse</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Paste text fallback */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Or paste resume text
                  </label>
                  <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={6}
                    placeholder="Paste your resume content here for analysis…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                </div>

                {analyzeError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{analyzeError}
                  </div>
                )}

                <motion.button onClick={handleAnalyze} disabled={analyzing || (!resumeText && !resumeFile)}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">
                  {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI…</>
                    : <><Zap className="w-4 h-4" />Analyze Resume ATS Score</>}
                </motion.button>
              </div>

              {/* Right: Results */}
              <div>
                <AnimatePresence mode="wait">
                  {analyzing && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 text-center space-y-6 h-full flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 animate-ping" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Claude AI is analyzing…</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Matching against {selectedCo?.name} ATS criteria
                        </p>
                      </div>
                      <div className="w-full max-w-xs space-y-2">
                        {['Parsing resume structure', 'Matching keywords', 'Scoring ATS compatibility', 'Generating insights'].map((step, i) => (
                          <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.4 }}
                            className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle className="w-3 h-3 text-blue-400" />{step}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!analyzing && !atsResult && (
                    <motion.div key="empty-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 text-center space-y-4 h-full flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        <BarChart2 className="w-10 h-10 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-400">ATS Analysis will appear here</p>
                        <p className="text-sm text-slate-600 mt-1">Upload your resume and click Analyze</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                        {COMPANIES.slice(0, 6).map(co => (
                          <div key={co.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                            <div className="text-xl mb-1">{co.logo}</div>
                            <div className="text-[10px] text-slate-600">{co.name}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!analyzing && atsResult && (
                    <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-4">
                      {/* Score header */}
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                        <div className="flex items-center gap-6 mb-6">
                          <ScoreRing score={atsResult.overallScore} size={120} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{selectedCo?.logo}</span>
                              <p className="font-bold text-white">{selectedCo?.name}</p>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{atsResult.verdict}</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              atsResult.atsCompatible ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
                            }`}>
                              {atsResult.atsCompatible ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {atsResult.atsCompatible ? 'ATS Compatible' : 'Not ATS Compatible'}
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                              {atsResult.experienceLevel?.toUpperCase()} level • ~{atsResult.estimatedYOE} yrs exp
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Bar label="Keyword Match" value={atsResult.breakdown.keywords} color="#3b82f6" />
                          <Bar label="Formatting" value={atsResult.breakdown.formatting} color="#8b5cf6" />
                          <Bar label="Sections" value={atsResult.breakdown.sections} color="#f59e0b" />
                          <Bar label="Impact & Metrics" value={atsResult.breakdown.impact} color="#10b981" />
                        </div>
                      </div>

                      {/* Keywords */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Found Keywords
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.foundKeywords?.map(k => (
                              <span key={k} className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-300 rounded-full border border-green-500/15">{k}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing Keywords
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.missingKeywords?.map(k => (
                              <span key={k} className="text-[11px] px-2 py-0.5 bg-red-500/10 text-red-300 rounded-full border border-red-500/15">{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Strengths + Improvements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">✅ Strengths</p>
                          <ul className="space-y-2">
                            {atsResult.strengths?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <Star className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">⚡ Quick Wins</p>
                          <ul className="space-y-2">
                            {atsResult.improvements?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <TrendingUp className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* AI Tips */}
                      {atsResult.personalizedTips?.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-500/[0.07] to-purple-500/[0.07] border border-blue-500/20 rounded-2xl p-4">
                          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> AI Personalized Tips for {selectedCo?.name}
                          </p>
                          <ul className="space-y-2">
                            {atsResult.personalizedTips.map((t, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA */}
                      <button onClick={() => setTab('build')}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-purple-500 transition-all">
                        <PenTool className="w-4 h-4" /> Build AI-Optimized Resume for {selectedCo?.name}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── BUILDER TAB ── */}
          {tab === 'build' && (
            <motion.div key="build" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Company + role (shared) */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Company</label>
                  <CompanySelector value={company} onChange={setCompany} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
                  <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Data Analyst…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all h-full" />
                </div>
              </div>

              {/* Step indicator */}
              {step !== 'preview' && (
                <div className="flex items-center gap-2 mb-8">
                  {(['info', 'experience', 'skills'] as Step[]).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <button onClick={() => setStep(s)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          step === s ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                        }`}>
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">{i+1}</span>
                        {s === 'info' ? 'Personal Info' : s === 'experience' ? 'Experience & Education' : 'Skills & Extras'}
                      </button>
                      {i < 2 && <ArrowRight className="w-3 h-3 text-slate-700" />}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 1: Personal Info */}
                {step === 'info' && (
                  <motion.div key="step-info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-5">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                      <h3 className="font-semibold text-white flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <InputField label="Full Name *" icon={<User className="w-4 h-4"/>} value={formData.name} onChange={v => setFormData(d=>({...d,name:v}))} placeholder="John Doe" />
                        <InputField label="Email *" icon={<Mail className="w-4 h-4"/>} value={formData.email} onChange={v => setFormData(d=>({...d,email:v}))} placeholder="john@example.com" type="email" />
                        <InputField label="Phone" icon={<Phone className="w-4 h-4"/>} value={formData.phone} onChange={v => setFormData(d=>({...d,phone:v}))} placeholder="+91 99999 88888" />
                        <InputField label="Location" icon={<MapPin className="w-4 h-4"/>} value={formData.location} onChange={v => setFormData(d=>({...d,location:v}))} placeholder="Bangalore, India" />
                        <InputField label="LinkedIn URL" icon={<Linkedin className="w-4 h-4"/>} value={formData.linkedin} onChange={v => setFormData(d=>({...d,linkedin:v}))} placeholder="linkedin.com/in/johndoe" />
                        <InputField label="GitHub URL" icon={<Github className="w-4 h-4"/>} value={formData.github} onChange={v => setFormData(d=>({...d,github:v}))} placeholder="github.com/johndoe" />
                        <InputField label="Portfolio / Website" icon={<Globe className="w-4 h-4"/>} value={formData.website} onChange={v => setFormData(d=>({...d,website:v}))} placeholder="johndoe.dev" />
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Years of Experience</label>
                          <input type="number" min={0} max={40} value={formData.yearsExp}
                            onChange={e => setFormData(d=>({...d,yearsExp:+e.target.value}))}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Professional Summary / Objective</label>
                        <textarea value={formData.summary} onChange={e => setFormData(d=>({...d,summary:e.target.value}))} rows={4}
                          placeholder="Brief summary about your background, key skills, and career goals (AI will optimize this)…"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setStep('experience')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all">
                        Next: Experience <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Experience & Education */}
                {step === 'experience' && (
                  <motion.div key="step-exp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-5">
                    {/* Work Experience */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Work Experience</h3>
                        <button onClick={() => setFormData(d => ({ ...d, experience: [...d.experience, { title:'',company:'',period:'',location:'',bullets:['',''] }] }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 text-xs font-semibold hover:bg-blue-600/30 transition-all border border-blue-500/20">
                          <Plus className="w-3.5 h-3.5" /> Add Job
                        </button>
                      </div>
                      <div className="space-y-6">
                        {formData.experience.map((exp, ei) => (
                          <div key={ei} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job #{ei+1}</span>
                              {formData.experience.length > 1 && (
                                <button onClick={() => setFormData(d=>({...d,experience:d.experience.filter((_,i)=>i!==ei)}))}
                                  className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <SmInput value={exp.title} onChange={v => setFormData(d=>({...d,experience:d.experience.map((e,i)=>i===ei?{...e,title:v}:e)}))} placeholder="Job Title" />
                              <SmInput value={exp.company} onChange={v => setFormData(d=>({...d,experience:d.experience.map((e,i)=>i===ei?{...e,company:v}:e)}))} placeholder="Company Name" />
                              <SmInput value={exp.period} onChange={v => setFormData(d=>({...d,experience:d.experience.map((e,i)=>i===ei?{...e,period:v}:e)}))} placeholder="Jan 2022 – Present" />
                              <SmInput value={exp.location} onChange={v => setFormData(d=>({...d,experience:d.experience.map((e,i)=>i===ei?{...e,location:v}:e)}))} placeholder="City, Country" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Responsibilities / Achievements</label>
                              {exp.bullets.map((b, bi) => (
                                <div key={bi} className="flex items-center gap-2">
                                  <span className="text-slate-600 text-xs">•</span>
                                  <input value={b} onChange={e => setFormData(d=>({...d,experience:d.experience.map((ex,i)=>i===ei?{...ex,bullets:ex.bullets.map((bl,j)=>j===bi?e.target.value:bl)}:ex)}))}
                                    placeholder="Describe your achievement with metrics (AI will enhance this)…"
                                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-all" />
                                  {exp.bullets.length > 1 && <button onClick={() => setFormData(d=>({...d,experience:d.experience.map((ex,i)=>i===ei?{...ex,bullets:ex.bullets.filter((_,j)=>j!==bi)}:ex)}))}
                                    className="text-slate-700 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>}
                                </div>
                              ))}
                              <button onClick={() => setFormData(d=>({...d,experience:d.experience.map((ex,i)=>i===ei?{...ex,bullets:[...ex.bullets,'']}:ex)}))}
                                className="text-xs text-slate-600 hover:text-blue-400 flex items-center gap-1 transition-colors">
                                <Plus className="w-3 h-3" /> Add bullet
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-400" /> Education</h3>
                        <button onClick={() => setFormData(d=>({...d,education:[...d.education,{degree:'',school:'',year:'',gpa:''}]}))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-all border border-purple-500/20">
                          <Plus className="w-3.5 h-3.5" /> Add Education
                        </button>
                      </div>
                      {formData.education.map((edu, ei) => (
                        <div key={ei} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Education #{ei+1}</span>
                            {formData.education.length > 1 && <button onClick={() => setFormData(d=>({...d,education:d.education.filter((_,i)=>i!==ei)}))}
                              className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <SmInput value={edu.degree} onChange={v => setFormData(d=>({...d,education:d.education.map((e,i)=>i===ei?{...e,degree:v}:e)}))} placeholder="B.Tech Computer Science" />
                            <SmInput value={edu.school} onChange={v => setFormData(d=>({...d,education:d.education.map((e,i)=>i===ei?{...e,school:v}:e)}))} placeholder="University / College Name" />
                            <SmInput value={edu.year} onChange={v => setFormData(d=>({...d,education:d.education.map((e,i)=>i===ei?{...e,year:v}:e)}))} placeholder="2024" />
                            <SmInput value={edu.gpa || ''} onChange={v => setFormData(d=>({...d,education:d.education.map((e,i)=>i===ei?{...e,gpa:v}:e)}))} placeholder="CGPA / GPA (optional)" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-cyan-400" /> Projects</h3>
                        <button onClick={() => setFormData(d=>({...d,projects:[...d.projects,{name:'',tech:'',description:''}]}))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-600/30 transition-all border border-cyan-500/20">
                          <Plus className="w-3.5 h-3.5" /> Add Project
                        </button>
                      </div>
                      {formData.projects.map((proj, pi) => (
                        <div key={pi} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project #{pi+1}</span>
                            {formData.projects.length > 1 && <button onClick={() => setFormData(d=>({...d,projects:d.projects.filter((_,i)=>i!==pi)}))}
                              className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <SmInput value={proj.name} onChange={v => setFormData(d=>({...d,projects:d.projects.map((p,i)=>i===pi?{...p,name:v}:p)}))} placeholder="Project Name" />
                            <SmInput value={proj.tech} onChange={v => setFormData(d=>({...d,projects:d.projects.map((p,i)=>i===pi?{...p,tech:v}:p)}))} placeholder="React, Node.js, MongoDB" />
                          </div>
                          <textarea value={proj.description} onChange={e => setFormData(d=>({...d,projects:d.projects.map((p,i)=>i===pi?{...p,description:e.target.value}:p)}))}
                            placeholder="What did you build? What was the impact?" rows={2}
                            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-all resize-none" />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between">
                      <button onClick={() => setStep('info')}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all border border-white/10">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={() => setStep('skills')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all">
                        Next: Skills <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Skills & Extras */}
                {step === 'skills' && (
                  <motion.div key="step-skills" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-5">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                      <h3 className="font-semibold text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-cyan-400" /> Skills & Extras</h3>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Technical Skills</label>
                        <textarea value={formData.skills} onChange={e => setFormData(d=>({...d,skills:e.target.value}))} rows={4}
                          placeholder="React, Node.js, TypeScript, Python, AWS, Docker, PostgreSQL, REST APIs, Git…"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                        <p className="text-xs text-slate-600 mt-1">Comma-separated list. AI will reorder for maximum ATS impact.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Certifications</label>
                        <input value={formData.certifications} onChange={e => setFormData(d=>({...d,certifications:e.target.value}))}
                          placeholder="AWS Solutions Architect, Google Cloud Professional, PMP…"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Achievements & Awards</label>
                        <textarea value={formData.achievements} onChange={e => setFormData(d=>({...d,achievements:e.target.value}))} rows={3}
                          placeholder="Employee of the Year 2023, Hackathon Winner, Dean's List…"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                      </div>
                    </div>

                    {buildError && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{buildError}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button onClick={() => setStep('experience')}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all border border-white/10">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <motion.button onClick={handleGenerate} disabled={generating}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">
                        {generating ? <><Loader2 className="w-4 h-4 animate-spin" />AI is Building Your Resume…</>
                          : <><Sparkles className="w-4 h-4" />Generate AI Resume <ArrowRight className="w-4 h-4" /></>}
                      </motion.button>
                    </div>

                    {generating && (
                      <div className="bg-gradient-to-r from-blue-500/[0.07] to-purple-500/[0.07] border border-blue-500/20 rounded-2xl p-6 text-center space-y-4">
                        <div className="relative w-16 h-16 mx-auto">
                          <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                          <Brain className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Claude AI is optimizing your resume</p>
                          <p className="text-sm text-slate-400 mt-1">Injecting {selectedCo?.name} keywords, enhancing bullets with STAR method, maximizing ATS score…</p>
                        </div>
                        <div className="space-y-2 max-w-xs mx-auto text-left">
                          {['Analyzing your experience', 'Adding ATS keywords', 'Writing STAR bullets', 'Optimizing for 90+ score'].map((s, i) => (
                            <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.5 }} className="flex items-center gap-2 text-xs text-slate-400">
                              <CheckCircle className="w-3 h-3 text-blue-400" />{s}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: Preview & Download */}
                {step === 'preview' && generated && (
                  <motion.div key="step-preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-5">
                    {/* Score banner */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-6">
                      <ScoreRing score={generated.estimatedScore} size={100} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 mb-1">Estimated ATS Score for {selectedCo?.name}</p>
                        <h3 className="text-2xl font-black text-white mb-1">Your Resume is Ready! 🎉</h3>
                        <p className="text-sm text-emerald-400 mb-3">AI added {generated.keywordsAdded?.length || 0} keywords to maximize your ATS score</p>
                        <div className="flex flex-wrap gap-1.5">
                          {generated.keywordsAdded?.slice(0, 8).map(k => (
                            <span key={k} className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/15">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Download buttons */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <FileDown className="w-4 h-4 text-blue-400" /> Download Your Resume — Free
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <motion.button onClick={downloadPDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
                          <FileText className="w-6 h-6 text-red-400" />
                          <span className="text-sm font-semibold text-white">PDF</span>
                          <span className="text-[10px] text-slate-500">Print to PDF</span>
                        </motion.button>
                        <motion.button onClick={downloadHTML} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-2 py-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                          <Globe className="w-6 h-6 text-blue-400" />
                          <span className="text-sm font-semibold text-white">HTML</span>
                          <span className="text-[10px] text-slate-500">Web format</span>
                        </motion.button>
                        <motion.button onClick={downloadTXT} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-2 py-4 rounded-xl bg-slate-500/10 border border-slate-500/20 hover:bg-slate-500/20 transition-all">
                          <FileDown className="w-6 h-6 text-slate-400" />
                          <span className="text-sm font-semibold text-white">TXT</span>
                          <span className="text-[10px] text-slate-500">Plain text</span>
                        </motion.button>
                      </div>
                      <p className="text-xs text-slate-600 text-center mt-3">💡 For Word format: open the HTML file in Microsoft Word and Save As .docx</p>
                    </div>

                    {/* Resume preview */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                        <h3 className="font-semibold text-white flex items-center gap-2"><Eye className="w-4 h-4 text-slate-400" /> Resume Preview</h3>
                        <div className="flex gap-2">
                          <button onClick={() => copy(buildResumePlainText(formData, generated), 'all')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:text-white text-xs transition-all border border-white/[0.08]">
                            {copiedSection === 'all' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSection === 'all' ? 'Copied!' : 'Copy All'}
                          </button>
                          <button onClick={() => setStep('skills')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:text-white text-xs transition-all border border-white/[0.08]">
                            <RefreshCw className="w-3 h-3" /> Rebuild
                          </button>
                        </div>
                      </div>
                      <div className="p-6 max-h-[800px] overflow-y-auto">
                        {/* Summary */}
                        {generated.summary && (
                          <ResumeSection title="Professional Summary" onCopy={() => copy(generated.summary, 'summary')} copied={copiedSection === 'summary'}>
                            <p className="text-sm text-slate-300 leading-relaxed">{generated.summary}</p>
                          </ResumeSection>
                        )}
                        {/* Skills */}
                        {generated.skills?.length > 0 && (
                          <ResumeSection title="Skills" onCopy={() => copy(generated.skills.join(', '), 'skills')} copied={copiedSection === 'skills'}>
                            <div className="flex flex-wrap gap-1.5">
                              {generated.skills.map(s => (
                                <span key={s} className="text-xs px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded-full text-slate-300">{s}</span>
                              ))}
                            </div>
                          </ResumeSection>
                        )}
                        {/* Experience */}
                        {generated.experience?.length > 0 && (
                          <ResumeSection title="Work Experience" onCopy={() => copy(generated.experience.map(e=>`${e.title} at ${e.company} (${e.period})\n${e.bullets.join('\n')}`).join('\n\n'), 'exp')} copied={copiedSection === 'exp'}>
                            {generated.experience.map((exp, i) => (
                              <div key={i} className="mb-5 last:mb-0">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <p className="font-bold text-white text-sm">{exp.title}</p>
                                    <p className="text-blue-400 text-xs">{exp.company} {exp.location && `• ${exp.location}`}</p>
                                  </div>
                                  <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">{exp.period}</span>
                                </div>
                                <ul className="space-y-1.5 mt-2">
                                  {exp.bullets.filter(Boolean).map((b, j) => (
                                    <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                                      <span className="text-blue-500 mt-1 flex-shrink-0">▸</span>{b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </ResumeSection>
                        )}
                        {/* Education */}
                        {generated.education?.length > 0 && (
                          <ResumeSection title="Education" onCopy={() => copy(generated.education.map(e=>`${e.degree}, ${e.school} (${e.year})`).join('\n'), 'edu')} copied={copiedSection === 'edu'}>
                            {generated.education.map((edu, i) => (
                              <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                                <div>
                                  <p className="text-sm font-semibold text-white">{edu.degree}</p>
                                  <p className="text-xs text-slate-400">{edu.school}{edu.gpa && ` • GPA: ${edu.gpa}`}</p>
                                </div>
                                <span className="text-xs text-slate-500">{edu.year}</span>
                              </div>
                            ))}
                          </ResumeSection>
                        )}
                        {/* Projects */}
                        {generated.projects?.length > 0 && (
                          <ResumeSection title="Projects" onCopy={() => copy(generated.projects.map(p=>`${p.name} [${p.tech}]: ${p.description}`).join('\n'), 'proj')} copied={copiedSection === 'proj'}>
                            {generated.projects.map((p, i) => (
                              <div key={i} className="mb-3 last:mb-0">
                                <p className="text-sm font-semibold text-white">{p.name} <span className="text-[11px] text-slate-500 font-normal">[{p.tech}]</span></p>
                                <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                              </div>
                            ))}
                          </ResumeSection>
                        )}
                        {/* Certs */}
                        {generated.certifications?.length > 0 && (
                          <ResumeSection title="Certifications" onCopy={() => copy(generated.certifications.join(', '), 'certs')} copied={copiedSection === 'certs'}>
                            <div className="flex flex-wrap gap-2">
                              {generated.certifications.map(c => (
                                <span key={c} className="text-xs px-3 py-1 bg-yellow-500/10 text-yellow-300 rounded-full border border-yellow-500/20 flex items-center gap-1">
                                  <Award className="w-3 h-3" />{c}
                                </span>
                              ))}
                            </div>
                          </ResumeSection>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features footer */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-16 grid md:grid-cols-4 gap-4">
          {[
            { icon: Brain, title: 'Claude AI Powered', desc: 'Real AI analysis & generation, not template-based', color: 'from-blue-600 to-blue-500' },
            { icon: Target, title: '90+ ATS Score', desc: 'Optimized for 17 top MNC ATS systems', color: 'from-purple-600 to-purple-500' },
            { icon: Download, title: 'Free Downloads', desc: 'PDF, HTML & TXT — no watermarks, no cost', color: 'from-green-600 to-green-500' },
            { icon: Shield, title: '100% Private', desc: 'Your data never stored or shared', color: 'from-slate-600 to-slate-500' },
          ].map(f => (
            <div key={f.title} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${f.color} mb-3`}>
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InputField({ label, icon, value, onChange, placeholder, type = 'text' }:
  { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>
    </div>
  )
}

function SmInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-all" />
  )
}

function ResumeSection({ title, children, onCopy, copied }: {
  title: string; children: React.ReactNode; onCopy: () => void; copied: boolean
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        <button onClick={onCopy}
          className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-400 transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="border-t border-white/[0.05] pt-3">{children}</div>
    </div>
  )
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060912] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResumePageInner />
    </Suspense>
  )
}
