export interface DomainScore {
  domain: string
  total: number
  grade: string
  gradeLabel: string
  dimensions: {
    length: number
    memorability: number
    tldValue: number
    seoPotential: number
    brandPotential: number
    extensibility: number
    marketHeat: number
  }
  dimensionLabels: Record<string, string>
  suggestions: string[]
  alternates: string[]
}

// 100 common English words that make good domain bases
const COMMON_WORDS = new Set([
  'art', 'bay', 'bit', 'box', 'bug', 'bus', 'buy', 'car', 'cat', 'cow',
  'cup', 'cut', 'day', 'dig', 'dog', 'dot', 'eat', 'egg', 'end', 'eye',
  'fan', 'far', 'fat', 'fit', 'fly', 'fog', 'fun', 'gap', 'gas', 'gem',
  'get', 'got', 'gun', 'gut', 'hat', 'hit', 'hop', 'hot', 'hub', 'hug',
  'ion', 'jam', 'jar', 'jet', 'job', 'joy', 'key', 'kid', 'kit', 'lab',
  'law', 'lay', 'leg', 'let', 'lid', 'lip', 'lot', 'low', 'map', 'max',
  'mix', 'mob', 'mop', 'mud', 'nap', 'net', 'new', 'nix', 'nod', 'now',
  'oak', 'odd', 'oil', 'old', 'one', 'opt', 'orb', 'own', 'pad', 'pan',
  'pay', 'pie', 'pig', 'pin', 'pip', 'pit', 'pop', 'pot', 'pro', 'pub',
  'pup', 'put', 'ray', 'red', 'ref', 'rig', 'rip', 'row', 'run', 'rut',
  'sap', 'sat', 'set', 'sip', 'sit', 'six', 'sky', 'sly', 'spy', 'sum',
  'sun', 'sup', 'tab', 'tan', 'tap', 'tax', 'tea', 'ten', 'tip', 'top',
  'toy', 'try', 'tub', 'tug', 'two', 'use', 'van', 'via', 'vow', 'war',
  'way', 'web', 'win', 'wit', 'woe', 'wok', 'woo', 'wow', 'yak', 'yam',
  'yap', 'yaw', 'yep', 'yes', 'yet', 'yew', 'zip', 'zoo', 'ace', 'age',
  'ago', 'aid', 'aim', 'air', 'ale', 'amp', 'ant', 'any', 'ape', 'apt',
  'arc', 'arm', 'ash', 'ask', 'ate', 'awe', 'axe', 'aye', 'bad', 'bag',
  'ban', 'bar', 'bat', 'bed', 'bee', 'beg', 'bet', 'bid', 'big', 'bin',
  'app', 'api', 'web', 'hub', 'lab', 'pro', 'net', 'dot', 'data', 'code',
  'base', 'core', 'edge', 'fast', 'flow', 'go', 'live', 'open', 'plus',
  'safe', 'sync', 'cloud', 'link', 'node', 'port', 'send', 'sign', 'smart',
  'snap', 'soft', 'stack', 'track', 'trust', 'next', 'bolt', 'dash', 'drop',
  'echo', 'flex', 'flux', 'grid', 'jump', 'keen', 'lean', 'mint', 'mode',
  'norm', 'pace', 'peak', 'pick', 'ping', 'pipe', 'plan', 'play', 'post',
  'push', 'read', 'rise', 'root', 'rule', 'rush', 'scan', 'seed', 'ship',
  'show', 'span', 'spot', 'step', 'stop', 'swap', 'turn', 'view', 'wave',
  'wire', 'work', 'wrap', 'zoom', 'zone', 'yield', 'vault', 'test', 'sort',
  'save', 'rank', 'rate', 'mark', 'make', 'list', 'load', 'look', 'lock',
])

const HIGH_VALUE_KEYWORDS = ['tech', 'app', 'pro', 'hub', 'lab', 'get', 'go', 'try',
  'my', 'the', 'best', 'top', 'easy', 'quick', 'fast', 'smart', 'super',
  'ultra', 'mega', 'nova', 'apex', 'prime', 'elite', 'core', 'base', 'cloud',
  'data', 'api', 'ai', 'bot', 'io', 'dev', 'web', 'net', 'digital', 'cyber',
  'auto', 'flow', 'link', 'dash', 'sync', 'edge', 'next', 'open', 'plus']

const HOT_KEYWORDS = ['ai', 'gpt', 'llm', 'crypto', 'defi', 'nft', 'saas', 'b2b', 'crm',
  'erp', 'ml', 'blockchain', 'web3', 'dao', 'dapp', 'fintech', 'proptech',
  'edtech', 'healthtech', 'cleantech', 'biotech', 'deeptech', 'automl', 'genai',
  'agi', 'copilot', 'agent', 'nocode', 'lowcode', 'devops', 'mlops']

const TLD_SCORES: Record<string, number> = {
  'com': 100, 'ai': 90, 'io': 85, 'co': 80, 'app': 78, 'dev': 75,
  'net': 60, 'org': 55, 'me': 50, 'us': 45, 'info': 35, 'biz': 30,
  'online': 28, 'site': 25, 'xyz': 22, 'tech': 70, 'so': 55,
  'gg': 60, 'sh': 65, 'ly': 55, 'to': 50, 'is': 48, 'im': 45,
}

// Syntax validation only: no DNS, registration or public-suffix availability claim.
function parseDomain(input: string): { name: string; tld: string; full: string } {
  const raw = input.trim()
  if (!raw || /\s|\\/.test(raw)) throw new Error('Enter a valid domain, such as example.com.')
  let url: URL
  try { url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`) }
  catch { throw new Error('Enter a valid domain, such as example.com.') }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) {
    throw new Error('Enter a domain without credentials or a port.')
  }
  const full = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '')
  const parts = full.split('.')
  if (full.length > 253 || parts.length < 2 || parts.some(part =>
    part.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(part)
  ) || !/[a-z]/.test(parts[parts.length - 1])) {
    throw new Error('Enter a valid domain with a suffix, such as example.com.')
  }
  return { name: parts[0], tld: parts.slice(1).join('.'), full }
}

function scoreLength(name: string): number {
  const len = name.length
  if (len <= 5) return 100
  if (len <= 8) return 85
  if (len <= 12) return 65
  if (len <= 15) return 40
  return 20
}

function scoreMemorability(name: string): number {
  let score = 50
  const hasNumbers = /\d/.test(name)
  const hasHyphen = /-/.test(name)
  const isAlpha = /^[a-z]+$/.test(name)
  const isWord = COMMON_WORDS.has(name)

  if (isAlpha) score += 30
  if (hasNumbers) score -= 20
  if (hasHyphen) score -= 25
  if (isWord) score += 40

  // Check if it contains a common word as substring
  for (const word of COMMON_WORDS) {
    if (word.length >= 3 && name.includes(word) && !isWord) {
      score += 15
      break
    }
  }

  return Math.max(0, Math.min(100, score))
}

function scoreTLD(tld: string): number {
  return TLD_SCORES[tld] ?? 30
}

function scoreSeoPotential(name: string, tld: string): number {
  let score = 50
  const len = name.length
  // Shorter = better for SEO
  if (len <= 6) score += 20
  else if (len <= 10) score += 10

  // High-value keywords
  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (name.includes(kw)) {
      score += 20
      break
    }
  }

  // No special chars
  if (/^[a-z0-9]+$/.test(name)) score += 10

  // Exact match potential
  if (COMMON_WORDS.has(name)) score += 15

  return Math.max(0, Math.min(100, score))
}

function scoreBrandPotential(name: string): number {
  let score = 50
  // Vowel-consonant alternation pattern (easier to pronounce)
  const vowels = new Set(['a', 'e', 'i', 'o', 'u'])
  let alternations = 0
  for (let i = 0; i < name.length - 1; i++) {
    const curr = vowels.has(name[i])
    const next = vowels.has(name[i + 1])
    if (curr !== next) alternations++
  }
  const altRatio = name.length > 1 ? alternations / (name.length - 1) : 0
  score += Math.round(altRatio * 25)

  // Repeated syllable patterns (catchy)
  if (/(.{2,3})\1/.test(name)) score += 10

  // No hyphens or numbers for brand
  if (!/[-\d]/.test(name)) score += 15

  // Length sweet spot for brand (5-9 chars)
  if (name.length >= 5 && name.length <= 9) score += 10

  return Math.max(0, Math.min(100, score))
}

function scoreExtensibility(name: string): number {
  // Penalize extremely niche / vertical-locked names
  const nichePenalties = ['plumber', 'dentist', 'lawyer', 'pizza', 'burger',
    'taxi', 'nurse', 'doctor', 'school', 'church']
  for (const niche of nichePenalties) {
    if (name.includes(niche)) return 30
  }

  // Very short names are more extensible
  if (name.length <= 6) return 90
  if (name.length <= 10) return 70
  return 55
}

function scoreMarketHeat(name: string): number {
  let score = 40
  for (const kw of HOT_KEYWORDS) {
    if (name.includes(kw)) {
      score += 45
      break
    }
  }
  // Tech-adjacent words
  if (/^[a-z]+$/.test(name) && name.length <= 8) score += 15
  return Math.max(0, Math.min(100, score))
}

function getGrade(total: number): { grade: string; label: string } {
  if (total >= 90) return { grade: 'diamond', label: 'Domain Diamond 💎' }
  if (total >= 75) return { grade: 'premium', label: 'Premium' }
  if (total >= 60) return { grade: 'standard', label: 'Standard' }
  if (total >= 40) return { grade: 'weak', label: 'Weak' }
  return { grade: 'poor', label: 'Poor' }
}

function generateSuggestions(
  name: string,
  tld: string,
  dimensions: DomainScore['dimensions']
): string[] {
  const suggestions: string[] = []

  if (/-/.test(name)) suggestions.push('Consider removing the hyphen — hyphens hurt memorability and SEO.')
  if (/\d/.test(name)) suggestions.push('Numbers in domain names reduce memorability. Try a word alternative.')
  if (tld && tld !== 'com') suggestions.push(`Try the .com version — ${name}.com has higher perceived value.`)
  if (name.length > 12) suggestions.push('Shorter is better. Aim for under 12 characters.')
  if (dimensions.brandPotential < 50) suggestions.push('Add vowels or improve syllable flow for a more brandable name.')
  if (dimensions.seoPotential < 50) suggestions.push('Include a keyword that reflects your core service.')
  if (dimensions.tldValue < 60) suggestions.push('Upgrade to .com, .io, or .ai for higher perceived credibility.')
  if (dimensions.memorability < 60) suggestions.push('Consider a real English word or pronounceable combination.')

  return suggestions.slice(0, 4)
}

function generateAlternates(name: string, tld: string): string[] {
  const alternates: string[] = []
  const tldToUse = tld || 'com'

  // Prefix variants
  alternates.push(`get${name}.${tldToUse}`)
  alternates.push(`try${name}.${tldToUse}`)
  alternates.push(`${name}hq.com`)
  alternates.push(`${name}app.io`)
  alternates.push(`use${name}.com`)

  return alternates.slice(0, 5)
}

export function scoreDomain(input: string): DomainScore {
  const { name, tld, full } = parseDomain(input)

  const length = scoreLength(name)
  const memorability = scoreMemorability(name)
  const tldValue = scoreTLD(tld)
  const seoPotential = scoreSeoPotential(name, tld)
  const brandPotential = scoreBrandPotential(name)
  const extensibility = scoreExtensibility(name)
  const marketHeat = scoreMarketHeat(name)

  const total = Math.round(
    length * 0.25 +
    memorability * 0.20 +
    tldValue * 0.20 +
    seoPotential * 0.15 +
    brandPotential * 0.10 +
    extensibility * 0.05 +
    marketHeat * 0.05
  )

  const dimensions = { length, memorability, tldValue, seoPotential, brandPotential, extensibility, marketHeat }
  const { grade, label } = getGrade(total)

  return {
    domain: full || input,
    total,
    grade,
    gradeLabel: label,
    dimensions,
    dimensionLabels: {
      length: 'Length',
      memorability: 'Memorability',
      tldValue: 'TLD Value',
      seoPotential: 'SEO Potential',
      brandPotential: 'Brand Potential',
      extensibility: 'Extensibility',
      marketHeat: 'Market Heat',
    },
    suggestions: generateSuggestions(name, tld, dimensions),
    alternates: generateAlternates(name, tld),
  }
}

export function scoreBatch(domains: string[]): DomainScore[] {
  return domains
    .map(d => d.trim())
    .filter(d => d.length > 0)
    .map(scoreDomain)
    .sort((a, b) => b.total - a.total)
}
