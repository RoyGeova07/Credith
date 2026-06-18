import { HomeIcon, BuildingIcon, StoreIcon, UsersIcon, BoxIcon, TagIcon, CreditCardIcon, DocumentIcon, ChartIcon, UserRoleIcon, SalesIcon } from "@/assets/icons"

export const ROLE =
{
    OWNER:    "OWNER",
    ADMIN:    "ADMIN",
    EMPLOYEE: "EMPLOYEE",
}

const ALL = [ROLE.OWNER, ROLE.ADMIN, ROLE.EMPLOYEE]

export const menuItems = [
    { key: "home",        text: "Inicio",            icon: HomeIcon,       path: "/",                   roles: ALL          },
    { key: "companies",   text: "Empresas",          icon: BuildingIcon,   path: "/admin/companies",    roles: [ROLE.OWNER] },
    { key: "stores",      text: "Tiendas",           icon: StoreIcon,      path: "/admin/stores",       roles: [ROLE.OWNER] },
    { key: "sales",       text: "Ventas",            icon: SalesIcon,      path: "#",                   roles: ALL          },
    { key: "employees",   text: "Empleados",         icon: UsersIcon,      path: "#",                   roles: [ROLE.OWNER] },
    { key: "products",    text: "Productos",         icon: BoxIcon,        path: "/products",           roles: [ROLE.OWNER] },
    { key: "categories",  text: "Categorías",        icon: TagIcon,        path: "/owner/category",     roles: [ROLE.OWNER] },
    { key: "creditPlans", text: "Planes de crédito", icon: CreditCardIcon, path: "#",                   roles: ALL          },
    { key: "invoices",    text: "Facturas",          icon: DocumentIcon,   path: "#",                   roles: ALL          },
    { key: "reports",     text: "Reportes",          icon: ChartIcon,      path: "#",                   roles: [ROLE.OWNER] },
    { key: "assignRoles", text: "Asignar roles",     icon: UserRoleIcon,   path: "/admin/assign-roles", roles: [ROLE.OWNER] },
]
