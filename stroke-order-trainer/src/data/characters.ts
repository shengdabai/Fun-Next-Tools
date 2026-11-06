export interface CharacterData {
  char: string
  pinyin: string
  wordByWord: string
  english: string
  strokeCount: number
  hsk: number
  // Standard (GB mainland) stroke name for each stroke, same order as `strokes`
  strokeNames: string[]
  // SVG path data per stroke, coordinate system 0-100. One continuous path per stroke.
  strokes: string[]
}

// Hand-drawn SCHEMATIC stroke paths (not glyph outlines, not taken from a licensed
// stroke database). Order and stroke types follow the mainland standard stroke order
// and are checked by the b11 regression (order table + direction geometry).
// Coordinate system: 0-100 viewBox.
export const CHARACTER_DB: Record<string, CharacterData> = {
  '一': {
    char: '一', pinyin: 'yī', wordByWord: 'one', english: 'one',
    strokeCount: 1, hsk: 1,
    strokeNames: ['横'],
    strokes: ['M15,50 Q50,45 85,50'],
  },
  '二': {
    char: '二', pinyin: 'èr', wordByWord: 'two', english: 'two',
    strokeCount: 2, hsk: 1,
    strokeNames: ['横', '横'],
    strokes: [
      'M20,38 Q50,34 80,38',
      'M12,62 Q50,57 88,62',
    ],
  },
  '三': {
    char: '三', pinyin: 'sān', wordByWord: 'three', english: 'three',
    strokeCount: 3, hsk: 1,
    strokeNames: ['横', '横', '横'],
    strokes: [
      'M25,28 Q50,24 75,28',
      'M18,50 Q50,46 82,50',
      'M12,72 Q50,67 88,72',
    ],
  },
  '人': {
    char: '人', pinyin: 'rén', wordByWord: 'person', english: 'person / people',
    strokeCount: 2, hsk: 1,
    strokeNames: ['撇', '捺'],
    strokes: [
      'M50,12 Q40,35 22,78',
      'M46,38 Q60,62 82,80',
    ],
  },
  '大': {
    char: '大', pinyin: 'dà', wordByWord: 'big / great', english: 'big / large / great',
    strokeCount: 3, hsk: 1,
    strokeNames: ['横', '撇', '捺'],
    strokes: [
      'M15,40 Q50,36 85,40',
      'M50,12 Q48,50 18,86',
      'M50,42 Q62,68 84,86',
    ],
  },
  '小': {
    char: '小', pinyin: 'xiǎo', wordByWord: 'small', english: 'small / little',
    strokeCount: 3, hsk: 1,
    strokeNames: ['竖钩', '撇', '点'],
    strokes: [
      'M50,12 L50,82 L42,75',
      'M30,40 Q26,55 16,68',
      'M68,40 Q76,54 84,66',
    ],
  },
  '山': {
    char: '山', pinyin: 'shān', wordByWord: 'mountain', english: 'mountain',
    strokeCount: 3, hsk: 1,
    strokeNames: ['竖', '竖折', '竖'],
    strokes: [
      'M50,12 L50,78',
      'M20,40 L20,78 L80,78',
      'M80,40 L80,80',
    ],
  },
  '日': {
    char: '日', pinyin: 'rì', wordByWord: 'sun / day', english: 'sun / day',
    strokeCount: 4, hsk: 1,
    strokeNames: ['竖', '横折', '横', '横'],
    strokes: [
      'M28,15 L28,85',
      'M28,15 L72,15 L72,85',
      'M28,50 L72,50',
      'M28,85 L72,85',
    ],
  },
  '月': {
    char: '月', pinyin: 'yuè', wordByWord: 'moon / month', english: 'moon / month',
    strokeCount: 4, hsk: 1,
    strokeNames: ['撇', '横折钩', '横', '横'],
    strokes: [
      'M32,12 Q32,60 20,88',
      'M32,12 L74,12 L74,86 L66,80',
      'M32,36 L74,36',
      'M32,58 L74,58',
    ],
  },
  '木': {
    char: '木', pinyin: 'mù', wordByWord: 'wood / tree', english: 'wood / tree',
    strokeCount: 4, hsk: 1,
    strokeNames: ['横', '竖', '撇', '捺'],
    strokes: [
      'M15,36 Q50,32 85,36',
      'M50,10 L50,90',
      'M50,38 Q40,62 16,80',
      'M50,38 Q62,62 86,80',
    ],
  },
  '水': {
    char: '水', pinyin: 'shuǐ', wordByWord: 'water', english: 'water',
    strokeCount: 4, hsk: 1,
    strokeNames: ['竖钩', '横撇', '撇', '捺'],
    strokes: [
      'M50,8 L50,88 L42,80',
      'M16,36 L40,36 Q34,56 16,72',
      'M78,28 Q68,40 54,48',
      'M54,48 Q66,70 86,84',
    ],
  },
  '火': {
    char: '火', pinyin: 'huǒ', wordByWord: 'fire', english: 'fire',
    strokeCount: 4, hsk: 2,
    strokeNames: ['点', '撇', '撇', '捺'],
    strokes: [
      'M24,30 Q28,40 30,48',
      'M78,28 Q72,40 64,48',
      'M50,10 Q50,55 18,88',
      'M50,48 Q62,72 84,88',
    ],
  },
  '土': {
    char: '土', pinyin: 'tǔ', wordByWord: 'earth / soil', english: 'earth / soil / ground',
    strokeCount: 3, hsk: 2,
    strokeNames: ['横', '竖', '横'],
    strokes: [
      'M28,35 Q50,30 72,35',
      'M50,35 L50,80',
      'M18,80 Q50,75 82,80',
    ],
  },
  '天': {
    char: '天', pinyin: 'tiān', wordByWord: 'sky / heaven / day', english: 'sky / heaven / day',
    strokeCount: 4, hsk: 1,
    strokeNames: ['横', '横', '撇', '捺'],
    strokes: [
      'M24,24 Q50,20 76,24',
      'M14,48 Q50,44 86,48',
      'M50,24 Q48,60 16,88',
      'M50,50 Q62,74 86,88',
    ],
  },
  '中': {
    char: '中', pinyin: 'zhōng', wordByWord: 'middle / center / China', english: 'middle / center / China',
    strokeCount: 4, hsk: 1,
    strokeNames: ['竖', '横折', '横', '竖'],
    strokes: [
      'M22,30 L22,66',
      'M22,30 L78,30 L78,66',
      'M22,64 L78,64',
      'M50,8 L50,94',
    ],
  },
  '国': {
    char: '国', pinyin: 'guó', wordByWord: 'country / nation', english: 'country / nation / China',
    strokeCount: 8, hsk: 1,
    strokeNames: ['竖', '横折', '横', '横', '竖', '横', '点', '横'],
    strokes: [
      'M15,12 L15,88',
      'M15,12 L85,12 L85,88',
      'M32,30 L68,30',
      'M34,48 L66,48',
      'M50,30 L50,68',
      'M30,68 L70,68',
      'M60,54 Q64,58 66,62',
      'M15,88 L85,88',
    ],
  },
  '好': {
    char: '好', pinyin: 'hǎo', wordByWord: 'good / well', english: 'good / well / like',
    strokeCount: 6, hsk: 1,
    strokeNames: ['撇点', '撇', '横', '横撇', '弯钩', '横'],
    strokes: [
      'M26,14 Q20,40 12,58 Q28,68 40,82',
      'M38,30 Q32,62 10,84',
      'M6,44 Q25,40 46,44',
      'M54,20 L86,20 Q76,32 68,40',
      'M70,40 Q76,62 70,86 L62,80',
      'M50,56 Q70,52 94,56',
    ],
  },
  '你': {
    char: '你', pinyin: 'nǐ', wordByWord: 'you', english: 'you',
    strokeCount: 7, hsk: 1,
    strokeNames: ['撇', '竖', '撇', '横钩', '竖钩', '撇', '点'],
    strokes: [
      'M30,10 Q24,28 8,46',
      'M20,32 L20,90',
      'M52,10 Q46,24 36,34',
      'M44,28 L88,28 L80,38',
      'M64,28 L64,86 L56,80',
      'M50,48 Q46,62 36,74',
      'M78,48 Q84,60 90,72',
    ],
  },
  '我': {
    char: '我', pinyin: 'wǒ', wordByWord: 'I / me', english: 'I / me',
    strokeCount: 7, hsk: 1,
    strokeNames: ['撇', '横', '竖钩', '提', '斜钩', '撇', '点'],
    strokes: [
      'M40,8 Q28,16 12,20',
      'M6,40 Q50,35 94,40',
      'M30,18 L30,86 L22,80',
      'M6,68 Q22,62 46,52',
      'M56,8 Q64,60 88,88 L90,76',
      'M84,48 Q70,66 52,80',
      'M74,14 Q80,20 84,26',
    ],
  },
  '是': {
    char: '是', pinyin: 'shì', wordByWord: 'be / is / are', english: 'to be / is / are',
    strokeCount: 9, hsk: 1,
    strokeNames: ['竖', '横折', '横', '横', '横', '竖', '横', '撇', '捺'],
    strokes: [
      'M30,8 L30,40',
      'M30,8 L70,8 L70,40',
      'M30,24 L70,24',
      'M30,40 L70,40',
      'M8,52 Q50,48 92,52',
      'M50,52 L50,88',
      'M50,68 L76,68',
      'M32,62 Q28,80 10,92',
      'M28,80 Q52,90 92,92',
    ],
  },
  '不': {
    char: '不', pinyin: 'bù', wordByWord: 'not / no', english: 'not / no',
    strokeCount: 4, hsk: 1,
    strokeNames: ['横', '撇', '竖', '点'],
    strokes: [
      'M12,18 Q50,14 88,18',
      'M54,18 Q44,44 12,62',
      'M50,38 L50,92',
      'M62,44 Q74,52 84,62',
    ],
  },
}

export const POPULAR_CHARS = [
  '一','二','三','人','大','小','山','日','月',
  '木','水','火','天','中','国','好','你','我','是','不',
]

export function getCharData(char: string): CharacterData | null {
  return CHARACTER_DB[char] ?? null
}

export function getStrokePathLength(path: string): number {
  // rough estimate: count coordinate pairs × average segment length
  const coords = path.match(/[\d.]+/g)
  if (!coords || coords.length < 2) return 100
  let len = 0
  for (let i = 0; i < coords.length - 2; i += 2) {
    const dx = parseFloat(coords[i + 2]) - parseFloat(coords[i])
    const dy = parseFloat(coords[i + 3]) - parseFloat(coords[i + 1])
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return Math.max(len, 30)
}
