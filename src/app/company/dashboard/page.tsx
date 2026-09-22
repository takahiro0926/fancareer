import {
  BarChartIcon,
  CalendarIcon,
  ChevronRightIcon,
  DownloadIcon,
  FlaskIcon,
  GearIcon,
  MegaphoneIcon,
  PlusIcon,
  TrendUpIcon,
} from '@/components/icons'
import { DUMMY_KPI, DUMMY_PROMOTIONS, DUMMY_SAMPLING, DUMMY_SURVEY } from '@/lib/dummy'

const barColors = ['#2F7A6B', '#4F9686', '#B9C2B4', '#D8C3AE', '#E8734A']

export default function CompanyDashboardPage() {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#F5F3ED] text-cw-ink">
      <div className="flex w-60 flex-shrink-0 flex-col gap-7 bg-cw-navy px-[18px] py-7 text-white">
        <div className="flex flex-col gap-0.5 px-1.5">
          <div className="font-heading text-lg font-bold">カルチャーウォーク</div>
          <div className="text-xs text-cw-navy-soft">B2B協賛企業ダッシュボード</div>
        </div>
        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-3 rounded-[10px] bg-cw-teal px-3.5 py-2.5 text-sm font-semibold text-white">
            <BarChartIcon />
            インサイト分析
          </div>
          <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold text-gray-300">
            <FlaskIcon />
            サンプリング効果
          </div>
          <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold text-gray-300">
            <MegaphoneIcon />
            広告・イベント管理
          </div>
          <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold text-gray-300">
            <GearIcon />
            設定
          </div>
        </nav>
      </div>

      <div className="flex flex-grow flex-col overflow-hidden">
        <div className="flex h-[76px] flex-shrink-0 items-center justify-between border-b border-[#E7E2D6] bg-white px-8">
          <div className="flex flex-col gap-0.5">
            <div className="font-heading text-lg font-bold">インサイト分析ダッシュボード</div>
            <div className="text-sm text-cw-muted">〇〇製薬株式会社 様</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-[10px] border border-[#E7E2D6] bg-[#F5F3ED] px-3.5 py-2.5 text-sm font-semibold">
              <CalendarIcon />
              2026年9月
            </div>
            <button className="flex items-center gap-2 rounded-[10px] bg-cw-teal px-4 py-2.5 text-sm font-bold text-white">
              <DownloadIcon />
              レポート出力
            </button>
          </div>
        </div>

        <div className="flex flex-grow flex-col gap-6 overflow-y-auto px-8 py-7">
          <div className="grid grid-cols-4 gap-[18px]">
            <KpiCard label="アクティブユーザー数" value={DUMMY_KPI.activeUsers} unit="人" delta={`前月比 +${DUMMY_KPI.activeUsersDeltaPct}%`} />
            <KpiCard label="イベント会場チェックイン" value={DUMMY_KPI.checkins} unit="件" delta={`前月比 +${DUMMY_KPI.checkinsDeltaPct}%`} />
            <KpiCard
              label="行動連動アンケート回答数"
              value={DUMMY_KPI.surveyResponses}
              unit="件"
              delta={`回答率 ${DUMMY_KPI.surveyResponseRatePct}%`}
            />
            <KpiCard
              label="サンプリング配布数"
              value={DUMMY_KPI.samplesDistributed}
              unit="個"
              delta={`対象会場 ${DUMMY_KPI.sampleVenueCount}箇所`}
              muted
            />
          </div>

          <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#E7E2D6] bg-white p-[22px]">
              <div className="flex flex-col gap-1">
                <div className="font-heading text-base font-bold">行動連動シニアインサイト</div>
                <div className="text-xs text-cw-muted">
                  Q. {DUMMY_SURVEY.question}（n={DUMMY_SURVEY.n.toLocaleString()}）
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {DUMMY_SURVEY.answers.map((answer, i) => (
                  <div key={answer.label} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 text-sm text-gray-600">{answer.label}</div>
                    <div className="h-3.5 flex-grow overflow-hidden rounded-full bg-[#F0EEE6]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${answer.percentage}%`, backgroundColor: barColors[i] }}
                      />
                    </div>
                    <div className="w-9 text-right text-sm font-bold">{answer.percentage}%</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F0EEE6] pt-3 text-xs text-gray-400">
                匿名化済みの行動ログ（歩数・来場履歴）とアンケート回答を突合した集計です。個人を特定できない単位で表示しています。
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-[#E7E2D6] bg-white p-[22px]">
              <div className="flex flex-col gap-1">
                <div className="font-heading text-base font-bold">サンプリング＆効果測定トラッカー</div>
                <div className="text-xs text-cw-muted">会場での手渡しサンプリング後の追跡結果</div>
              </div>
              <div className="flex flex-col overflow-hidden rounded-xl border border-[#EFEDE6]">
                <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-[#F7F5F0] px-3 py-2.5 text-[11px] font-bold text-cw-muted">
                  <div>商品名</div>
                  <div>配布数</div>
                  <div>認知度変化</div>
                </div>
                {DUMMY_SAMPLING.map((row) => (
                  <div
                    key={row.productName}
                    className="grid grid-cols-[1.6fr_1fr_1fr] items-center border-t border-[#F0EEE6] px-3 py-3 text-sm"
                  >
                    <div className="font-semibold">{row.productName}</div>
                    <div>{row.distributedCount}個</div>
                    <div className="font-bold text-cw-teal">+{row.awarenessChangePt}pt</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400">認知度変化＝配布前後の「知っている」回答率の差分</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[#E7E2D6] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="font-heading text-base font-bold">アプリ内広告・冠イベント管理</div>
                <div className="text-xs text-cw-muted">バナー掲出、ウォークラリー、マイル交換クーポンの状況</div>
              </div>
              <button className="flex items-center gap-2 rounded-[10px] bg-cw-teal px-4 py-2.5 text-sm font-bold text-white">
                <PlusIcon />
                新しい掲出を作成
              </button>
            </div>
            <div className="flex flex-col">
              {DUMMY_PROMOTIONS.map((promo) => (
                <div key={promo.title} className="flex items-center gap-4 border-t border-[#F0EEE6] py-3.5">
                  <div className="w-[90px] flex-shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        promo.status === '掲出中' ? 'bg-[#E6F4EE] text-[#1F7A52]' : 'bg-[#EFEDE6] text-cw-muted'
                      }`}
                    >
                      {promo.status}
                    </span>
                  </div>
                  <div className="flex-grow text-sm font-semibold">{promo.title}</div>
                  <div className="w-[110px] text-sm text-cw-muted">{promo.type}</div>
                  <div className="w-[140px] text-sm text-cw-muted">{promo.period}</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-cw-teal">
                    編集
                    <ChevronRightIcon size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  muted,
}: {
  label: string
  value: number
  unit: string
  delta: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#E7E2D6] bg-white p-5">
      <div className="text-sm text-cw-muted">{label}</div>
      <div className="text-2xl font-extrabold">
        {value.toLocaleString()}
        <span className="text-sm font-semibold">{unit}</span>
      </div>
      <div className={`flex items-center gap-1.5 text-xs font-bold ${muted ? 'text-cw-muted' : 'text-cw-teal'}`}>
        {!muted && <TrendUpIcon size={13} />}
        {delta}
      </div>
    </div>
  )
}
