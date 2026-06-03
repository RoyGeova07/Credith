import { useEffect, useMemo, useState } from 'react'
import './AdminCompanyManagementPage.css'

const API_BASE = import.meta.env.VITE_BASE_ROUTE || 'http://localhost:3000'

const emptyForm = {
  name: '',
  rtn: '',
  email: '',
  address: '',
}

function normalizeCompany(company) {
  return {
    companyId: company.companyId,
    name: company.name || '',
    rtn: company.rtn || '',
    email: company.email || '',
    address: company.address || '',
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || 'No se pudo completar la solicitud')
  }

  return json
}

export default function AdminCompanyManagementPage() {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedCompany = useMemo(
    () => companies.find((company) => company.companyId === selectedCompanyId),
    [companies, selectedCompanyId]
  )

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return companies
    }

    return companies.filter((company) =>
      [company.name, company.rtn, company.email, company.address]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [companies, search])

  const activeCompanies = companies.length

  useEffect(() => {
    let isMounted = true

    apiRequest('/api/companies?limit=100&offset=0')
      .then((data) => {
        if (!isMounted) {
          return
        }

        setCompanies((data.companies || []).map(normalizeCompany))
      })
      .catch((requestError) => {
        if (!isMounted) {
          return
        }

        setError(requestError.message)
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setNotice('')
  }

  const handleSelectCompany = (company) => {
    setSelectedCompanyId(company.companyId)
    setForm({
      name: company.name,
      rtn: company.rtn,
      email: company.email,
      address: company.address,
    })
    setError('')
    setNotice('')
  }

  const handleNewCompany = () => {
    setSelectedCompanyId(null)
    setForm(emptyForm)
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const payload = {
      name: form.name.trim(),
      rtn: form.rtn.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    }

    try {
      if (selectedCompanyId) {
        const data = await apiRequest(`/api/companies/${selectedCompanyId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const updatedCompany = normalizeCompany(data.company)
        setCompanies((current) =>
          current.map((company) => (company.companyId === selectedCompanyId ? updatedCompany : company))
        )
        setNotice('Empresa actualizada correctamente')
      } else {
        const data = await apiRequest('/api/companies', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const createdCompany = normalizeCompany(data.company)
        setCompanies((current) => [createdCompany, ...current])
        setSelectedCompanyId(createdCompany.companyId)
        setNotice('Empresa creada correctamente')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCompanyId || !selectedCompany) {
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await apiRequest(`/api/companies/${selectedCompanyId}`, {
        method: 'DELETE',
      })
      setCompanies((current) => current.filter((company) => company.companyId !== selectedCompanyId))
      handleNewCompany()
      setNotice('Empresa eliminada correctamente')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="company-admin-page">
      <section className="company-admin-header">
        <div>
          <p className="company-admin-kicker">Administración</p>
          <h1>Compañias</h1>
        </div>

        <button type="button" className="company-admin-primary" onClick={handleNewCompany}>
          Nueva compañia
        </button>
      </section>

      <section className="company-admin-summary" aria-label="Resumen de compañias">
        <div>
          <span>Total</span>
          <strong>{activeCompanies}</strong>
        </div>
        <div>
          <span>Vista</span>
          <strong>{filteredCompanies.length}</strong>
        </div>
        <div>
          <span>Selección</span>
          <strong>{selectedCompany ? 'Edición' : 'Nueva'}</strong>
        </div>
      </section>

      <section className="company-admin-layout">
        <div className="company-admin-list-panel">
          <div className="company-admin-toolbar">
            <label htmlFor="company-search">Buscar</label>
            <input
              id="company-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, RTN, correo o dirección"
            />
          </div>

          <div className="company-admin-table-wrap">
            <table className="company-admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RTN</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="company-admin-empty">
                      Cargando compañias
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredCompanies.map((company) => (
                    <tr
                      key={company.companyId}
                      className={company.companyId === selectedCompanyId ? 'selected' : ''}
                      onClick={() => handleSelectCompany(company)}
                    >
                      <td>{company.name}</td>
                      <td>{company.rtn}</td>
                      <td>{company.email || 'Sin correo'}</td>
                      <td>{company.address || 'Sin dirección'}</td>
                    </tr>
                  ))}

                {!loading && filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan="4" className="company-admin-empty">
                      No hay compañias para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form className="company-admin-form-panel" onSubmit={handleSubmit}>
          <div className="company-admin-form-heading">
            <p>{selectedCompany ? 'Editar compañia' : 'Nueva compañia'}</p>
            <span>{selectedCompany ? selectedCompany.rtn : 'Regístro administrativo'}</span>
          </div>    

          {error && <div className="company-admin-alert error">{error}</div>}
          {notice && <div className="company-admin-alert success">{notice}</div>}

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

          <div className="company-admin-actions">
            <button type="submit" className="company-admin-primary" disabled={saving}>
              {saving ? 'Guardando' : 'Guardar'}
            </button>
            <button type="button" className="company-admin-secondary" onClick={handleNewCompany}>
              Limpiar
            </button>
          </div>

          {selectedCompany && (
            <button type="button" className="company-admin-danger" onClick={handleDelete} disabled={saving}>
              Eliminar compañia
            </button>
          )}
        </form>
      </section>
    </main>
  )
}
