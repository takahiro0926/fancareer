import Link from 'next/link'
import { HomeIcon, SearchIcon, UserIcon } from './icons'

export function BottomNav() {
  return (
    <div className="flex flex-shrink-0 border-t border-cw-border bg-cw-surface py-2.5">
      <Link
        href="/"
        className="flex flex-1 flex-col items-center gap-1 text-cw-teal"
      >
        <HomeIcon />
        <span className="text-xs font-bold">ホーム</span>
      </Link>
      <div className="flex flex-1 flex-col items-center gap-1 text-gray-400">
        <SearchIcon />
        <span className="text-xs">イベントを探す</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1 text-gray-400">
        <UserIcon />
        <span className="text-xs">マイページ</span>
      </div>
    </div>
  )
}
