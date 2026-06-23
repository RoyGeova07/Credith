import "./Sidebar.css"
import { getUserRole } from "@/helpers/session"
import { menuItems, ROLE } from "@/helpers/permissions"

export default function SideBar({ currentPage, onNavigate, session, onLogout }) {

    const role = getUserRole()
    const visibleMenu = menuItems.filter(item => item.roles.includes(role))

    const roleLabel = session?.role === ROLE.OWNER ? 'Propietario'
        : session?.role === ROLE.ADMIN ? 'Administrador'
            : 'Empleado'

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h2>ServiCredith</h2>
                <span>Gestión empresarial</span>
            </div>

            <div className="sidebar-divider"></div>

            <nav className="sidebar-menu">
                {visibleMenu.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.text}
                            className={`sidebar-item${currentPage === item.path ? ' sidebar-item-active' : ''}`}
                            onClick={() => onNavigate(item.path)}
                        >
                            <Icon className="sidebar-icon" />
                            <span>{item.text}</span>
                        </button>
                    )
                })}
            </nav>

            {session && (
                <div className="sidebar-user">
                    <div className="sidebar-divider"></div>
                    <div className="sidebar-user-info">
                        <div className="user-avatar">
                            {session.first_name ? session.first_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="sidebar-user-text">
                            <div className="user-name">{session.first_name} {session.first_last_name}</div>
                            <div className="user-role">{roleLabel}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        Cerrar sesion
                    </button>
                </div>
            )}

        </aside>
    )
}
