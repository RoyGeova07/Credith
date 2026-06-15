import { Post,getSession } from '@/helpers/fetcher'
import { useState,useEffect,useRef } from 'react'
import './Home.css'
import{useNavigate}from 'react-router-dom'
import SideBar from '@/components/sidebar/Sidebar'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Home() 
{

  const navigate=useNavigate();
  const location=useLocation()
  const hasShownToast=useRef(false)
  const[currentUser]=useState(()=>getSession())
  const handleLogout=async()=>
  {

    await Post('/api/users/logout')//limpia ambas cookies desde el servidor    
    navigate('/login');

  };

  useEffect(()=>
  {

    if(hasShownToast.current)
    {

      return

    }
    if(!location.state?.toastType)
    {

      return

    }
    hasShownToast.current=true

    if(location.state.toastType==="login")
    {

      toast.success(`¡Bienvenido de nuevo, ${currentUser?.first_name || "Usuario"}!`,)

    }

    if(location.state.toastType==="register")
    {

      toast.success(`¡Cuenta creada correctamente, ${currentUser?.first_name || "Usuario"}!`)

    }
    window.history.replaceState({},document.title)

  },[location,currentUser])

  

  return(

    <div className="home-container">

      <SideBar/>

      <main className="home-content">

        <div className="home-header">

          <div>


            <span className="home-tag">Administracion</span>

            <h1>Panel Principal</h1>

            <p>

              Bienvenido al sistema administrativo ServiCredith

            </p>

          </div>

          {

            currentUser&&(

              <div className="user-panel">

                <div className="user-avatar">

                  {

                    currentUser.first_name?currentUser.first_name.charAt(0).toUpperCase():"U"

                  }

                </div>

                <div>

                  <div className="user-name">

                    {currentUser.first_name} {currentUser.first_last_name}

                  </div>

                  <div className="user-role">

                    {currentUser?.role==="OWNER"?"Propietario":currentUser?.role==="ADMIN"?"Administrador":"Empleado"}

                  </div>

                </div>

                <button

                  className="logout-btn"
                  onClick={handleLogout}

                >

                  Cerrar sesión

                </button>

              </div>

            )

          }

        </div>

        <div className="dashboard-content">

          <div className="dashboard-empty">

            <h2>Panel en construccion</h2>

            <p> Aquí se mostrarán las estadísticas, métricas y reportes principales del sistema.</p>

          </div>

        </div>

      </main>

    </div>
    
  )

}

