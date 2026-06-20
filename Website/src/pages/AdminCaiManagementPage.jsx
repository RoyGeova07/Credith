import { useCallback, useEffect, useState } from 'react'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { ActionColumn, CustomAction, DataColumn, DataTable, UpdateAction } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post, Put } from '@/helpers/fetcher'
import './AdminCaiManagementPage.css'
import { toast } from 'react-toastify'
import { Update } from '@/assets/icons'

const WARNING_DAYS = parseInt(import.meta.env.VITE_CAI_WARNING_DAYS ?? '30', 10)

const emptyAddForm = {
    governmentId: '',
    storeId: '',
    expirationDate: '',
    minRange: '',
    maxRange: '',
}

const emptyRenewForm = {
    governmentId: '',
    expirationDate: '',
    minRange: '',
    maxRange: '',
}

function isNearExpiry(dateStr) {
    const diff = new Date(dateStr) - new Date()
    return diff > 0 && diff / (1000 * 60 * 60 * 24) <= WARNING_DAYS
}

function isExpired(dateStr) {
    return new Date(dateStr) <= new Date()
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-HN')
}

function normalizeCai(cai) {
    const store = cai.store || {}
    const expiry = cai.expirationDate
    const expired = isExpired(expiry)
    const nearExpiry = !expired && isNearExpiry(expiry)
    const activeRange = (cai.caiRanges || []).find((r) => r.isActive) || (cai.caiRanges || [])[0] || {}

    return {
        caiId: cai.caiId,
        governmentId: cai.governmentId,
        storeId: cai.storeId || store.storeId || '',
        storeNumber: store.storeNumber != null
            ? `${store.company?.name ?? ''} | #${store.storeNumber}`.trim()
            : '—',
        expirationDate: expiry,
        expirationLabel: formatDate(expiry),
        expirationStatus: expired ? 'expired' : nearExpiry ? 'warning' : 'ok',
        minRange: activeRange.minRange ?? '—',
        maxRange: activeRange.maxRange ?? '—',
        currentNumber: activeRange.currentNumber ?? '—',
        isActive: cai.isActive !== false,
    }
}

function normalizeStore(store) {
    return {
        storeId: store.storeId,
        storeNumber: store.storeNumber,
        companyName: store.company?.name || '',
    }
}

function ExpirationCell({ row }) {
    return (
        <span className={`cai-expiry cai-expiry--${row.expirationStatus}`}>
            {row.expirationLabel}
        </span>
    )
}

export default function AdminCaiManagementPage() {
    const [filter, setFilter] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)
    const [stores, setStores] = useState([])
    const [activeCaiStoreIds, setActiveCaiStoreIds] = useState(new Set())

    const [addOpen, setAddOpen] = useState(false)
    const [addForm, setAddForm] = useState(emptyAddForm)
    const [addError, setAddError] = useState('')

    const [renewOpen, setRenewOpen] = useState(false)
    const [renewingCai, setRenewingCai] = useState(null)
    const [renewForm, setRenewForm] = useState(emptyRenewForm)
    const [renewError, setRenewError] = useState('')

    useEffect(() => {
        Get('/api/stores?limit=500&offset=0')
            .then((res) => {
                if (res.status !== 200) return
                setStores((res.json.data || []).map(normalizeStore))
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        Get('/api/cais?limit=500&offset=0')
            .then((res) => {
                if (res.status !== 200) return
                const ids = new Set(
                    (res.json.data || [])
                        .filter((c) => c.isActive)
                        .map((c) => c.storeId)
                )
                setActiveCaiStoreIds(ids)
            })
            .catch(() => { })
    }, [refreshKey])

    const loadCais = useCallback(
        async (offset, limit) => {
            try {
                const res = await Get(`/api/cais?limit=500&offset=0&_=${refreshKey}`)
                if (res.status !== 200) throw new Error(res.json.message || 'No se pudieron cargar los CAI')

                const term = filter.trim().toLowerCase()
                const cais = (res.json.data || []).map(normalizeCai)
                const filtered = !term
                    ? cais
                    : cais.filter((c) =>
                        [c.governmentId, c.storeNumber, c.expirationLabel]
                            .join(' ')
                            .toLowerCase()
                            .includes(term)
                    )

                return {
                    data: filtered.slice(offset, offset + limit),
                    total: filtered.length,
                }
            } catch (err) {
                toast.error(err.message)
                return { data: [], total: 0 }
            }
        },
        [filter, refreshKey]
    )

    const handleAddChange = (e) => {
        setAddForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        setAddError('')
    }

    const handleRenewChange = (e) => {
        setRenewForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        setRenewError('')
    }

    const availableStores = stores.filter((s) => !activeCaiStoreIds.has(s.storeId))

    const openAdd = () => {
        if (availableStores.length === 0) {
            toast.info('Todas las tiendas ya tienen un CAI activo. Use la opción Renovar.')
            return
        }
        setAddForm(emptyAddForm)
        setAddError('')
        setAddOpen(true)
    }

    const openRenew = (cai) => {
        setRenewingCai(cai)
        setRenewForm(emptyRenewForm)
        setRenewError('')
        setRenewOpen(true)
    }

    const handleAdd = async () => {
        try {
            const minRange = Number(addForm.minRange)
            const maxRange = Number(addForm.maxRange)

            if (!addForm.governmentId.trim()) throw new Error('El número de CAI es requerido')
            if (!addForm.storeId) throw new Error('Selecciona una tienda')
            if (!addForm.expirationDate) throw new Error('La fecha de expiración es requerida')
            if (!Number.isInteger(minRange) || minRange < 0) throw new Error('El rango inicial debe ser un entero positivo')
            if (!Number.isInteger(maxRange) || maxRange < 0) throw new Error('El rango final debe ser un entero positivo')
            if (minRange > maxRange) throw new Error('El rango inicial no puede ser mayor al rango final')

            const res = await Post('/api/cais', JSON.stringify({
                governmentId: addForm.governmentId.trim(),
                storeId: addForm.storeId,
                expirationDate: addForm.expirationDate,
                range: { minRange, maxRange },
            }))

            if (res.status !== 201) throw new Error(res.json.message || 'No se pudo crear el CAI')

            setAddOpen(false)
            setRefreshKey((k) => k + 1)
            toast.success('CAI creado correctamente')
        } catch (err) {
            setAddError(err.message)
            toast.error(err.message)
        }
    }

    const handleRenew = async () => {
        try {
            const minRange = Number(renewForm.minRange)
            const maxRange = Number(renewForm.maxRange)

            if (!renewForm.governmentId.trim()) throw new Error('El número de CAI es requerido')
            if (!renewForm.expirationDate) throw new Error('La fecha de expiración es requerida')
            if (!Number.isInteger(minRange) || minRange < 0) throw new Error('El rango inicial debe ser un entero positivo')
            if (!Number.isInteger(maxRange) || maxRange < 0) throw new Error('El rango final debe ser un entero positivo')
            if (minRange > maxRange) throw new Error('El rango inicial no puede ser mayor al rango final')

            const res = await Post('/api/cais', JSON.stringify({
                governmentId: renewForm.governmentId.trim(),
                storeId: renewingCai.storeId,
                expirationDate: renewForm.expirationDate,
                range: { minRange, maxRange },
                isRenewal: true,
            }))

            if (res.status !== 201) throw new Error(res.json.message || 'No se pudo renovar el CAI')

            setRenewOpen(false)
            setRefreshKey((k) => k + 1)
            toast.success('CAI renovado correctamente')
        } catch (err) {
            setRenewError(err.message)
            toast.error(err.message)
        }
    }

    return (
        <div className="cai-admin-page">
            <DataGrid>
                <DataGridHeader
                    title="CAI"
                    description="Administración"
                    addButtonTxt="Nuevo CAI"
                    onAddClick={openAdd}
                >
                    <HeaderTextFilter
                        filterPlaceholder="Código CAI, tienda o fecha"
                        className="grid-main-filter"
                        value={filter}
                        onChange={setFilter}
                    />
                </DataGridHeader>

                <DataTable onLoad={loadCais} onRowClick={openRenew}>
                    <DataColumn propertyName="storeNumber" title="Tienda" />
                    <DataColumn propertyName="governmentId" title="Código CAI" />
                    <DataColumn
                        propertyName="expirationLabel"
                        title="Vence"
                        render={(row) => <ExpirationCell row={row} />}
                    />
                    <DataColumn propertyName="minRange" title="Rango inicial" />
                    <DataColumn propertyName="maxRange" title="Rango final" />
                    <DataColumn propertyName="currentNumber" title="Factura actual" />
                    <ActionColumn>
                        <CustomAction
                            backgroundColor="#1a6b4a"
                            color="#ffffff"
                            tooltip="Renovar CAI"
                            label="Renovar"
                            icon={Update}
                            onClick={openRenew}
                        />
                    </ActionColumn>
                </DataTable>

                {/* Add CAI dialog */}
                <FormDialog
                    title="Nuevo CAI"
                    isOpen={addOpen}
                    setIsOpen={setAddOpen}
                    onAccept={handleAdd}
                    acceptText="Crear"
                    onClose={() => { setAddOpen(false); setAddError('') }}
                    closeText="Cancelar"
                >
                    {addError && <div className="cai-admin-alert error">{addError}</div>}
                    <form className="cai-dialog-form">
                        <label>
                            Tienda
                            <select name="storeId" value={addForm.storeId} onChange={handleAddChange} required>
                                <option value="">Selecciona una tienda</option>
                                {availableStores.map((s) => (
                                    <option key={s.storeId} value={s.storeId}>
                                        #{s.storeNumber} — {s.companyName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Código CAI
                            <input
                                name="governmentId"
                                value={addForm.governmentId}
                                onChange={handleAddChange}
                                placeholder="A1B2C3-D4E5F6-G7H8I9-J0K1L2-M3N4O5-06"
                                required
                            />
                        </label>

                        <label>
                            Fecha de expiración
                            <input
                                name="expirationDate"
                                type="date"
                                value={addForm.expirationDate}
                                onChange={handleAddChange}
                                required
                            />
                        </label>

                        <div className="cai-dialog-row">
                            <label>
                                Rango inicial
                                <input
                                    name="minRange"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={addForm.minRange}
                                    onChange={handleAddChange}
                                    placeholder="1"
                                    required
                                />
                            </label>

                            <label>
                                Rango final
                                <input
                                    name="maxRange"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={addForm.maxRange}
                                    onChange={handleAddChange}
                                    placeholder="50000"
                                    required
                                />
                            </label>
                        </div>
                    </form>
                </FormDialog>

                {/* Renew CAI dialog */}
                <FormDialog
                    title={`Renovar CAI — Tienda ${renewingCai?.storeNumber ?? ''}`}
                    isOpen={renewOpen}
                    setIsOpen={setRenewOpen}
                    onAccept={handleRenew}
                    acceptText="Renovar"
                    onClose={() => { setRenewOpen(false); setRenewError('') }}
                    closeText="Cancelar"
                >
                    {renewError && <div className="cai-admin-alert error">{renewError}</div>}
                    <p className="cai-renew-note">
                        SAR emitió un nuevo código CAI para esta tienda. Ingresa los datos del nuevo CAI — el anterior quedará inactivo automáticamente.
                    </p>
                    <form className="cai-dialog-form">
                        <label>
                            Nuevo código CAI
                            <input
                                name="governmentId"
                                value={renewForm.governmentId}
                                onChange={handleRenewChange}
                                placeholder="A1B2C3-D4E5F6-G7H8I9-J0K1L2-M3N4O5-06"
                                required
                            />
                        </label>

                        <label>
                            Nueva fecha de expiración
                            <input
                                name="expirationDate"
                                type="date"
                                value={renewForm.expirationDate}
                                onChange={handleRenewChange}
                                required
                            />
                        </label>

                        <div className="cai-dialog-row">
                            <label>
                                Rango inicial
                                <input
                                    name="minRange"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={renewForm.minRange}
                                    onChange={handleRenewChange}
                                    placeholder="1"
                                    required
                                />
                            </label>

                            <label>
                                Rango final
                                <input
                                    name="maxRange"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={renewForm.maxRange}
                                    onChange={handleRenewChange}
                                    placeholder="50000"
                                    required
                                />
                            </label>
                        </div>
                    </form>
                </FormDialog>
            </DataGrid>
        </div>
    )
}
