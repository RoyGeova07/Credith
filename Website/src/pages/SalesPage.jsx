import { useEffect, useMemo, useRef, useState } from 'react'
import CartDrawerButton from '@/components/cart/CartDrawerButton'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import MultiSelect from '@/components/multiSelect/MultiSelect'
import { DataGrid } from '@/components/dataGrid/DataGrid'
import { CartIcon } from '@/assets/icons'
import { Get } from '@/helpers/fetcher'
import { toast } from 'react-toastify'
import './SalesPage.css'

const fallbackCategories = [
  { categoryId: 'preview-1', name: 'electrodomesticos', description: 'Linea blanca y pequenos aparatos' },
  { categoryId: 'preview-2', name: 'electronica', description: 'Audio, video y entretenimiento' },
  { categoryId: 'preview-3', name: 'smart home', description: 'Automatizacion y confort conectado' },
  { categoryId: 'preview-4', name: 'tecnologia', description: 'Computacion y accesorios' },
  { categoryId: 'preview-5', name: 'deportes', description: 'Equipos y vida activa' },
  { categoryId: 'preview-6', name: 'cocina', description: 'Preparacion y cuidado del hogar' },
  { categoryId: 'preview-7', name: 'muebles', description: 'Salas, comedores y soluciones funcionales' },
  { categoryId: 'preview-8', name: 'audio', description: 'Parlantes, barras y sonido envolvente' },
]

const fallbackProducts = [
  { productId: 'preview-p1', name: 'Refrigeradora Inverter 18 pies', description: 'Frio uniforme, bajo consumo y diseno moderno.', sellPrice: 24999, imageUrl: 'https://picsum.photos/seed/refrigeradora-servicredith/560/420', categories: [{ name: 'electrodomesticos' }] },
  { productId: 'preview-p2', name: 'Smart TV 55 pulgadas 4K', description: 'Streaming fluido y colores intensos para sala o dormitorio.', sellPrice: 15999, imageUrl: 'https://picsum.photos/seed/smarttv-servicredith/560/420', categories: [{ name: 'electronica' }] },
  { productId: 'preview-p3', name: 'Aspiradora robot inteligente', description: 'Mapeo automatico y control desde el celular.', sellPrice: 8999, imageUrl: 'https://picsum.photos/seed/robot-servicredith/560/420', categories: [{ name: 'smart home' }] },
  { productId: 'preview-p4', name: 'Laptop 15 pulgadas Ryzen', description: 'Ideal para estudio, trabajo y tareas del dia a dia.', sellPrice: 18999, imageUrl: 'https://picsum.photos/seed/laptop-servicredith/560/420', categories: [{ name: 'tecnologia' }] },
  { productId: 'preview-p5', name: 'Bicicleta estatica compacta', description: 'Rutinas en casa con estructura robusta y silenciosa.', sellPrice: 6499, imageUrl: 'https://picsum.photos/seed/deporte-servicredith/560/420', categories: [{ name: 'deportes' }] },
  { productId: 'preview-p6', name: 'Freidora de aire familiar', description: 'Coccion rapida con menos aceite y canasta de gran capacidad.', sellPrice: 3299, imageUrl: 'https://picsum.photos/seed/cocina-servicredith/560/420', categories: [{ name: 'cocina' }] },
]

const pageSizeOptions = [8, 12, 16, 20]

function toCurrency(value) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL', maximumFractionDigits: 0 }).format(Number(value || 0))
}

function formatCategoryName(name) {
  return String(name || '').split(' ').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function normalizeCategory(category, index) {
  const normalizedName = String(category.name || '').trim().toLowerCase()
  return {
    categoryId: category.categoryId || `category-${index}`,
    name: normalizedName,
    label: formatCategoryName(normalizedName),
    description: category.description || '',
  }
}

function normalizeProduct(product, index) {
  return {
    productId: product.productId || `product-${index}`,
    name: product.name || 'Producto sin nombre',
    description: product.description || 'Producto destacado para la vitrina principal.',
    sellPrice: product.sellPrice,
    imageUrl: product.imageUrl || `https://picsum.photos/seed/fallback-servicredith-${index}/560/420`,
    categories: product.categories || [],
  }
}

export default function SalesPage({ session }) {
  const [categories, setCategories] = useState(fallbackCategories.map(normalizeCategory))
  const [selectedCategories, setSelectedCategories] = useState([])
  const [products, setProducts] = useState(fallbackProducts.map(normalizeProduct))
  const [search, setSearch] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(pageSizeOptions[0])
  const [isLimitMenuOpen, setIsLimitMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [productsLoaded, setProductsLoaded] = useState(false)
  const limitMenuRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    Get('/api/categories?limit=24&offset=0')
      .then((response) => {
        if (!isMounted || response.status !== 200) return
        const uniqueCategories = []
        const seenNames = new Set()
        for (const category of response.json.data || []) {
          const normalized = normalizeCategory(category, uniqueCategories.length)
          if (!normalized.name || seenNames.has(normalized.name)) continue
          seenNames.add(normalized.name)
          uniqueCategories.push(normalized)
        }
        if (uniqueCategories.length > 0) setCategories(uniqueCategories)
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    Get('/api/products?limit=100&offset=0')
      .then((response) => {
        if (!isMounted || response.status !== 200) return
        const normalizedProducts = (response.json.data || []).map(normalizeProduct)
        if (normalizedProducts.length > 0) {
          setProducts(normalizedProducts)
          setProductsLoaded(true)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (limitMenuRef.current && !limitMenuRef.current.contains(event.target)) {
        setIsLimitMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCategoryNames = useMemo(
    () => selectedCategories.map((category) => category.value),
    [selectedCategories]
  )

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    const selectedNames = new Set(selectedCategoryNames)
    return products.filter((product) => {
      const productCategories = (product.categories || []).map((category) => String(category.name || '').toLowerCase())
      const matchesCategory = selectedNames.size === 0 || productCategories.some((category) => selectedNames.has(category))
      if (!matchesCategory) return false
      if (!term) return true
      return [product.name, product.description, ...productCategories].join(' ').toLowerCase().includes(term)
    })
  }, [products, search, selectedCategoryNames])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / visibleLimit))
  const displayedProducts = visibleProducts.slice((currentPage - 1) * visibleLimit, currentPage * visibleLimit)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const activeCategoryTitle = useMemo(() => {
    if (selectedCategories.length === 0) return 'Todo el catalogo'
    if (selectedCategories.length === 1) return selectedCategories[0].label
    return `${selectedCategories.length} categorias seleccionadas`
  }, [selectedCategories])

  const loadCategoryOptions = async (categorySearch, _loadedOptions, { page: optionPage }) => {
    const pageSize = 10
    const normalizedSearch = categorySearch.trim().toLowerCase()
    const filteredCategories = categories
      .filter((category) => category.label.toLowerCase().includes(normalizedSearch))
      .map((category) => ({ value: category.name, label: category.label }))
    const start = (optionPage - 1) * pageSize
    return {
      options: filteredCategories.slice(start, start + pageSize),
      hasMore: start + pageSize < filteredCategories.length,
      additional: { page: optionPage + 1 },
    }
  }

  const handleLimitSelect = (limit) => {
    setVisibleLimit(limit)
    setCurrentPage(1)
    setIsLimitMenuOpen(false)
  }

  const handleCategorySelect = (selected) => {
    setSelectedCategories(selected || [])
    setCurrentPage(1)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setCurrentPage(1)
  }

  const handleResetCatalog = () => {
    setSelectedCategories([])
    setSearch('')
    setCurrentPage(1)
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), totalPages))
  }

  const handleAddToCart = (product) => {
    setCartItems((items) => {
      const currentItem = items.find((item) => item.productId === product.productId)
      if (currentItem) {
        return items.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...items, { ...product, quantity: 1 }]
    })
    toast.success(`${product.name} agregado al carrito`)
  }

  const handleIncreaseCartItem = (productId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const handleDecreaseCartItem = (productId) => {
    setCartItems((items) =>
      items.flatMap((item) => {
        if (item.productId !== productId) return [item]
        if (item.quantity <= 1) return []
        return [{ ...item, quantity: item.quantity - 1 }]
      })
    )
  }

  const handleRemoveCartItem = (productId) => {
    setCartItems((items) => items.filter((item) => item.productId !== productId))
  }

  return (
    <>
      <div className="sales-page">
        <DataGrid>
          <div className="data-grid-header">
            <div>
              <p className="data-grid-kicker">Catalogo activo</p>
              <h1 className="data-grid-header-title">
                <button type="button" className="sales-title-reset" onClick={handleResetCatalog}>
                  {activeCategoryTitle}
                </button>
              </h1>
            </div>
            <CartDrawerButton
              buttonLabel="Mi Carrito"
              buttonClassName="sales-cart-header-button"
              items={cartItems}
              onIncreaseItem={handleIncreaseCartItem}
              onDecreaseItem={handleDecreaseCartItem}
              onRemoveItem={handleRemoveCartItem}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>

          <form className="data-grid-filters" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              className="grid-main-filter"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar en el catalogo"
            />
            <div className="sales-category-filter">
              <MultiSelect
                title="Categorias"
                selected={selectedCategories}
                onSelect={handleCategorySelect}
                onLoad={loadCategoryOptions}
                pageSize={10}
              />
            </div>
            <div className="sales-limit-select" ref={limitMenuRef}>
              <button
                type="button"
                className="sales-limit-button"
                onClick={() => setIsLimitMenuOpen((isOpen) => !isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isLimitMenuOpen}
              >
                <span>Ver</span>
                <strong>{visibleLimit}</strong>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isLimitMenuOpen && (
                <div className="sales-limit-menu" role="listbox" aria-label="Cantidad de productos visibles">
                  {pageSizeOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`sales-limit-option ${visibleLimit === option ? 'active' : ''}`}
                      onClick={() => handleLimitSelect(option)}
                      role="option"
                      aria-selected={visibleLimit === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="sales-results-count">{visibleProducts.length} resultados</span>
          </form>

          <div className="sales-grid">
            {displayedProducts.map((product) => (
              <article className="sales-product-card" key={product.productId}>
                <div className="sales-product-media">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="sales-product-body">
                  <p className="sales-product-tag">
                    {formatCategoryName(product.categories?.[0]?.name || selectedCategoryNames[0] || 'destacado')}
                  </p>
                  <h3>{product.name}</h3>
                  <strong className="sales-product-price">{toCurrency(product.sellPrice)}</strong>
                  <button
                    type="button"
                    className="sales-add-cart-button"
                    onClick={() => handleAddToCart(product)}
                    disabled={!productsLoaded}
                  >
                    <CartIcon />
                    <span>{productsLoaded ? 'Agregar al carrito' : 'Cargando...'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <nav className="sales-pagination" aria-label="Paginacion de productos">
            <button
              type="button"
              className="sales-page-arrow"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Pagina anterior"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`sales-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => goToPage(pageNumber)}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              className="sales-page-arrow"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Pagina siguiente"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </nav>
        </DataGrid>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        session={session}
        onBillCreated={() => setCartItems([])}
      />
    </>
  )
}
