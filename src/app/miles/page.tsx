import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons'
import { DUMMY_COUPONS, DUMMY_USER } from '@/lib/dummy'
import { CouponRow } from './CouponRow'

export default function MilesPage() {
  const nextCoupon = DUMMY_COUPONS.find((coupon) => coupon.requiredMiles > DUMMY_USER.mileBalance)
  const progressPct = nextCoupon
    ? Math.min(100, Math.round((DUMMY_USER.mileBalance / nextCoupon.requiredMiles) * 100))
    : 100
  const milesToNext = nextCoupon ? nextCoupon.requiredMiles - DUMMY_USER.mileBalance : 0

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-cw-bg">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-cw-border bg-cw-surface px-5 py-4">
        <Link href="/" aria-label="ホームに戻る">
          <ArrowLeftIcon />
        </Link>
        <span className="font-heading text-lg font-bold">カルチャーマイル</span>
      </div>

      <div className="flex flex-grow flex-col gap-5 overflow-y-auto px-5 py-[22px]">
        <div className="flex flex-col gap-2.5 rounded-2xl bg-gradient-to-br from-cw-teal to-[#24594E] p-6 text-white">
          <div className="text-sm opacity-85">現在のマイル残高</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold">{DUMMY_USER.mileBalance}</span>
            <span className="text-base font-bold">マイル</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white" style={{ width: `${progressPct}%` }} />
          </div>
          {nextCoupon && (
            <div className="text-sm opacity-90">あと{milesToNext}マイルで{nextCoupon.title}</div>
          )}
        </div>

        <div className="font-heading text-lg font-bold">マイルと交換できるクーポン</div>

        {DUMMY_COUPONS.map((coupon) => (
          <CouponRow key={coupon.id} coupon={coupon} userMileBalance={DUMMY_USER.mileBalance} />
        ))}
      </div>
    </div>
  )
}
