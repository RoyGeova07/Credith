import { useCallback, useState } from 'react'
import { Get } from '@/helpers/fetcher'
import { getSession } from '@/helpers/session'
import { ROLE } from '@/helpers/permissions'
import { DataGrid } from '@/components/dataGrid/DataGrid'
import { DataTable, DataColumn, ActionColumn, CustomAction } from '@/components/dataGrid/DataTable'
import Dialog from '@/components/dialogs/Dialog'
import { DocumentIcon } from '@/assets/icons'
import './BillsPage.css'

const RANGE_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'day',   label: 'Día específico' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getDateRange(rangeType, specificDay) {
  const now = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)

  if (rangeType === 'today') {
    const d = fmt(now)
    return { from: d, to: d }
  }
  if (rangeType === 'week') {
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    return { from: fmt(monday), to: fmt(now) }
  }
  if (rangeType === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: fmt(first), to: fmt(now) }
  }
  if (rangeType === 'day' && specificDay) {
    return { from: specificDay, to: specificDay }
  }
  return { from: null, to: null }
}

function toMoney(value) {
  return `L. ${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function paymentTypeLabel(type) {
  return type === 'INSTALLMENT' ? 'Crédito' : 'Contado'
}

function BillDetailsDialog({ bill, isOpen, setIsOpen }) {
  if (!bill) return null
  const details = bill.billDetails || []
  const discountedSubtotal = Number(bill.subtotal || 0) - Number(bill.discountAmount || 0)
  const isv15 = Number(bill.isv15Amount) || (Number(bill.total || 0) - discountedSubtotal)

  return (
    <Dialog title={`Factura ${bill.billNumberFinal}`} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="bills-dialog-body">
        <div className="bills-dialog-meta">
          <div className="bills-meta-row">
            <span>Cliente</span>
            <strong>{bill.customerName || '-'}</strong>
          </div>
          <div className="bills-meta-row">
            <span>Cajero</span>
            <strong>{bill.cashierName || '-'}</strong>
          </div>
          <div className="bills-meta-row">
            <span>Tipo de pago</span>
            <strong>{paymentTypeLabel(bill.paymentType)}</strong>
          </div>
          <div className="bills-meta-row">
            <span>Fecha</span>
            <strong>{formatDate(bill.createdAt)}</strong>
          </div>
          <div className="bills-meta-row">
            <span>Subtotal</span>
            <strong>{toMoney(bill.subtotal)}</strong>
          </div>
          <div className="bills-meta-row">
            <span>Descuento</span>
            <strong>{toMoney(bill.discountAmount)}</strong>
          </div>
          <div className="bills-meta-row">
            <span>ISV 15%</span>
            <strong>{toMoney(isv15)}</strong>
          </div>
          <div className="bills-meta-row bills-meta-total">
            <span>Total</span>
            <strong>{toMoney(bill.total)}</strong>
          </div>
        </div>

        <h4 className="bills-dialog-section-title">Productos vendidos</h4>

        {details.length === 0 ? (
          <p className="bills-dialog-empty">Sin detalles disponibles.</p>
        ) : (
          <div className="bills-dialog-table-wrap">
            <table className="bills-dialog-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio venta</th>
                  <th>Descuento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d) => (
                  <tr key={d.billDetailId}>
                    <td>{d.product?.name || '-'}</td>
                    <td>{d.quantity}</td>
                    <td>{toMoney(d.sellPrice)}</td>
                    <td>{toMoney(d.discountAmount)}</td>
                    <td>{toMoney(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  )
}

function RangeFilter({ rangeType, specificDay, onRangeChange, onDayChange, onApply }) {
  return (
    <form className="bills-filter-bar" onSubmit={(e) => { e.preventDefault(); onApply() }}>
      <div className="bills-filter-chips">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`bills-chip${rangeType === opt.value ? ' bills-chip--active' : ''}`}
            onClick={() => onRangeChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {rangeType === 'day' && (
        <input
          className="bills-date-input"
          type="date"
          value={specificDay}
          max={todayStr()}
          onChange={(e) => onDayChange(e.target.value)}
        />
      )}

      <button type="submit" className="bills-apply-btn">
        Aplicar
      </button>
    </form>
  )
}

export default function BillsPage() {
  const session = getSession()
  const role = session?.role || ROLE.EMPLOYEE
  const isManagerRole = role === ROLE.OWNER || role === ROLE.ADMIN

  const [rangeType, setRangeType] = useState('month')
  const [specificDay, setSpecificDay] = useState(todayStr)
  const [appliedRange, setAppliedRange] = useState(() => getDateRange('month', null))

  const [selectedBill, setSelectedBill] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleApply = () => {
    setAppliedRange(getDateRange(rangeType, specificDay))
  }

  const handleRangeChange = (value) => {
    setRangeType(value)
    if (value !== 'day') {
      setAppliedRange(getDateRange(value, null))
    }
  }

  const handleDetails = useCallback(async (row) => {
    const { status, json } = await Get(`/api/bills/${row.billId}`)
    if (status === 200) {
      setSelectedBill(json)
      setIsOpen(true)
    }
  }, [])

  const loadBills = useCallback(async (offset, limit) => {
    const params = new URLSearchParams({ limit, offset })
    if (isManagerRole && appliedRange.from) params.set('from', appliedRange.from)
    if (isManagerRole && appliedRange.to) params.set('to', appliedRange.to)
    const { status, json } = await Get(`/api/bills?${params}`)
    if (status !== 200) return { data: [], total: 0 }
    return { data: json.data || [], total: json.total || 0 }
  }, [isManagerRole, appliedRange])

  const tableKey = isManagerRole
    ? `bills-${appliedRange.from}-${appliedRange.to}`
    : 'bills-employee'

  const rangeLabel = isManagerRole && appliedRange.from
    ? appliedRange.from === appliedRange.to
      ? appliedRange.from
      : `${appliedRange.from} — ${appliedRange.to}`
    : null

  return (
    <>
      <div className="bills-page">
      <DataGrid>
        <div className="bills-page-header">
          <div>
            <p className="data-grid-kicker">Registro de ventas</p>
            <h1 className="data-grid-header-title">Facturas</h1>
            {rangeLabel && <p className="bills-range-label">{rangeLabel}</p>}
          </div>
        </div>

        {isManagerRole && (
          <RangeFilter
            rangeType={rangeType}
            specificDay={specificDay}
            onRangeChange={handleRangeChange}
            onDayChange={setSpecificDay}
            onApply={handleApply}
          />
        )}

        <DataTable key={tableKey} onLoad={loadBills} rowsPerPage={10}>
          <DataColumn title="N° Factura"  render={(row) => row.billNumberFinal || '-'} />
          <DataColumn title="Empleado"    render={(row) => row.cashierName || '-'} />
          <DataColumn title="Cliente"     render={(row) => row.customerName || '-'} />
          <DataColumn title="Tipo"        render={(row) => paymentTypeLabel(row.paymentType)} />
          {isManagerRole && (
            <DataColumn title="G. Bruta" render={(row) => toMoney(row.grossGain)} />
          )}
          {isManagerRole && (
            <DataColumn title="G. Neta"  render={(row) => toMoney(row.netGain)} />
          )}
          <DataColumn title="Total"       render={(row) => toMoney(row.total)} />
          <DataColumn title="Fecha"       render={(row) => formatDate(row.createdAt)} />
          <ActionColumn>
            <CustomAction
              backgroundColor="#2563eb"
              color="#ffffff"
              icon={DocumentIcon}
              tooltip="Ver detalles"
              onClick={handleDetails}
            />
          </ActionColumn>
        </DataTable>
      </DataGrid>
      </div>

      <BillDetailsDialog bill={selectedBill} isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}
