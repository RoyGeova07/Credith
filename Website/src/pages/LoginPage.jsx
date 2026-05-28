import { useState } from 'react'
import BrandPanel from '@/components/BrandPanel'
import BrandMark from '@/components/BrandMark'
import DualPanel from '@/components/DualPanel'
import FormField from '@/components/form/FormField'
import './LoginPage.css'

const users = [
  {
    email: 'admin.tienda@servicredith.com',
    password: 'Admin123',
    role: 'Administrador de tienda',
    branch: 'ServiCredith Central',
  },
  {
    email: 'empleado.tienda@servicredith.com',
    password: 'Empleado123',
    role: 'Empleado de tienda',
    branch: 'ServiCredith Central',
  },
]

const initialForm = {
  email: '',
  password: '',
}

function validate(form) {
  const errors = {}

  if (!form.email.trim()) {
    errors.email = 'El correo es requerido'
  }

  if (!form.password.trim()) {
    errors.password = 'La contrasena es requerida'
  }

  return errors
}

export default function LoginPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [activeUser, setActiveUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const updatedForm = { ...form, [event.target.name]: event.target.value }
    setForm(updatedForm)
    setActiveUser(null)

    if (touched[event.target.name]) {
      setErrors(validate(updatedForm))
    }
  }

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }))
    setErrors(validate(form))
  }

  const fillUser = (user) => {
    setForm({ email: user.email, password: user.password })
    setErrors({})
    setTouched({})
    setActiveUser(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const currentErrors = validate(form)
    setTouched({ email: true, password: true })
    setErrors(currentErrors)

    if (Object.keys(currentErrors).length > 0) {
      return
    }

    setLoading(true)

    setTimeout(() => {
      const user = users.find(
        (item) => item.email === form.email.trim() && item.password === form.password
      )

      setLoading(false)

      if (!user) {
        setActiveUser(null)
        setErrors({ password: 'Credenciales no registradas para esta sucursal' })
        return
      }

      setActiveUser(user)
    }, 450)
  }

  const formPanel = (
    <main className="login-panel">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-header">
          <BrandMark className="brand-mark-on-light login-logo" compact />
          <p className="login-eyebrow">Acceso administrativo</p>
          <h2 id="login-title">Iniciar sesion</h2>
          <p>Ingresa con un perfil autorizado para administrar la tienda.</p>
        </div>

        <div className={`login-feedback ${activeUser ? 'login-feedback-visible' : ''}`}>
          {activeUser && (
            <div className="login-success" role="status">
              <span>Acceso concedido</span>
              <strong>{activeUser.role}</strong>
              <p>{activeUser.branch}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            inputName="email"
            description="Correo"
            placeholder="correo@servicredith.com"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            required
            className="full"
          />

          <FormField
            inputName="password"
            description="Contrasena"
            placeholder="Ingresa tu contrasena"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            required
            className="full"
          />

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-roles" aria-label="Perfiles de acceso">
          {users.map((user) => (
            <button type="button" key={user.email} onClick={() => fillUser(user)}>
              <span>{user.role}</span>
              <strong>{user.email}</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  )

  return (
    <DualPanel
      left={
        <BrandPanel
          description="Acceso interno para administrar usuarios, reportes y operaciones de la sucursal."
        />
      }
      right={formPanel}
    />
  )
}
