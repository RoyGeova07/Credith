import { useState, useCallback, useEffect } from "react"
import { toast } from "react-toastify"
import { getSession } from "@/helpers/session"
import { ROLE } from "@/helpers/permissions"
import { getPendingPayments, getPaymentPlan, payPlan } from "@/helpers/paymentPlans"
import { DataTable, DataColumn, ActionColumn, CustomAction } from "@/components/dataGrid/DataTable"
import { DataGrid, DataGridHeader } from "@/components/dataGrid/DataGrid"
import Dialog from "@/components/dialogs/Dialog"
import { DocumentIcon, CreditCardIcon } from "@/assets/icons"
import DniInput from "@/components/DniInput"
import "./PaymentPlansPage.css"

function toMoney(value) {
  return `L. ${Number(value || 0).toFixed(2)}`
}

function groupByPlan(pendingPayments) {
  const planMap = {}
  for (const row of pendingPayments) {
    const pid = row.billPaymentPlanId
    if (!planMap[pid]) {
      planMap[pid] = {
        billPaymentPlanId: pid,
        planStatus: row.planStatus,
        client: row.client,
        totalAmount: (row.totalToPay ?? 0) - (row.planPayedAmount ?? 0),
      }
    }
    if (row.planStatus === "OVERDUE") planMap[pid].planStatus = "OVERDUE"
  }
  return Object.values(planMap)
}

function DetailsDialog({ plan, isOpen, setIsOpen }) {
  if (!plan) return null

  return (
    <Dialog title="Detalles del Plan" isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="details-dialog-body">
        <div className="details-plan-info">
          <div className="details-info-item">
            <span className="label">Cliente</span>
            <span className="value">{plan.client?.name || "-"}</span>
          </div>
          <div className="details-info-item">
            <span className="label">DNI</span>
            <span className="value">{plan.client?.dni || "-"}</span>
          </div>
          <div className="details-info-item">
            <span className="label">Total a Pagar</span>
            <span className="value">{toMoney(plan.totalToPay)}</span>
          </div>
          <div className="details-info-item">
            <span className="label">Pagado</span>
            <span className="value">{toMoney(plan.payedAmount)}</span>
          </div>
          <div className="details-info-item">
            <span className="label">Saldo Pendiente</span>
            <span className="value">{toMoney(Number(plan.totalToPay) - Number(plan.payedAmount))}</span>
          </div>
          <div className="details-info-item">
            <span className="label">Estado</span>
            <span className="value">
              {plan.status === "OVERDUE" ? "Vencido" : plan.status === "PAYED" ? "Pagado" : "Pendiente"}
            </span>
          </div>
          <div className="details-info-item">
            <span className="label">Meses</span>
            <span className="value">{plan.monthsToPay || "-"}</span>
          </div>
          <div className="details-info-item">
            <span className="label">Día de Pago</span>
            <span className="value">{plan.paymentDay || "-"}</span>
          </div>
        </div>

        {plan.monthlyPayments?.length > 0 && (
          <div className="details-monthly-section">
            <h4>Cuotas Mensuales</h4>
            <DataTable
              key="dialog-monthly-payments"
              onLoad={async () => ({
                data: plan.monthlyPayments,
                total: plan.monthlyPayments.length,
              })}
              rowsPerPage={5}
            >
              <DataColumn
                title="Vencimiento"
                render={(row) => new Date(row.paymentDeadline).toLocaleDateString("es-HN")}
              />
              <DataColumn title="Monto" render={(row) => toMoney(row.paymentAmount)} />
              <DataColumn title="Interés" render={(row) => toMoney(row.interestToPay)} />
              <DataColumn title="Pagado" render={(row) => toMoney(row.payedAmount)} />
              <DataColumn
                title="Estado"
                render={(row) => (row.isPayed ? "Pagado" : "Pendiente")}
              />
            </DataTable>
          </div>
        )}
      </div>
    </Dialog>
  )
}

function PayDialog({ planRow, isOpen, setIsOpen, onSuccess }) {
  const [plan, setPlan] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0)
  const [amount, setAmount] = useState("")
  const [overflow, setOverflow] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || !planRow?.client?.dni) return
    setLoadingPlan(true)
    getPaymentPlan(planRow.client.dni)
      .then((result) => {
        const p = result.paymentPlan
        setPlan(p)
        const unpaid = (p.monthlyPayments ?? [])
          .map((mp, idx) => ({ ...mp, originalIndex: idx }))
          .filter((mp) => !mp.isPayed)
        if (unpaid.length > 0) {
          setSelectedMonthIdx(0)
          const remaining = Number(unpaid[0].paymentAmount) + Number(unpaid[0].interestToPay) - Number(unpaid[0].payedAmount)
          setAmount(String(remaining))
        }
      })
      .catch((err) => {
        toast.error(err.message || "No se pudo cargar el plan")
        setIsOpen(false)
      })
      .finally(() => setLoadingPlan(false))
  }, [isOpen, planRow?.client?.dni, setIsOpen])

  useEffect(() => {
    if (!isOpen) {
      setPlan(null)
      setAmount("")
      setOverflow(true)
      setSelectedMonthIdx(0)
    }
  }, [isOpen])

  if (!isOpen || !planRow) return null

  if (loadingPlan) {
    return (
      <Dialog title="Realizar Pago" isOpen={isOpen} setIsOpen={setIsOpen}>
        <p className="pay-loading">Cargando información del plan...</p>
      </Dialog>
    )
  }

  if (!plan) return null

  const unpaidMonths = (plan.monthlyPayments ?? [])
    .map((mp, idx) => ({ ...mp, originalIndex: idx }))
    .filter((mp) => !mp.isPayed)

  const planRemaining = Math.max(0, Number(plan.totalToPay) - Number(plan.payedAmount))

  const selectedMonth = unpaidMonths[selectedMonthIdx]
  const selectedMonthRemaining = selectedMonth
    ? Number(selectedMonth.paymentAmount) + Number(selectedMonth.interestToPay) - Number(selectedMonth.payedAmount)
    : 0

  const numericAmount = parseFloat(amount) || 0
  const finalAmount = overflow ? numericAmount : Math.min(numericAmount, selectedMonthRemaining)
  const validAmount = numericAmount > 0 && numericAmount <= planRemaining

  const handleSubmit = async () => {
    if (!validAmount) return
    setSubmitting(true)
    try {
      await payPlan(planRow.billPaymentPlanId, finalAmount, selectedMonth?.originalIndex ?? 0)
      toast.success("Pago realizado con éxito")
      setIsOpen(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al realizar el pago")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog title="Realizar Pago" isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="pay-dialog-body">
        <div className="pay-plan-info">
          <div className="pay-info-item">
            <span className="label">Cliente</span>
            <span className="value">{planRow.client?.name || "-"}</span>
          </div>
          <div className="pay-info-item">
            <span className="label">DNI</span>
            <span className="value">{planRow.client?.dni || "-"}</span>
          </div>
          <div className="pay-info-item">
            <span className="label">Total Pendiente</span>
            <span className="value">{toMoney(planRemaining)}</span>
          </div>
        </div>

        {unpaidMonths.length > 0 && (
          <div className="pay-month-select">
            <label>Mes a pagar</label>
            <select
              value={selectedMonthIdx}
              onChange={(e) => {
                const idx = Number(e.target.value)
                setSelectedMonthIdx(idx)
                const mp = unpaidMonths[idx]
                if (mp) {
                  const remaining = Number(mp.paymentAmount) + Number(mp.interestToPay) - Number(mp.payedAmount)
                  setAmount(String(remaining))
                }
              }}
            >
              {unpaidMonths.map((mp, idx) => {
                const remaining = Number(mp.paymentAmount) + Number(mp.interestToPay) - Number(mp.payedAmount)
                return (
                  <option key={mp.monthlyPaymentId} value={idx}>
                    {new Date(mp.paymentDeadline).toLocaleDateString("es-HN", { month: "long", year: "numeric" })} — Vence {new Date(mp.paymentDeadline).toLocaleDateString("es-HN")} — {toMoney(remaining)}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        <div className="pay-amount-input">
          <label>Monto a pagar</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={planRemaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <label className="pay-overflow-label">
          <input
            type="checkbox"
            checked={overflow}
            onChange={(e) => setOverflow(e.target.checked)}
          />
          Aplicar sobrante al siguiente mes
        </label>

        <div className="pay-actions">
          <button className="pay-cancel-btn" onClick={() => setIsOpen(false)} disabled={submitting}>
            Cancelar
          </button>
          <button className="pay-submit-btn" onClick={handleSubmit} disabled={!validAmount || submitting}>
            {submitting ? "Procesando..." : "Pagar"}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

function PendingPaymentsView({ onViewDetails, onPay }) {
  return (
    <div className="payment-plans-admin-page">
    <DataGrid>
      <DataGridHeader
        title="Planes de Crédito"
        description="Pagos pendientes hasta el mes actual"
      />
      <DataTable
        key="pending-payments"
        onLoad={async () => {
          const result = await getPendingPayments()
          const grouped = groupByPlan(result.pendingPayments || [])
          return { data: grouped, total: grouped.length }
        }}
        rowsPerPage={10}
      >
        <DataColumn title="Cliente" render={(row) => row.client?.name || "-"} />
        <DataColumn title="DNI" render={(row) => row.client?.dni || "-"} />
        <DataColumn title="Teléfono" render={(row) => row.client?.phone || "-"} />
        <DataColumn title="Total Pendiente" render={(row) => toMoney(row.totalAmount)} />
        <DataColumn
          title="Estado"
          render={(row) => (row.planStatus === "OVERDUE" ? "Vencido" : "Pendiente")}
        />
        <ActionColumn>
          <CustomAction
            backgroundColor="#2563eb"
            color="#ffffff"
            icon={DocumentIcon}
            tooltip="Ver detalles"
            onClick={onViewDetails}
          />
          <CustomAction
            backgroundColor="#16a34a"
            color="#ffffff"
            icon={CreditCardIcon}
            tooltip="Realizar pago"
            onClick={onPay}
          />
        </ActionColumn>
      </DataTable>
    </DataGrid>
    </div>
  )
}

function FulfillmentDialog({ plan, isOpen, setIsOpen }) {
  if (!plan) return null

  const paidMonths = (plan.monthlyPayments ?? []).filter((mp) => mp.isPayed)
  const locale = "es-HN"

  return (
    <Dialog title="Detalles del Plan" isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="fulfillment-dialog-body">
        <div className="fulfillment-plan-info">
          <div className="fulfillment-info-item">
            <span className="label">Cliente</span>
            <span className="value">{plan.client?.[0]?.name || "-"}</span>
          </div>
          <div className="fulfillment-info-item">
            <span className="label">Total a Pagar</span>
            <span className="value">{toMoney(plan.totalToPay)}</span>
          </div>
          <div className="fulfillment-info-item">
            <span className="label">Abono Inicial</span>
            <span className="value">{toMoney(plan.initialPayment)}</span>
          </div>
          <div className="fulfillment-info-item">
            <span className="label">Meses Pagados</span>
            <span className="value">{paidMonths.length} de {plan.monthsToPay}</span>
          </div>
        </div>

        {paidMonths.length > 0 && (
          <div className="fulfillment-monthly-section">
            <h4>Resumen de Pagos</h4>
            <table className="fulfillment-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Total Pagado</th>
                  <th>Intereses</th>
                </tr>
              </thead>
              <tbody>
                {paidMonths.map((mp) => (
                  <tr key={mp.monthlyPaymentId}>
                    <td>{new Date(mp.paymentDeadline).toLocaleDateString(locale, { month: "long", year: "numeric" })}</td>
                    <td>{toMoney(mp.payedAmount)}</td>
                    <td>{toMoney(mp.interestToPay)}</td>
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

function EmployeePaymentView() {
  const [dni, setDni] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [plan, setPlan] = useState(null)
  const [payAmount, setPayAmount] = useState("")
  const [overflow, setOverflow] = useState(true)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [fulfillmentPlan, setFulfillmentPlan] = useState(null)

  const handleSearch = async () => {
    if (!dni.trim()) return
    setLoading(true)
    setError("")
    setPlan(null)
    try {
      const result = await getPaymentPlan(dni.trim())
      setPlan(result.paymentPlan)
      setSelectedMonthIdx(0)
      setPayAmount("")
      setOverflow(true)
    } catch (err) {
      setError(err.message || "No se encontraron planes para este DNI")
    } finally {
      setLoading(false)
    }
  }

  const unpaidMonths = (plan?.monthlyPayments ?? [])
    .map((mp, idx) => ({ ...mp, originalIndex: idx }))
    .filter((mp) => !mp.isPayed)

  const planRemaining = Math.max(0, Number(plan?.totalToPay ?? 0) - Number(plan?.payedAmount ?? 0))

  const selectedMonth = unpaidMonths[selectedMonthIdx]
  const selectedMonthRemaining = selectedMonth
    ? Number(selectedMonth.paymentAmount) + Number(selectedMonth.interestToPay) - Number(selectedMonth.payedAmount)
    : 0

  const numericAmount = parseFloat(payAmount) || 0
  const finalAmount = overflow ? numericAmount : Math.min(numericAmount, selectedMonthRemaining)
  const validAmount = numericAmount > 0 && numericAmount <= planRemaining

  const handlePay = async () => {
    if (!validAmount || !plan) return
    setSubmitting(true)
    try {
      const response = await payPlan(plan.billPaymentPlanId, finalAmount, selectedMonth?.originalIndex ?? 0)
      const result = await getPaymentPlan(dni.trim())
      const updatedPlan = result.paymentPlan
      if (updatedPlan.status === 'PAYED') {
        setFulfillmentPlan(updatedPlan)
      } else {
        toast.success("Pago realizado con éxito")
      }
      setPlan(updatedPlan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al realizar el pago")
    } finally {
      setSubmitting(false)
    }
  }

  const clientName = plan?.client?.[0]?.name ?? ""
  const clientDni = plan?.client?.[0]?.dni ?? ""

  return (
    <div className="payment-plans-page">
      <div className="payment-plans-header">
        <h1>Planes de Crédito</h1>
      </div>

      <div className="dni-search-section">
        <label>Número de identidad</label>
        <div className="dni-input-wrapper">
          <DniInput value={dni} onChange={setDni} onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }} />
          <button onClick={handleSearch} disabled={loading || !dni.trim()}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="payment-plans-error">{error}</p>}
      </div>

      {plan && (
        <div className="employee-plan-section">
          <div className="employee-plan-card" onClick={() => plan.status === 'PAYED' && setFulfillmentPlan(plan)}>
            <h3>Resumen del Plan</h3>
            <div className="employee-plan-info">
              <div className="employee-plan-row">
                <span className="label">Cliente</span>
                <span className="value">{clientName || "-"}</span>
              </div>
              <div className="employee-plan-row">
                <span className="label">DNI</span>
                <span className="value">{clientDni || "-"}</span>
              </div>
              <div className="employee-plan-row">
                <span className="label">Total a Pagar</span>
                <span className="value">{toMoney(plan.totalToPay)}</span>
              </div>
              <div className="employee-plan-row">
                <span className="label">Pagado</span>
                <span className="value">{toMoney(plan.payedAmount)}</span>
              </div>
              <div className="employee-plan-row">
                <span className="label">Saldo Pendiente</span>
                <span className="value">{toMoney(planRemaining)}</span>
              </div>
              <div className="employee-plan-row">
                <span className="label">Estado</span>
                <span className={`employee-status ${plan.status === "OVERDUE" ? "status-overdue" : plan.status === "PAYED" ? "status-payed" : "status-pending"}`}>
                  {plan.status === "OVERDUE" ? "Vencido" : plan.status === "PAYED" ? "Pagado" : "Pendiente"}
                </span>
              </div>
            </div>
          </div>

          {plan.status !== "PAYED" && (
            <div className="employee-pay-section">
              <h3>Realizar Pago</h3>

              {unpaidMonths.length > 0 && (
                <div className="pay-month-select">
                  <label>Mes a pagar</label>
                  <select
                    value={selectedMonthIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value)
                      setSelectedMonthIdx(idx)
                      const mp = unpaidMonths[idx]
                      if (mp) {
                        const remaining = Number(mp.paymentAmount) + Number(mp.interestToPay) - Number(mp.payedAmount)
                        setPayAmount(String(remaining))
                      }
                    }}
                  >
                    {unpaidMonths.map((mp, idx) => {
                      const remaining = Number(mp.paymentAmount) + Number(mp.interestToPay) - Number(mp.payedAmount)
                      return (
                        <option key={mp.monthlyPaymentId} value={idx}>
                          {new Date(mp.paymentDeadline).toLocaleDateString("es-HN", { month: "long", year: "numeric" })} — Vence {new Date(mp.paymentDeadline).toLocaleDateString("es-HN")} — {toMoney(remaining)}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div className="pay-amount-input">
                <label>Monto a pagar</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={planRemaining}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <label className="pay-overflow-label">
                <input
                  type="checkbox"
                  checked={overflow}
                  onChange={(e) => setOverflow(e.target.checked)}
                />
                Aplicar sobrante al siguiente mes
              </label>

              <button className="employee-pay-btn" onClick={handlePay} disabled={!validAmount || submitting}>
                {submitting ? "Procesando..." : "Pagar"}
              </button>
            </div>
          )}
        </div>
      )}

      <FulfillmentDialog
        plan={fulfillmentPlan}
        isOpen={!!fulfillmentPlan}
        setIsOpen={(open) => {
          if (!open) setFulfillmentPlan(null)
        }}
      />
    </div>
  )
}

export default function PaymentPlansPage() {
  const session = getSession()
  const isAdmin = session?.role === ROLE.OWNER || session?.role === ROLE.ADMIN

  const [detailsPlan, setDetailsPlan] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [payPlanRow, setPayPlanRow] = useState(null)
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleViewDetails = useCallback(async (planOrRow) => {
    if (planOrRow.client?.dni) {
      try {
        const result = await getPaymentPlan(planOrRow.client.dni)
        setDetailsPlan(result.paymentPlan)
        setIsDetailsOpen(true)
      } catch (err) {
        toast.error(err.message || "No se pudieron cargar los detalles del plan")
        setDetailsPlan(planOrRow)
        setIsDetailsOpen(true)
      }
    } else {
      setDetailsPlan(planOrRow)
      setIsDetailsOpen(true)
    }
  }, [])

  const handlePay = useCallback((planOrRow) => {
    setPayPlanRow(planOrRow)
    setIsPayOpen(true)
  }, [])

  const handlePaySuccess = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <>
      {isAdmin ? (
        <PendingPaymentsView
          onViewDetails={handleViewDetails}
          onPay={handlePay}
          key={refreshKey}
        />
      ) : (
        <EmployeePaymentView />
      )}

      {isAdmin && (
        <>
          <DetailsDialog
            plan={detailsPlan}
            isOpen={isDetailsOpen}
            setIsOpen={setIsDetailsOpen}
          />

          <PayDialog
            planRow={payPlanRow}
            isOpen={isPayOpen}
            setIsOpen={setIsPayOpen}
            onSuccess={handlePaySuccess}
          />
        </>
      )}
    </>
  )
}
