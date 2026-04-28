'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, CheckCircle, AlertCircle, FileText, X, TrendingUp, Target, Zap, ChevronDown, Building2 } from 'lucide-react'

// ── MNC company profiles with keyword requirements ──────────────────────────
const MNC_COMPANIES = [
  {
    id: 'amazon', name: 'Amazon', logo: '🛒', color: '#FF9900',
    description: 'Leadership Principles focused',
    mustHave: ['aws', 'cloud', 'distributed', 'scalable', 'leadership', 'customer', 'ownership', 'agile'],
    preferred: ['python', 'java', 'docker', 'kubernetes', 'microservices', 'ci/cd', 'sql', 'nosql', 'data structures', 'algorithms'],
    sections: ['summary', 'experience', 'skills', 'education', 'projects'],
    atsSystem: 'Workday',
    scoringWeights: { keywords: 0.40, formatting: 0.20, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'google', name: 'Google', logo: '🔍', color: '#4285F4',
    description: 'Algorithm & impact driven',
    mustHave: ['algorithms', 'data structures', 'python', 'java', 'golang', 'distributed systems', 'problem solving'],
    preferred: ['ml', 'machine learning', 'tensorflow', 'kubernetes', 'gcp', 'scala', 'c++', 'sql', 'impact', 'metrics'],
    sections: ['summary', 'experience', 'education', 'projects', 'skills'],
    atsSystem: 'Google Hire',
    scoringWeights: { keywords: 0.45, formatting: 0.15, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'microsoft', name: 'Microsoft', logo: '🪟', color: '#00A4EF',
    description: 'Growth mindset & Azure focus',
    mustHave: ['azure', 'cloud', 'typescript', 'c#', '.net', 'agile', 'collaboration', 'growth mindset'],
    preferred: ['react', 'node', 'python', 'sql', 'devops', 'ci/cd', 'leadership', 'communication', 'innovation'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    atsSystem: 'Workday',
    scoringWeights: { keywords: 0.35, formatting: 0.25, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'meta', name: 'Meta', logo: '🌐', color: '#0866FF',
    description: 'Move fast, build at scale',
    mustHave: ['react', 'python', 'php', 'hack', 'data', 'scale', 'performance', 'impact'],
    preferred: ['graphql', 'pytorch', 'ml', 'machine learning', 'c++', 'android', 'ios', 'javascript', 'metrics'],
    sections: ['summary', 'experience', 'projects', 'skills', 'education'],
    atsSystem: 'Greenhouse',
    scoringWeights: { keywords: 0.40, formatting: 0.20, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'netflix', name: 'Netflix', logo: '🎬', color: '#E50914',
    description: 'Freedom & Responsibility culture',
    mustHave: ['java', 'python', 'cloud', 'distributed', 'api', 'microservices', 'leadership', 'impact'],
    preferred: ['aws', 'spring', 'kafka', 'cassandra', 'chaos', 'resilience', 'streaming', 'data', 'sql'],
    sections: ['summary', 'experience', 'skills', 'projects'],
    atsSystem: 'Lever',
    scoringWeights: { keywords: 0.45, formatting: 0.15, sections: 0.25, readability: 0.15 },
  },
  {
    id: 'linkedin', name: 'LinkedIn', logo: '💼', color: '#0A66C2',
    description: 'Professional network builder',
    mustHave: ['java', 'scala', 'python', 'data', 'distributed', 'api', 'rest', 'sql', 'communication'],
    preferred: ['kafka', 'spark', 'hadoop', 'machine learning', 'product', 'analytics', 'growth', 'a/b testing'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    atsSystem: 'Talent Hub',
    scoringWeights: { keywords: 0.35, formatting: 0.25, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'apple', name: 'Apple', logo: '🍎', color: '#555555',
    description: 'Detail, quality, innovation',
    mustHave: ['swift', 'objective-c', 'ios', 'macos', 'xcode', 'design', 'quality', 'innovation'],
    preferred: ['c++', 'python', 'metal', 'core data', 'ui/ux', 'testing', 'performance', 'algorithms'],
    sections: ['summary', 'experience', 'skills', 'education', 'projects'],
    atsSystem: 'Internal ATS',
    scoringWeights: { keywords: 0.40, formatting: 0.25, sections: 0.15, readability: 0.20 },
  },
  {
    id: 'infosys', name: 'Infosys', logo: '🏢', color: '#007CC3',
    description: 'IT services & consulting',
    mustHave: ['java', 'python', 'sql', 'agile', 'communication', 'teamwork', 'project management'],
    preferred: ['spring', 'hibernate', 'react', 'angular', 'cloud', 'devops', 'testing', 'client', 'delivery'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    atsSystem: 'iCIMS',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'techmahindra', name: 'Tech Mahindra', logo: '🔷', color: '#E31E26',
    description: 'Digital transformation focus',
    mustHave: ['java', 'python', 'sql', 'cloud', 'communication', 'client', 'agile', 'delivery'],
    preferred: ['aws', 'azure', 'devops', 'testing', 'automation', 'selenium', 'rest', 'microservices'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    atsSystem: 'SAP SuccessFactors',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'ibm', name: 'IBM', logo: '🔵', color: '#006699',
    description: 'Enterprise & AI solutions',
    mustHave: ['cloud', 'ai', 'data', 'java', 'python', 'consulting', 'enterprise', 'watson'],
    preferred: ['kubernetes', 'openshift', 'devops', 'machine learning', 'sql', 'api', 'analytics', 'security'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    atsSystem: 'Kenexa / IBM Brass Ring',
    scoringWeights: { keywords: 0.35, formatting: 0.20, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'accenture', name: 'Accenture', logo: '🔺', color: '#A100FF',
    description: 'Consulting & tech services',
    mustHave: ['consulting', 'client', 'agile', 'communication', 'project', 'delivery', 'cloud', 'digital'],
    preferred: ['python', 'java', 'sql', 'analytics', 'salesforce', 'sap', 'leadership', 'teamwork'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    atsSystem: 'Taleo',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'tcs', name: 'TCS', logo: '🌟', color: '#0052CC',
    description: 'IT services & outsourcing',
    mustHave: ['java', 'sql', 'communication', 'teamwork', 'agile', 'testing', 'client', 'delivery'],
    preferred: ['python', 'spring', 'angular', 'react', 'cloud', 'devops', 'automation', 'selenium'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    atsSystem: 'Taleo / Internal',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'wipro', name: 'Wipro', logo: '💡', color: '#341c75',
    description: 'Technology & BPO services',
    mustHave: ['java', 'python', 'sql', 'agile', 'communication', 'project', 'testing', 'cloud'],
    preferred: ['react', 'angular', 'devops', 'automation', 'analytics', 'salesforce', 'sap'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    atsSystem: 'Workday',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'deloitte', name: 'Deloitte', logo: '🟢', color: '#86BC25',
    description: 'Consulting & advisory',
    mustHave: ['consulting', 'analytics', 'communication', 'client', 'finance', 'risk', 'leadership'],
    preferred: ['python', 'sql', 'power bi', 'tableau', 'excel', 'cloud', 'data', 'project management'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    atsSystem: 'Workday',
    scoringWeights: { keywords: 0.30, formatting: 0.25, sections: 0.25, readability: 0.20 },
  },
  {
    id: 'oracle', name: 'Oracle', logo: '🔴', color: '#F80000',
    description: 'Database & enterprise cloud',
    mustHave: ['oracle', 'sql', 'java', 'plsql', 'database', 'cloud', 'erp', 'api'],
    preferred: ['python', 'javascript', 'react', 'oci', 'autonomous', 'fusion', 'data', 'microservices'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    atsSystem: 'Taleo (Oracle)',
    scoringWeights: { keywords: 0.40, formatting: 0.20, sections: 0.20, readability: 0.20 },
  },
  {
    id: 'salesforce', name: 'Salesforce', logo: '☁️', color: '#00A1E0',
    description: 'CRM & cloud platform',
    mustHave: ['salesforce', 'crm', 'apex', 'lightning', 'cloud', 'api', 'javascript', 'customer'],
    preferred: ['python', 'react', 'sql', 'trailhead', 'marketing cloud', 'data', 'integration', 'rest'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    atsSystem: 'Workday',
    scoringWeights: { keywords: 0.40, formatting: 0.20, sections: 0.20, readability: 0.20 },
  },
]

interface ATSResult {
  company: typeof MNC_COMPANIES[0]
  overallScore: number
  breakdown: { keywords: number; formatting: number; readability: number; sections: number }
  strengths: string[]
  improvements: string[]
  foundKeywords: string[]
  missingKeywords: string[]
  verdict: string
}

function ScoreRing({ score, size = 80, color }: { score: number; size?: number; color?: string }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const c = color || (score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444')
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        transform={`rotate(90, ${size/2}, ${size/2})`}
        fill={c} fontSize={size > 60 ? 18 : 13} fontWeight="bold">
        {score}%
      </text>
    </svg>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }} />
      </div>
    </div>
  )
}

async function analyzeResume(file: File, company: typeof MNC_COMPANIES[0]): Promise<ATSResult> {
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => resolve('')
    reader.readAsText(file)
  })
  const lower = (text || file.name).toLowerCase()

  const allKeywords = [...company.mustHave, ...company.preferred]
  const found = allKeywords.filter(k => lower.includes(k.toLowerCase()))
  const missing = company.mustHave.filter(k => !lower.includes(k.toLowerCase()))
  const mustFound = company.mustHave.filter(k => lower.includes(k.toLowerCase()))

  const keywordsScore = Math.min(100, Math.round(
    (mustFound.length / company.mustHave.length) * 60 +
    (found.filter(k => company.preferred.includes(k)).length / company.preferred.length) * 40
  ))

  const sectionKeywords = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications', 'achievements', 'objective']
  const foundSections = sectionKeywords.filter(k => lower.includes(k))
  const requiredSections = company.sections.filter(s => lower.includes(s))
  const sectionsScore = Math.min(100, Math.round(
    (requiredSections.length / company.sections.length) * 70 +
    (foundSections.length / sectionKeywords.length) * 30
  ))

  const isPdf = file.name.endsWith('.pdf')
  const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc')
  const formattingScore = isPdf ? 88 + Math.floor(Math.random() * 8) : isDocx ? 75 + Math.floor(Math.random() * 12) : 58 + Math.floor(Math.random() * 15)

  const words = lower.split(/\s+/).length
  const readabilityScore = Math.min(95, Math.max(40, words > 400 ? 75 + Math.floor(words / 100) : Math.floor(words / 6)))

  const w = company.scoringWeights
  const overall = Math.min(99, Math.max(25, Math.round(
    keywordsScore * w.keywords +
    formattingScore * w.formatting +
    sectionsScore * w.sections +
    readabilityScore * w.readability
  )))

  const verdict =
    overall >= 80 ? `🟢 Excellent — Strong match for ${company.name}` :
    overall >= 65 ? `🟡 Good — Moderate chance at ${company.name}` :
    overall >= 45 ? `🟠 Fair — Needs improvement for ${company.name}` :
    `🔴 Weak — Significant gaps for ${company.name}`

  return {
    company,
    overallScore: overall,
    breakdown: {
      keywords: keywordsScore,
      formatting: formattingScore,
      readability: readabilityScore,
      sections: sectionsScore,
    },
    strengths: [
      ...(mustFound.length >= company.mustHave.length * 0.6 ? [`Key skills matched: ${mustFound.slice(0, 3).join(', ')}`] : []),
      ...(foundSections.length >= 5 ? ['Well-structured sections present'] : []),
      ...(isPdf ? ['PDF format — preferred by most ATS'] : []),
      ...(words > 400 ? ['Sufficient content length'] : []),
    ].slice(0, 3),
    improvements: [
      ...(missing.length > 0 ? [`Add must-have keywords: ${missing.slice(0, 3).join(', ')}`] : []),
      ...(requiredSections.length < company.sections.length * 0.7 ? [`Add missing sections: ${company.sections.filter(s => !lower.includes(s)).slice(0, 2).join(', ')}`] : []),
      ...(!isPdf ? ['Convert to PDF for better ATS parsing'] : []),
      `Tailor resume to ${company.name}'s "${company.description}" culture`,
    ].slice(0, 4),
    foundKeywords: found.slice(0, 8),
    missingKeywords: missing.slice(0, 6),
  }
}

export function ATSScoreWidget({ compact = false }: { compact?: boolean }) {
  const [selectedCompany, setSelectedCompany] = useState<typeof MNC_COMPANIES[0] | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!selectedCompany) { setError('Please select a company first.'); return }
    setLoading(true); setError(null); setFileName(file.name)
    try {
      const res = await analyzeResume(file, selectedCompany)
      setResult(res)
    } catch {
      setError('Failed to analyze. Please try a PDF or DOCX file.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.overallScore >= 80 ? 'text-emerald-400' : result.overallScore >= 65 ? 'text-amber-400' : result.overallScore >= 45 ? 'text-orange-400' : 'text-red-400'
    : ''

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/40 bg-slate-800/30">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">ATS Resume Score</p>
          <p className="text-xs text-slate-400">Match your resume against top MNC companies</p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setFileName(null) }} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Company selector */}
        <div className="relative">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Company</p>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center gap-2">
              {selectedCompany ? (
                <>
                  <span className="text-lg">{selectedCompany.logo}</span>
                  <span className="font-semibold">{selectedCompany.name}</span>
                  <span className="text-xs text-slate-400">— {selectedCompany.description}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Choose a company…</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {MNC_COMPANIES.map(co => (
                    <button
                      key={co.id}
                      onClick={() => { setSelectedCompany(co); setDropdownOpen(false); setResult(null); setFileName(null) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors ${selectedCompany?.id === co.id ? 'bg-slate-800' : ''}`}
                    >
                      <span className="text-lg flex-shrink-0">{co.logo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{co.name}</p>
                        <p className="text-xs text-slate-500 truncate">{co.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{co.atsSystem}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Must-have keywords preview */}
        {selectedCompany && !result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Must-Have Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedCompany.mustHave.map(k => (
                <span key={k} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">{k}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upload */}
        {!result && !loading && (
          <>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button
              onClick={() => selectedCompany ? fileRef.current?.click() : setError('Please select a company first.')}
              className={`w-full flex flex-col items-center gap-3 py-7 border-2 border-dashed rounded-xl transition-all group ${
                selectedCompany
                  ? 'border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 cursor-pointer'
                  : 'border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <div className={`p-3 rounded-full transition-colors ${selectedCompany ? 'bg-slate-800 group-hover:bg-emerald-500/10' : 'bg-slate-900'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Upload Resume / CV</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCompany ? `Analyze against ${selectedCompany.name} requirements` : 'Select a company above first'}
                </p>
              </div>
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white font-medium">Analyzing resume…</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Matching against {selectedCompany?.name} ({selectedCompany?.atsSystem}) criteria
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Company + score */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <ScoreRing score={result.overallScore} size={72} color={result.company.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{result.company.logo}</span>
                    <p className="text-sm font-bold text-white">{result.company.name}</p>
                  </div>
                  <p className={`text-2xl font-black ${scoreColor}`}>{result.overallScore}%</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{fileName}</p>
                  <p className="text-xs text-slate-400 mt-1">{result.verdict}</p>
                </div>
              </div>

              {/* ATS system */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">ATS Platform: <span className="text-slate-300 font-medium">{result.company.atsSystem}</span></span>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Score Breakdown</p>
                <Bar label="Keyword Match" value={result.breakdown.keywords} color={result.company.color} />
                <Bar label="Formatting" value={result.breakdown.formatting} color="#3b82f6" />
                <Bar label="Readability" value={result.breakdown.readability} color="#8b5cf6" />
                <Bar label="Required Sections" value={result.breakdown.sections} color="#f59e0b" />
              </div>

              {/* Found keywords */}
              {result.foundKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Keywords Found ✓</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.foundKeywords.map(k => (
                      <span key={k} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-2.5 h-2.5" />{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Missing Must-Haves ✗</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map(k => (
                      <span key={k} className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    <Zap className="w-3 h-3 inline mr-1 text-amber-400" />Quick Wins
                  </p>
                  <div className="space-y-1.5">
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <TrendingUp className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{imp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyze another */}
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />New Resume
                </button>
                <button onClick={() => { setResult(null); setDropdownOpen(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-all">
                  <Building2 className="w-3.5 h-3.5" />Change Company
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
