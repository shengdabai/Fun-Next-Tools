export interface ToneWord {
  char: string
  pinyin: string
  pinyinBase: string
  tone: 1 | 2 | 3 | 4
  english: string
  wordByWord: string
  example: string
  hsk: number
}

export const TONE_WORDS: ToneWord[] = [
  // ── Tone 1 ──
  { char: '妈', pinyin: 'māma', pinyinBase: 'mama', tone: 1, english: 'mother / mom', wordByWord: 'mother', example: '我的妈妈很好。', hsk: 1 },
  { char: '书', pinyin: 'shū', pinyinBase: 'shu', tone: 1, english: 'book', wordByWord: 'book', example: '这本书很有意思。', hsk: 1 },
  { char: '飞', pinyin: 'fēi', pinyinBase: 'fei', tone: 1, english: 'to fly', wordByWord: 'fly', example: '鸟在飞。', hsk: 2 },
  { char: '天', pinyin: 'tiān', pinyinBase: 'tian', tone: 1, english: 'sky / day', wordByWord: 'sky/day', example: '今天天气好。', hsk: 1 },
  { char: '喝', pinyin: 'hē', pinyinBase: 'he', tone: 1, english: 'to drink', wordByWord: 'drink', example: '我喝水。', hsk: 1 },
  { char: '说', pinyin: 'shuō', pinyinBase: 'shuo', tone: 1, english: 'to speak / to say', wordByWord: 'speak/say', example: '他说中文。', hsk: 1 },
  { char: '开', pinyin: 'kāi', pinyinBase: 'kai', tone: 1, english: 'to open / to start', wordByWord: 'open/start', example: '请开门。', hsk: 1 },
  { char: '花', pinyin: 'huā', pinyinBase: 'hua', tone: 1, english: 'flower', wordByWord: 'flower', example: '这朵花很美。', hsk: 2 },
  { char: '多', pinyin: 'duō', pinyinBase: 'duo', tone: 1, english: 'many / much', wordByWord: 'many/much', example: '人很多。', hsk: 1 },
  { char: '中', pinyin: 'zhōng', pinyinBase: 'zhong', tone: 1, english: 'middle / center', wordByWord: 'middle', example: '中文很有趣。', hsk: 1 },
  { char: '高', pinyin: 'gāo', pinyinBase: 'gao', tone: 1, english: 'tall / high', wordByWord: 'tall/high', example: '那座山很高。', hsk: 2 },
  { char: '知', pinyin: 'zhī', pinyinBase: 'zhi', tone: 1, english: 'to know', wordByWord: 'know', example: '我不知道。', hsk: 2 },
  { char: '新', pinyin: 'xīn', pinyinBase: 'xin', tone: 1, english: 'new', wordByWord: 'new', example: '这是新书。', hsk: 2 },
  { char: '音', pinyin: 'yīn', pinyinBase: 'yin', tone: 1, english: 'sound / music', wordByWord: 'sound', example: '中文发音很难。', hsk: 3 },
  { char: '家', pinyin: 'jiā', pinyinBase: 'jia', tone: 1, english: 'home / family', wordByWord: 'home/family', example: '我家在北京。', hsk: 1 },

  // ── Tone 2 ──
  { char: '来', pinyin: 'lái', pinyinBase: 'lai', tone: 2, english: 'to come', wordByWord: 'come', example: '你来了！', hsk: 1 },
  { char: '人', pinyin: 'rén', pinyinBase: 'ren', tone: 2, english: 'person / people', wordByWord: 'person', example: '这个人很好。', hsk: 1 },
  { char: '学', pinyin: 'xué', pinyinBase: 'xue', tone: 2, english: 'to study / learn', wordByWord: 'study/learn', example: '我学中文。', hsk: 1 },
  { char: '国', pinyin: 'guó', pinyinBase: 'guo', tone: 2, english: 'country / nation', wordByWord: 'country', example: '中国很大。', hsk: 1 },
  { char: '明', pinyin: 'míng', pinyinBase: 'ming', tone: 2, english: 'bright / clear', wordByWord: 'bright/clear', example: '明天见！', hsk: 1 },
  { char: '红', pinyin: 'hóng', pinyinBase: 'hong', tone: 2, english: 'red', wordByWord: 'red', example: '红色很好看。', hsk: 2 },
  { char: '年', pinyin: 'nián', pinyinBase: 'nian', tone: 2, english: 'year', wordByWord: 'year', example: '今年是好年。', hsk: 1 },
  { char: '文', pinyin: 'wén', pinyinBase: 'wen', tone: 2, english: 'language / culture', wordByWord: 'language', example: '中文很有用。', hsk: 1 },
  { char: '词', pinyin: 'cí', pinyinBase: 'ci', tone: 2, english: 'word / vocabulary', wordByWord: 'word', example: '这个词很难。', hsk: 2 },
  { char: '行', pinyin: 'xíng', pinyinBase: 'xing', tone: 2, english: 'OK / to walk', wordByWord: 'OK/walk', example: '行，没问题。', hsk: 2 },
  { char: '时', pinyin: 'shí', pinyinBase: 'shi', tone: 2, english: 'time / when', wordByWord: 'time', example: '现在几时了？', hsk: 2 },
  { char: '男', pinyin: 'nán', pinyinBase: 'nan', tone: 2, english: 'male / man', wordByWord: 'male', example: '他是男生。', hsk: 2 },
  { char: '还', pinyin: 'hái', pinyinBase: 'hai', tone: 2, english: 'still / also', wordByWord: 'still/also', example: '我还在学习。', hsk: 2 },

  // ── Tone 3 ──
  { char: '你', pinyin: 'nǐ', pinyinBase: 'ni', tone: 3, english: 'you', wordByWord: 'you', example: '你好！', hsk: 1 },
  { char: '我', pinyin: 'wǒ', pinyinBase: 'wo', tone: 3, english: 'I / me', wordByWord: 'I/me', example: '我是学生。', hsk: 1 },
  { char: '好', pinyin: 'hǎo', pinyinBase: 'hao', tone: 3, english: 'good / well', wordByWord: 'good', example: '你好！', hsk: 1 },
  { char: '小', pinyin: 'xiǎo', pinyinBase: 'xiao', tone: 3, english: 'small / little', wordByWord: 'small', example: '这个很小。', hsk: 1 },
  { char: '买', pinyin: 'mǎi', pinyinBase: 'mai', tone: 3, english: 'to buy', wordByWord: 'buy', example: '我买书。', hsk: 1 },
  { char: '水', pinyin: 'shuǐ', pinyinBase: 'shui', tone: 3, english: 'water', wordByWord: 'water', example: '我喝水。', hsk: 1 },
  { char: '马', pinyin: 'mǎ', pinyinBase: 'ma', tone: 3, english: 'horse', wordByWord: 'horse', example: '那匹马很快。', hsk: 2 },
  { char: '里', pinyin: 'lǐ', pinyinBase: 'li', tone: 3, english: 'inside / in', wordByWord: 'inside', example: '书在包里。', hsk: 1 },
  { char: '请', pinyin: 'qǐng', pinyinBase: 'qing', tone: 3, english: 'please / to invite', wordByWord: 'please', example: '请进！', hsk: 1 },
  { char: '语', pinyin: 'yǔ', pinyinBase: 'yu', tone: 3, english: 'language', wordByWord: 'language', example: '普通话是中国语言。', hsk: 2 },
  { char: '写', pinyin: 'xiě', pinyinBase: 'xie', tone: 3, english: 'to write', wordByWord: 'write', example: '请写你的名字。', hsk: 1 },
  { char: '也', pinyin: 'yě', pinyinBase: 'ye', tone: 3, english: 'also / too', wordByWord: 'also', example: '我也是学生。', hsk: 1 },
  { char: '可', pinyin: 'kě', pinyinBase: 'ke', tone: 3, english: 'can / may', wordByWord: 'can', example: '可以吗？', hsk: 2 },

  // ── Tone 4 ──
  { char: '是', pinyin: 'shì', pinyinBase: 'shi', tone: 4, english: 'to be / is', wordByWord: 'be/is', example: '我是老师。', hsk: 1 },
  { char: '去', pinyin: 'qù', pinyinBase: 'qu', tone: 4, english: 'to go', wordByWord: 'go', example: '我去学校。', hsk: 1 },
  { char: '大', pinyin: 'dà', pinyinBase: 'da', tone: 4, english: 'big / large', wordByWord: 'big', example: '中国很大。', hsk: 1 },
  { char: '不', pinyin: 'bù', pinyinBase: 'bu', tone: 4, english: 'not / no', wordByWord: 'not/no', example: '我不去。', hsk: 1 },
  { char: '爱', pinyin: 'ài', pinyinBase: 'ai', tone: 4, english: 'to love / love', wordByWord: 'love', example: '我爱你。', hsk: 1 },
  { char: '看', pinyin: 'kàn', pinyinBase: 'kan', tone: 4, english: 'to look / to watch', wordByWord: 'look/watch', example: '我看书。', hsk: 1 },
  { char: '叫', pinyin: 'jiào', pinyinBase: 'jiao', tone: 4, english: 'to be called / to call', wordByWord: 'called/call', example: '我叫小明。', hsk: 1 },
  { char: '对', pinyin: 'duì', pinyinBase: 'dui', tone: 4, english: 'correct / toward', wordByWord: 'correct', example: '对，没错！', hsk: 1 },
  { char: '用', pinyin: 'yòng', pinyinBase: 'yong', tone: 4, english: 'to use', wordByWord: 'use', example: '你用什么方法？', hsk: 2 },
  { char: '意', pinyin: 'yì', pinyinBase: 'yi', tone: 4, english: 'meaning / idea', wordByWord: 'meaning', example: '这是什么意思？', hsk: 2 },
  { char: '课', pinyin: 'kè', pinyinBase: 'ke', tone: 4, english: 'class / lesson', wordByWord: 'class', example: '今天有三节课。', hsk: 2 },
  { char: '汉', pinyin: 'hàn', pinyinBase: 'han', tone: 4, english: 'Han Chinese / Chinese', wordByWord: 'Han/Chinese', example: '汉字很有趣。', hsk: 2 },
  { char: '字', pinyin: 'zì', pinyinBase: 'zi', tone: 4, english: 'character / word', wordByWord: 'character', example: '这个字怎么写？', hsk: 2 },
]

export const DAILY_COUNT = 10

export function getDailyWords(): ToneWord[] {
  const seed = new Date().toDateString()
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i)
    hash >>>= 0  // keep unsigned 32-bit
  }
  // stable per-word weight to avoid clustering
  const weighted = TONE_WORDS.map((w, i) => ({
    word: w,
    weight: ((hash * 31 + i * 2654435761) >>> 0),
  }))
  weighted.sort((a, b) => a.weight - b.weight)
  return weighted.slice(0, DAILY_COUNT).map(w => w.word)
}

export function getRandomWords(count: number): ToneWord[] {
  return [...TONE_WORDS]
    .map(w => ({ w, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, count)
    .map(x => x.w)
}

export const TONE_INFO = {
  1: { symbol: '—', name: 'First Tone',   description: 'High and level',        color: '#ff6b6b', example: 'māma (妈妈)' },
  2: { symbol: '/',  name: 'Second Tone',  description: 'Rising, like a question', color: '#ffd93d', example: 'lái (来)' },
  3: { symbol: '∨', name: 'Third Tone',   description: 'Dipping, then rising',   color: '#6bcb77', example: 'nǐ (你)' },
  4: { symbol: '\\', name: 'Fourth Tone', description: 'Sharply falling',        color: '#4d96ff', example: 'shì (是)' },
} as const
