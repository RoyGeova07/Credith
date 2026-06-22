import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Post, Get } from '@/helpers/fetcher'
import { toast } from 'react-toastify'
import DniInput from '@/components/DniInput'
import './CheckoutModal.css'

const ISV_RATE = 0.15

function toCurrency(value) {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2,
    }).format(Number(value || 0))
}

function today() {
    return new Date().toISOString().split('T')[0]
}

const EMPTY_FORM = {
    paymentType: 'CASH',
    customerName: '',
    // INSTALLMENT client search
    dniInput: '',
    dniStatus: 'idle', // idle | searching | found | not_found
    foundClient: null,
    newClientName: '',
    newClientPhone: '',
    newClientAddress: '',
    // bill-level discount
    discountPercentage: '',
    // payment (CASH: monto recibido; INSTALLMENT: abono inicial)
    payment: '',
    // INSTALLMENT only
    startingDate: '',
    monthsToPay: '',
    paymentDay: '',
    interestRate: '5',
}

export default function CheckoutModal({ isOpen, onClose, cartItems, session, onBillCreated }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [dniError, setDniError] = useState(null)

    const subtotal = cartItems.reduce((s, item) => s + Number(item.sellPrice) * item.quantity, 0)
    const discountPct = Math.min(100, Math.max(0, Number(form.discountPercentage) || 0))
    const discountAmount = subtotal * (discountPct / 100)
    const discountedSubtotal = subtotal - discountAmount
    const isv15 = discountedSubtotal * ISV_RATE
    const total = discountedSubtotal + isv15

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function searchClient() {
        const dni = form.dniInput
        if (dni.length !== 13) {
            setDniError('El DNI debe tener 13 dígitos')
            return
        }
        setDniError(null)
        set('dniStatus', 'searching')
        try {
            const res = await Get(`/api/clients?dni=${encodeURIComponent(dni)}`)
            if (res.status === 200 && res.json.data?.length > 0) {
                const c = res.json.data[0]
                setForm(f => ({
                    ...f,
                    dniStatus: 'found',
                    foundClient: c,
                    customerName: c.name || '',
                }))
            } else {
                setForm(f => ({
                    ...f,
                    dniStatus: 'not_found',
                    foundClient: null,
                    newClientName: '',
                    newClientPhone: '',
                    newClientAddress: '',
                    customerName: '',
                }))
            }
        } catch {
            set('dniStatus', 'idle')
        }
    }

    function isFormValid() {
        if (!form.customerName.trim()) return false
        if (!form.payment) return false
        if (form.paymentType === 'CASH' && Number(form.payment) < total) return false
        if (form.paymentType === 'INSTALLMENT') {
            if (form.dniStatus === 'idle' || form.dniStatus === 'searching') return false
            if (form.dniStatus === 'not_found' && !form.newClientName.trim()) return false
            if (!form.startingDate || !form.monthsToPay || !form.paymentDay) return false
            if (Number(form.paymentDay) < 0 || Number(form.paymentDay) > 31) return false
            if (Number(form.payment) >= total) return false
            if (Number(form.monthsToPay) <= 0) return false
        }
        return true
    }

    async function handleSubmit() {
        setSubmitting(true)
        setSubmitError(null)
        try {
            let clientId = form.foundClient?.clientId ?? null

            if (form.paymentType === 'INSTALLMENT' && form.dniStatus === 'not_found') {
                const newClientBody = { name: form.newClientName }

                if (form.dniInput.trim()) newClientBody.dni = form.dniInput.trim()
                if (form.newClientPhone.trim()) newClientBody.phone = form.newClientPhone.trim()
                if (form.newClientAddress.trim()) newClientBody.address = form.newClientAddress.trim()

                const clientRes = await Post('/api/clients', JSON.stringify(newClientBody))
                if (clientRes.status !== 201) {
                    setSubmitError(clientRes.json.message || 'Error al crear el cliente')
                    setSubmitting(false)
                    return
                }

                clientId = clientRes.json.client.clientId
            }

            const details = cartItems.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                sellPrice: Number(item.sellPrice),
                discountPercentage: 0,
                discountAmount: 0,
                total: item.quantity * Number(item.sellPrice),
            }))

            const limitDate = form.paymentType === 'INSTALLMENT' ? form.startingDate : today()

            const paymentData = form.paymentType === 'CASH'
                ? { payment: Number(form.payment) }
                : {
                    payment: Number(form.payment),
                    startingDate: form.startingDate,
                    monthsToPay: parseInt(form.monthsToPay, 10),
                    paymentDay: parseInt(form.paymentDay, 10),
                    interestRate: form.interestRate ? Number(form.interestRate) : 0,
                }

            const customer = {
                customerName: form.customerName,
                ...(form.paymentType === 'INSTALLMENT' ? { clientId } : {}),
            }

            const billRes = await Post('/api/bills', JSON.stringify({
                limitDate,
                paymentType: form.paymentType,
                userId: session.userId,
                storeId: session.storeId,
                discountPercentage: discountPct,
                discountAmount,
                details,
                customer,
                paymentData,
            }))

            if (billRes.status !== 201) {
                setSubmitError(billRes.json.message || 'Error al crear la factura')
                return
            }

            toast.success(`Factura ${billRes.json.billNumberFinal} creada correctamente`)
            onBillCreated?.()
            closeAndReset()
        } catch (err) {
            console.error('Bill submit error:', err)
            setSubmitError('Error inesperado, intente de nuevo')
        } finally {
            setSubmitting(false)
        }
    }

    function closeAndReset() {
        setForm(EMPTY_FORM)
        setSubmitError(null)
        setDniError(null)
        onClose()
    }

    if (!isOpen || typeof document === 'undefined') return null

    return createPortal(
        <>
            <button type="button" className="checkout-backdrop" onClick={closeAndReset} />
            <div className="checkout-modal" role="dialog" aria-modal="true">
                <header className="checkout-modal-header">
                    <h2 className="checkout-modal-title">Procesar Venta</h2>
                    <button type="button" className="checkout-close-btn" onClick={closeAndReset}>×</button>
                </header>

                <div className="checkout-modal-body">
                    <div className="checkout-left">
                        <FormPanel form={form} set={set} setForm={setForm} onSearchClient={searchClient} dniError={dniError} setDniError={setDniError} />
                    </div>
                    <div className="checkout-right">
                        <SummaryPanel
                            form={form}
                            cartItems={cartItems}
                            subtotal={subtotal}
                            discountPct={discountPct}
                            discountAmount={discountAmount}
                            isv15={isv15}
                            total={total}
                            error={submitError}
                            submitting={submitting}
                            isValid={isFormValid()}
                            onConfirm={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}

function Field({ label, children }) {
    return (
        <div className="checkout-field">
            <label className="checkout-label">{label}</label>
            {children}
        </div>
    )
}

function FormPanel({ form, set, setForm, onSearchClient, dniError, setDniError }) {
    const isCash = form.paymentType === 'CASH'

    return (
        <div className="checkout-form">
            <div className="checkout-type-toggle">
                <button
                    type="button"
                    className={`checkout-type-btn ${isCash ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, paymentType: 'CASH' }))}
                >
                    Contado
                </button>
                <button
                    type="button"
                    className={`checkout-type-btn ${!isCash ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, paymentType: 'INSTALLMENT' }))}
                >
                    Plazos
                </button>
            </div>

            <section className="checkout-section">
                <h3 className="checkout-section-title">Datos del cliente</h3>

                {!isCash && (
                    <Field label="DNI del cliente">
                        <div className="checkout-dni-row">
                            <DniInput
                                value={form.dniInput}
                                onChange={v => { set('dniInput', v); set('dniStatus', 'idle'); setDniError(null) }}
                            />
                            <button
                                type="button"
                                className="checkout-search-btn"
                                onClick={onSearchClient}
                                disabled={form.dniStatus === 'searching'}
                            >
                                {form.dniStatus === 'searching' ? '...' : 'Buscar'}
                            </button>
                        </div>
                        {dniError && <p className="checkout-field-error">{dniError}</p>}
                    </Field>
                )}

                {!isCash && form.dniStatus === 'found' && form.foundClient && (
                    <div className="checkout-client-card checkout-client-card--found">
                        <p className="checkout-client-tag">Cliente encontrado</p>
                        <p className="checkout-client-name">{form.foundClient.name}</p>
                        {form.foundClient.dni && <p className="checkout-client-meta">DNI: {form.foundClient.dni}</p>}
                        {form.foundClient.phone && <p className="checkout-client-meta">Tel: {form.foundClient.phone}</p>}
                    </div>
                )}

                {!isCash && form.dniStatus === 'not_found' && (
                    <div className="checkout-client-card checkout-client-card--new">
                        <p className="checkout-client-tag">Cliente no registrado — crear nuevo</p>
                        <Field label="Nombre completo *">
                            <input
                                type="text"
                                className="checkout-input"
                                placeholder="Juan Pérez"
                                value={form.newClientName}
                                onChange={e => setForm(f => ({ ...f, newClientName: e.target.value, customerName: e.target.value }))}
                            />
                        </Field>
                        <Field label="Teléfono">
                            <input
                                type="text"
                                className="checkout-input"
                                placeholder="9999-9999"
                                value={form.newClientPhone}
                                onChange={e => set('newClientPhone', e.target.value)}
                            />
                        </Field>
                        <Field label="Dirección">
                            <input
                                type="text"
                                className="checkout-input"
                                placeholder="Tegucigalpa, Honduras"
                                value={form.newClientAddress}
                                onChange={e => set('newClientAddress', e.target.value)}
                            />
                        </Field>
                    </div>
                )}

                {!isCash && form.dniStatus !== 'idle' ? (
                    <Field label="Cliente">
                        <input
                            type="text"
                            className="checkout-input"
                            value={form.customerName}
                            readOnly
                        />
                    </Field>
                ) : (
                    <Field label="Nombre en la factura *">
                        <input
                            type="text"
                            className="checkout-input"
                            placeholder="Nombre del cliente"
                            value={form.customerName}
                            onChange={e => set('customerName', e.target.value)}
                        />
                    </Field>
                )}
            </section>

            <section className="checkout-section">
                <h3 className="checkout-section-title">Datos del pago</h3>

                <Field label="Descuento (opcional)">
                    <div className="checkout-suffix-wrap">
                        <input
                            type="number"
                            className="checkout-input"
                            placeholder="0"
                            min="0"
                            max="100"
                            value={form.discountPercentage}
                            onChange={e => {
                                const raw = e.target.value
                                if (raw === '') { set('discountPercentage', ''); return }
                                const n = Number(raw)
                                if (isNaN(n)) return
                                set('discountPercentage', String(Math.min(100, Math.max(0, n))))
                            }}
                        />
                        <span className="checkout-suffix">%</span>
                    </div>
                </Field>

                <Field label={isCash ? 'Monto recibido *' : 'Abono inicial *'}>
                    <input
                        type="number"
                        className="checkout-input"
                        placeholder="0.00"
                        min="0"
                        value={form.payment}
                        onChange={e => set('payment', e.target.value)}
                    />
                </Field>

                {!isCash && (
                    <>
                        <Field label="Fecha de inicio de pagos *">
                            <input
                                type="date"
                                className="checkout-input"
                                value={form.startingDate}
                                onChange={e => set('startingDate', e.target.value)}
                            />
                        </Field>
                        <div className="checkout-row-2">
                            <Field label="Número de cuotas *">
                                <input
                                    type="number"
                                    className="checkout-input"
                                    placeholder="12"
                                    min="1"
                                    value={form.monthsToPay}
                                    onChange={e => set('monthsToPay', e.target.value)}
                                />
                            </Field>
                            <Field label="Día de cobro *">
                                <input
                                    type="number"
                                    className="checkout-input"
                                    placeholder="1 – 31"
                                    min="0"
                                    max="31"
                                    value={form.paymentDay}
                                    onChange={e => set('paymentDay', e.target.value)}
                                />
                            </Field>
                        </div>
                        <Field label="Tasa de interés (opcional)">
                            <div className="checkout-suffix-wrap">
                                <input
                                    type="number"
                                    className="checkout-input"
                                    placeholder="5"
                                    min="0"
                                    value={form.interestRate}
                                    onChange={e => set('interestRate', e.target.value)}
                                />
                                <span className="checkout-suffix">%</span>
                            </div>
                        </Field>
                    </>
                )}
            </section>
        </div>
    )
}

function SummaryPanel({ form, cartItems, subtotal, discountPct, discountAmount, isv15, total, error, submitting, isValid, onConfirm }) {
    const isCash = form.paymentType === 'CASH'
    const vuelto = isCash && form.payment ? Number(form.payment) - total : null

    return (
        <div className="checkout-summary">
            <h3 className="checkout-section-title">Resumen de la venta</h3>

            {/* Cliente */}
            <div className="checkout-summary-block">
                <p className="checkout-summary-block-label">Cliente</p>
                {form.customerName
                    ? <p className="checkout-summary-name">{form.customerName}</p>
                    : <p className="checkout-summary-empty">Sin nombre aún</p>
                }

                {!isCash && form.dniStatus === 'found' && form.foundClient && (
                    <p className="checkout-summary-badge checkout-summary-badge--linked">
                        Vinculado: {form.foundClient.name} — {form.foundClient.dni}
                    </p>
                )}
                {!isCash && form.dniStatus === 'not_found' && form.newClientName && (
                    <p className="checkout-summary-badge checkout-summary-badge--new">
                        Nuevo: {form.newClientName}{form.dniInput.trim() ? ` (${form.dniInput.trim()})` : ''}
                    </p>
                )}
            </div>

            {/* Productos */}
            <div className="checkout-summary-block checkout-summary-block--items">
                <p className="checkout-summary-block-label">Productos</p>
                <ul className="checkout-items-list">
                    {cartItems.map(item => (
                        <li key={item.productId} className="checkout-item-row">
                            <span className="checkout-item-name">{item.name}</span>
                            <span className="checkout-item-qty">×{item.quantity}</span>
                            <span className="checkout-item-price">{toCurrency(Number(item.sellPrice) * item.quantity)}</span>
                        </li>
                    ))}
                </ul>
                <div className="checkout-totals">
                    <div className="checkout-total-row">
                        <span>Subtotal</span>
                        <span>{toCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="checkout-total-row" style={{ color: '#1a6b30' }}>
                            <span>Descuento {discountPct}%</span>
                            <span>−{toCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="checkout-total-row">
                        <span>ISV 15%</span>
                        <span>{toCurrency(isv15)}</span>
                    </div>
                    <div className="checkout-total-row checkout-total-row--final">
                        <span>Total</span>
                        <span>{toCurrency(total)}</span>
                    </div>
                    {isCash && form.payment && (
                        <>
                            <div className="checkout-total-row" style={{ marginTop: '6px', borderTop: '1px dashed rgba(31,122,55,0.15)', paddingTop: '8px' }}>
                                <span>Monto recibido</span>
                                <span>{toCurrency(form.payment)}</span>
                            </div>
                            <div className={`checkout-vuelto ${vuelto < 0 ? 'checkout-vuelto--warning' : ''}`}>
                                <span>{vuelto >= 0 ? 'Vuelto' : 'Falta'}</span>
                                <span>{toCurrency(Math.abs(vuelto))}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Pago — INSTALLMENT summary */}
            {!isCash && (
                <div className="checkout-summary-block">
                    <p className="checkout-summary-block-label">
                        Pago — <span className="checkout-summary-type">Plazos</span>
                    </p>
                    <div className="checkout-summary-rows">
                        <div className="checkout-summary-row">
                            <span>Abono inicial</span>
                            <span>{form.payment ? toCurrency(form.payment) : '—'}</span>
                        </div>
                        {total > Number(form.payment) && (
                            <div className="checkout-summary-row">
                                <span>Saldo a financiar</span>
                                <span>{toCurrency(total - Number(form.payment))}</span>
                            </div>
                        )}
                        {total > Number(form.payment) && Number(form.monthsToPay) > 0 && (
                            <div className="checkout-summary-row">
                                <span>Cuota mensual estimada</span>
                                <span>{toCurrency((total - Number(form.payment)) / Number(form.monthsToPay))}</span>
                            </div>
                        )}
                        {form.startingDate && (
                            <div className="checkout-summary-row">
                                <span>Inicio de pagos</span>
                                <span>{form.startingDate}</span>
                            </div>
                        )}
                        {form.monthsToPay && (
                            <div className="checkout-summary-row">
                                <span>Cuotas</span>
                                <span>{form.monthsToPay}</span>
                            </div>
                        )}
                        {form.paymentDay && (
                            <div className="checkout-summary-row">
                                <span>Día de cobro</span>
                                <span>{form.paymentDay}</span>
                            </div>
                        )}
                        {form.interestRate && (
                            <div className="checkout-summary-row">
                                <span>Interés</span>
                                <span>{form.interestRate}%</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="checkout-error">{error}</p>}

            <button
                type="button"
                className="checkout-primary-btn"
                onClick={onConfirm}
                disabled={!isValid || submitting}
            >
                {submitting ? 'Procesando...' : 'Confirmar y facturar'}
            </button>
        </div>
    )
}
