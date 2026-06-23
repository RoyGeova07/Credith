import { useEffect, useState } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'
import { Get } from '@/helpers/fetcher'
import './DashboardHomePage.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(v) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        maximumFractionDigits: 0,
    }).format(Number(v || 0))
}

function fmtShort(v) {
    const n = Number(v || 0)
    if (n >= 1_000_000) return `L${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `L${(n / 1_000).toFixed(0)}K`
    return `L${n.toFixed(0)}`
}

function fmtDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getLast6Months() {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            label: d.toLocaleString('es', { month: 'short' }),
        })
    }
    return months
}

function toIsoDate(d) {
    return d.toISOString().slice(0, 10)
}

function getRangeDates(daysBack) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - daysBack + 1)
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

function buildDailyData(rows) {
    return rows.map(({ date, grossGain, netGain }) => {
        const d = new Date(date + 'T00:00:00')
        return {
            label: d.toLocaleDateString('es', { day: '2-digit', month: 'short' }),
            gross: grossGain,
            net: netGain,
        }
    })
}

function buildWeeklyData(rows) {
    const weeks = new Map()
    for (const { date, grossGain, netGain } of rows) {
        const d = new Date(date + 'T00:00:00')
        const dow = d.getDay() === 0 ? 7 : d.getDay()
        const mon = new Date(d)
        mon.setDate(d.getDate() - dow + 1)
        const key = toIsoDate(mon)
        const w = weeks.get(key) ?? { gross: 0, net: 0, mon }
        w.gross += grossGain
        w.net += netGain
        weeks.set(key, w)
    }
    return [...weeks.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, { gross, net, mon }]) => ({
            label: mon.toLocaleDateString('es', { day: '2-digit', month: 'short' }),
            gross,
            net,
        }))
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, trend, trendLabel, loading }) {
    const isPositive = (trend ?? 0) >= 0

    return (
        <div className="dash-metric-card">
            <p className="dash-metric-label">{label}</p>
            {loading
                ? <div className="dash-skeleton dash-metric-skeleton" />
                : <p className="dash-metric-value">{value}</p>
            }
            {trend !== undefined && !loading && (
                <p className={`dash-metric-trend ${isPositive ? 'dash-metric-trend--up' : 'dash-metric-trend--down'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% {trendLabel}
                </p>
            )}
        </div>
    )
}

// ─── RevenueChart (Recharts) ──────────────────────────────────────────────────

const CHART_TABS = ['Meses', 'Semanas', 'Dias']

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="dash-chart-tooltip">
            <p className="dash-tooltip-label">{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === 'gross' ? 'Bruto' : 'Neto'}: {fmtCurrency(p.value)}
                </p>
            ))}
        </div>
    )
}

function RevenueChart({ monthly, weekly, daily, loading }) {
    const [tab, setTab] = useState(0)

    const data = tab === 0 ? monthly : tab === 1 ? weekly : daily

    function renderBody() {
        if (loading) return <div className="dash-skeleton dash-chart-skeleton" />
        if (!data.length) return <div className="dash-chart-unavailable">Sin datos disponibles</div>

        return (
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="dh-grad-gross" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#1f8b3c" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#1f8b3c" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="dh-grad-net" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3483d1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3483d1" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={fmtShort}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="gross"
                        stroke="#1f8b3c"
                        strokeWidth={2.5}
                        fill="url(#dh-grad-gross)"
                        dot={{ r: 4, fill: '#fff', stroke: '#1f8b3c', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="net"
                        stroke="#3483d1"
                        strokeWidth={2.5}
                        fill="url(#dh-grad-net)"
                        dot={{ r: 4, fill: '#fff', stroke: '#3483d1', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        )
    }

    return (
        <div className="dash-card dash-chart-card">
            <div className="dash-chart-header">
                <div>
                    <h3 className="dash-card-title">Ingresos</h3>
                    {data.length > 0 && (
                        <div className="dash-chart-legend">
                            <span className="dash-legend-dot" style={{ background: '#1f8b3c' }} />
                            <span>Bruto</span>
                            <span className="dash-legend-dot" style={{ background: '#3483d1', marginLeft: 12 }} />
                            <span>Neto</span>
                        </div>
                    )}
                </div>
                <div className="dash-tabs">
                    {CHART_TABS.map((t, i) => (
                        <button
                            key={i}
                            className={`dash-tab ${i === tab ? 'dash-tab--active' : ''}`}
                            onClick={() => setTab(i)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            {renderBody()}
        </div>
    )
}

// ─── PendingPaymentsTable ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const config = {
        PENDING: { label: 'Pendiente', cls: 'badge--yellow' },
        OVERDUE:  { label: 'Vencido',   cls: 'badge--red' },
    }
    const { label, cls } = config[status] ?? { label: status, cls: '' }
    return <span className={`dash-badge ${cls}`}>{label}</span>
}

function PendingPaymentsTable({ payments, loading, onViewPlans }) {
    return (
        <div className="dash-card">
            <h3 className="dash-card-title">Pagos Pendientes</h3>
            {loading
                ? <div className="dash-skeleton dash-table-skeleton" />
                : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>No. Plan</th>
                                    <th>Cliente</th>
                                    <th>Vence</th>
                                    <th>Cuota</th>
                                    <th>Pendiente</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0
                                    ? <tr><td colSpan={7} className="dash-table-empty">Sin pagos pendientes</td></tr>
                                    : payments.map(p => (
                                        <tr key={p.monthlyPaymentId}>
                                            <td className="dash-plan-id">
                                                {p.billPaymentPlanId?.slice(-8).toUpperCase() ?? '—'}
                                            </td>
                                            <td>{p.client?.name ?? '—'}</td>
                                            <td>{fmtDate(p.paymentDeadline)}</td>
                                            <td>{fmtCurrency(p.paymentAmount)}</td>
                                            <td className="dash-col-bold">{fmtCurrency(p.amountToPay)}</td>
                                            <td><StatusBadge status={p.planStatus} /></td>
                                            <td>
                                                <button
                                                    className="dash-action-btn"
                                                    onClick={onViewPlans}
                                                    title="Ver plan de pagos"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.4 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.15 7.5-9.75 7.5S3.5 16.5 2.25 12Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    )
}

// ─── InventorySidebar ─────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 5

function InventorySidebar({ items, loading, storeAddress }) {
    const perStore = items[0]?.store != null

    return (
        <div className="dash-card dash-inventory-card">
            <div className="dash-inventory-header">
                <div>
                    <h3 className="dash-card-title">Stock Bajo</h3>
                    {!perStore && storeAddress && (
                        <p className="dash-inventory-store">Tienda: {storeAddress}</p>
                    )}
                </div>
                {!loading && items.length > 0 && (
                    <span className="dash-inventory-badge">{items.length}</span>
                )}
            </div>

            {loading
                ? <div className="dash-skeleton dash-inventory-skeleton" />
                : items.length === 0
                    ? <p className="dash-inventory-empty">Todo el inventario tiene stock suficiente</p>
                    : (
                        <div className="dash-inventory-list">
                            {items.map(item => (
                                <div
                                    key={`${item.storeId}-${item.productId}`}
                                    className="dash-inventory-item"
                                >
                                    <div>
                                        <p className="dash-inventory-name">{item.product?.name ?? '—'}</p>
                                        {perStore
                                            ? <p className="dash-inventory-store-tag">{item.store?.address ?? '—'}</p>
                                            : <p className="dash-inventory-sku">
                                                {(item.productId ?? '').slice(-8).toUpperCase()}
                                              </p>
                                        }
                                    </div>
                                    <span className="dash-inventory-qty">{item.inStock}</span>
                                </div>
                            ))}
                        </div>
                    )
            }
        </div>
    )
}

// ─── DashboardHomePage ────────────────────────────────────────────────────────

export default function DashboardHomePage({ session, onNavigate }) {
    const storeId      = session?.storeId
    const storeAddress = session?.storeAddress ?? null

    const [monthlyData, setMonthlyData]     = useState([])
    const [weeklyData, setWeeklyData]       = useState([])
    const [dailyData, setDailyData]         = useState([])
    const [chartLoading, setChartLoading]   = useState(Boolean(storeId))
    const [payments, setPayments]           = useState([])
    const [paymentsLoading, setPaymentsLoading] = useState(true)
    const [inventory, setInventory]         = useState([])
    const [inventoryLoading, setInventoryLoading] = useState(true)

    useEffect(() => {
        if (!storeId) return

        const months = getLast6Months()
        const { startDate, endDate } = getRangeDates(56)

        Promise.all([
            Promise.all(
                months.map(({ year, month }) =>
                    Get(`/api/reports/stores?storeId=${storeId}&month=${year}-${String(month).padStart(2, '0')}`)
                        .catch(() => null)
                )
            ),
            Get(`/api/reports/stores/range?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`)
                .catch(() => null),
        ]).then(([monthResults, rangeResult]) => {
            setMonthlyData(monthResults.map((r, i) => ({
                label: months[i].label,
                gross: r?.status === 200 ? (r.json.store?.monthlyGrossGain ?? 0) : 0,
                net:   r?.status === 200 ? (r.json.store?.monthlyNetGain   ?? 0) : 0,
            })))

            const rangeDays = rangeResult?.status === 200 ? (rangeResult.json.data ?? []) : []
            setWeeklyData(buildWeeklyData(rangeDays))
            setDailyData(buildDailyData(rangeDays.slice(-30)))
        }).finally(() => setChartLoading(false))
    }, [storeId])

    useEffect(() => {
        Get('/api/payment-plan/pending-payments')
            .then(r => { if (r.status === 200) setPayments(r.json.pendingPayments ?? []) })
            .catch(() => {})
            .finally(() => setPaymentsLoading(false))
    }, [])

    useEffect(() => {
        Get('/api/store-inventory/low-stock')
            .then(r => { if (r.status === 200) setInventory(r.json.data ?? []) })
            .catch(() => {})
            .finally(() => setInventoryLoading(false))
    }, [])

    const currentNet   = monthlyData.at(-1)?.net   ?? 0
    const prevNet      = monthlyData.at(-2)?.net    ?? 0
    const currentGross = monthlyData.at(-1)?.gross  ?? 0
    const prevGross    = monthlyData.at(-2)?.gross   ?? 0
    const netTrend   = prevNet   > 0 ? ((currentNet   - prevNet)   / prevNet)   * 100 : undefined
    const grossTrend = prevGross > 0 ? ((currentGross - prevGross) / prevGross) * 100 : undefined

    return (
        <div className="dash-root">
            <div className="dash-metrics-row">
                <MetricCard
                    label="Ganancias del Mes"
                    value={fmtCurrency(currentNet)}
                    trend={netTrend}
                    trendLabel="vs. mes anterior"
                    loading={chartLoading}
                />
                <MetricCard
                    label="Ingresos Brutos"
                    value={fmtCurrency(currentGross)}
                    trend={grossTrend}
                    trendLabel="vs. mes anterior"
                    loading={chartLoading}
                />
                <MetricCard
                    label="Pagos Pendientes"
                    value={`${payments.length} pago${payments.length !== 1 ? 's' : ''}`}
                    loading={paymentsLoading}
                />
            </div>

            <RevenueChart
                monthly={monthlyData}
                weekly={weeklyData}
                daily={dailyData}
                loading={chartLoading}
            />

            <div className="dash-bottom-row">
                <PendingPaymentsTable
                    payments={payments}
                    loading={paymentsLoading}
                    onViewPlans={() => onNavigate?.('/credit-plans')}
                />
                <InventorySidebar items={inventory} loading={inventoryLoading} storeAddress={storeAddress} />
            </div>
        </div>
    )
}
