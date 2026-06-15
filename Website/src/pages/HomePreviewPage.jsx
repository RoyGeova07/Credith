import { useEffect, useMemo, useState } from 'react'
import CartDrawerButton from '@/components/cart/CartDrawerButton'
import MultiSelect from '@/components/multiSelect/MultiSelect'
import { Get } from '@/helpers/fetcher'
import logo from '@/assets/logo.png'
import './HomePreviewPage.css'

const fallbackCategories = [
  { categoryId: 'preview-1', name: 'electrodomésticos', description: 'Línea blanca y pequeños aparatos' },
  { categoryId: 'preview-2', name: 'electrónica', description: 'Audio, video y entretenimiento' },
  { categoryId: 'preview-3', name: 'smart home', description: 'Automatización y confort conectado' },
  { categoryId: 'preview-4', name: 'tecnología', description: 'Computación y accesorios' },
  { categoryId: 'preview-5', name: 'deportes', description: 'Equipos y vida activa' },
  { categoryId: 'preview-6', name: 'cocina', description: 'Preparación y cuidado del hogar' },
  { categoryId: 'preview-7', name: 'muebles', description: 'Salas, comedores y soluciones funcionales' },
  { categoryId: 'preview-8', name: 'audio', description: 'Parlantes, barras y sonido envolvente' },
  { categoryId: 'preview-9', name: 'gaming', description: 'Consolas, controles y accesorios gamer' },
  { categoryId: 'preview-10', name: 'bebés', description: 'Cuidado, descanso y seguridad infantil' },
  { categoryId: 'preview-11', name: 'belleza', description: 'Cuidado personal y bienestar diario' },
  { categoryId: 'preview-12', name: 'ofertas', description: 'Promociones activas para vitrina principal' },
]

const fallbackProducts = [
  {
    productId: 'preview-p1',
    name: 'Refrigeradora Inverter 18 pies',
    description: 'Frío uniforme, bajo consumo y diseño moderno.',
    sellPrice: 24999,
    imageUrl: 'https://picsum.photos/seed/refrigeradora-servicredith/560/420',
    categories: [{ name: 'electrodomésticos' }],
  },
  {
    productId: 'preview-p2',
    name: 'Smart TV 55 pulgadas 4K',
    description: 'Streaming fluido y colores intensos para sala o dormitorio.',
    sellPrice: 15999,
    imageUrl: 'https://picsum.photos/seed/smarttv-servicredith/560/420',
    categories: [{ name: 'electrónica' }],
  },
  {
    productId: 'preview-p3',
    name: 'Aspiradora robot inteligente',
    description: 'Mapeo automático y control desde el celular.',
    sellPrice: 8999,
    imageUrl: 'https://picsum.photos/seed/robot-servicredith/560/420',
    categories: [{ name: 'smart home' }],
  },
  {
    productId: 'preview-p4',
    name: 'Laptop 15 pulgadas Ryzen',
    description: 'Ideal para estudio, trabajo y tareas del día a día.',
    sellPrice: 18999,
    imageUrl: 'https://picsum.photos/seed/laptop-servicredith/560/420',
    categories: [{ name: 'tecnología' }],
  },
  {
    productId: 'preview-p5',
    name: 'Bicicleta estática compacta',
    description: 'Rutinas en casa con estructura robusta y silenciosa.',
    sellPrice: 6499,
    imageUrl: 'https://picsum.photos/seed/deporte-servicredith/560/420',
    categories: [{ name: 'deportes' }],
  },
  {
    productId: 'preview-p6',
    name: 'Freidora de aire familiar',
    description: 'Cocción rápida con menos aceite y canasta de gran capacidad.',
    sellPrice: 3299,
    imageUrl: 'https://picsum.photos/seed/cocina-servicredith/560/420',
    categories: [{ name: 'cocina' }],
  },
]

function toCurrency(value) {
  const numericValue = Number(value || 0)
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    maximumFractionDigits: 0,
  }).format(numericValue)
}

function formatCategoryName(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

export default function HomePreviewPage() {
  const [categories, setCategories] = useState(fallbackCategories.map(normalizeCategory))
  const [selectedCategories, setSelectedCategories] = useState([])
  const [products, setProducts] = useState(fallbackProducts.map(normalizeProduct))
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    Get('/api/categories?limit=24&offset=0')
      .then((response) => {
        if (!isMounted || response.status !== 200) {
          return
        }

        const uniqueCategories = []
        const seenNames = new Set()

        for (const category of response.json.data || []) {
          const normalized = normalizeCategory(category, uniqueCategories.length)
          if (!normalized.name || seenNames.has(normalized.name)) {
            continue
          }

          seenNames.add(normalized.name)
          uniqueCategories.push(normalized)
        }

        if (uniqueCategories.length > 0) {
          const mergedCategories = [...uniqueCategories]

          for (const fallbackCategory of fallbackCategories.map(normalizeCategory)) {
            if (mergedCategories.some((category) => category.name === fallbackCategory.name)) {
              continue
            }

            mergedCategories.push(fallbackCategory)
          }

          setCategories(mergedCategories)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    Get('/api/products?limit=24&offset=0')
      .then((response) => {
        if (!isMounted || response.status !== 200) {
          return
        }

        const normalizedProducts = (response.json.data || []).map(normalizeProduct)
        setProducts(normalizedProducts.length > 0 ? normalizedProducts : fallbackProducts.map(normalizeProduct))
      })
      .catch(() => {
        setProducts(fallbackProducts.map(normalizeProduct))
      })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedCategoryNames = useMemo(
    () => selectedCategories.map((category) => category.value),
    [selectedCategories]
  )

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    const selectedNames = new Set(selectedCategoryNames)

    return products.filter((product) => {
      const matchesCategory =
        selectedNames.size === 0 ||
        (product.categories || []).some((category) => selectedNames.has(String(category.name || '').toLowerCase()))

      if (!matchesCategory) {
        return false
      }

      if (!term) {
        return true
      }

      return [product.name, product.description, ...(product.categories || []).map((category) => category.name || '')]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [products, search, selectedCategoryNames])

  const activeCategoryTitle = useMemo(() => {
    if (selectedCategories.length === 0) {
      return 'Todo el catálogo'
    }

    if (selectedCategories.length === 1) {
      return selectedCategories[0].label
    }

    return `${selectedCategories.length} categorías seleccionadas`
  }, [selectedCategories])

  const loadCategoryOptions = async (categorySearch, _loadedOptions, { page }) => {
    const pageSize = 10
    const normalizedSearch = categorySearch.trim().toLowerCase()
    const filteredCategories = categories
      .filter((category) => category.label.toLowerCase().includes(normalizedSearch))
      .map((category) => ({
        value: category.name,
        label: category.label,
      }))

    const start = (page - 1) * pageSize

    return {
      options: filteredCategories.slice(start, start + pageSize),
      hasMore: start + pageSize < filteredCategories.length,
      additional: {
        page: page + 1,
      },
    }
  }

  return (
    <main className="home-preview-page" id="home-preview-top">
      <header className="storefront-header">
        <div className="storefront-topbar">
          <button
            type="button"
            className="storefront-logo-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver al inicio"
          >
            <img src={logo} alt="ServiCredith" className="storefront-logo" />
          </button>

          <label className="storefront-search">
            <span className="storefront-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar en nuestra tienda"
            />
          </label>

          <div className="storefront-category-filter">
            <MultiSelect
              title="Categorías"
              selected={selectedCategories}
              onSelect={(selected) => setSelectedCategories(selected || [])}
              onLoad={loadCategoryOptions}
              pageSize={10}
            />
          </div>

          <CartDrawerButton compact buttonClassName="storefront-cart-button" />
        </div>
      </header>

      <section className="storefront-products">
        <div className="storefront-section-heading">
          <div>
            <p className="storefront-kicker">Categoría activa</p>
            <h2>{activeCategoryTitle}</h2>
          </div>
          <span>{visibleProducts.length} resultados</span>
        </div>

        <div className="storefront-grid">
          {visibleProducts.map((product) => (
            <article className="storefront-card" key={product.productId}>
              <div className="storefront-card-media">
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className="storefront-card-body">
                <p className="storefront-card-tag">
                  {formatCategoryName(product.categories?.[0]?.name || selectedCategoryNames[0] || 'destacado')}
                </p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <strong>{toCurrency(product.sellPrice)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
