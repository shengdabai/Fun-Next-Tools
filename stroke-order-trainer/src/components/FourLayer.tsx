import { CharacterData } from '@/data/characters'

interface Props {
  data: CharacterData
}

export default function FourLayer({ data }: Props) {
  return (
    <div className="four-layer animate-in">
      <div className="layer-chinese">{data.char}</div>
      <div className="layer-pinyin">{data.pinyin}</div>
      <div className="layer-wbw">「{data.wordByWord}」</div>
      <div className="layer-english">{data.english}</div>
    </div>
  )
}
