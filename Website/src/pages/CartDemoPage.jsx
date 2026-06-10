import { useEffect, useState } from 'react'
import './CartDemoPage.css'

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.4 5.8h2.1l1.7 8.4a2 2 0 0 0 2 1.6h6.4a2 2 0 0 0 1.9-1.4l1.2-4.6H8.1" />
      <path d="M10.4 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
      <path d="M17.2 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.5 8.2h9l.7 10a2 2 0 0 1-2 2.2H8.8a2 2 0 0 1-2-2.2l.7-10Z" />
      <path d="M9.2 8.2V6.9a2.8 2.8 0 0 1 5.6 0v1.3" />
      <path d="M10 12.2h4" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3.3 7.1 4.1v8.2L12 19.7l-7.1-4.1V7.4L12 3.3Z" />
      <path d="m4.9 7.4 7.1 4.1 7.1-4.1" />
      <path d="M12 11.5v8.2" />
      <path d="m8.4 5.4 7.1 4.1" />
    </svg>
  )
}

function buildSparkles() {
  return Array.from({ length: 16 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 16
    const distance = 34 + Math.random() * 38

    return {
      id: `${Date.now()}-${index}`,
      style: {
        '--x': `${Math.cos(angle) * distance}px`,
        '--y': `${Math.sin(angle) * distance}px`,
        '--delay': `${index * 14}ms`,
      },
    }
  })
}

export default function CartDemoPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleCartClick = () => {
    setSparkles(buildSparkles())
    setIsOpen(true)
    window.setTimeout(() => setSparkles([]), 900)
  }

  return (
    <main className="cart-demo-page">
      <div className="cart-demo-stage">
        <div className="cart-button-wrap">
          <button
            type="button"
            className="cart-trigger"
            aria-expanded={isOpen}
            aria-controls="cart-drawer"
            onClick={handleCartClick}
          >
            <span className="cart-trigger-icon">
              <CartIcon />
            </span>
            <span>Mi Carrito</span>
          </button>

          <span className="cart-sparkle-layer" aria-hidden="true">
            {sparkles.map((sparkle) => (
              <span key={sparkle.id} className="cart-sparkle" style={sparkle.style} />
            ))}
          </span>
        </div>
      </div>

      {isOpen && <button type="button" className="cart-backdrop" aria-label="Cerrar carrito" onClick={() => setIsOpen(false)} />}

      <aside id="cart-drawer" className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="Mi Carrito" aria-modal="true">
        <header className="cart-drawer-header">
          <span className="cart-drawer-mark">
            <BagIcon />
          </span>
          <h1>Mi Carrito</h1>
          <button type="button" className="cart-close" aria-label="Cerrar carrito" onClick={() => setIsOpen(false)}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <section className="cart-empty-state">
          <div className="cart-empty-icon">
            <BoxIcon />
          </div>
          <h2>Tu carrito está vacío</h2>
          <p>Explora el catálogo y agrega productos para continuar.</p>
        </section>
      </aside>
    </main>
  )
}
