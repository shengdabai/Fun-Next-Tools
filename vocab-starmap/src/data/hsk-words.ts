export interface VocabWord {
  char: string
  pinyin: string
  wordByWord: string
  english: string
  hsk: 1 | 2 | 3 | 4 | 5 | 6
  topic: string
}

export const HSK_WORDS: VocabWord[] = [
  // HSK 1 — People
  { char: '我', pinyin: 'wǒ', wordByWord: 'I/me', english: 'I / me', hsk: 1, topic: '人称' },
  { char: '你', pinyin: 'nǐ', wordByWord: 'you', english: 'you', hsk: 1, topic: '人称' },
  { char: '他', pinyin: 'tā', wordByWord: 'he/him', english: 'he / him', hsk: 1, topic: '人称' },
  { char: '她', pinyin: 'tā', wordByWord: 'she/her', english: 'she / her', hsk: 1, topic: '人称' },
  { char: '们', pinyin: 'men', wordByWord: '[plural]', english: '[plural marker]', hsk: 1, topic: '人称' },
  { char: '妈妈', pinyin: 'māma', wordByWord: 'mother', english: 'mother / mom', hsk: 1, topic: '家庭' },
  { char: '爸爸', pinyin: 'bàba', wordByWord: 'father', english: 'father / dad', hsk: 1, topic: '家庭' },
  { char: '朋友', pinyin: 'péngyǒu', wordByWord: 'friend-friend', english: 'friend', hsk: 1, topic: '家庭' },
  { char: '老师', pinyin: 'lǎoshī', wordByWord: 'old-teacher', english: 'teacher', hsk: 1, topic: '职业' },
  { char: '学生', pinyin: 'xuésheng', wordByWord: 'study-person', english: 'student', hsk: 1, topic: '职业' },
  // HSK 1 — Grammar
  { char: '是', pinyin: 'shì', wordByWord: 'be/is', english: 'to be', hsk: 1, topic: '语法' },
  { char: '不', pinyin: 'bù', wordByWord: 'not/no', english: 'not / no', hsk: 1, topic: '语法' },
  { char: '的', pinyin: 'de', wordByWord: '[possessive]', english: '[possessive particle]', hsk: 1, topic: '语法' },
  { char: '了', pinyin: 'le', wordByWord: '[completed]', english: '[completion particle]', hsk: 1, topic: '语法' },
  { char: '吗', pinyin: 'ma', wordByWord: '[question]', english: '[question particle]', hsk: 1, topic: '语法' },
  { char: '呢', pinyin: 'ne', wordByWord: '[and you?]', english: '[follow-up question]', hsk: 1, topic: '语法' },
  { char: '也', pinyin: 'yě', wordByWord: 'also', english: 'also / too', hsk: 1, topic: '语法' },
  { char: '都', pinyin: 'dōu', wordByWord: 'all/both', english: 'all / both', hsk: 1, topic: '语法' },
  // HSK 1 — Adjectives
  { char: '好', pinyin: 'hǎo', wordByWord: 'good', english: 'good / well', hsk: 1, topic: '形容词' },
  { char: '大', pinyin: 'dà', wordByWord: 'big', english: 'big / large', hsk: 1, topic: '形容词' },
  { char: '小', pinyin: 'xiǎo', wordByWord: 'small', english: 'small / little', hsk: 1, topic: '形容词' },
  { char: '多', pinyin: 'duō', wordByWord: 'many/much', english: 'many / much', hsk: 1, topic: '形容词' },
  { char: '少', pinyin: 'shǎo', wordByWord: 'few/little', english: 'few / little', hsk: 1, topic: '形容词' },
  { char: '高', pinyin: 'gāo', wordByWord: 'tall/high', english: 'tall / high', hsk: 1, topic: '形容词' },
  // HSK 1 — Actions
  { char: '吃', pinyin: 'chī', wordByWord: 'eat', english: 'to eat', hsk: 1, topic: '动作' },
  { char: '喝', pinyin: 'hē', wordByWord: 'drink', english: 'to drink', hsk: 1, topic: '动作' },
  { char: '去', pinyin: 'qù', wordByWord: 'go', english: 'to go', hsk: 1, topic: '动作' },
  { char: '来', pinyin: 'lái', wordByWord: 'come', english: 'to come', hsk: 1, topic: '动作' },
  { char: '看', pinyin: 'kàn', wordByWord: 'look/watch', english: 'to look / to watch', hsk: 1, topic: '动作' },
  { char: '说', pinyin: 'shuō', wordByWord: 'speak/say', english: 'to speak / to say', hsk: 1, topic: '动作' },
  { char: '学', pinyin: 'xué', wordByWord: 'study/learn', english: 'to study / to learn', hsk: 1, topic: '动作' },
  { char: '写', pinyin: 'xiě', wordByWord: 'write', english: 'to write', hsk: 1, topic: '动作' },
  { char: '买', pinyin: 'mǎi', wordByWord: 'buy', english: 'to buy', hsk: 1, topic: '动作' },
  { char: '有', pinyin: 'yǒu', wordByWord: 'have/exist', english: 'to have / to exist', hsk: 1, topic: '动作' },
  // HSK 1 — Food & drink
  { char: '水', pinyin: 'shuǐ', wordByWord: 'water', english: 'water', hsk: 1, topic: '饮食' },
  { char: '饭', pinyin: 'fàn', wordByWord: 'rice/meal', english: 'rice / meal', hsk: 1, topic: '饮食' },
  { char: '茶', pinyin: 'chá', wordByWord: 'tea', english: 'tea', hsk: 1, topic: '饮食' },
  { char: '菜', pinyin: 'cài', wordByWord: 'vegetable/dish', english: 'vegetable / dish', hsk: 1, topic: '饮食' },
  // HSK 1 — Places
  { char: '中国', pinyin: 'Zhōngguó', wordByWord: 'middle-country', english: 'China', hsk: 1, topic: '地点' },
  { char: '学校', pinyin: 'xuéxiào', wordByWord: 'study-place', english: 'school', hsk: 1, topic: '地点' },
  { char: '家', pinyin: 'jiā', wordByWord: 'home/family', english: 'home / family', hsk: 1, topic: '地点' },
  { char: '书', pinyin: 'shū', wordByWord: 'book', english: 'book', hsk: 1, topic: '学习' },
  // HSK 2
  { char: '因为', pinyin: 'yīnwèi', wordByWord: 'because', english: 'because', hsk: 2, topic: '语法' },
  { char: '所以', pinyin: 'suǒyǐ', wordByWord: 'therefore', english: 'therefore / so', hsk: 2, topic: '语法' },
  { char: '但是', pinyin: 'dànshì', wordByWord: 'but-is', english: 'but / however', hsk: 2, topic: '语法' },
  { char: '如果', pinyin: 'rúguǒ', wordByWord: 'if-fruit', english: 'if / in case', hsk: 2, topic: '语法' },
  { char: '知道', pinyin: 'zhīdào', wordByWord: 'know-way', english: 'to know', hsk: 2, topic: '认知' },
  { char: '觉得', pinyin: 'juéde', wordByWord: 'feel-get', english: 'to feel / to think', hsk: 2, topic: '认知' },
  { char: '喜欢', pinyin: 'xǐhuān', wordByWord: 'like-enjoy', english: 'to like / to enjoy', hsk: 2, topic: '情感' },
  { char: '开心', pinyin: 'kāixīn', wordByWord: 'open-heart', english: 'happy / glad', hsk: 2, topic: '情感' },
  { char: '身体', pinyin: 'shēntǐ', wordByWord: 'body-body', english: 'body / health', hsk: 2, topic: '身体' },
  { char: '工作', pinyin: 'gōngzuò', wordByWord: 'work-do', english: 'work / job', hsk: 2, topic: '职业' },
  { char: '问题', pinyin: 'wèntí', wordByWord: 'question-topic', english: 'question / problem', hsk: 2, topic: '学习' },
  { char: '时间', pinyin: 'shíjiān', wordByWord: 'time-between', english: 'time', hsk: 2, topic: '时间' },
  { char: '现在', pinyin: 'xiànzài', wordByWord: 'present-at', english: 'now / currently', hsk: 2, topic: '时间' },
  { char: '以前', pinyin: 'yǐqián', wordByWord: 'already-before', english: 'before / previously', hsk: 2, topic: '时间' },
  // HSK 3
  { char: '环境', pinyin: 'huánjìng', wordByWord: 'surround-scenery', english: 'environment', hsk: 3, topic: '社会' },
  { char: '经济', pinyin: 'jīngjì', wordByWord: 'manage-benefit', english: 'economy', hsk: 3, topic: '社会' },
  { char: '文化', pinyin: 'wénhuà', wordByWord: 'writing-transform', english: 'culture', hsk: 3, topic: '文化' },
  { char: '历史', pinyin: 'lìshǐ', wordByWord: 'past-record', english: 'history', hsk: 3, topic: '文化' },
  { char: '传统', pinyin: 'chuántǒng', wordByWord: 'pass-system', english: 'tradition', hsk: 3, topic: '文化' },
  { char: '机会', pinyin: 'jīhuì', wordByWord: 'machine-meet', english: 'opportunity / chance', hsk: 3, topic: '社会' },
  { char: '成功', pinyin: 'chénggōng', wordByWord: 'become-work', english: 'success / to succeed', hsk: 3, topic: '目标' },
  { char: '努力', pinyin: 'nǔlì', wordByWord: 'strive-strength', english: 'to work hard / effort', hsk: 3, topic: '目标' },
  { char: '发展', pinyin: 'fāzhǎn', wordByWord: 'develop-spread', english: 'to develop / development', hsk: 3, topic: '社会' },
  { char: '重要', pinyin: 'zhòngyào', wordByWord: 'heavy-want', english: 'important', hsk: 3, topic: '形容词' },
  // HSK 4
  { char: '竟然', pinyin: 'jìngrán', wordByWord: 'unexpectedly', english: 'unexpectedly / to one\'s surprise', hsk: 4, topic: '副词' },
  { char: '尽管', pinyin: 'jǐnguǎn', wordByWord: 'even-manage', english: 'even though / despite', hsk: 4, topic: '语法' },
  { char: '逐渐', pinyin: 'zhújiàn', wordByWord: 'gradually', english: 'gradually / progressively', hsk: 4, topic: '副词' },
  { char: '严格', pinyin: 'yángé', wordByWord: 'strict-correct', english: 'strict / rigorous', hsk: 4, topic: '形容词' },
  { char: '培养', pinyin: 'péiyǎng', wordByWord: 'cultivate-raise', english: 'to cultivate / to foster', hsk: 4, topic: '目标' },
  { char: '积极', pinyin: 'jījí', wordByWord: 'accumulate-extreme', english: 'positive / active / enthusiastic', hsk: 4, topic: '形容词' },
  // HSK 5
  { char: '追求', pinyin: 'zhuīqiú', wordByWord: 'chase-seek', english: 'to pursue / pursuit', hsk: 5, topic: '目标' },
  { char: '沟通', pinyin: 'gōutōng', wordByWord: 'ditch-through', english: 'to communicate', hsk: 5, topic: '交流' },
  { char: '影响', pinyin: 'yǐngxiǎng', wordByWord: 'shadow-sound', english: 'influence / to affect', hsk: 5, topic: '社会' },
  { char: '表达', pinyin: 'biǎodá', wordByWord: 'express-reach', english: 'to express', hsk: 5, topic: '交流' },
  { char: '创新', pinyin: 'chuàngxīn', wordByWord: 'create-new', english: 'innovation / to innovate', hsk: 5, topic: '目标' },
  // HSK 6
  { char: '磋商', pinyin: 'cuōshāng', wordByWord: 'grind-consult', english: 'to negotiate / consultation', hsk: 6, topic: '外交' },
  { char: '鼎盛', pinyin: 'dǐngshèng', wordByWord: 'tripod-flourish', english: 'at its peak / flourishing', hsk: 6, topic: '历史' },
  { char: '渊源', pinyin: 'yuānyuán', wordByWord: 'deep-source', english: 'origin / source', hsk: 6, topic: '文化' },
  { char: '博大精深', pinyin: 'bódà jīngshēn', wordByWord: 'broad-great profound-deep', english: 'broad and profound', hsk: 6, topic: '文化' },
]

// O(1) lookup index — avoids O(n²) in lookupWords
const WORD_INDEX = new Map<string, VocabWord>(
  HSK_WORDS.map(w => [w.char, w])
)

export const HSK_COLORS: Record<number, string> = {
  1: '#ffd700',
  2: '#ff8c00',
  3: '#ff4500',
  4: '#9370db',
  5: '#00ced1',
  6: '#ff69b4',
}

export const HSK_LABELS: Record<number, string> = {
  1: 'HSK 1 (Beginner)',
  2: 'HSK 2 (Elementary)',
  3: 'HSK 3 (Intermediate)',
  4: 'HSK 4 (Upper-Intermediate)',
  5: 'HSK 5 (Advanced)',
  6: 'HSK 6 (Mastery)',
}

export const PRESET_SETS: Record<string, string[]> = {
  'HSK 1 核心': ['我','你','他','是','不','好','大','小','吃','喝','去','来','说','学','家'],
  '家庭词汇': ['妈妈','爸爸','家','朋友','老师','学生','我','你','他','她'],
  '动作动词': ['吃','喝','去','来','看','说','学','写','买','有','工作'],
  '情感表达': ['好','喜欢','开心','知道','觉得','因为','所以','重要','努力'],
  'HSK 全级': ['我','是','好','工作','文化','历史','竟然','追求','鼎盛','渊源'],
}

export function lookupWords(chars: string[]): VocabWord[] {
  // Each word at most once: duplicate nodes share a D3 join key and inflate the stats.
  const seen = new Set<string>()
  return chars
    .map(c => WORD_INDEX.get(c.trim()))
    .filter((w): w is VocabWord => {
      if (w === undefined || seen.has(w.char)) return false
      seen.add(w.char)
      return true
    })
}

export function parseInput(raw: string): string[] {
  return raw
    .split(/[\n,，、\s]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}
