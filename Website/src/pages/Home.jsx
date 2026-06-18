import { useState, useEffect, useRef } from 'react'
import './Home.css'
import { toast } from 'react-toastify'
import SideBar from '@/components/sidebar/Sidebar'
import AdminCompanyManagementPage from './AdminCompanyManagementPage'
import AdminRoleManagementPage from './AdminRoleManagementPage'
import AdminStoreManagementPage from './AdminStoreManagementPage'
import CartDemoPage from './CartDemoPage'
import ManagerEmployeesManagementPage from './ManagerEmployeesManagementPage'
import ProductsPage from './ProductsPage'
import OwnerCategoryManagementPage from './OwnerCategoryManagementPage'

const PAGE_PERMISSIONS = {
    '/admin/companies':   ['OWNER'],
    '/admin/assign-roles':['OWNER'],
    '/admin/stores':      ['OWNER', 'ADMIN'],
    '/owner/category':    ['OWNER'],
    '/products':          ['OWNER', 'ADMIN'],
}

function DashboardHome()
{
    return (
        <div className="dashboard-card">
            <div className="dashboard-empty">
                <h2>Panel en construccion</h2>
                <p>Aquí se mostrarán las estadísticas, métricas y reportes principales del sistema.</p>
            </div>
        </div>
    )
}

function renderContent(page)
{
    switch (page) {
        case '/admin/companies':    return <AdminCompanyManagementPage />
        case '/admin/assign-roles': return <AdminRoleManagementPage />
        case '/admin/stores':       return <AdminStoreManagementPage />
        case '/owner/category':     return <OwnerCategoryManagementPage />
        case '/products':           return <ProductsPage />
        case '/manager/employees':  return <ManagerEmployeesManagementPage />
        case '/cart':               return <CartDemoPage />
        default:                    return <DashboardHome />
    }
}

export default function Home({ session, onLogout, toastType, onToastShown })
{
    const [page, setPage] = useState('/')
    const hasShownToast = useRef(false)

    useEffect(() =>
    {
        if (hasShownToast.current || !toastType) return
        hasShownToast.current = true
        if (toastType === 'login')
            toast.success(`¡Bienvenido de nuevo, ${session?.first_name || 'Usuario'}!`)
        if (toastType === 'register')
            toast.success(`¡Cuenta creada correctamente, ${session?.first_name || 'Usuario'}!`)
        onToastShown()
    }, [toastType, session, onToastShown])

    const handleNavigate = (path) => {
        if (path === '#') return
        const role = session?.role || 'EMPLOYEE'
        const allowed = PAGE_PERMISSIONS[path]
        if (allowed && !allowed.includes(role)) return
        setPage(path)
    }

    return (
        <div className="home-container">

            <SideBar currentPage={page} onNavigate={handleNavigate} />

            <div className="home-page">

                <div className="home-header">

                    <div>
                        <span className="home-tag">Administracion</span>
                        <h1>Panel Principal</h1>
                        <p>Bienvenido al sistema administrativo ServiCredith</p>
                    </div>

                    {session && (
                        <div className="user-panel">

                            <div className="user-avatar">
                                {session.first_name ? session.first_name.charAt(0).toUpperCase() : 'U'}
                            </div>

                            <div>
                                <div className="user-name">{session.first_name} {session.first_last_name}</div>
                                <div className="user-role">
                                    {session.role === 'OWNER' ? 'Propietario' : session.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                                </div>
                            </div>

                            <button className="logout-btn" onClick={onLogout}>
                                Cerrar sesión
                            </button>

                        </div>
                    )}

                </div>

                <div className="dashboard-content">
                    {renderContent(page)}
                </div>

            </div>

        </div>
    )
}
