import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { ChevronRightIcon, ClockIcon, CoinIcon, PackageIcon, PhoneIcon, PinIcon, TrainIcon } from '@/components/icons'
import { DUMMY_EVENTS, DUMMY_USER } from '@/lib/dummy'

export default function HomePage() {
  const goalPct = Math.min(
    100,
    Math.round((DUMMY_USER.dailySteps / DUMMY_USER.dailyStepsGoal) * 100),
  )
  const stepsRemaining = Math.max(0, DUMMY_USER.dailyStepsGoal - DUMMY_USER.dailySteps)

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-cw-bg">
      <div className="flex flex-grow flex-col gap-5 overflow-y-auto px-5 py-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="font-heading text-xl font-bold">こんにちは、{DUMMY_USER.name}</div>
            <div className="text-sm text-cw-muted">9月22日（火）</div>
          </div>
          <Link
            href="/miles"
            aria-label="カルチャーマイルの残高を見る"
            className="flex items-center gap-1.5 rounded-full border border-cw-border bg-cw-surface px-3.5 py-2 text-sm font-bold text-cw-orange-dark"
          >
            <CoinIcon />
            {DUMMY_USER.mileBalance}マイル
          </Link>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-cw-surface p-5 shadow-sm">
          <div
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#E8734A 0% ${goalPct}%, #EDE7DA ${goalPct}% 100%)`,
            }}
          >
            <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-white">
              <span className="text-lg font-extrabold">{DUMMY_USER.dailySteps.toLocaleString()}</span>
              <span className="text-xs text-cw-muted">歩</span>
            </div>
          </div>
          <div className="flex flex-grow flex-col gap-1.5">
            <div className="text-sm text-cw-muted">今日の一歩</div>
            <div className="text-base font-bold">目標まであと{stepsRemaining.toLocaleString()}歩</div>
            <div className="w-fit rounded-full bg-cw-orange-soft px-2.5 py-1 text-sm font-bold text-cw-orange-dark">
              本日 +{DUMMY_USER.dailyMilesEarned} カルチャーマイル
            </div>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cw-teal" />
          <span className="font-heading text-lg font-bold">近くのおでかけ</span>
        </div>

        {DUMMY_EVENTS.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block overflow-hidden rounded-2xl border border-cw-border bg-cw-surface shadow-sm"
          >
            <div className={`flex h-28 items-center justify-center text-sm font-semibold ${event.imageColorClass}`}>
              {event.imageLabel}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="text-lg font-bold">{event.title}</div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-cw-teal-soft px-2.5 py-1 text-sm font-semibold text-cw-teal">
                  {event.accessMode === '徒歩' ? <PinIcon size={13} /> : <TrainIcon size={13} />}
                  {event.accessMode}
                  {event.accessMinutes}分
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-[#F3F1EA] px-2.5 py-1 text-sm font-semibold text-cw-muted">
                  <ClockIcon size={13} />
                  {event.datetimeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${event.hasMileDiscount ? 'text-cw-orange' : 'text-cw-muted'}`}>
                  {event.hasMileDiscount ? 'マイル割引で500円引き' : '通常価格でご案内'}
                </span>
                <ChevronRightIcon size={18} className="text-gray-400" />
              </div>
            </div>
          </Link>
        ))}

        <Link
          href={`/events/${DUMMY_EVENTS[0].id}`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-cw-teal px-4 py-4 text-base font-bold text-white"
        >
          <PackageIcon />
          初心者向けおでかけパックを見る
        </Link>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2.5 border-t border-[#F0E4D3] bg-[#FFF7EF] px-5 pb-4 pt-3.5">
        <div className="text-center text-sm text-cw-muted">デジタル操作でお困りですか？</div>
        <Link
          href="/support"
          className="flex items-center justify-center gap-2 rounded-2xl bg-cw-orange px-4 py-3.5 text-base font-bold text-white"
        >
          <PhoneIcon />
          ASAスタッフに相談する
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
