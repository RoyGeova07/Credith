import { HomeIcon, StoreIcon, UsersIcon, BoxIcon, TagIcon, CreditCardIcon, DocumentIcon, ChartIcon, SalesIcon, CogIcon } from "@/assets/icons"

export const ROLE =
{
    OWNER:    "OWNER",
    ADMIN:    "ADMIN",
    EMPLOYEE: "EMPLOYEE",
}

const ALL = [ROLE.OWNER, ROLE.ADMIN, ROLE.EMPLOYEE]

export const menuItems = [
    { key: "home",        text: "Inicio",            icon: HomeIcon,       path: "/",                roles: ALL                      },
    { key: "stores",      text: "Tiendas",           icon: StoreIcon,      path: "/admin/stores",    roles: [ROLE.OWNER]             },
    { key: "cai",         text: "CAI",               icon: DocumentIcon,   path: "/admin/cai",       roles: [ROLE.OWNER]             },
    { key: "employees",   text: "Empleados",         icon: UsersIcon,      path: "/admin/employees", roles: [ROLE.OWNER]             },
    { key: "machines",    text: "Cajas",             icon: CogIcon,        path: "/admin/machines",  roles: [ROLE.OWNER]             },
    { key: "sales",       text: "Ventas",            icon: SalesIcon,      path: "/cart",            roles: [ROLE.OWNER, ROLE.ADMIN] },
    { key: "products",    text: "Productos",         icon: BoxIcon,        path: "/products",        roles: [ROLE.OWNER, ROLE.ADMIN] },
    { key: "categories",  text: "Categorias",        icon: TagIcon,        path: "/owner/category",  roles: [ROLE.OWNER]             },
    { key: "creditPlans", text: "Planes de credito", icon: CreditCardIcon, path: "/credit-plans",    roles: ALL                      },
    { key: "invoices",    text: "Facturas",          icon: DocumentIcon,   path: "/bills",           roles: ALL                      },
    { key: "reports",     text: "Reportes",          icon: ChartIcon,      path: "/reports",         roles: [ROLE.OWNER]             },
]
