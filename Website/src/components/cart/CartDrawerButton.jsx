import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BagIcon, BoxIcon, CartIcon } from '@/assets/icons'
import './CartDrawerButton.css'

function toCurrency(value) {
  const numericValue = Number(value || 0)
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    maximumFractionDigits: 0,
  }).format(numericValue)
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

export default function CartDrawerButton({
  buttonClassName = '',
  compact = false,
  buttonLabel = 'Mi Carrito',
  items = [],
  onIncreaseItem,
  onDecreaseItem,
  onRemoveItem,
  onCheckout,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + Number(item.sellPrice || 0) * item.quantity, 0)

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

  const overlay =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            {isOpen && (
              <button
                type="button"
                className="cart-backdrop"
                aria-label="Cerrar carrito"
                onClick={() => setIsOpen(false)}
              />
            )}

            <aside
              id="cart-drawer"
              className={`cart-drawer ${isOpen ? 'open' : ''}`}
              aria-label="Mi Carrito"
              aria-modal="true"
            >
              <header className="cart-drawer-header">
                <span className="cart-drawer-mark">
                  <BagIcon />
                </span>
                <h1>Mi Carrito</h1>
                <button
                  type="button"
                  className="cart-close"
                  aria-label="Cerrar carrito"
                  onClick={() => setIsOpen(false)}
                >
                  <span aria-hidden="true">x</span>
                </button>
              </header>

              {items.length > 0 ? (
                <section className="cart-items">
                  <div className="cart-items-list">
                    {items.map((item) => (
                      <article className="cart-item" key={item.productId}>
                        <div className="cart-item-media">
                          <img src={item.imageUrl} alt={item.name} />
                        </div>
                        <div className="cart-item-info">
                          <p>{item.categories?.[0]?.name || 'Producto'}</p>
                          <h2>{item.name}</h2>
                          <div className="cart-item-controls">
                            <button
                              type="button"
                              className="cart-qty-button"
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              onClick={() => onDecreaseItem?.(item.productId)}
                            >
                              -
                            </button>
                            <span className="cart-qty-value">Cantidad: {item.quantity}</span>
                            <button
                              type="button"
                              className="cart-qty-button"
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              onClick={() => onIncreaseItem?.(item.productId)}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              className="cart-remove-button"
                              aria-label={`Eliminar ${item.name} del carrito`}
                              onClick={() => onRemoveItem?.(item.productId)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <strong>{toCurrency(Number(item.sellPrice || 0) * item.quantity)}</strong>
                      </article>
                    ))}
                  </div>

                  <footer className="cart-summary">
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <strong>{toCurrency(subtotal)}</strong>
                    </div>
                    <button
                      type="button"
                      className="cart-checkout-btn"
                      onClick={() => { setIsOpen(false); onCheckout?.() }}
                    >
                      Procesar venta
                    </button>
                  </footer>
                </section>
              ) : (
                <section className="cart-empty-state">
                  <div className="cart-empty-icon">
                    <BoxIcon />
                  </div>
                  <h2>Tu carrito esta vacio</h2>
                  <p>Explora el catalogo y agrega productos para continuar.</p>
                </section>
              )}
            </aside>
          </>,
          document.body
        )
      : null

  return (
    <>
      <div className="cart-button-wrap">
        <button
          type="button"
          className={`cart-trigger ${compact ? 'compact' : ''} ${buttonClassName}`.trim()}
          aria-expanded={isOpen}
          aria-controls="cart-drawer"
          onClick={handleCartClick}
        >
          <span className="cart-trigger-icon">
            <CartIcon />
          </span>
          {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
          {!compact && <span>{buttonLabel}</span>}
        </button>

        <span className="cart-sparkle-layer" aria-hidden="true">
          {sparkles.map((sparkle) => (
            <span key={sparkle.id} className="cart-sparkle" style={sparkle.style} />
          ))}
        </span>
      </div>
      {overlay}
    </>
  )
}
