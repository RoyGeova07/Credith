import { useCallback, useEffect, useState } from 'react'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { DataColumn, DataTable } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post } from '@/helpers/fetcher'
import { toast } from 'react-toastify'
import './AdminCheckoutMachineManagementPage.css'

const emptyForm = {
    machineNumber: '',
    name: '',
    storeId: '',
}

function normalizeMachine(machine) {
    const firstUser = machine.users?.[0]
    const assignedTo = firstUser
        ? [firstUser.first_name, firstUser.second_name, firstUser.first_last_name, firstUser.second_last_name]
            .filter(Boolean).join(' ').trim()
        : 'Sin asignar'

    const storeLabel = machine.store
        ? `${machine.store.company?.name ?? ''} | #${machine.store.storeNumber ?? machine.store.address ?? ''}`.trim()
        : 'Sin tienda'

    return {
        checkoutMachineId: machine.checkoutMachineId,
        machineNumber: machine.machineNumber,
        name: machine.name || '',
        assignedTo,
        storeLabel,
        isActive: machine.isActive !== false,
        statusLabel: machine.isActive !== false ? 'Activa' : 'Inactiva',
    }
}

function normalizeStore(store) {
    return {
        storeId: store.storeId,
        label: `${store.company?.name ?? ''} | #${store.storeNumber ?? store.address ?? ''}`.trim(),
    }
}

export default function AdminCheckoutMachineManagementPage() {
    const [filter, setFilter] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [stores, setStores] = useState([])
    const [error, setError] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        let isMounted = true
        Get('/api/stores?limit=500&offset=0')
            .then((response) => {
                if (!isMounted) return
                if (response.status !== 200) return
                setStores((response.json.data || []).map(normalizeStore))
            })
            .catch(() => {})
        return () => { isMounted = false }
    }, [])

    const loadMachines = useCallback(
        async (offset, limit) => {
            try {
                const response = await Get(`/api/checkout-machines?limit=500&offset=0&_=${refreshKey}`)

                if (response.status !== 200) {
                    throw new Error(response.json.message || 'No se pudieron cargar las cajas')
                }

                const term = filter.trim().toLowerCase()
                const machines = (response.json.data || []).map(normalizeMachine)
                const filtered = !term
                    ? machines
                    : machines.filter((m) =>
                        [String(m.machineNumber), m.name, m.assignedTo, m.storeLabel, m.statusLabel]
                            .join(' ').toLowerCase().includes(term)
                    )

                return {
                    data: filtered.slice(offset, offset + limit),
                    total: filtered.length,
                }
            } catch (requestError) {
                toast.error(requestError.message)
                return { data: [], total: 0 }
            }
        },
        [filter, refreshKey]
    )

    const handleFormChange = (e) => {
        setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
        setError('')
    }

    const openNewDialog = () => {
        setForm(emptyForm)
        setError('')
        setIsDialogOpen(true)
    }

    const handleAccept = async () => {
        const machineNumber = parseInt(form.machineNumber, 10)

        if (!form.machineNumber || isNaN(machineNumber) || machineNumber < 1) {
            setError('El número de caja debe ser un entero positivo')
            return
        }

        if (!form.name.trim()) {
            setError('El nombre de la caja es requerido')
            return
        }

        if (!form.storeId) {
            setError('La tienda es requerida')
            return
        }

        try {
            const response = await Post('/api/checkout-machines', JSON.stringify({
                machineNumber,
                name: form.name.trim(),
                storeId: form.storeId,
            }))

            if (response.status !== 201) {
                throw new Error(response.json.message || 'No se pudo crear la caja')
            }

            setIsDialogOpen(false)
            setForm(emptyForm)
            setRefreshKey((k) => k + 1)
            toast.success('Caja de facturación creada correctamente')
        } catch (requestError) {
            setError(requestError.message)
        }
    }

    const handleClose = () => {
        setIsDialogOpen(false)
        setError('')
    }

    return (
        <div className="machines-admin-page">
            <DataGrid>
                <DataGridHeader
                    title="Cajas de facturación"
                    description="Gestión"
                    addButtonTxt="Nueva caja"
                    onAddClick={openNewDialog}
                >
                    <HeaderTextFilter
                        filterPlaceholder="Número, nombre o empleado"
                        className="grid-main-filter"
                        value={filter}
                        onChange={setFilter}
                    />
                </DataGridHeader>

                <DataTable onLoad={loadMachines} rowsPerPage={8}>
                    <DataColumn propertyName="machineNumber" title="N°" />
                    <DataColumn propertyName="name" title="Nombre" />
                    <DataColumn propertyName="storeLabel" title="Tienda" />
                    <DataColumn propertyName="assignedTo" title="Empleado asignado" />
                    <DataColumn propertyName="statusLabel" title="Estado" />
                </DataTable>

                <FormDialog
                    title="Nueva caja de facturación"
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    onAccept={handleAccept}
                    acceptText="Guardar"
                    onClose={handleClose}
                    closeText="Cancelar"
                >
                    {error && <div className="machines-admin-alert error">{error}</div>}

                    <form className="machines-dialog-form">
                        <label>
                            Número de caja
                            <input
                                name="machineNumber"
                                type="number"
                                min="1"
                                value={form.machineNumber}
                                onChange={handleFormChange}
                                placeholder="1"
                                required
                            />
                        </label>

                        <label>
                            Nombre
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Caja Principal"
                                required
                            />
                        </label>

                        <label>
                            Tienda
                            <select name="storeId" value={form.storeId} onChange={handleFormChange} required>
                                <option value="" disabled>
                                    {stores.length === 0 ? 'No hay tiendas disponibles' : 'Selecciona una tienda'}
                                </option>
                                {stores.map((s) => (
                                    <option key={s.storeId} value={s.storeId}>{s.label}</option>
                                ))}
                            </select>
                        </label>
                    </form>
                </FormDialog>
            </DataGrid>
        </div>
    )
}
