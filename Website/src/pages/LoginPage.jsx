import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '@/components/form/FormField'
import BrandPanel from '@/components/BrandPanel'
import { Post } from '@/helpers/fetcher'
import { LoginFormConfig } from '@/pages/constants/FormConfig'
import './LoginPage.css'


export default function LoginPage() {
  const [form, setForm] = useState(LoginFormConfig.INITIAL_LOG)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [activeUser, setActiveUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const updatedForm = { ...form, [event.target.name]: event.target.value }
    setForm(updatedForm)
    setActiveUser(null)

    if (touched[event.target.name]) {
      setErrors(LoginFormConfig.validateLogin(updatedForm))
    }
  }

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }))
    setErrors(LoginFormConfig.validateLogin(form))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const currentErrors = LoginFormConfig.validateLogin(form)
    setTouched({ email: true, password: true })
    setErrors(currentErrors)

    if (Object.keys(currentErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const response = await Post('/api/users/login', JSON.stringify(form))

        throw new Error(response.json.message ||'Credenciales incorrectas');

      } 

      navigate("/",{state:{toastType:"login"}});

    }catch(error){

      setErrors({password:error.message});
      
    }finally{

      setLoading(false);

      navigate('/')
    } catch (error) {
      setErrors({ password: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-brand-column">
        <BrandPanel description="Acceso interno para administrar usuarios, reportes y operaciones de la sucursal." />
      </div>

      <div className="login-content-column">
        <main className="login-panel">
          <section className="login-card" aria-labelledby="login-title">
            <div className="login-card-header">
              <p className="login-eyebrow">Acceso administrativo</p>
              <h2 id="login-title">Iniciar sesión</h2>
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
            description="Contraseña"
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

        <p className="register-prompt">

          ¿No tienes una cuenta?
          <Link to="/register"> Regístrate</Link>

        </p>

        
      </section>
    </main>
      </div>
    </div>
  )
}
