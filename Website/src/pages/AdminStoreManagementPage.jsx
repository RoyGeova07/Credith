import { useEffect, useMemo, useState } from 'react'
import './AdminStoreManagementPage.css'

const API_BASE = import.meta.env.VITE_BASE_ROUTE || 'http://localhost:3000'

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

  return {
    storeId: store.storeId,
    address: store.address ?? '',
    isActive: store.isActive !== false,
    companyId: store.companyId || company.companyId || '',
    companyName: company.name || 'Sin empresa',
    companyRtn: company.rtn || '',
  }
}

async function apiRequest(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders || {}),
    },
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || 'No se pudo completar la solicitud')
  }

  return json
}

export default function AdminStoreManagementPage() {
  const [stores, setStores] = useState([])
  const [companies, setCompanies] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedStore = useMemo(
    () => stores.find((store) => store.storeId === selectedStoreId),
    [stores, selectedStoreId]
  )

  const filteredStores = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return stores
    }

    return stores.filter((store) =>
      [
        store.address,
        store.companyName,
        store.companyRtn,
        store.isActive ? 'activa' : 'inactiva',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [stores, search])

  const activeStores = stores.filter((store) => store.isActive).length
  const inactiveStores = stores.length - activeStores

  const fillFormFromStore = (store) => {
    setSelectedStoreId(store.storeId)
    setForm({
      address: String(store.address),
      companyId: store.companyId,
    })
    setError('')
    setNotice('')
  }

  const refreshStores = async (targetStoreId) => {
    const data = await apiRequest('/api/stores?limit=100&offset=0')
    const nextStores = (data.stores || []).map(normalizeStore)

    setStores(nextStores)

    if (targetStoreId) {
      const targetStore = nextStores.find((store) => store.storeId === targetStoreId)

      if (targetStore) {
        fillFormFromStore(targetStore)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      apiRequest('/api/stores?limit=100&offset=0'),
      apiRequest('/api/companies?limit=100&offset=0'),
    ])
      .then(([storeData, companyData]) => {
        if (!isMounted) {
          return
        }

        setStores((storeData.stores || []).map(normalizeStore))
        setCompanies((companyData.companies || []).map(normalizeCompany))
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
    setError('')
    setNotice('')
  }

  const handleNewStore = () => {
    setSelectedStoreId(null)
    setForm(emptyForm)
    setError('')
    setNotice('')
  }

  const handleStoreRowKeyDown = (event, store) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fillFormFromStore(store)
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = buildPayload()

      if (selectedStoreId) {
        await apiRequest(`/api/stores/${selectedStoreId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        await refreshStores(selectedStoreId)
        setNotice('Tienda actualizada correctamente')
      } else {
        const data = await apiRequest('/api/stores', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        await refreshStores(data.store?.storeId)
        setNotice('Tienda creada correctamente')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedStoreId || !selectedStore) {
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const action = selectedStore.isActive ? 'deactivate' : 'activate'

      await apiRequest(`/api/stores/${action}/${selectedStoreId}`, {
        method: 'PUT',
      })

      await refreshStores(selectedStoreId)
      setNotice(selectedStore.isActive ? 'Tienda desactivada correctamente' : 'Tienda activada correctamente')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="store-admin-page">
      <section className="store-admin-header">
        <div>
          <p className="store-admin-kicker">Administración</p>
          <h1>Tiendas</h1>
        </div>

        <button type="button" className="store-admin-primary" onClick={handleNewStore}>
          Nueva tienda
        </button>
      </section>

      <section className="store-admin-summary" aria-label="Resumen de tiendas">
        <div>
          <span>Total</span>
          <strong>{stores.length}</strong>
        </div>
        <div>
          <span>Activas</span>
          <strong>{activeStores}</strong>
        </div>
        <div>
          <span>Inactivas</span>
          <strong>{inactiveStores}</strong>
        </div>
      </section>

      <section className="store-admin-layout">
        <div className="store-admin-list-panel">
          <div className="store-admin-toolbar">
            <label htmlFor="store-search">Buscar</label>
            <input
              id="store-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Dirección, empresa, RTN o estado"
            />
          </div>

          <div className="store-admin-table-wrap">
            <table className="store-admin-table">
              <thead>
                <tr>
                  <th>Dirección</th>
                  <th>Empresa</th>
                  <th>RTN</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="store-admin-empty">
                      Cargando tiendas
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredStores.map((store) => (
                    <tr
                      key={store.storeId}
                      className={store.storeId === selectedStoreId ? 'selected' : ''}
                      role="button"
                      tabIndex={0}
                      onClick={() => fillFormFromStore(store)}
                      onKeyDown={(event) => handleStoreRowKeyDown(event, store)}
                    >
                      <td>{store.address}</td>
                      <td>{store.companyName}</td>
                      <td>{store.companyRtn || 'Sin RTN'}</td>
                      <td>
                        <span className={`store-admin-status ${store.isActive ? 'active' : 'inactive'}`}>
                          {store.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredStores.length === 0 && (
                  <tr>
                    <td colSpan="4" className="store-admin-empty">
                      No hay tiendas para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form className="store-admin-form-panel" onSubmit={handleSubmit}>
          <div className="store-admin-form-heading">
            <p>{selectedStore ? 'Editar tienda' : 'Nueva tienda'}</p>
            <span>{selectedStore ? selectedStore.companyName : 'Registro administrativo'}</span>
          </div>

          {error && <div className="store-admin-alert error">{error}</div>}
          {notice && <div className="store-admin-alert success">{notice}</div>}

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

          <div className="store-admin-actions">
            <button type="submit" className="store-admin-primary" disabled={saving || loading}>
              {saving ? 'Guardando' : 'Guardar'}
            </button>
            <button type="button" className="store-admin-secondary" onClick={handleNewStore}>
              Limpiar
            </button>
          </div>

          {selectedStore && (
            <button
              type="button"
              className={`store-admin-status-action ${selectedStore.isActive ? 'deactivate' : 'activate'}`}
              onClick={handleToggleStatus}
              disabled={saving}
            >
              {selectedStore.isActive ? 'Desactivar tienda' : 'Activar tienda'}
            </button>
          )}
        </form>
      </section>
    </main>
  )
}
