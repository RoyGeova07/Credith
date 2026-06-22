import { useEffect, useState } from 'react'
import { ExportDocumentIcon } from '@/assets/icons'
import { Get } from '@/helpers/fetcher'
import './ManagerReportsPage.css'

const PRODUCT_LIMIT_OPTIONS = [10, 20, 50, 100]

function getCurrentMonthValue() {
  const currentDate = new Date()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  return `${currentDate.getFullYear()}-${month}`
}

function normalizeCompany(company) {
  return {
    companyId: company.companyId,
    name: company.name || 'Sin nombre',
    rtn: company.rtn || 'Sin RTN',
    email: company.email || 'Sin correo',
    address: company.address || 'Sin dirección',
  }
}

function normalizeStore(store) {
  return {
    storeId: store.storeId,
    companyId: store.companyId || store.company?.companyId || '',
    companyName: store.company?.name || 'Sin empresa',
    storeNumber: store.storeNumber ?? 'N/A',
    address: store.address || 'Sin dirección',
    isActive: store.isActive !== false,
  }
}

function toCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function toInteger(value) {
  return Number.parseInt(value || 0, 10)
}

function formatPeriod(period) {
  if (!period) return 'No disponible'

  if (period.type === 'historical') {
    return 'Histórico acumulado'
  }

  const date = new Date(`${period.year}-${String(period.month).padStart(2, '0')}-01T00:00:00`)

  return new Intl.DateTimeFormat('es-HN', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function buildInitialFilters(companies, stores) {
  const companyId = companies[0]?.companyId || ''
  const firstStore = stores.find((store) => store.companyId === companyId)

  return {
    companyId,
    storeId: firstStore?.storeId || '',
    month: getCurrentMonthValue(),
    limit: String(PRODUCT_LIMIT_OPTIONS[0]),
  }
}

function buildQueryString(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  return query.toString()
}

function downloadCsv(filename, rows) {
  const content = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function buildCompanyCsv(report) {
  const company = report?.company

  if (!company) return null

  return {
    filename: `company-report-${company.name.replaceAll(' ', '-').toLowerCase()}.csv`,
    rows: [
      ['Compañía', company.name],
      ['RTN', company.rtn],
      ['Correo', company.email],
      ['Ganancia bruta mensual', toCurrency(company.totalMonthlyGrossGain)],
      ['Ganancia neta mensual', toCurrency(company.totalMonthlyNetGain)],
      [],
      ['ID de tienda', 'Dirección', 'Activa', 'Ganancia bruta', 'Ganancia neta'],
      ...(company.stores || []).map((store) => [
        store.storeId,
        store.address,
        store.isOperating ? 'Sí' : 'No',
        toCurrency(store.monthlyGrossGain),
        toCurrency(store.monthlyNetGain),
      ]),
    ],
  }
}

function buildStoreCsv(report) {
  const store = report?.store

  if (!store) return null

  return {
    filename: `store-report-${store.storeId}.csv`,
    rows: [
      ['ID de tienda', store.storeId],
      ['Dirección', store.address],
      ['Operando', store.isOperating ? 'Sí' : 'No'],
      ['Ganancia bruta mensual', toCurrency(store.monthlyGrossGain)],
      ['Ganancia neta mensual', toCurrency(store.monthlyNetGain)],
      [],
      ['ID de empleado', 'Nombre', 'Correo', 'Activo'],
      ...(store.employees || []).map((employee) => [
        employee.userId,
        employee.fullName,
        employee.email,
        employee.isActive ? 'Sí' : 'No',
      ]),
    ],
  }
}

function buildProductsCsv(report) {
  if (!report?.products?.length) return null

  return {
    filename: 'product-report.csv',
    rows: [
      ['Producto', 'Vendidos', 'En stock', 'Ganancia bruta', 'Ganancia neta', 'Tiendas'],
      ...report.products.map((product) => [
        product.name,
        toInteger(product.quantitySold),
        toInteger(product.inStock),
        toCurrency(product.grossGain),
        toCurrency(product.netGain),
        (product.stores || [])
          .map((store) => `${store.address} | vendidos ${toInteger(store.quantitySold)} | stock ${toInteger(store.inStock)}`)
          .join(' ; '),
      ]),
    ],
  }
}

function EmptySection({ title, description }) {
  return (
    <div className="reports-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function StatCard({ label, value, tone = 'green' }) {
  return (
    <article className={`reports-stat-card reports-stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default function ManagerReportsPage() {
  const [filters, setFilters] = useState({
    companyId: '',
    storeId: '',
    month: getCurrentMonthValue(),
    limit: String(PRODUCT_LIMIT_OPTIONS[0]),
  })
  const [companies, setCompanies] = useState([])
  const [stores, setStores] = useState([])
  const [reports, setReports] = useState({
    company: null,
    store: null,
    product: null,
  })
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [loadingReports, setLoadingReports] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [reportError, setReportError] = useState('')

  async function loadReports(activeFilters) {
    if (!activeFilters.companyId) {
      setReports({ company: null, store: null, product: null })
      return
    }

    setLoadingReports(true)
    setReportError('')

    try {
      const companyQuery = buildQueryString({
        companyId: activeFilters.companyId,
        month: activeFilters.month,
      })
      const productQuery = buildQueryString({
        companyId: activeFilters.companyId,
        month: activeFilters.month,
        limit: activeFilters.limit,
        offset: 0,
      })

      const requests = [
        Get(`/api/reports/companies?${companyQuery}`),
        Get(`/api/reports/products?${productQuery}`),
      ]

      if (activeFilters.storeId) {
        const storeQuery = buildQueryString({
          storeId: activeFilters.storeId,
          month: activeFilters.month,
        })
        requests.push(Get(`/api/reports/stores?${storeQuery}`))
      }

      const responses = await Promise.all(requests)
      const [companyResponse, productResponse, storeResponse] = responses

      if (companyResponse.status !== 200) {
        throw new Error(companyResponse.json.message || 'No se pudo cargar el reporte de compañía')
      }

      if (productResponse.status !== 200) {
        throw new Error(productResponse.json.message || 'No se pudo cargar el reporte de productos')
      }

      if (activeFilters.storeId && storeResponse?.status !== 200) {
        throw new Error(storeResponse?.json.message || 'No se pudo cargar el reporte de tienda')
      }

      setReports({
        company: companyResponse.json,
        product: productResponse.json,
        store: activeFilters.storeId ? storeResponse.json : null,
      })
    } catch (error) {
      setReportError(error.message)
      setReports((current) => ({
        ...current,
        store: activeFilters.storeId ? current.store : null,
      }))
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      Get('/api/companies?limit=100&offset=0'),
      Get('/api/stores?limit=500&offset=0'),
    ])
      .then(async ([companiesResponse, storesResponse]) => {
        if (!isMounted) return

        if (companiesResponse.status !== 200) {
          throw new Error(companiesResponse.json.message || 'No se pudieron cargar las compañías')
        }

        if (storesResponse.status !== 200) {
          throw new Error(storesResponse.json.message || 'No se pudieron cargar las tiendas')
        }

        const normalizedCompanies = (companiesResponse.json.data || []).map(normalizeCompany)
        const normalizedStores = (storesResponse.json.data || []).map(normalizeStore)
        const initialFilters = buildInitialFilters(normalizedCompanies, normalizedStores)

        setCompanies(normalizedCompanies)
        setStores(normalizedStores)
        setFilters(initialFilters)
        await loadReports(initialFilters)
      })
      .catch((error) => {
        if (!isMounted) return
        setCatalogError(error.message)
      })
      .finally(() => {
        if (!isMounted) return
        setLoadingCatalogs(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const visibleStores = filters.companyId
    ? stores.filter((store) => store.companyId === filters.companyId)
    : stores

  const selectedCompany = companies.find((company) => company.companyId === filters.companyId) || null
  const selectedStore = visibleStores.find((store) => store.storeId === filters.storeId) || null
  const productCount = reports.product?.products?.length || 0

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters((current) => {
      if (name === 'companyId') {
        const nextStores = stores.filter((store) => store.companyId === value)

        return {
          ...current,
          companyId: value,
          storeId: nextStores[0]?.storeId || '',
        }
      }

      return {
        ...current,
        [name]: value,
      }
    })
  }

  const handleApplyFilters = async (event) => {
    event.preventDefault()
    await loadReports(filters)
  }

  const handleResetFilters = async () => {
    const nextFilters = buildInitialFilters(companies, stores)
    setFilters(nextFilters)
    await loadReports(nextFilters)
  }

  const companyCsv = buildCompanyCsv(reports.company)
  const storeCsv = buildStoreCsv(reports.store)
  const productsCsv = buildProductsCsv(reports.product)

  return (
    <div className="reports-page">
      <div className="reports-surface">
        <section className="reports-hero">
          <div>
            <p className="reports-eyebrow">Analítica operativa</p>
            <h2>Reportes generales</h2>
            <p className="reports-intro">
              Consulta el estado mensual de compañías, tiendas y productos desde una sola vista.
            </p>
          </div>

          <div className="reports-stat-grid">
            <StatCard
              label="Ganancia neta de compañía"
              value={reports.company?.company ? toCurrency(reports.company.company.totalMonthlyNetGain) : 'Sin datos'}
              tone="green"
            />
            <StatCard
              label="Ganancia neta de tienda"
              value={reports.store?.store ? toCurrency(reports.store.store.monthlyNetGain) : 'Sin datos'}
              tone="blue"
            />
            <StatCard
              label="Productos analizados"
              value={String(productCount)}
              tone="gold"
            />
          </div>
        </section>

        <form className="reports-filters" onSubmit={handleApplyFilters}>
          <div className="reports-filter-grid">
            <label>
              Compañía
              <select name="companyId" value={filters.companyId} onChange={handleFilterChange} disabled={loadingCatalogs}>
                <option value="">Selecciona una compañía</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tienda
              <select name="storeId" value={filters.storeId} onChange={handleFilterChange} disabled={loadingCatalogs || !visibleStores.length}>
                <option value="">Sin tienda específica</option>
                {visibleStores.map((store) => (
                  <option key={store.storeId} value={store.storeId}>
                    #{store.storeNumber} - {store.address}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Mes
              <input name="month" type="month" value={filters.month} onChange={handleFilterChange} />
            </label>

            <label>
              Límite de productos
              <select name="limit" value={filters.limit} onChange={handleFilterChange}>
                {PRODUCT_LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} productos
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="reports-filter-actions">
            <p>
              Si limpias el mes manualmente, el reporte de productos vuelve a histórico y los demás usan el mes actual.
            </p>

            <div>
              <button type="button" className="reports-secondary-button" onClick={handleResetFilters}>
                Restablecer
              </button>
              <button type="submit" className="reports-primary-button" disabled={loadingCatalogs || loadingReports}>
                {loadingReports ? 'Actualizando...' : 'Aplicar filtros'}
              </button>
            </div>
          </div>
        </form>

        {catalogError && <div className="reports-alert reports-alert--error">{catalogError}</div>}
        {reportError && <div className="reports-alert reports-alert--error">{reportError}</div>}

        <div className="reports-sections">
          <section className="reports-card">
            <div className="reports-card-header">
              <div>
                <span className="reports-kicker">Reporte mensual</span>
                <h3>Compañía</h3>
                <p>{reports.company?.period ? formatPeriod(reports.company.period) : 'Sin periodo disponible'}</p>
              </div>

              {companyCsv && (
                <button
                  type="button"
                  className="reports-export-button"
                  onClick={() => downloadCsv(companyCsv.filename, companyCsv.rows)}
                >
                  <ExportDocumentIcon />
                  <span>Exportar CSV</span>
                </button>
              )}
            </div>

            {reports.company?.company ? (
              <>
                <div className="reports-company-summary">
                  <article>
                    <span>Compañía seleccionada</span>
                    <strong>{reports.company.company.name}</strong>
                    <p>{selectedCompany?.address || reports.company.company.email}</p>
                  </article>
                  <article>
                    <span>Ganancia bruta</span>
                    <strong>{toCurrency(reports.company.company.totalMonthlyGrossGain)}</strong>
                    <p>{reports.company.company.rtn}</p>
                  </article>
                  <article>
                    <span>Ganancia neta</span>
                    <strong>{toCurrency(reports.company.company.totalMonthlyNetGain)}</strong>
                    <p>{reports.company.company.email}</p>
                  </article>
                </div>

                <div className="reports-table-wrap">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Tienda</th>
                        <th>Estado</th>
                        <th>Ganancia bruta</th>
                        <th>Ganancia neta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reports.company.company.stores || []).map((store) => (
                        <tr key={store.storeId}>
                          <td>
                            <strong>#{stores.find((item) => item.storeId === store.storeId)?.storeNumber || 'N/A'}</strong>
                            <span>{store.address}</span>
                          </td>
                          <td>{store.isOperating ? 'Activa' : 'Inactiva'}</td>
                          <td>{toCurrency(store.monthlyGrossGain)}</td>
                          <td>{toCurrency(store.monthlyNetGain)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptySection
                title="Sin reporte de compañía"
                description="Selecciona una compañía y aplica filtros para ver el consolidado mensual."
              />
            )}
          </section>

          <section className="reports-card">
            <div className="reports-card-header">
              <div>
                <span className="reports-kicker">Reporte operativo</span>
                <h3>Tienda</h3>
                <p>{reports.store?.period ? formatPeriod(reports.store.period) : 'Selecciona una tienda para cargarlo'}</p>
              </div>

              {storeCsv && (
                <button
                  type="button"
                  className="reports-export-button"
                  onClick={() => downloadCsv(storeCsv.filename, storeCsv.rows)}
                >
                  <ExportDocumentIcon />
                  <span>Exportar CSV</span>
                </button>
              )}
            </div>

            {reports.store?.store ? (
              <>
                <div className="reports-store-banner">
                  <div>
                    <span>{selectedCompany?.name || selectedStore?.companyName || 'Compañía'}</span>
                    <strong>#{selectedStore?.storeNumber || 'N/A'} - {reports.store.store.address}</strong>
                  </div>

                  <div className="reports-store-metrics">
                    <div>
                      <span>Bruta</span>
                      <strong>{toCurrency(reports.store.store.monthlyGrossGain)}</strong>
                    </div>
                    <div>
                      <span>Neta</span>
                      <strong>{toCurrency(reports.store.store.monthlyNetGain)}</strong>
                    </div>
                    <div>
                      <span>Estado</span>
                      <strong>{reports.store.store.isOperating ? 'Activa' : 'Inactiva'}</strong>
                    </div>
                  </div>
                </div>

                <div className="reports-table-wrap">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Correo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reports.store.store.employees || []).map((employee) => (
                        <tr key={employee.userId}>
                          <td>{employee.fullName}</td>
                          <td>{employee.email}</td>
                          <td>{employee.isActive ? 'Activo' : 'Inactivo'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptySection
                title="Sin reporte de tienda"
                description="Selecciona una tienda dentro de la compañía elegida para ver personal y ganancias."
              />
            )}
          </section>

          <section className="reports-card reports-card--products">
            <div className="reports-card-header">
              <div>
                <span className="reports-kicker">Rendimiento por producto</span>
                <h3>Productos</h3>
                <p>{reports.product?.period ? formatPeriod(reports.product.period) : 'Sin periodo disponible'}</p>
              </div>

              {productsCsv && (
                <button
                  type="button"
                  className="reports-export-button"
                  onClick={() => downloadCsv(productsCsv.filename, productsCsv.rows)}
                >
                  <ExportDocumentIcon />
                  <span>Exportar CSV</span>
                </button>
              )}
            </div>

            {reports.product?.products?.length ? (
              <div className="reports-products-grid">
                {reports.product.products.map((product) => (
                  <article className="reports-product-card" key={product.productId}>
                    <div className="reports-product-head">
                      <div>
                        <span className="reports-product-kicker">Producto</span>
                        <h4>{product.name}</h4>
                      </div>
                      <span className="reports-product-pill">{(product.stores || []).length} tiendas</span>
                    </div>

                    <div className="reports-product-metrics">
                      <div>
                        <span>Vendidos</span>
                        <strong>{toInteger(product.quantitySold)}</strong>
                      </div>
                      <div>
                        <span>En stock</span>
                        <strong>{toInteger(product.inStock)}</strong>
                      </div>
                      <div>
                        <span>Bruta</span>
                        <strong>{toCurrency(product.grossGain)}</strong>
                      </div>
                      <div>
                        <span>Neta</span>
                        <strong>{toCurrency(product.netGain)}</strong>
                      </div>
                    </div>

                    <div className="reports-product-stores">
                      {(product.stores || []).length ? (
                        product.stores.map((store) => (
                          <div className="reports-product-store-chip" key={`${product.productId}-${store.storeId}`}>
                            <strong>{store.address}</strong>
                            <span>
                              vendidos {toInteger(store.quantitySold)} | stock {toInteger(store.inStock)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="reports-product-empty">Este producto no tiene movimiento por tienda en el periodo filtrado.</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptySection
                title="Sin datos de productos"
                description="No se encontraron productos para los filtros seleccionados."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
