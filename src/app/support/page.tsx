import Link from 'next/link'
import { ArrowLeftIcon, PhoneIcon, PinIcon, QrPlaceholderIcon } from '@/components/icons'
import { DUMMY_ASA_STORE } from '@/lib/dummy'

export default function SupportPage() {
  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-cw-bg">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-cw-border bg-cw-surface px-5 py-4">
        <Link href="/" aria-label="ホームに戻る">
          <ArrowLeftIcon />
        </Link>
        <span className="font-heading text-lg font-bold">対面サポート</span>
      </div>

      <div className="flex flex-grow flex-col gap-6 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-cw-surface px-6 py-7 shadow-sm">
          <div className="flex h-[152px] w-[152px] items-center justify-center rounded-2xl border-2 border-cw-border">
            <QrPlaceholderIcon />
          </div>
          <div className="text-sm text-gray-400">QRコード（サンプル）</div>
          <div className="text-center font-heading text-lg font-bold">
            この画面をASA店舗の
            <br />
            スタッフにお見せください
          </div>
          <div className="text-center text-sm leading-7 text-cw-muted">
            チケットのお申し込みや操作を、
            <br />
            お店の担当者がその場でお手伝いします。
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-grow bg-cw-border" />
          <span className="text-sm text-gray-400">または</span>
          <div className="h-px flex-grow bg-cw-border" />
        </div>

        <a
          href={`tel:${DUMMY_ASA_STORE.phoneNumber}`}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-cw-orange px-4 py-[18px] text-lg font-bold text-white"
        >
          <PhoneIcon size={22} />
          電話で相談する
        </a>

        <div className="flex flex-col gap-2.5 rounded-2xl border border-cw-border bg-cw-surface p-[18px]">
          <div className="flex items-center gap-2 text-base font-bold">
            <PinIcon size={16} className="text-cw-teal" />
            最寄りのASA店舗
          </div>
          <div className="text-base font-semibold">{DUMMY_ASA_STORE.name}</div>
          <div className="text-sm leading-6 text-cw-muted">
            {DUMMY_ASA_STORE.address}
            <br />
            営業時間：{DUMMY_ASA_STORE.businessHours}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-5 pb-[18px] pt-3.5">
        <Link href="/" className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-cw-muted">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
