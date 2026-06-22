import { useState, useEffect, useRef } from 'react'
import { ROLE, menuItems } from '@/helpers/permissions'
import './Home.css'
import { toast } from 'react-toastify'
import SideBar from '@/components/sidebar/Sidebar'
import AdminCompanyManagementPage from './AdminCompanyManagementPage'
import AdminStoreManagementPage from './AdminStoreManagementPage'
import CartDemoPage from './CartDemoPage'
import InicioPage from './InicioPage'
import ManagerReportsPage from './ManagerReportsPage'
import ManagerEmployeesManagementPage from './ManagerEmployeesManagementPage'
import ProductsPage from './ProductsPage'
import OwnerCategoryManagementPage from './OwnerCategoryManagementPage'
import AdminCaiManagementPage from './AdminCaiManagementPage'
import AdminCheckoutMachineManagementPage from './AdminCheckoutMachineManagementPage'
import PaymentPlansPage from './PaymentPlansPage'

function DashboardHome({ session })
{
    if (session?.role === ROLE.OWNER) {
        return <InicioPage embedded session={session} />
    }

    return (
        <div className="dashboard-card">
            <div className="dashboard-empty">
                <h2>Panel en construccion</h2>
                <p>Aqui se mostraran las estadisticas, metricas y reportes principales del sistema.</p>
            </div>
        </div>
    )
}

function renderContent(page, session)
{
    switch (page) {
        case '/admin/companies': return <AdminCompanyManagementPage />
        case '/admin/stores': return <AdminStoreManagementPage />
        case '/admin/cai': return <AdminCaiManagementPage />
        case '/admin/machines': return <AdminCheckoutMachineManagementPage />
        case '/owner/category': return <OwnerCategoryManagementPage />
        case '/products': return <ProductsPage />
        case '/admin/employees': return <ManagerEmployeesManagementPage />
        case '/credit-plans': return <PaymentPlansPage />
        case '/reports': return <ManagerReportsPage />
        case '/cart': return <CartDemoPage />
        default: return <DashboardHome session={session} />
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
            toast.success(`Bienvenido de nuevo, ${session?.first_name || 'Usuario'}!`)
        if (toastType === 'register')
            toast.success(`Cuenta creada correctamente, ${session?.first_name || 'Usuario'}!`)
        onToastShown()
    }, [toastType, session, onToastShown])

    const handleNavigate = (path) => {
        if (path === '#') return
        const role = session?.role || ROLE.EMPLOYEE
        const item = menuItems.find(i => i.path === path)
        if (item && !item.roles.includes(role)) return
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
                                    {session.role === ROLE.OWNER ? 'Propietario' : session.role === ROLE.ADMIN ? 'Administrador' : 'Empleado'}
                                </div>
                            </div>

                            <button className="logout-btn" onClick={onLogout}>
                                Cerrar sesion
                            </button>

                        </div>
                    )}

                </div>

                <div className="dashboard-content">
                    {renderContent(page, session)}
                </div>

            </div>

        </div>
    )
}
