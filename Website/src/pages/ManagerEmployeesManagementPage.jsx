import { useCallback, useEffect, useState } from 'react'
import { Archive } from '@/assets/icons'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { ActionColumn, CustomAction, DataColumn, DataTable } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post, Put } from '@/helpers/fetcher'
import './ManagerEmployeesManagementPage.css'

const emptyForm = {
  first_name: '',
  second_name: '',
  first_last_name: '',
  second_last_name: '',
  email: '',
  password: '',
  storeId: '',
}

function buildFullName(user) {
  return [user.first_name, user.second_name, user.first_last_name, user.second_last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function normalizeStore(store) {
  return {
    storeId: store.storeId,
    address: String(store.address ?? ''),
    companyName: store.company?.name || '',
  }
}

function normalizeUser(user, storesById) {
  const isActive = user.isActive !== false
  const store = storesById.get(user.storeId)
  const storeLabel = store ? `Tienda ${store.address}${store.companyName ? ` - ${store.companyName}` : ''}` : 'Sin tienda'

  return {
    userId: user.userId,
    fullName: buildFullName(user),
    first_name: user.first_name || '',
    second_name: user.second_name || '',
    first_last_name: user.first_last_name || '',
    second_last_name: user.second_last_name || '',
    email: user.email || '',
    storeId: user.storeId || '',
    storeLabel,
    isActive,
    statusLabel: isActive ? 'Activo' : 'Inactivo',
  }
}

export default function ManagerEmployeesManagementPage() {
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [stores, setStores] = useState([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    Get('/api/stores?limit=500&offset=0')
      .then((response) => {
        if (!isMounted) {
          return
        }

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar las tiendas')
        }

        setStores((response.json.data || []).map(normalizeStore))
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

  const loadUsers = useCallback(
    async (offset, limit) => {
      try {
        const response = await Get(`/api/users?limit=500&offset=0&_=${refreshKey}`)

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar los empleados')
        }

        const storesById = new Map(stores.map((store) => [store.storeId, store]))
        const term = filter.trim().toLowerCase()
        const users = (response.json.data || []).map((user) => normalizeUser(user, storesById))
        const filteredUsers = !term
          ? users
          : users.filter((user) =>
              [user.fullName, user.email, user.storeLabel, user.statusLabel].join(' ').toLowerCase().includes(term)
            )

        return {
          data: filteredUsers.slice(offset, offset + limit),
          total: filteredUsers.length,
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
    [filter, refreshKey, stores]
  )

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setError('')
  }

  const openNewDialog = () => {
    setForm(emptyForm)
    setError('')
    setIsDialogOpen(true)
  }

  const handleAccept = async () => {
    const payload = {
      first_name: form.first_name.trim(),
      second_name: form.second_name.trim(),
      first_last_name: form.first_last_name.trim(),
      second_last_name: form.second_last_name.trim(),
      email: form.email.trim(),
      password: form.password,
      storeId: form.storeId,
    }

    try {
      const response = await Post('/api/users', JSON.stringify(payload))

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.json.message || 'No se pudo crear el empleado')
      }

      setIsDialogOpen(false)
      setForm(emptyForm)
      setRefreshKey((current) => current + 1)
      setFeedback({
        type: 'success',
        message: 'Empleado creado correctamente',
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'desactivate' : 'activate'
    const prompt = user.isActive
      ? `Deseas desactivar a ${user.fullName}?`
      : `Deseas activar a ${user.fullName}?`

    if (!window.confirm(prompt)) {
      return
    }

    try {
      const response = await Put(`/api/users/${action}/${user.userId}`)

      if (response.status !== 200) {
        throw new Error(response.json.message || 'No se pudo actualizar el estado del empleado')
      }

      setRefreshKey((current) => current + 1)
      setFeedback({
        type: 'success',
        message: user.isActive ? 'Empleado desactivado correctamente' : 'Empleado activado correctamente',
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
    <div className="employees-admin-page">
      <DataGrid>
        <DataGridHeader
          title="Empleados"
          description="Gestión"
          addButtonTxt="Nuevo empleado"
          onAddClick={openNewDialog}
        >
          <HeaderTextFilter
            filterPlaceholder="Nombre, correo, tienda o estado"
            className="grid-main-filter"
            value={filter}
            onChange={setFilter}
          />
        </DataGridHeader>

        {feedback && <div className={`employees-admin-alert ${feedback.type}`}>{feedback.message}</div>}

        <DataTable onLoad={loadUsers} rowsPerPage={8}>
          <DataColumn propertyName="fullName" title="Nombre completo" />
          <DataColumn propertyName="email" title="Correo" />
          <DataColumn propertyName="storeLabel" title="Tienda" />
          <DataColumn
            propertyName="statusLabel"
            title="Estado"
            render={(row) => (
              <span className={`employee-status-badge ${row.isActive ? 'active' : 'inactive'}`}>{row.statusLabel}</span>
            )}
          />
          <ActionColumn>
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
          title="Nuevo empleado"
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onAccept={handleAccept}
          acceptText="Guardar"
          onClose={handleClose}
          closeText="Cancelar"
        >
          {error && <div className="employees-admin-alert error">{error}</div>}

          <form className="employees-dialog-form">
            <label>
              Primer nombre
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleFormChange}
                placeholder="Carlos"
                required
              />
            </label>

            <label>
              Segundo nombre
              <input
                name="second_name"
                value={form.second_name}
                onChange={handleFormChange}
                placeholder="Andres"
                required
              />
            </label>

            <label>
              Primer apellido
              <input
                name="first_last_name"
                value={form.first_last_name}
                onChange={handleFormChange}
                placeholder="Lopez"
                required
              />
            </label>

            <label>
              Segundo apellido
              <input
                name="second_last_name"
                value={form.second_last_name}
                onChange={handleFormChange}
                placeholder="Martinez"
                required
              />
            </label>

            <label className="employees-dialog-form--wide">
              Correo
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="empleado@servicredith.com"
                required
              />
            </label>

            <label>
              Contraseña temporal
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                placeholder="Mínimo 6 caracteres"
                minLength="6"
                required
              />
            </label>

            <label>
              Tienda
              <select name="storeId" value={form.storeId} onChange={handleFormChange} required>
                <option value="">Selecciona una tienda</option>
                {stores.map((store) => (
                  <option key={store.storeId} value={store.storeId}>
                    Tienda {store.address}
                    {store.companyName ? ` - ${store.companyName}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </FormDialog>
      </DataGrid>
    </div>
  )
}
