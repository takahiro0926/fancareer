export type AccessMode = '徒歩' | '電車'

export interface CwUser {
  id: string
  name: string
  mileBalance: number
  dailySteps: number
  dailyStepsGoal: number
  dailyMilesEarned: number
}

export interface CwEvent {
  id: string
  title: string
  imageLabel: string
  imageColorClass: string
  accessMode: AccessMode
  accessMinutes: number
  datetimeLabel: string
  priceNormal: number
  discountAmount: number
  hasMileDiscount: boolean
  packWalkMinutes: number
  packRestSpots: string[]
  packTicketArranged: boolean
}

export interface CwCoupon {
  id: string
  title: string
  requiredMiles: number
  discountAmount: number
}

export interface AsaStore {
  name: string
  address: string
  businessHours: string
  phoneNumber: string
}

export interface SurveyAnswer {
  label: string
  percentage: number
}

export interface SamplingRecord {
  productName: string
  distributedCount: number
  awarenessChangePt: number
}

export interface Promotion {
  title: string
  type: 'バナー広告' | 'ウォークラリー' | '交換クーポン'
  status: '掲出中' | '準備中'
  period: string
}
