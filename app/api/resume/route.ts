import { NextResponse } from 'next/server'

// ── MNC Company Profiles ─────────────────────────────────────────────────────
const MNC_PROFILES: Record<string, {
  name: string; ats: string; weight: Record<string, number>
  must: string[]; preferred: string[]; sections: string[]
  culture: string; tips: string[]
}> = {
  google: {
    name: 'Google', ats: 'Google Hire', culture: 'Impact-driven, algorithmic excellence',
    weight: { keywords: 0.40, formatting: 0.15, sections: 0.25, impact: 0.20 },
    must: ['algorithms', 'data structures', 'distributed systems', 'python', 'java', 'golang', 'problem solving', 'scalable'],
    preferred: ['ml', 'machine learning', 'tensorflow', 'kubernetes', 'gcp', 'scala', 'c++', 'sql', 'impact', 'metrics', 'leetcode'],
    sections: ['summary', 'experience', 'education', 'projects', 'skills'],
    tips: ['Quantify all achievements with %, $, time saved', 'Use STAR format for each role', 'Highlight system design experience', 'Mention open source contributions']
  },
  amazon: {
    name: 'Amazon', ats: 'Workday', culture: 'Leadership Principles & customer obsession',
    weight: { keywords: 0.35, formatting: 0.20, sections: 0.25, impact: 0.20 },
    must: ['aws', 'leadership', 'customer', 'ownership', 'scalable', 'agile', 'python', 'java'],
    preferred: ['distributed', 'microservices', 'docker', 'kubernetes', 'ci/cd', 'data structures', 'algorithms', 'nosql', 'dynamodb'],
    sections: ['summary', 'experience', 'skills', 'education', 'projects'],
    tips: ['Align each bullet to Amazon Leadership Principles', 'Show customer impact', 'Highlight ownership and bias for action', 'Use "Delivered", "Led", "Owned" action verbs']
  },
  microsoft: {
    name: 'Microsoft', ats: 'Workday', culture: 'Growth mindset, Azure-first cloud',
    weight: { keywords: 0.35, formatting: 0.25, sections: 0.20, impact: 0.20 },
    must: ['azure', 'cloud', 'typescript', 'c#', '.net', 'agile', 'collaboration', 'growth'],
    preferred: ['react', 'node', 'python', 'sql', 'devops', 'ci/cd', 'leadership', 'innovation', 'kubernetes'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    tips: ['Emphasize collaboration and growth mindset', 'Mention Azure certifications', 'Show cross-team impact', 'Include accessibility/inclusive design']
  },
  meta: {
    name: 'Meta', ats: 'Greenhouse', culture: 'Move fast, build at scale, data-driven',
    weight: { keywords: 0.40, formatting: 0.20, sections: 0.20, impact: 0.20 },
    must: ['react', 'python', 'data', 'scale', 'performance', 'impact', 'php', 'hack'],
    preferred: ['graphql', 'pytorch', 'ml', 'machine learning', 'c++', 'android', 'ios', 'javascript', 'metrics', 'a/b testing'],
    sections: ['summary', 'experience', 'projects', 'skills', 'education'],
    tips: ['Every achievement must have measurable impact', 'Mention scale (millions of users)', 'Show A/B testing experience', 'Highlight speed of iteration']
  },
  netflix: {
    name: 'Netflix', ats: 'Lever', culture: 'Freedom, responsibility, high performance',
    weight: { keywords: 0.40, formatting: 0.15, sections: 0.25, impact: 0.20 },
    must: ['java', 'python', 'cloud', 'distributed', 'api', 'microservices', 'leadership', 'impact'],
    preferred: ['aws', 'spring', 'kafka', 'cassandra', 'chaos engineering', 'resilience', 'streaming', 'data', 'sql'],
    sections: ['summary', 'experience', 'skills', 'projects'],
    tips: ['Show senior-level ownership', 'Mention chaos engineering or resilience', 'Quantify streaming/data at scale', 'Demonstrate independent decision-making']
  },
  apple: {
    name: 'Apple', ats: 'Internal ATS', culture: 'Perfection, detail, design excellence',
    weight: { keywords: 0.40, formatting: 0.25, sections: 0.15, impact: 0.20 },
    must: ['swift', 'objective-c', 'ios', 'macos', 'xcode', 'design', 'quality', 'innovation'],
    preferred: ['c++', 'python', 'metal', 'core data', 'ui/ux', 'testing', 'performance', 'algorithms'],
    sections: ['summary', 'experience', 'skills', 'education', 'projects'],
    tips: ['Focus on polish and quality over quantity', 'Mention specific iOS frameworks', 'Show design collaboration experience', 'Highlight attention to detail']
  },
  linkedin: {
    name: 'LinkedIn', ats: 'Talent Hub', culture: 'Professional network, member growth',
    weight: { keywords: 0.35, formatting: 0.25, sections: 0.20, impact: 0.20 },
    must: ['java', 'scala', 'python', 'data', 'distributed', 'api', 'rest', 'sql'],
    preferred: ['kafka', 'spark', 'hadoop', 'ml', 'product', 'analytics', 'growth', 'a/b testing', 'react'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    tips: ['Highlight data platform experience', 'Show member impact at scale', 'Mention feed/recommendation systems', 'Include growth metrics']
  },
  infosys: {
    name: 'Infosys', ats: 'iCIMS', culture: 'IT services, client delivery excellence',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['java', 'python', 'sql', 'agile', 'communication', 'teamwork', 'client', 'delivery'],
    preferred: ['spring', 'hibernate', 'react', 'angular', 'cloud', 'devops', 'testing', 'project management'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    tips: ['Highlight client-facing projects', 'Show certifications (AWS, Azure, GCP)', 'Mention delivery metrics', 'Include team size and project scale']
  },
  techmahindra: {
    name: 'Tech Mahindra', ats: 'SAP SuccessFactors', culture: 'Digital transformation',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['java', 'python', 'sql', 'cloud', 'communication', 'client', 'agile', 'delivery'],
    preferred: ['aws', 'azure', 'devops', 'testing', 'automation', 'selenium', 'rest', 'microservices'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    tips: ['Emphasize digital transformation projects', 'Show 5G/telecom if relevant', 'Highlight automation achievements', 'Include client names if permitted']
  },
  tcs: {
    name: 'TCS', ats: 'Taleo', culture: 'IT services, process excellence',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['java', 'sql', 'communication', 'teamwork', 'agile', 'testing', 'client', 'delivery'],
    preferred: ['python', 'spring', 'angular', 'react', 'cloud', 'devops', 'automation', 'selenium'],
    sections: ['summary', 'experience', 'education', 'skills', 'projects'],
    tips: ['Mention TATA group values alignment', 'Show process improvement', 'Include training/mentoring others', 'Highlight global project experience']
  },
  wipro: {
    name: 'Wipro', ats: 'Workday', culture: 'Technology & BPO',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['java', 'python', 'sql', 'agile', 'communication', 'project', 'testing', 'cloud'],
    preferred: ['react', 'angular', 'devops', 'automation', 'analytics', 'salesforce', 'sap'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    tips: ['Show ERP/SAP/Salesforce if applicable', 'Highlight BFSI or healthcare domain', 'Include vendor certifications', 'Mention onshore/offshore collaboration']
  },
  ibm: {
    name: 'IBM', ats: 'Kenexa', culture: 'Enterprise AI & cloud solutions',
    weight: { keywords: 0.35, formatting: 0.20, sections: 0.25, impact: 0.20 },
    must: ['cloud', 'ai', 'data', 'java', 'python', 'consulting', 'enterprise', 'watson'],
    preferred: ['kubernetes', 'openshift', 'devops', 'machine learning', 'sql', 'api', 'analytics', 'security'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    tips: ['Mention IBM Cloud or Red Hat', 'Show enterprise-scale projects', 'Include watsonx or AI experience', 'Highlight security clearances if any']
  },
  accenture: {
    name: 'Accenture', ats: 'Taleo', culture: 'Consulting & tech transformation',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['consulting', 'client', 'agile', 'communication', 'project', 'delivery', 'cloud', 'digital'],
    preferred: ['python', 'java', 'sql', 'analytics', 'salesforce', 'sap', 'leadership', 'teamwork'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    tips: ['Show industry verticals (BFSI, retail, healthcare)', 'Highlight client transformation stories', 'Include revenue impact', 'Mention Accenture Song/Song if creative']
  },
  deloitte: {
    name: 'Deloitte', ats: 'Workday', culture: 'Consulting & advisory excellence',
    weight: { keywords: 0.30, formatting: 0.25, sections: 0.25, impact: 0.20 },
    must: ['consulting', 'analytics', 'communication', 'client', 'finance', 'risk', 'leadership'],
    preferred: ['python', 'sql', 'power bi', 'tableau', 'excel', 'cloud', 'data', 'project management'],
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
    tips: ['Show big 4 or consulting mindset', 'Highlight risk/compliance if relevant', 'Include revenue/cost impact numbers', 'Mention thought leadership']
  },
  oracle: {
    name: 'Oracle', ats: 'Taleo (Oracle)', culture: 'Database & enterprise cloud',
    weight: { keywords: 0.40, formatting: 0.20, sections: 0.20, impact: 0.20 },
    must: ['oracle', 'sql', 'java', 'plsql', 'database', 'cloud', 'erp', 'api'],
    preferred: ['python', 'javascript', 'react', 'oci', 'autonomous', 'fusion', 'data', 'microservices'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    tips: ['Mention Oracle Cloud Infrastructure (OCI)', 'Show Oracle DB optimization', 'Include ERP/EBS if applicable', 'Highlight database performance tuning']
  },
  salesforce: {
    name: 'Salesforce', ats: 'Workday', culture: 'CRM & cloud-first',
    weight: { keywords: 0.40, formatting: 0.20, sections: 0.20, impact: 0.20 },
    must: ['salesforce', 'crm', 'apex', 'lightning', 'cloud', 'api', 'javascript', 'customer'],
    preferred: ['python', 'react', 'sql', 'trailhead', 'marketing cloud', 'data', 'integration', 'rest'],
    sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    tips: ['List Salesforce certifications prominently', 'Show Trailhead superbadges', 'Mention AppExchange development', 'Include CRM data model expertise']
  },
  startup: {
    name: 'Top Startups', ats: 'Lever/Greenhouse', culture: 'Velocity, ownership, generalist',
    weight: { keywords: 0.30, formatting: 0.20, sections: 0.25, impact: 0.25 },
    must: ['product', 'ownership', 'fast', 'shipped', 'impact', 'startup', 'agile', 'fullstack'],
    preferred: ['react', 'node', 'python', 'aws', 'docker', 'typescript', 'postgresql', 'redis'],
    sections: ['summary', 'experience', 'projects', 'skills', 'education'],
    tips: ['Lead with biggest product impact', 'Show breadth (full-stack, product, data)', 'Mention funding rounds if startup experience', 'Include side projects / open source']
  },
}

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildAnalyzePrompt(resumeText: string, company: string): string {
  const profile = MNC_PROFILES[company] || MNC_PROFILES.google
  return `You are an expert ATS (Applicant Tracking System) analyst and senior technical recruiter at ${profile.name}.

Analyze this resume against ${profile.name}'s ATS system (${profile.ats}) and hiring criteria.
Company culture: ${profile.culture}
ATS weights: Keywords=${profile.weight.keywords*100}%, Formatting=${profile.weight.formatting*100}%, Sections=${profile.weight.sections*100}%, Impact=${profile.weight.impact*100}%
Must-have keywords: ${profile.must.join(', ')}
Preferred keywords: ${profile.preferred.join(', ')}
Required sections: ${profile.sections.join(', ')}

RESUME TEXT:
---
${resumeText.slice(0, 3000)}
---

Respond ONLY with a valid JSON object, no markdown, no preamble:
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywords": <0-100>,
    "formatting": <0-100>,
    "sections": <0-100>,
    "impact": <0-100>
  },
  "foundKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4"],
  "verdict": "<one sentence verdict>",
  "atsCompatible": <true/false>,
  "sectionAnalysis": {
    "summary": <0-100>,
    "experience": <0-100>,
    "skills": <0-100>,
    "education": <0-100>
  },
  "experienceLevel": "<junior|mid|senior|lead>",
  "estimatedYOE": <number>,
  "topSkills": ["skill1", "skill2", "skill3"],
  "personalizedTips": ["tip1", "tip2", "tip3"]
}`
}

function buildGeneratePrompt(data: ResumeData, company: string, targetRole: string): string {
  const profile = MNC_PROFILES[company] || MNC_PROFILES.google
  return `You are an expert resume writer specializing in getting candidates hired at ${profile.name}.

Create a highly optimized, ATS-friendly resume for ${data.name} targeting the role of "${targetRole}" at ${profile.name}.
Company ATS: ${profile.ats} | Culture: ${profile.culture}
Must include these keywords naturally: ${profile.must.slice(0, 6).join(', ')}
Preferred keywords: ${profile.preferred.slice(0, 8).join(', ')}

Candidate Data:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
LinkedIn: ${data.linkedin || ''}
GitHub: ${data.github || ''}
Target Role: ${targetRole}
Years of Experience: ${data.yearsExp}
Summary/Objective: ${data.summary}
Key Skills: ${data.skills}
Work Experience: ${JSON.stringify(data.experience)}
Education: ${JSON.stringify(data.education)}
Projects: ${JSON.stringify(data.projects)}
Certifications: ${data.certifications || ''}
Achievements: ${data.achievements || ''}

Instructions:
1. Write a powerful 3-line summary with keywords for ${profile.name}
2. Rewrite each job bullet using STAR method with quantified impact (%, $, users, time)
3. Optimize skill section with ${profile.name}-relevant technologies
4. Ensure 90+ ATS score by naturally including must-have keywords
5. Use strong action verbs: Led, Architected, Delivered, Scaled, Reduced, Increased
6. Format for ${profile.ats} ATS compatibility

Respond ONLY with JSON, no markdown:
{
  "summary": "<3-sentence optimized summary>",
  "skills": ["skill1", "skill2", "skill3", ...],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Month Year – Month Year",
      "location": "City, Country",
      "bullets": ["bullet 1 with metrics", "bullet 2 with impact", "bullet 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "YYYY",
      "gpa": "GPA if notable"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Tech Stack",
      "description": "Impact-focused description"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "estimatedScore": <85-98>,
  "keywordsAdded": ["kw1", "kw2", "kw3"]
}`
}

function buildImproveSummaryPrompt(summary: string, company: string, role: string): string {
  const profile = MNC_PROFILES[company] || MNC_PROFILES.google
  return `Rewrite this professional summary to be highly optimized for ${profile.name}'s ATS (${profile.ats}) for the role of "${role}".
Include these keywords naturally: ${profile.must.slice(0, 4).join(', ')}.
Company culture: ${profile.culture}
Original: ${summary}
Write exactly 3 impactful sentences. No markdown. Return only the improved text.`
}

interface ResumeData {
  name: string; email: string; phone: string; location: string
  linkedin?: string; github?: string; summary: string; skills: string
  yearsExp: number; experience: any[]; education: any[]
  projects: any[]; certifications?: string; achievements?: string
}

// ── API handler ───────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, resumeText, resumeData, company, targetRole, summary } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    let prompt = ''
    if (action === 'analyze') prompt = buildAnalyzePrompt(resumeText || '', company || 'google')
    else if (action === 'generate') prompt = buildGeneratePrompt(resumeData, company || 'google', targetRole || 'Software Engineer')
    else if (action === 'improve-summary') prompt = buildImproveSummaryPrompt(summary || '', company || 'google', targetRole || 'Software Engineer')
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      const err = await aiRes.text()
      console.error('AI API error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const aiData = await aiRes.json()
    const text = aiData.content?.[0]?.text || ''

    if (action === 'improve-summary') return NextResponse.json({ result: text.trim() })

    try {
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ result: parsed })
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }
  } catch (e) {
    console.error('[resume API]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    companies: Object.entries(MNC_PROFILES).map(([id, p]) => ({
      id, name: p.name, ats: p.ats, culture: p.culture,
      mustKeywords: p.must, tips: p.tips,
    }))
  })
}
