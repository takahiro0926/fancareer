'use client'

import { useState } from 'react'
import { CheckIcon, CoinIcon } from '@/components/icons'

export function DiscountToggle({
  priceNormal,
  discountAmount,
  hasMileDiscount,
}: {
  priceNormal: number
  discountAmount: number
  hasMileDiscount: boolean
}) {
  const [applied, setApplied] = useState(false)

  if (!hasMileDiscount) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-cw-border bg-cw-surface p-[18px]">
        <div className="text-2xl font-extrabold">{priceNormal.toLocaleString()}円</div>
        <div className="text-sm text-cw-muted">このイベントはマイル割引の対象外です</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cw-border bg-cw-surface p-[18px]">
      {applied ? (
        <>
          <div className="flex items-baseline gap-2.5">
            <span className="text-base text-gray-400 line-through">{priceNormal.toLocaleString()}円</span>
            <span className="text-[26px] font-extrabold text-cw-orange">
              {(priceNormal - discountAmount).toLocaleString()}円
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-cw-teal">
            <CheckIcon size={16} />
            マイル割引（{discountAmount}円分）を適用しました
          </div>
          <button
            onClick={() => setApplied(false)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-cw-teal bg-cw-teal-soft px-4 py-3.5 text-base font-bold text-cw-teal"
          >
            割引の適用をやめる
          </button>
        </>
      ) : (
        <>
          <div className="text-[26px] font-extrabold">{priceNormal.toLocaleString()}円</div>
          <div className="text-sm text-cw-muted">貯めたマイルを使うと、今すぐ{discountAmount}円引きになります</div>
          <button
            onClick={() => setApplied(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cw-orange px-4 py-3.5 text-base font-bold text-white"
          >
            <CoinIcon size={18} />
            貯めたマイルを割引に使う（▲{discountAmount}円）
          </button>
        </>
      )}
    </div>
  )
}
