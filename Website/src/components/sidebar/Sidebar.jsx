import "./Sidebar.css"
import { getUserRole } from "@/helpers/session"
import { menuItems } from "@/helpers/permissions"

export default function SideBar({ currentPage, onNavigate }) {

    const role = getUserRole()
    const visibleMenu = menuItems.filter(item => item.roles.includes(role))

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

            <div className="sidebar-divider"></div>

        </aside>
    )
}
