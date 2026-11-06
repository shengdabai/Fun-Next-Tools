export interface ScoreBreakdown {
  contactInfo: number
  workExperience: number
  skills: number
  education: number
  formatting: number
}

export interface Suggestion {
  category: string
  text: string
}

export interface KeywordMatch {
  word: string
  category: string
}

export interface AnalysisResult {
  totalScore: number
  breakdown: ScoreBreakdown
  suggestions: Suggestion[]
  keywords: KeywordMatch[]
  wordCount: number
  // Present only when a target job title was supplied.
  targetMatch?: TargetMatch
}

export interface TargetMatch {
  title: string
  matchedTerms: string[]
  missingTerms: string[]
}

const CONTACT_PATTERNS = [
  { pattern: /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, label: 'email' },
  { pattern: /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i, label: 'phone' },
  { pattern: /linkedin\.com\/in\//i, label: 'LinkedIn' },
  { pattern: /github\.com\//i, label: 'GitHub' },
  { pattern: /portfolio|website|personal site/i, label: 'portfolio' },
]

const EXPERIENCE_VERBS = [
  'managed', 'led', 'developed', 'built', 'designed', 'implemented',
  'created', 'launched', 'drove', 'increased', 'reduced', 'improved',
  'delivered', 'collaborated', 'coordinated', 'spearheaded', 'architected',
  'optimized', 'mentored', 'oversaw', 'established', 'achieved', 'worked',
  'responsible', 'experience', 'contributed', 'supported', 'handled',
]

const TECH_KEYWORDS: { word: string; category: string }[] = [
  { word: 'Python', category: 'Language' },
  { word: 'JavaScript', category: 'Language' },
  { word: 'TypeScript', category: 'Language' },
  { word: 'Java', category: 'Language' },
  { word: 'C++', category: 'Language' },
  { word: 'C#', category: 'Language' },
  { word: 'Go', category: 'Language' },
  { word: 'Rust', category: 'Language' },
  { word: 'Ruby', category: 'Language' },
  { word: 'Swift', category: 'Language' },
  { word: 'Kotlin', category: 'Language' },
  { word: 'React', category: 'Frontend' },
  { word: 'Next.js', category: 'Frontend' },
  { word: 'Vue', category: 'Frontend' },
  { word: 'Angular', category: 'Frontend' },
  { word: 'Tailwind', category: 'Frontend' },
  { word: 'HTML', category: 'Frontend' },
  { word: 'CSS', category: 'Frontend' },
  { word: 'Node.js', category: 'Backend' },
  { word: 'Express', category: 'Backend' },
  { word: 'Django', category: 'Backend' },
  { word: 'FastAPI', category: 'Backend' },
  { word: 'Spring', category: 'Backend' },
  { word: 'GraphQL', category: 'Backend' },
  { word: 'REST', category: 'Backend' },
  { word: 'SQL', category: 'Database' },
  { word: 'PostgreSQL', category: 'Database' },
  { word: 'MySQL', category: 'Database' },
  { word: 'MongoDB', category: 'Database' },
  { word: 'Redis', category: 'Database' },
  { word: 'Elasticsearch', category: 'Database' },
  { word: 'AWS', category: 'Cloud' },
  { word: 'GCP', category: 'Cloud' },
  { word: 'Azure', category: 'Cloud' },
  { word: 'Docker', category: 'DevOps' },
  { word: 'Kubernetes', category: 'DevOps' },
  { word: 'CI/CD', category: 'DevOps' },
  { word: 'Git', category: 'DevOps' },
  { word: 'Terraform', category: 'DevOps' },
  { word: 'Machine Learning', category: 'AI/ML' },
  { word: 'Deep Learning', category: 'AI/ML' },
  { word: 'TensorFlow', category: 'AI/ML' },
  { word: 'PyTorch', category: 'AI/ML' },
  { word: 'LLM', category: 'AI/ML' },
  { word: 'Agile', category: 'Methodology' },
  { word: 'Scrum', category: 'Methodology' },
  { word: 'Figma', category: 'Design' },
  { word: 'Sketch', category: 'Design' },
  { word: 'Excel', category: 'Tools' },
  { word: 'Jira', category: 'Tools' },
  { word: 'Tableau', category: 'Tools' },
  { word: 'Salesforce', category: 'Tools' },
]

const EDUCATION_PATTERNS = [
  /university|college|institute of technology|polytechnic/i,
  /bachelor|master|phd|doctorate|mba|b\.s\.|m\.s\.|b\.a\.|m\.a\./i,
  /degree|diploma|certification|certified/i,
  /graduated|graduation|class of \d{4}/i,
  /gpa|cum laude|honors/i,
]

function scoreContactInfo(text: string): { score: number; found: string[] } {
  const found: string[] = []
  for (const { pattern, label } of CONTACT_PATTERNS) {
    if (pattern.test(text)) found.push(label)
  }
  const score = Math.min(20, found.length * 5)
  return { score, found }
}

function scoreWorkExperience(text: string): { score: number; verbCount: number; hasYears: boolean } {
  const lower = text.toLowerCase()
  let verbCount = 0
  for (const verb of EXPERIENCE_VERBS) {
    const re = new RegExp(`\\b${verb}\\b`, 'gi')
    const matches = text.match(re)
    if (matches) verbCount += matches.length
  }
  const hasYears = /\b(19|20)\d{2}\b/.test(text)
  const hasExperienceSection = /experience|employment|work history|career/i.test(text)

  let score = 0
  if (hasExperienceSection) score += 8
  if (hasYears) score += 7
  score += Math.min(10, verbCount * 1)
  return { score: Math.min(25, score), verbCount, hasYears }
}

// Whole-term match that also works for terms ending in symbols ("C++", "C#"),
// where a trailing \b can never match.
function containsTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'i').test(text)
}

const TITLE_FILLER_WORDS = ['a', 'an', 'and', 'at', 'for', 'in', 'of', 'or', 'the', 'to', 'with']

// Compare the target job title against the resume text. This does not change
// the score; it reports which title terms the resume never mentions.
export function matchTargetTitle(text: string, jobTitle?: string): TargetMatch | undefined {
  const title = (jobTitle ?? '').trim()
  if (!title) return undefined
  const terms: string[] = []
  for (const raw of title.toLowerCase().split(/[^a-z0-9+#.]+/)) {
    const term = raw.replace(/^\.+|\.+$/g, '')
    if (!term || TITLE_FILLER_WORDS.includes(term) || terms.includes(term)) continue
    terms.push(term)
  }
  const matchedTerms = terms.filter(term => containsTerm(text, term))
  const missingTerms = terms.filter(term => !matchedTerms.includes(term))
  return { title, matchedTerms, missingTerms }
}

function scoreSkills(text: string): { score: number; matched: KeywordMatch[] } {
  const matched: KeywordMatch[] = []
  for (const kw of TECH_KEYWORDS) {
    if (containsTerm(text, kw.word)) matched.push(kw)
  }

  // Bonus if skills section is present
  const hasSkillsSection = /skills|technologies|tech stack|tools/i.test(text)
  let score = Math.min(20, matched.length * 2)
  if (hasSkillsSection) score = Math.min(25, score + 5)

  return { score, matched }
}

function scoreEducation(text: string): { score: number; matches: number } {
  let matches = 0
  for (const pattern of EDUCATION_PATTERNS) {
    if (pattern.test(text)) matches++
  }
  const score = Math.min(15, matches * 4)
  return { score, matches }
}

function scoreFormatting(text: string): { score: number } {
  const words = text.trim().split(/\s+/).length
  const lines = text.split('\n').filter(l => l.trim().length > 0).length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

  // Special chars ratio (bullets, dashes etc. are good)
  const specialChars = (text.match(/[•\-*|]/g) || []).length
  const specialRatio = specialChars / Math.max(1, words)

  let score = 0

  // Word count: 300-800 is ideal
  if (words >= 200 && words <= 1000) score += 5
  else if (words >= 100) score += 2

  // Reasonable line count
  if (lines >= 20) score += 4
  else if (lines >= 10) score += 2

  // Paragraph structure
  if (paragraphs >= 3) score += 3
  else if (paragraphs >= 1) score += 1

  // Bullet points are good for readability
  if (specialRatio > 0.01 && specialRatio < 0.15) score += 3

  return { score: Math.min(15, score) }
}

function generateSuggestions(
  breakdown: ScoreBreakdown,
  contactFound: string[],
  verbCount: number,
  hasYears: boolean,
  skillsMatched: KeywordMatch[],
  educationMatches: number,
  wordCount: number,
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Contact suggestions
  if (breakdown.contactInfo < 15) {
    if (!contactFound.includes('email')) {
      suggestions.push({ category: 'Contact Info', text: 'Add your professional email address — recruiters need a direct way to reach you.' })
    }
    if (!contactFound.includes('LinkedIn')) {
      suggestions.push({ category: 'Contact Info', text: 'Include your LinkedIn profile URL to increase credibility and discoverability.' })
    }
    if (!contactFound.includes('GitHub') && skillsMatched.length > 0) {
      suggestions.push({ category: 'Contact Info', text: 'Add your GitHub profile to showcase your technical projects and code.' })
    }
  }

  // Experience suggestions
  if (breakdown.workExperience < 18) {
    if (verbCount < 5) {
      suggestions.push({ category: 'Work Experience', text: 'Use strong action verbs (led, built, increased, delivered) to describe your achievements — passive language weakens impact.' })
    }
    if (!hasYears) {
      suggestions.push({ category: 'Work Experience', text: 'Add dates (years or month/year) to each position to show career progression.' })
    }
    if (breakdown.workExperience < 10) {
      suggestions.push({ category: 'Work Experience', text: 'Quantify achievements with numbers: "increased sales by 30%" beats "improved sales performance".' })
    }
  }

  // Skills suggestions
  if (breakdown.skills < 18) {
    if (skillsMatched.length < 5) {
      suggestions.push({ category: 'Skills', text: 'Add a dedicated Skills section listing your technical tools, languages, and frameworks.' })
    } else {
      suggestions.push({ category: 'Skills', text: 'Tailor your skills list to match the job description keywords — ATS systems scan for exact matches.' })
    }
  }

  // Education suggestions
  if (breakdown.education < 10) {
    if (educationMatches === 0) {
      suggestions.push({ category: 'Education', text: 'Add an Education section with your degree, institution, and graduation year.' })
    } else {
      suggestions.push({ category: 'Education', text: 'Include relevant certifications, online courses, or bootcamps if your formal education is limited.' })
    }
  }

  // Formatting suggestions
  if (breakdown.formatting < 10) {
    if (wordCount < 200) {
      suggestions.push({ category: 'Formatting', text: 'Your resume seems short. Aim for 400-700 words to give enough context without overwhelming recruiters.' })
    } else if (wordCount > 1000) {
      suggestions.push({ category: 'Formatting', text: 'Consider condensing to 1 page (600-800 words). Recruiters spend ~7 seconds on first pass.' })
    }
    suggestions.push({ category: 'Formatting', text: 'Use bullet points (•) for experience items — they improve scannability and ATS parsing.' })
  }

  // Always add one universal tip if score is high
  if (suggestions.length === 0) {
    suggestions.push({ category: 'Pro Tip', text: 'Your resume looks strong! Consider customizing the skills and summary for each job application to maximize ATS matching.' })
  }

  return suggestions
}

export function analyzeResume(text: string, jobTitle?: string): AnalysisResult {
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length

  const { score: contactScore, found: contactFound } = scoreContactInfo(text)
  const { score: expScore, verbCount, hasYears } = scoreWorkExperience(text)
  const { score: skillsScore, matched: skillsMatched } = scoreSkills(text)
  const { score: eduScore, matches: eduMatches } = scoreEducation(text)
  const { score: fmtScore } = scoreFormatting(text)

  const breakdown: ScoreBreakdown = {
    contactInfo: contactScore,
    workExperience: expScore,
    skills: skillsScore,
    education: eduScore,
    formatting: fmtScore,
  }

  const totalScore = contactScore + expScore + skillsScore + eduScore + fmtScore

  const suggestions = generateSuggestions(
    breakdown,
    contactFound,
    verbCount,
    hasYears,
    skillsMatched,
    eduMatches,
    wordCount,
  )

  const keywords: KeywordMatch[] = skillsMatched

  const targetMatch = matchTargetTitle(text, jobTitle)
  if (targetMatch && targetMatch.missingTerms.length > 0) {
    suggestions.unshift({
      category: 'Target Role',
      text: `Your resume never mentions ${targetMatch.missingTerms.map(t => `"${t}"`).join(', ')} from your target title "${targetMatch.title}". If that matches your experience, use the same wording recruiters search for.`,
    })
  }

  return {
    totalScore,
    breakdown,
    suggestions,
    keywords,
    wordCount,
    ...(targetMatch ? { targetMatch } : {}),
  }
}
