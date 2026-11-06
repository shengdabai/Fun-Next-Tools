import { MARKETS, RoomType, BedroomCount } from '@/data/markets'

export interface PropertyInput {
  city: string
  roomType: RoomType
  bedrooms: BedroomCount
  maxGuests: number
  amenities: string[]
  qualityRating: number // 1-5
}

export interface OccupancyScenario {
  rate: number
  label: string
  monthlyRevenue: number
  annualRevenue: number
}

export interface RadarScore {
  dimension: string
  score: number // 0-100
}

export interface PriceTip {
  icon: string
  text: string
}

export interface PriceAnalysis {
  recommendedNightly: number
  conservativeNightly: number
  aggressiveNightly: number
  weekendPrice: number
  peakSeasonPrice: number
  offSeasonPrice: number
  currencySymbol: string
  currency: string
  occupancyScenarios: OccupancyScenario[]
  tips: PriceTip[]
  radarScores: RadarScore[]
}

const AMENITY_MULTIPLIERS: Record<string, number> = {
  Pool: 0.18,
  'Beach Access': 0.22,
  Balcony: 0.1,
  Gym: 0.07,
  AC: 0.06,
  Parking: 0.08,
  Kitchen: 0.05,
  WiFi: 0.03,
  Workspace: 0.05,
  'Pet-friendly': 0.04,
}

const QUALITY_MULTIPLIERS: Record<number, number> = {
  1: 0.7,
  2: 0.85,
  3: 1.0,
  4: 1.15,
  5: 1.3,
}

const GUEST_MULTIPLIERS: Record<string, number> = {
  '1-2': 1.0,
  '3-4': 1.08,
  '5-6': 1.18,
  '7-10': 1.3,
  '11+': 1.45,
}

const ROOM_TYPES: RoomType[] = ['entire', 'private', 'shared']
const BEDROOM_COUNTS: BedroomCount[] = ['studio', '1br', '2br', '3br', '4br+']
export const MIN_GUESTS = 1
export const MAX_GUESTS = 16

// Validate a value restored from localStorage. Only fields that are valid for
// the current market data are returned; anything else is dropped so stale or
// corrupted storage cannot crash the page or produce NaN prices.
export function sanitizeSavedInput(raw: unknown): Partial<PropertyInput> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
  const value = raw as Record<string, unknown>
  const clean: Partial<PropertyInput> = {}
  if (typeof value.city === 'string' && Object.prototype.hasOwnProperty.call(MARKETS, value.city)) {
    clean.city = value.city
  }
  if (ROOM_TYPES.includes(value.roomType as RoomType)) clean.roomType = value.roomType as RoomType
  if (BEDROOM_COUNTS.includes(value.bedrooms as BedroomCount)) clean.bedrooms = value.bedrooms as BedroomCount
  if (
    typeof value.maxGuests === 'number' &&
    Number.isInteger(value.maxGuests) &&
    value.maxGuests >= MIN_GUESTS &&
    value.maxGuests <= MAX_GUESTS
  ) {
    clean.maxGuests = value.maxGuests
  }
  if (Array.isArray(value.amenities)) {
    clean.amenities = value.amenities.filter(
      (a, i, all): a is string =>
        typeof a === 'string' &&
        Object.prototype.hasOwnProperty.call(AMENITY_MULTIPLIERS, a) &&
        all.indexOf(a) === i,
    )
  }
  if (
    typeof value.qualityRating === 'number' &&
    Object.prototype.hasOwnProperty.call(QUALITY_MULTIPLIERS, value.qualityRating)
  ) {
    clean.qualityRating = value.qualityRating
  }
  return clean
}

function getGuestMultiplier(maxGuests: number): number {
  if (maxGuests <= 2) return GUEST_MULTIPLIERS['1-2']
  if (maxGuests <= 4) return GUEST_MULTIPLIERS['3-4']
  if (maxGuests <= 6) return GUEST_MULTIPLIERS['5-6']
  if (maxGuests <= 10) return GUEST_MULTIPLIERS['7-10']
  return GUEST_MULTIPLIERS['11+']
}

export function calculatePrice(input: PropertyInput): PriceAnalysis {
  const market = MARKETS[input.city]
  if (!market) throw new Error(`Unknown city: ${input.city}`)

  const base = market.basePrice[input.roomType]?.[input.bedrooms]
  if (typeof base !== 'number') {
    throw new Error(`Unknown room configuration: ${input.roomType} / ${input.bedrooms}`)
  }

  // Amenity multiplier
  let amenityBonus = 0
  for (const amenity of input.amenities) {
    amenityBonus += AMENITY_MULTIPLIERS[amenity] ?? 0
  }
  const amenityMultiplier = 1 + Math.min(amenityBonus, 0.6) // cap at 60%

  // Quality multiplier
  const qualityMultiplier = QUALITY_MULTIPLIERS[input.qualityRating] ?? 1.0

  // Guest multiplier
  const guestMultiplier = getGuestMultiplier(input.maxGuests)

  const recommended = Math.round(base * amenityMultiplier * qualityMultiplier * guestMultiplier)
  const conservative = Math.round(recommended * 0.85)
  const aggressive = Math.round(recommended * 1.2)
  const weekendPrice = Math.round(recommended * market.weekendMultiplier)
  const peakSeasonPrice = Math.round(recommended * 1.4)
  const offSeasonPrice = Math.round(recommended * 0.82)

  // Occupancy scenarios
  const occupancyScenarios: OccupancyScenario[] = [0.6, 0.7, 0.8].map((rate) => {
    const monthly = Math.round(recommended * rate * 30)
    return {
      rate,
      label: rate === 0.6 ? 'Conservative' : rate === 0.7 ? 'Moderate' : 'Optimistic',
      monthlyRevenue: monthly,
      annualRevenue: monthly * 12,
    }
  })

  // Tips
  const tips: PriceTip[] = generateTips(input)

  // Radar scores
  const radarScores = generateRadarScores(input, amenityBonus)

  return {
    recommendedNightly: recommended,
    conservativeNightly: conservative,
    aggressiveNightly: aggressive,
    weekendPrice,
    peakSeasonPrice,
    offSeasonPrice,
    currencySymbol: market.currencySymbol,
    currency: market.currency,
    occupancyScenarios,
    tips,
    radarScores,
  }
}

function generateTips(input: PropertyInput): PriceTip[] {
  const tips: PriceTip[] = []

  if (input.amenities.includes('Pool')) {
    tips.push({ icon: '🏊', text: 'Your pool is a major asset — highlight it in photos and the first line of your description.' })
  }
  if (input.amenities.includes('Beach Access')) {
    tips.push({ icon: '🏖️', text: 'Beach access commands a premium — mention walking distance to the beach prominently.' })
  }
  if (input.qualityRating >= 4) {
    tips.push({ icon: '⭐', text: 'High-quality listings can charge more — ensure your photos are professional-grade.' })
  }
  if (input.qualityRating <= 2) {
    tips.push({ icon: '📸', text: 'Upgrading photos and adding amenities could raise your nightly rate by 20-30%.' })
  }
  if (!input.amenities.includes('WiFi')) {
    tips.push({ icon: '📶', text: 'Adding fast WiFi (and advertising the speed) is one of the cheapest ways to raise your rate.' })
  }
  if (input.roomType === 'entire') {
    tips.push({ icon: '🗓️', text: 'Offer a 7-night discount (10-15%) to boost occupancy during slow periods.' })
  }
  if (input.maxGuests >= 6) {
    tips.push({ icon: '👨‍👩‍👧‍👦', text: 'Market to groups and families — highlight large common areas and nearby group activities.' })
  }
  if (!input.amenities.includes('Workspace')) {
    tips.push({ icon: '💻', text: 'Adding a dedicated workspace attracts remote workers who book longer stays.' })
  }

  // Always add a seasonal tip
  tips.push({ icon: '📅', text: 'Adjust prices at least 2 weeks before peak season — early-bird rates fill your calendar faster.' })

  return tips.slice(0, 5)
}

function generateRadarScores(input: PropertyInput, amenityBonus: number): RadarScore[] {
  const priceScore = Math.min(100, Math.round(input.qualityRating * 18 + amenityBonus * 40))
  const amenityScore = Math.min(100, Math.round((input.amenities.length / 10) * 100))
  const roomScore =
    input.roomType === 'entire'
      ? { studio: 60, '1br': 70, '2br': 80, '3br': 88, '4br+': 95 }[input.bedrooms]
      : input.roomType === 'private'
      ? 50
      : 30
  const locationScore = Math.round(
    (input.amenities.includes('Beach Access') ? 95 : input.amenities.includes('Balcony') ? 78 : 65)
  )
  const ratingScore = Math.round(input.qualityRating * 20)

  return [
    { dimension: 'Price Value', score: priceScore },
    { dimension: 'Amenities', score: amenityScore },
    { dimension: 'Space', score: roomScore },
    { dimension: 'Location', score: locationScore },
    { dimension: 'Quality', score: ratingScore },
  ]
}

export function formatCurrency(amount: number, currencySymbol: string): string {
  if (amount >= 1000) {
    return `${currencySymbol}${amount.toLocaleString()}`
  }
  return `${currencySymbol}${amount}`
}
