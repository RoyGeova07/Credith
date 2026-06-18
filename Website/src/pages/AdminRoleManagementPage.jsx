import { useCallback, useState } from 'react'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { ActionColumn, DataColumn, DataTable, DeleteAction, UpdateAction } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Delete, Get, Post, Put } from '@/helpers/fetcher'
import './AdminRoleManagementPage.css'
import { toast } from 'react-toastify'

const roleOptions = ['Employee', 'Admin', 'Owner']

const emptyForm = {
  name: roleOptions[0],
  description: '',
}

function normalizeRole(role) {
  return {
    roleId: role.roleId,
    name: role.name || '',
    description: role.description || 'Sin descripción',
  }
}

export default function AdminRoleManagementPage() {
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const loadRoles = useCallback(
    async (offset, limit) => {
      try {
        const response = await Get(`/api/roles?limit=100&offset=0&_=${refreshKey}`)

        if (response.status !== 200) {
          throw new Error(response.json.message || 'No se pudieron cargar los roles')
        }

        const term = filter.trim().toLowerCase()
        const roles = (response.json.data || []).map(normalizeRole)
        const filteredRoles = !term
          ? roles
          : roles.filter((role) => [role.name, role.description].join(' ').toLowerCase().includes(term))

        return {
          data: filteredRoles.slice(offset, offset + limit),
          total: filteredRoles.length,
        }
      } catch (requestError) {
        toast.error(requestError.message)

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
    setEditingRole(null)
    setForm(emptyForm)
    setError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (role) => {
    setEditingRole(role)
    setForm({
      name: role.name || roleOptions[0],
      description: role.description === 'Sin descripción' ? '' : role.description || '',
    })
    setError('')
    setIsDialogOpen(true)
  }

  const handleAccept = async () => {
    const payload = {
      name: form.name,
      description: form.description.trim(),
    }

    try {
      const response = editingRole
        ? await Put(`/api/roles/${editingRole.roleId}`, JSON.stringify(payload))
        : await Post('/api/roles', JSON.stringify(payload))

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.json.message || 'No se pudo completar la solicitud')
      }

      setIsDialogOpen(false)
      setRefreshKey((current) => current + 1)
      toast.success(editingRole?`Rol: ${payload.name} actualizado correctamente`:`Rol: ${payload.name} creado correctamente`)
    } catch (requestError) {
      setError(requestError.message)
      toast.error(requestError.message)
    }
  }

  const handleDelete = async (role) => {
    if (!window.confirm(`¿Eliminar el rol "${role.name}"?`)) {
      return
    }

    try {
      const response = await Delete(`/api/roles/${role.roleId}`)

      if (response.status !== 200) {
        throw new Error(response.json.message || 'No se pudo eliminar el rol')
      }

      setRefreshKey((current) => current + 1)
      toast.success(`Rol: ${role.name} eliminado correctamente`)
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setError('')
  }

  return (
    <div className="role-admin-page">
      <DataGrid>
        <DataGridHeader
          title="Roles"
          description="Administración"
          addButtonTxt="Nuevo rol"
          onAddClick={openNewDialog}
        >
          <HeaderTextFilter
            filterPlaceholder="Nombre o descripción"
            className="grid-main-filter"
            value={filter}
            onChange={setFilter}
          />
        </DataGridHeader>

        

        <DataTable onLoad={loadRoles} rowTitle="Click para editar" onRowClick={openEditDialog}>
          <DataColumn propertyName="name" title="Nombre" />
          <DataColumn propertyName="description" title="Descripción" />
          <ActionColumn>
            <UpdateAction onClick={openEditDialog} />
            <DeleteAction onClick={handleDelete} />
          </ActionColumn>
        </DataTable>

        <FormDialog
          title={editingRole ? 'Editar rol' : 'Nuevo rol'}
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onAccept={handleAccept}
          acceptText="Guardar"
          onClose={handleClose}
          closeText="Cancelar"
        >
          {error && <div className="role-admin-alert error">{error}</div>}

          <form className="role-dialog-form">
            <label>
              Nombre del rol
              <select name="name" value={form.name} onChange={handleFormChange} required>
                {roleOptions.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Descripción
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Describe el alcance del rol"
                rows="4"
              />
            </label>
          </form>
        </FormDialog>
      </DataGrid>
    </div>
  )
}
