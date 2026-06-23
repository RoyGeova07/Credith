import { useState } from 'react'
import SideBar from '@/components/sidebar/Sidebar'
import PaymentPlansPage from './PaymentPlansPage'
import BillsPage from './BillsPage'
import SalesPage from './SalesPage'
import { ROLE, menuItems } from '@/helpers/permissions'
import './Home.css'
import './InicioPage.css'

export default function InicioPage({ session, onLogout }) {
  const [page, setPage] = useState('/')

  const handleNavigate = (path) => {
    if (path === '#') return
    const item = menuItems.find((menuItem) => menuItem.path === path)
    const currentRole = session?.role || ROLE.EMPLOYEE
    if (item && item.roles.includes(currentRole)) setPage(path)
  }

  return (
    <div className="home-container">
      <SideBar currentPage={page} onNavigate={handleNavigate} session={session} onLogout={onLogout} />

      <div className="home-page">
        <div className="dashboard-content">
          {page === '/credit-plans' ? <PaymentPlansPage />
            : page === '/bills' ? <BillsPage />
            : <SalesPage session={session} />}
        </div>
      </div>
    </div>
  )
}
