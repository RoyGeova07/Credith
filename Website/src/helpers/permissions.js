export const ROLE=
{

    OWNER: "OWNER",
    ADMIN: "ADMIN",
    EMPLOYEE: "EMPLOYEE",
    DEFAULT: "sin-rol"

};

export const MENU_PERMISSIONS=
{
    Inicio:["OWNER","ADMIN","EMPLOYEE","sin-rol"],
    Ventas:["OWNER", "ADMIN", "EMPLOYEE", "sin-rol"],
    "Planes de crédito": ["OWNER", "ADMIN", "EMPLOYEE", "sin-rol"],
    Facturas: ["OWNER", "ADMIN", "EMPLOYEE", "sin-rol"],

    Tiendas: ["OWNER", "ADMIN"],
    Productos: ["OWNER"],

    Empresas: ["OWNER"],
    Empleados: ["OWNER"],
    Categorías: ["OWNER"],
    Reportes: ["OWNER"],
    "Asignar roles": ["OWNER"]
    
};