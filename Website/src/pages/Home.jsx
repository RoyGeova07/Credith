import { useState, useEffect, useRef } from 'react'
import { ROLE, menuItems } from '@/helpers/permissions'
import './Home.css'
import './InicioPage.css'
import { toast } from 'react-toastify'
import SideBar from '@/components/sidebar/Sidebar'
import AdminCompanyManagementPage from './AdminCompanyManagementPage'
import AdminStoreManagementPage from './AdminStoreManagementPage'
import SalesPage from './SalesPage'
import ManagerReportsPage from './ManagerReportsPage'
import ManagerEmployeesManagementPage from './ManagerEmployeesManagementPage'
import ProductsPage from './ProductsPage'
import OwnerCategoryManagementPage from './OwnerCategoryManagementPage'
import AdminCaiManagementPage from './AdminCaiManagementPage'
import AdminCheckoutMachineManagementPage from './AdminCheckoutMachineManagementPage'
import PaymentPlansPage from './PaymentPlansPage'
import BillsPage from './BillsPage'
import DashboardHomePage from './DashboardHomePage'

function DashboardHome({ session, onNavigate })
{
    if (session?.role === ROLE.OWNER || session?.role === ROLE.ADMIN) {
        return <DashboardHomePage session={session} onNavigate={onNavigate} />
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

function renderContent(page, session, onNavigate)
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
        case '/bills': return <BillsPage />
        case '/reports': return <ManagerReportsPage />
        case '/cart': return <SalesPage session={session} />
        default: return <DashboardHome session={session} onNavigate={onNavigate} />
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

            <SideBar currentPage={page} onNavigate={handleNavigate} session={session} onLogout={onLogout} />

            <div className="home-page">

                <div className="dashboard-content">
                    {renderContent(page, session, handleNavigate)}
                </div>

            </div>

        </div>
    )
}
