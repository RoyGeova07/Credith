import "./Sidebar.css"
import { useNavigate } from "react-router-dom"
import {HomeIcon,BuildingIcon,StoreIcon,UsersIcon,BoxIcon,TagIcon,CreditCardIcon,DocumentIcon,ChartIcon,UserRoleIcon,SalesIcon,}from"@/assets/icons"
import { getUserRole } from "@/helpers/session"
import { MENU_PERMISSIONS } from "@/helpers/permissions"

export default function SideBar() {

    const navigate=useNavigate()
    const menuItems=
    [
        {
            text: "Inicio",
            icon: HomeIcon,
            path: "/"
        },
        {
            text: "Empresas",
            icon: BuildingIcon,
            path: "/admin/companies"
        },
        {
            text: "Tiendas",
            icon: StoreIcon,
            path: "/admin/stores"
        },
        {

            text:"Ventas",
            icon:SalesIcon,
            path:"#"

        },
        {
            text: "Empleados",
            icon: UsersIcon,
            path: "#"
        },
        {
            text: "Productos",
            icon: BoxIcon,
            path: "/products"
        },
        {
            text: "Categorías",
            icon: TagIcon,
            path: "/owner/category"
        },
        {
            text: "Planes de crédito",
            icon: CreditCardIcon,
            path: "#"
        },
        {
            text: "Facturas",
            icon: DocumentIcon,
            path: "#"
        },
        {
            text: "Reportes",
            icon: ChartIcon,
            path: "#"
        },
        {
            text: "Asignar roles",
            icon: UserRoleIcon,
            path: "/admin/assign-roles"
        },

    ]
    const role=getUserRole()
    const visibleMenu=menuItems.filter(item=>MENU_PERMISSIONS[item.text]?.includes(role))

    return(

        <aside className="sidebar">

            <div className="sidebar-header">

                <h2>ServiCredith</h2>

                <span>Gestión empresarial</span>

            </div>

            <div className="sidebar-divider"></div>

            <nav className="sidebar-menu">

                {

                    visibleMenu.map((item)=>
                    {

                        const Icon=item.icon

                        return(

                            <button

                                key={item.text}
                                className="sidebar-item"
                                onClick={()=>item.path!=="#"&&navigate(item.path)}

                            >

                                <Icon className="sidebar-icon"/>

                                <span>{item.text}</span>

                            </button>


                        )

                    })

                }

            </nav>

            {/**dividor */}
            <div className="sidebar-divider"></div>
            

        </aside>

    )

}