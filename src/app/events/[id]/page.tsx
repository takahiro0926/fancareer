import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ClockIcon, PeopleIcon, PhoneIcon, PinIcon } from '@/components/icons'
import { getEventById } from '@/lib/dummy'
import { DiscountToggle } from './DiscountToggle'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = getEventById(params.id)
  if (!event) notFound()

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-cw-bg">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-cw-border bg-cw-surface px-5 py-4">
        <Link href="/" aria-label="ホームに戻る">
          <ArrowLeftIcon />
        </Link>
        <span className="font-heading text-lg font-bold">イベント詳細</span>
      </div>

      <div className="flex flex-grow flex-col overflow-y-auto">
        <div className={`flex h-44 items-center justify-center text-base font-semibold ${event.imageColorClass}`}>
          {event.imageLabel}
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-2.5">
            <div className="font-heading text-2xl font-bold">{event.title}</div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-cw-teal-soft px-2.5 py-1.5 text-sm font-semibold text-cw-teal">
                {event.accessMode === '徒歩' ? <PinIcon size={13} /> : null}
                {event.accessMode}
                {event.accessMinutes}分
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-[#F3F1EA] px-2.5 py-1.5 text-sm font-semibold text-cw-muted">
                <ClockIcon size={13} />
                {event.datetimeLabel}
              </span>
            </div>
          </div>

          <DiscountToggle
            priceNormal={event.priceNormal}
            discountAmount={event.discountAmount}
            hasMileDiscount={event.hasMileDiscount}
          />

          {event.packTicketArranged && (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#DCD3EC] bg-[#F5F2FA] p-[18px]">
              <div className="text-base font-bold text-[#5B4C8A]">初心者向け おでかけパックに含まれるもの</div>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <PinIcon size={16} className="text-[#5B4C8A]" />
                  歩数の目安（約{event.packWalkMinutes}分）と、ゆっくり歩ける道順のご案内
                </div>
                <div className="flex items-center gap-2.5">
                  <ClockIcon size={16} className="text-[#5B4C8A]" />
                  途中で休める休憩スポット（{event.packRestSpots.join('、')}）
                </div>
                <div className="flex items-center gap-2.5">
                  <PeopleIcon size={16} className="text-[#5B4C8A]" />
                  チケットの手配はスタッフにおまかせ
                </div>
              </div>
            </div>
          )}

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-cw-border bg-cw-surface px-4 py-3.5 text-base font-bold">
            <PeopleIcon />
            お友達を誘って一緒に行く
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[#F0E4D3] bg-[#FFF7EF] px-5 pb-[18px] pt-3.5">
        <Link
          href="/support"
          className="flex items-center justify-center gap-2 rounded-2xl bg-cw-orange px-4 py-3.5 text-base font-bold text-white"
        >
          <PhoneIcon />
          ASAスタッフに相談する
        </Link>
      </div>
    </div>
  )
}
