import { useEffect, useState } from 'react'
import BagIcon from '../assets/icons/BagIcon'
import BoxIcon from '../assets/icons/BoxIcon'
import CartIcon from '../assets/icons/CartIcon'
import './CartDemoPage.css'

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
