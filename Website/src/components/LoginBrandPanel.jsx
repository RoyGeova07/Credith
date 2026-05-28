import BrandMark from '@/components/BrandMark'
import './LoginBrandPanel.css'

export default function LoginBrandPanel() {
  return (
    <aside className="login-brand-panel">
      <BrandMark />

      <div className="login-brand-divider" />

      <p className="login-brand-description">
        Acceso interno para administrar usuarios, reportes y operaciones de la sucursal.
      </p>
    </aside>
  )
}
