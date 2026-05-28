import BrandMark from '@/components/BrandMark'
import './BrandPanel.css'

export default function BrandPanel({
  description = 'Unete a nuestra red de inversiones y forma parte de una comunidad que crece contigo. Gestiona tus creditos e inversiones con total confianza.',
}) {
  return (
    <aside className="brand-panel">
      <BrandMark />

      <div className="brand-divider" />

      <p className="brand-description">{description}</p>
    </aside>
  )
}
