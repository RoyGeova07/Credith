import { useCallback, useEffect, useState } from 'react'
import { Archive } from '@/assets/icons'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { ActionColumn, CustomAction, DataColumn, DataTable, UpdateAction } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post, Put } from '@/helpers/fetcher'
import './AdminStoreManagementPage.css'
import { toast } from 'react-toastify'

const emptyForm = {
  storeNumber: '',
  address: '',
  companyId: '',
}

function normalizeCompany(company) {
  return {
    companyId: company.companyId,
    name: company.name || '',
    rtn: company.rtn || '',
  }
}

function normalizeStore(store) {
  const company = store.company || {}
  const isActive = store.isActive !== false

  return {
    storeId: store.storeId,
    storeNumber: String(store.storeNumber ?? ''),
    address: store.address || '',
    companyId: store.companyId || company.companyId || '',
    companyName: company.name || 'Sin empresa',
    companyRtn: company.rtn || 'Sin RTN',
    isActive,
    statusLabel: isActive ? 'Activa' : 'Inactiva',
  }
}

export default function AdminStoreManagementPage() {
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [companies, setCompanies] = useState([])
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStore, setPendingStore] = useState(null)

  useEffect(() => {
    let isMounted = true

    Get('/api/companies?limit=100&offset=0')
      .then((response) => {
        if (!isMounted) return
        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar las empresas')
        }
        setCompanies((response.json.data || []).map(normalizeCompany))
      })
      .catch((requestError) => {
        if (!isMounted) return
        toast.error(requestError.message)
      })

    return () => { isMounted = false }
  }, [])

  const loadStores = useCallback(
    async (offset, limit) => {
      try {
        const response = await Get(`/api/stores?limit=500&offset=0&_=${refreshKey}`)

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar las tiendas')
        }

        const term = filter.trim().toLowerCase()
        const stores = (response.json.data || []).map(normalizeStore)
        const filteredStores = !term
          ? stores
          : stores.filter((store) =>
              [store.storeNumber, store.address, store.companyName, store.companyRtn, store.statusLabel]
                .join(' ')
                .toLowerCase()
                .includes(term)
            )

        return {
          data: filteredStores.slice(offset, offset + limit),
          total: filteredStores.length,
        }
      } catch (requestError) {
        toast.error(requestError.message)
        return { data: [], total: 0 }
      }
    },
    [filter, refreshKey]
  )

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setError('')
  }

  const openNewDialog = () => {
    setEditingStore(null)
    setForm(emptyForm)
    setError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (store) => {
    setEditingStore(store)
    setForm({
      storeNumber: store.storeNumber || '',
      address: store.address || '',
      companyId: store.companyId || '',
    })
    setError('')
    setIsDialogOpen(true)
  }

  const buildPayload = () => {
    const parsedStoreNumber = Number(form.storeNumber)

    if (!Number.isInteger(parsedStoreNumber) || parsedStoreNumber <= 0) {
      throw new Error('El número de tienda debe ser un entero positivo')
    }

    if (!form.companyId) {
      throw new Error('Selecciona una empresa para la tienda')
    }

    return {
      storeNumber: parsedStoreNumber,
      address: form.address.trim() || undefined,
      companyId: form.companyId,
    }
  }

  const handleAccept = async () => {
    try {
      const payload = buildPayload()
      const response = editingStore
        ? await Put(`/api/stores/${editingStore.storeId}`, JSON.stringify(payload))
        : await Post('/api/stores', JSON.stringify(payload))

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.json.message || 'No se pudo completar la solicitud')
      }

      setIsDialogOpen(false)
      setRefreshKey((current) => current + 1)
      toast.success(editingStore ? 'Tienda actualizada correctamente' : 'Tienda creada correctamente')
    } catch (requestError) {
      setError(requestError.message)
      toast.error(requestError.message)
    }
  }

  const handleToggleStatus = (store) => {
    setPendingStore(store)
    setConfirmOpen(true)
  }

  const doToggleStatus = async () => {
    if (!pendingStore) return
    setConfirmOpen(false)
    const store = pendingStore
    setPendingStore(null)
    const action = store.isActive ? 'deactivate' : 'activate'

    try {
      const response = await Put(`/api/stores/${action}/${store.storeId}`)

      if (response.status !== 200) {
        throw new Error(response.json.message || 'No se pudo actualizar el estado de la tienda')
      }

      setRefreshKey((current) => current + 1)
      toast.success(store.isActive ? 'Tienda desactivada correctamente' : 'Tienda activada correctamente')
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setError('')
  }

  return (
    <div className="store-admin-page">
      <DataGrid>
        <DataGridHeader
          title="Tiendas"
          description="Administración"
          addButtonTxt="Nueva tienda"
          onAddClick={openNewDialog}
        >
          <HeaderTextFilter
            filterPlaceholder="Número, dirección, empresa, RTN o estado"
            className="grid-main-filter"
            value={filter}
            onChange={setFilter}
          />
        </DataGridHeader>

        <DataTable onLoad={loadStores} rowTitle="Click para editar" onRowClick={openEditDialog}>
          <DataColumn propertyName="storeNumber" title="Número de tienda" />
          <DataColumn propertyName="address" title="Dirección" />
          <DataColumn propertyName="companyName" title="Empresa" />
          <DataColumn propertyName="companyRtn" title="RTN" />
          <DataColumn propertyName="statusLabel" title="Estado" />
          <ActionColumn>
            <UpdateAction onClick={openEditDialog} />
            <CustomAction
              backgroundColor="#d97706"
              color="#ffffff"
              icon={Archive}
              tooltip="Cambiar estado"
              onClick={handleToggleStatus}
            />
          </ActionColumn>
        </DataTable>

        <FormDialog
          title={editingStore ? 'Editar tienda' : 'Nueva tienda'}
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onAccept={handleAccept}
          acceptText="Guardar"
          onClose={handleClose}
          closeText="Cancelar"
        >
          {error && <div className="store-admin-alert error">{error}</div>}

          <form className="store-dialog-form">
            <label>
              Número de tienda
              <input
                name="storeNumber"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.storeNumber}
                onChange={handleFormChange}
                placeholder="1"
                required
              />
            </label>

            <label>
              Dirección
              <textarea
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Tegucigalpa, Honduras"
                rows="3"
              />
            </label>

            <label>
              Empresa
              <select name="companyId" value={form.companyId} onChange={handleFormChange} required>
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.name} {company.rtn ? `- ${company.rtn}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </FormDialog>

        <FormDialog
          title="Confirmar acción"
          isOpen={confirmOpen}
          setIsOpen={setConfirmOpen}
          onAccept={doToggleStatus}
          acceptText="Confirmar"
          onClose={() => { setConfirmOpen(false); setPendingStore(null) }}
          closeText="Cancelar"
        >
          <p>
            {pendingStore?.isActive
              ? `¿Desactivar la tienda #${pendingStore.storeNumber}?`
              : `¿Activar la tienda #${pendingStore?.storeNumber}?`}
          </p>
        </FormDialog>
      </DataGrid>
    </div>
  )
}
