import { useCallback, useEffect, useState } from 'react'
import { Archive } from '@/assets/icons'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { ActionColumn, CustomAction, DataColumn, DataTable, UpdateAction } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post, Put } from '@/helpers/fetcher'
import './AdminStoreManagementPage.css'

const emptyForm = {
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
    address: String(store.address ?? ''),
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
  const [feedback, setFeedback] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    Get('/api/companies?limit=100&offset=0')
      .then((response) => {
        if (!isMounted) {
          return
        }

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar las empresas')
        }

        setCompanies((response.json.companies || []).map(normalizeCompany))
      })
      .catch((requestError) => {
        if (!isMounted) {
          return
        }

        setFeedback({
          type: 'error',
          message: requestError.message,
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  const loadStores = useCallback(
    async (offset, limit) => {
      try {
        const response = await Get(`/api/stores?limit=500&offset=0&_=${refreshKey}`)

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar las tiendas')
        }

        const term = filter.trim().toLowerCase()
        const stores = (response.json.stores || []).map(normalizeStore)
        const filteredStores = !term
          ? stores
          : stores.filter((store) =>
              [store.address, store.companyName, store.companyRtn, store.statusLabel]
                .join(' ')
                .toLowerCase()
                .includes(term)
            )

        return {
          data: filteredStores.slice(offset, offset + limit),
          total: filteredStores.length,
        }
      } catch (requestError) {
        setFeedback({
          type: 'error',
          message: requestError.message,
        })

        return {
          data: [],
          total: 0,
        }
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
      address: store.address || '',
      companyId: store.companyId || '',
    })
    setError('')
    setIsDialogOpen(true)
  }

  const buildPayload = () => {
    const parsedAddress = Number(form.address)

    if (!Number.isInteger(parsedAddress)) {
      throw new Error('La dirección debe ser un número entero')
    }

    if (!form.companyId) {
      throw new Error('Selecciona una empresa para la tienda')
    }

    return {
      address: parsedAddress,
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
      setFeedback({
        type: 'success',
        message: editingStore ? 'Tienda actualizada correctamente' : 'Tienda creada correctamente',
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleToggleStatus = async (store) => {
    const action = store.isActive ? 'deactivate' : 'activate'
    const prompt = store.isActive
      ? `¿Desactivar la tienda ${store.address}?`
      : `¿Activar la tienda ${store.address}?`

    if (!window.confirm(prompt)) {
      return
    }

    try {
      const response = await Put(`/api/stores/${action}/${store.storeId}`)

      if (response.status !== 200) {
        throw new Error(response.json.message || 'No se pudo actualizar el estado de la tienda')
      }

      setRefreshKey((current) => current + 1)
      setFeedback({
        type: 'success',
        message: store.isActive ? 'Tienda desactivada correctamente' : 'Tienda activada correctamente',
      })
    } catch (requestError) {
      setFeedback({
        type: 'error',
        message: requestError.message,
      })
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setError('')
  }

  return (
    <main className="store-admin-page">
      <DataGrid>
        <DataGridHeader
          title="Tiendas"
          description="Administración"
          addButtonTxt="Nueva tienda"
          onAddClick={openNewDialog}
        >
          <HeaderTextFilter
            filterPlaceholder="Dirección, empresa, RTN o estado"
            className="grid-main-filter"
            value={filter}
            onChange={setFilter}
          />
        </DataGridHeader>

        {feedback && <div className={`store-admin-alert ${feedback.type}`}>{feedback.message}</div>}

        <DataTable onLoad={loadStores} rowTitle="Click para editar" onRowClick={openEditDialog}>
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
              Dirección
              <input
                name="address"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.address}
                onChange={handleFormChange}
                placeholder="101"
                required
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
      </DataGrid>
    </main>
  )
}
