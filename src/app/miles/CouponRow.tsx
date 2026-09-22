'use client'

import { useState } from 'react'
import { CheckIcon, TicketIcon } from '@/components/icons'
import type { CwCoupon } from '@/types'

export function CouponRow({
  coupon,
  userMileBalance,
}: {
  coupon: CwCoupon
  userMileBalance: number
}) {
  const [redeemed, setRedeemed] = useState(false)
  const canRedeem = userMileBalance >= coupon.requiredMiles

  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border p-[18px] ${
        canRedeem ? 'border-cw-border bg-cw-surface' : 'border-cw-border bg-[#F3F1EA] opacity-60'
      }`}
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
          canRedeem ? 'bg-cw-orange-soft text-cw-orange' : 'bg-[#E7E2D6] text-gray-400'
        }`}
      >
        <TicketIcon size={22} />
      </div>
      <div className="flex flex-grow flex-col gap-0.5">
        <div className={`text-base font-bold ${canRedeem ? '' : 'text-cw-muted'}`}>{coupon.title}</div>
        <div className={`text-sm ${canRedeem ? 'text-cw-muted' : 'text-gray-400'}`}>
          {canRedeem
            ? `${coupon.requiredMiles}マイルと交換`
            : `${coupon.requiredMiles}マイル必要（あと${coupon.requiredMiles - userMileBalance}マイル）`}
        </div>
      </div>
      {redeemed ? (
        <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-bold text-cw-teal">
          <CheckIcon size={16} />
          交換済み
        </div>
      ) : (
        <button
          onClick={() => setRedeemed(true)}
          disabled={!canRedeem}
          className={`flex-shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${
            canRedeem ? 'bg-cw-teal text-white' : 'cursor-not-allowed bg-[#E7E2D6] text-gray-400'
          }`}
        >
          交換する
        </button>
      )}
    </div>
  )
}
