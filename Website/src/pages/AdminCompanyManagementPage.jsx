import { useState, useCallback } from 'react'
import { DataGrid, DataGridHeader, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { DataColumn, DataTable } from '@/components/dataGrid/DataTable'
import FormDialog from '@/components/dialogs/SubmitDialog'
import { Get, Post, Put } from '@/helpers/fetcher'
import './AdminCompanyManagementPage.css'

const emptyForm = {
  name: '',
  rtn: '',
  email: '',
  address: '',
}

export default function AdminCompanyManagementPage() {
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const loadCompanies = useCallback(async (offset, limit) => {
    const res = await Get(`/api/companies?filter=${filter}&offset=${offset}&limit=${limit}&_=${refreshKey}`)
    if (res.status !== 200) {
      throw new Error(res.json.message || 'No se pudieron cargar las compañías')
    }
    return res.json
  }, [filter, refreshKey])

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setError('')
  }

  const openNewDialog = () => {
    setEditingCompany(null)
    setForm(emptyForm)
    setError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (company) => {
    setEditingCompany(company)
    setForm({
      name: company.name || '',
      rtn: company.rtn || '',
      email: company.email || '',
      address: company.address || '',
    })
    setError('')
    setIsDialogOpen(true)
  }

  const handleAccept = async () => {
    const payload = {
      name: form.name.trim(),
      rtn: form.rtn.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    }

    try {
      let res

      if (editingCompany) {
        res = await Put(`/api/companies/${editingCompany.companyId}`, JSON.stringify(payload))
      } else {
        res = await Post('/api/companies', JSON.stringify(payload))
      }

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.json.message || 'No se pudo completar la solicitud')
      }

      setIsDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setError('')
  }

  return (
    <DataGrid>
      <DataGridHeader
        title='Compañías'
        description='Administración'
        addButtonTxt='Nueva compañía'
        onAddClick={openNewDialog}>
        <HeaderTextFilter
          filterPlaceholder='Nombre, RTN, correo o dirección'
          className='grid-main-filter'
          value={filter}
          onChange={setFilter}
        />
      </DataGridHeader>

      <DataTable
        onLoad={loadCompanies}
        rowTitle='Click para editar'
        onRowClick={openEditDialog}>
        <DataColumn propertyName='name' title='Nombre' />
        <DataColumn propertyName='rtn' title='RTN' />
        <DataColumn propertyName='email' title='Correo' />
        <DataColumn propertyName='address' title='Dirección' />
      </DataTable>

      <FormDialog
        title={editingCompany ? 'Editar compañía' : 'Nueva compañía'}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onAccept={handleAccept}
        acceptText='Guardar'
        onClose={handleClose}
        closeText='Cancelar'>

        {error && <div className="company-admin-alert error">{error}</div>}

        <form className="company-dialog-form">
          <label>
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="ServiCredith"
              required
            />
          </label>

          <label>
            RTN
            <input
              name="rtn"
              value={form.rtn}
              onChange={handleFormChange}
              placeholder="08011999123456"
              required
            />
          </label>

          <label>
            Correo
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="contacto@servicredith.com"
            />
          </label>

          <label>
            Dirección
            <textarea
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Tegucigalpa, Honduras"
              rows="4"
            />
          </label>
        </form>
      </FormDialog>
    </DataGrid>
  )
}
