export type RoomType = 'entire' | 'private' | 'shared'
export type BedroomCount = 'studio' | '1br' | '2br' | '3br' | '4br+'

export interface MarketBaseline {
  city: string
  currency: string
  currencySymbol: string
  basePrice: Record<RoomType, Record<BedroomCount, number>>
  seasonalPeakMonths: number[] // 1-indexed months
  weekendMultiplier: number
}

export const MARKETS: Record<string, MarketBaseline> = {
  'New York': {
    city: 'New York',
    currency: 'USD',
    currencySymbol: '$',
    basePrice: {
      entire: { studio: 150, '1br': 220, '2br': 310, '3br': 430, '4br+': 580 },
      private: { studio: 80, '1br': 95, '2br': 110, '3br': 130, '4br+': 150 },
      shared: { studio: 45, '1br': 50, '2br': 55, '3br': 60, '4br+': 65 },
    },
    seasonalPeakMonths: [6, 7, 8, 12],
    weekendMultiplier: 1.28,
  },
  'London': {
    city: 'London',
    currency: 'GBP',
    currencySymbol: '£',
    basePrice: {
      entire: { studio: 130, '1br': 190, '2br': 270, '3br': 370, '4br+': 490 },
      private: { studio: 70, '1br': 85, '2br': 100, '3br': 115, '4br+': 135 },
      shared: { studio: 40, '1br': 45, '2br': 50, '3br': 55, '4br+': 60 },
    },
    seasonalPeakMonths: [6, 7, 8],
    weekendMultiplier: 1.25,
  },
  'Tokyo': {
    city: 'Tokyo',
    currency: 'JPY',
    currencySymbol: '¥',
    basePrice: {
      entire: { studio: 12000, '1br': 17000, '2br': 24000, '3br': 33000, '4br+': 45000 },
      private: { studio: 6000, '1br': 7500, '2br': 9000, '3br': 10500, '4br+': 12000 },
      shared: { studio: 3500, '1br': 4000, '2br': 4500, '3br': 5000, '4br+': 5500 },
    },
    seasonalPeakMonths: [3, 4, 10, 11],
    weekendMultiplier: 1.2,
  },
  'Paris': {
    city: 'Paris',
    currency: 'EUR',
    currencySymbol: '€',
    basePrice: {
      entire: { studio: 140, '1br': 200, '2br': 285, '3br': 395, '4br+': 530 },
      private: { studio: 75, '1br': 90, '2br': 105, '3br': 120, '4br+': 140 },
      shared: { studio: 42, '1br': 47, '2br': 52, '3br': 57, '4br+': 62 },
    },
    seasonalPeakMonths: [6, 7, 8],
    weekendMultiplier: 1.3,
  },
  'Sydney': {
    city: 'Sydney',
    currency: 'AUD',
    currencySymbol: 'A$',
    basePrice: {
      entire: { studio: 180, '1br': 250, '2br': 350, '3br': 470, '4br+': 620 },
      private: { studio: 90, '1br': 110, '2br': 130, '3br': 150, '4br+': 175 },
      shared: { studio: 50, '1br': 58, '2br': 65, '3br': 72, '4br+': 80 },
    },
    seasonalPeakMonths: [12, 1, 2],
    weekendMultiplier: 1.25,
  },
  'Toronto': {
    city: 'Toronto',
    currency: 'CAD',
    currencySymbol: 'C$',
    basePrice: {
      entire: { studio: 130, '1br': 185, '2br': 260, '3br': 360, '4br+': 480 },
      private: { studio: 68, '1br': 82, '2br': 96, '3br': 112, '4br+': 130 },
      shared: { studio: 38, '1br': 44, '2br': 49, '3br': 54, '4br+': 59 },
    },
    seasonalPeakMonths: [6, 7, 8],
    weekendMultiplier: 1.22,
  },
  'Los Angeles': {
    city: 'Los Angeles',
    currency: 'USD',
    currencySymbol: '$',
    basePrice: {
      entire: { studio: 140, '1br': 200, '2br': 285, '3br': 395, '4br+': 530 },
      private: { studio: 75, '1br': 90, '2br': 105, '3br': 120, '4br+': 140 },
      shared: { studio: 42, '1br': 47, '2br': 52, '3br': 57, '4br+': 62 },
    },
    seasonalPeakMonths: [6, 7, 8, 12],
    weekendMultiplier: 1.3,
  },
  'Miami': {
    city: 'Miami',
    currency: 'USD',
    currencySymbol: '$',
    basePrice: {
      entire: { studio: 160, '1br': 230, '2br': 320, '3br': 440, '4br+': 590 },
      private: { studio: 85, '1br': 100, '2br': 118, '3br': 138, '4br+': 160 },
      shared: { studio: 48, '1br': 54, '2br': 60, '3br': 66, '4br+': 72 },
    },
    seasonalPeakMonths: [1, 2, 3, 12],
    weekendMultiplier: 1.35,
  },
  'Barcelona': {
    city: 'Barcelona',
    currency: 'EUR',
    currencySymbol: '€',
    basePrice: {
      entire: { studio: 120, '1br': 175, '2br': 245, '3br': 340, '4br+': 455 },
      private: { studio: 65, '1br': 78, '2br': 92, '3br': 107, '4br+': 125 },
      shared: { studio: 36, '1br': 41, '2br': 46, '3br': 51, '4br+': 56 },
    },
    seasonalPeakMonths: [6, 7, 8],
    weekendMultiplier: 1.28,
  },
  'Singapore': {
    city: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    basePrice: {
      entire: { studio: 170, '1br': 240, '2br': 335, '3br': 460, '4br+': 615 },
      private: { studio: 88, '1br': 106, '2br': 125, '3br': 145, '4br+': 168 },
      shared: { studio: 50, '1br': 56, '2br': 63, '3br': 70, '4br+': 77 },
    },
    seasonalPeakMonths: [12, 1, 6, 7],
    weekendMultiplier: 1.2,
  },
}

export const CITY_LIST = Object.keys(MARKETS)
