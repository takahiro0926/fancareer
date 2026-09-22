import type {
  AsaStore,
  CwCoupon,
  CwEvent,
  CwUser,
  Promotion,
  SamplingRecord,
  SurveyAnswer,
} from '@/types'

export const DUMMY_USER: CwUser = {
  id: 'u1',
  name: '田中さん',
  mileBalance: 320,
  dailySteps: 6200,
  dailyStepsGoal: 8000,
  dailyMilesEarned: 62,
}

export const DUMMY_EVENTS: CwEvent[] = [
  {
    id: 'e1',
    title: '第九面福亭寄席',
    imageLabel: '［ 写真 ］寄席の様子',
    imageColorClass: 'bg-[#DCEEE9] text-cw-teal',
    accessMode: '徒歩',
    accessMinutes: 18,
    datetimeLabel: '9/28（日）14:00',
    priceNormal: 2500,
    discountAmount: 500,
    hasMileDiscount: true,
    packWalkMinutes: 20,
    packRestSpots: ['〇〇公園休憩所', '△△茶屋'],
    packTicketArranged: true,
  },
  {
    id: 'e2',
    title: '近代美術館 特別展',
    imageLabel: '［ 写真 ］特別展の様子',
    imageColorClass: 'bg-[#E6E1F2] text-[#5B4C8A]',
    accessMode: '電車',
    accessMinutes: 12,
    datetimeLabel: '10/3（土）〜',
    priceNormal: 1800,
    discountAmount: 0,
    hasMileDiscount: false,
    packWalkMinutes: 15,
    packRestSpots: ['美術館内カフェ'],
    packTicketArranged: true,
  },
]

export function getEventById(id: string): CwEvent | undefined {
  return DUMMY_EVENTS.find((event) => event.id === id)
}

export const DUMMY_COUPONS: CwCoupon[] = [
  { id: 'c1', title: '500円引きクーポン', requiredMiles: 200, discountAmount: 500 },
  { id: 'c2', title: '1,000円引きクーポン', requiredMiles: 500, discountAmount: 1000 },
]

export const DUMMY_ASA_STORE: AsaStore = {
  name: '朝日新聞 ASA〇〇本店',
  address: '〇〇区〇〇町1-2-3',
  businessHours: '9:00〜18:00（土日祝も対応）',
  phoneNumber: '0120000000',
}

export const DUMMY_KPI = {
  activeUsers: 12480,
  activeUsersDeltaPct: 8.2,
  checkins: 3210,
  checkinsDeltaPct: 5.6,
  surveyResponses: 1860,
  surveyResponseRatePct: 62,
  samplesDistributed: 640,
  sampleVenueCount: 12,
}

export const DUMMY_SURVEY = {
  question: '今回のイベント参加後、外出する頻度は増えたと感じますか',
  n: 1860,
  answers: [
    { label: 'とても増えた', percentage: 38 },
    { label: 'やや増えた', percentage: 34 },
    { label: '変わらない', percentage: 18 },
    { label: 'やや減った', percentage: 6 },
    { label: '減った', percentage: 4 },
  ] satisfies SurveyAnswer[],
}

export const DUMMY_SAMPLING: SamplingRecord[] = [
  { productName: '○○胃腸薬', distributedCount: 320, awarenessChangePt: 12 },
  { productName: '△△青汁', distributedCount: 180, awarenessChangePt: 9 },
  { productName: '□□サプリメント', distributedCount: 140, awarenessChangePt: 6 },
]

export const DUMMY_PROMOTIONS: Promotion[] = [
  {
    title: 'トップページ バナー「秋の特別展キャンペーン」',
    type: 'バナー広告',
    status: '掲出中',
    period: '9/1〜9/30',
  },
  {
    title: '冠ウォークラリー「〇〇健康ウォーク」',
    type: 'ウォークラリー',
    status: '掲出中',
    period: '9/10〜10/10',
  },
  {
    title: 'マイル交換クーポン「秋の500円引き」',
    type: '交換クーポン',
    status: '準備中',
    period: '10/1〜開始予定',
  },
]
