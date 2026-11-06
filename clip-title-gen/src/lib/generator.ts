export interface GenerateOptions {
  topic: string
  audience: string
  tone: string
}

export interface TitleResult {
  title: string
  formula: string
  ctrTag: string
  charCount: number
}

const FORMULAS = [
  {
    id: 1,
    formula: 'How I [Result] (Without [Obstacle])',
    ctrTag: 'Curiosity Gap',
    build: (topic: string, _audience: string, _tone: string) =>
      `How I Mastered ${toTitleCase(topic)} (Without Spending a Fortune)`,
  },
  {
    id: 2,
    formula: '[Number] Things Most People Don\'t Know',
    ctrTag: 'Social Proof',
    build: (topic: string) =>
      `7 Things About ${toTitleCase(topic)} That Most People Don't Know`,
  },
  {
    id: 3,
    formula: 'Why [Belief] Is WRONG',
    ctrTag: 'Controversy',
    build: (topic: string) =>
      `Why Everything You Know About ${toTitleCase(topic)} Is WRONG`,
  },
  {
    id: 4,
    formula: 'I Tried [Topic] for [Duration]',
    ctrTag: 'Personal Story',
    build: (topic: string) =>
      `I Tried ${toTitleCase(topic)} for 30 Days — Here's What Happened`,
  },
  {
    id: 5,
    formula: 'The Ultimate Guide to [Topic] in [Year]',
    ctrTag: 'How-To',
    build: (topic: string) =>
      `The Ultimate Guide to ${toTitleCase(topic)} in ${new Date().getFullYear()}`,
  },
  {
    id: 6,
    formula: 'Stop [Mistake] — Do This Instead',
    ctrTag: 'Curiosity Gap',
    build: (topic: string) =>
      `Stop Doing ${toTitleCase(topic)} Wrong — Do This Instead`,
  },
  {
    id: 7,
    formula: '[Topic] Tier List — Ranked Worst to Best',
    ctrTag: 'Entertainment',
    build: (topic: string) =>
      `${toTitleCase(topic)} Tier List — Ranked From Worst to Best`,
  },
  {
    id: 8,
    formula: 'What Nobody Tells You About [Topic]',
    ctrTag: 'Curiosity Gap',
    build: (topic: string) =>
      `What Nobody Tells You About ${toTitleCase(topic)}`,
  },
  {
    id: 9,
    formula: '[Topic] for Beginners: Complete Guide',
    ctrTag: 'How-To',
    build: (topic: string) =>
      `${toTitleCase(topic)} for Beginners: The Complete Step-by-Step Guide`,
  },
  {
    id: 10,
    formula: 'Is [Topic] Worth It? Honest Review',
    ctrTag: 'Review',
    build: (topic: string) =>
      `Is ${toTitleCase(topic)} Worth It in ${new Date().getFullYear()}? My Honest Review`,
  },
]

function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function generateTitles(options: GenerateOptions): TitleResult[] {
  const { topic, audience, tone } = options

  if (!topic.trim()) return []

  return FORMULAS.map((f) => {
    let title = f.build(topic, audience, tone)

    // Tone adjustments
    if (tone === 'Shocking') {
      title = title.replace('Wrong', 'DEAD WRONG').replace('Complete', 'SHOCKING')
    } else if (tone === 'Inspiring') {
      title = title + ' (Life-Changing Results)'
    } else if (tone === 'Educational') {
      title = title.replace('!', '').replace('WRONG', 'Incorrect')
    }

    // Audience adjustments
    if (audience === 'Gaming') {
      title = title.replace('for Beginners', 'for Noobs')
    } else if (audience === 'Tech') {
      title = title.replace('Complete', 'Technical')
    } else if (audience === 'Business') {
      title = title.replace('for Beginners', 'for Entrepreneurs')
    }

    return {
      title,
      formula: f.formula,
      ctrTag: f.ctrTag,
      charCount: title.length,
    }
  })
}

export function generateThumbnailText(title: string): string[] {
  // Extract key words to make punchy 2-4 word thumbnail text
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'it', 'i', 'my', 'me', 'this',
    'that', 'what', 'how', 'why', 'when', 'where', 'who', 'about', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'could', 'should', 'here', 'there',
  ])

  const words = title
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))

  const options: string[] = []

  if (words.length >= 2) options.push(words.slice(0, 2).join(' ').toUpperCase())
  if (words.length >= 3) options.push(words.slice(0, 3).join(' ').toUpperCase())
  if (words.length >= 4) options.push(`${words[0]} ${words[words.length - 1]}`.toUpperCase())

  // Fallback if not enough unique options
  while (options.length < 3) {
    options.push(words.slice(0, 2).join(' ').toUpperCase() || 'WATCH NOW')
  }

  return options.slice(0, 3)
}
