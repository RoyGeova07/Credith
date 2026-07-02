# Credith

[![Docs](https://img.shields.io/badge/docs-mintlify-blue?logo=readthedocs&logoColor=white)](https://mintlify.wiki/RoyGeova07/Credith)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20PostgreSQL-informational)](#tech-stack)
[![Docker](https://img.shields.io/badge/deploy-docker--compose-2496ED?logo=docker&logoColor=white)](https://mintlify.wiki/RoyGeova07/Credith/deployment)

**Inversiones ServiCredith** — plataforma full-stack de punto de venta y gestión de crédito para negocios minoristas en Honduras.

Credith combina un dashboard en React con una API REST en Express para manejar todo el ciclo de un negocio con crédito: facturación con cumplimiento fiscal (CAI), planes de pago a cuotas, inventario multi-tienda y reportes de ingresos, todo detrás de un sistema de acceso basado en roles (Owner, Admin, Employee).

---

## 📚 Documentación completa

Toda la documentación técnica —instalación, referencia de API, conceptos del dominio y despliegue— vive en Mintlify. Este README es solo una carta de presentación; para el detalle real, ve directo ahí:

👉 **[Ver documentación completa](https://mintlify.wiki/RoyGeova07/Credith)**

| Sección | Descripción |
|---|---|
| 🚀 [Quickstart](https://mintlify.wiki/RoyGeova07/Credith/quickstart) | Levanta Credith localmente en minutos con Docker Compose y datos semilla |
| 🔌 [API Reference](https://mintlify.wiki/RoyGeova07/Credith/api-reference/overview) | Todos los endpoints — usuarios, facturas, productos, planes de pago, etc. |
| 💡 [Roles y permisos](https://mintlify.wiki/RoyGeova07/Credith/concepts/roles-permissions) | Cómo funciona el acceso basado en roles |
| 🧾 [Facturación CAI](https://mintlify.wiki/RoyGeova07/Credith/concepts/cai-invoicing) | Facturas con autorización gubernamental y rangos de numeración |
| 💳 [Planes de crédito](https://mintlify.wiki/RoyGeova07/Credith/concepts/payment-plans) | Cuotas mensuales, tasas de interés y seguimiento de pagos |
| 📦 [Inventario](https://mintlify.wiki/RoyGeova07/Credith/concepts/inventory) | Stock por tienda con descuento automático en cada venta |
| 🏬 [Gestión de tiendas](https://mintlify.wiki/RoyGeova07/Credith/guides/managing-stores) | Múltiples tiendas bajo una compañía, cada una con su staff |
| 📊 [Reportes](https://mintlify.wiki/RoyGeova07/Credith/guides/reports) | Ingresos, desempeño de productos y KPIs por tienda |
| 🔐 [Autenticación](https://mintlify.wiki/RoyGeova07/Credith/guides/authentication) | JWT vía cookies HTTP con sesiones conscientes del rol |
| 🌐 [Deployment](https://mintlify.wiki/RoyGeova07/Credith/deployment) | Despliegue a producción con Docker Compose |

---

## Tech Stack

**Backend (`Service/`)**
- Node.js + Express
- Sequelize (PostgreSQL)
- JWT (cookies HttpOnly) para autenticación
- Swagger para documentación de API
- Jest para testing

**Frontend (`Website/`)**
- React + Vite
- Arquitectura de componentes desacoplados (form, dataGrid, dialogs, sidebar, etc.)

**Infraestructura**
- Docker / Docker Compose (dev y prod)

---

## Estructura del proyecto

```
Credith
├── Service/                # API REST (Express + Sequelize)
│   ├── config/              # Configuración de DB y Swagger
│   ├── controllers/         # Lógica de negocio por entidad
│   ├── helper/               # Utilidades (bcrypt, JWT, fechas, roles)
│   ├── middlewares/         # Auth, logging, control de roles
│   ├── migrations/           # Migraciones de base de datos
│   ├── models/                # Entidades Sequelize + asociaciones
│   ├── routes/                # Definición de rutas por recurso
│   ├── seeders/               # Datos base y de demo
│   └── tests/                  # Pruebas con Jest
│
├── Website/                # Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables (form, dataGrid, sidebar, etc.)
│   │   ├── helpers/            # Fetch, sesiones, permisos, categorías
│   │   └── pages/               # Vistas por rol (Owner, Admin, Employee)
│   └── public/
│
├── docs/                    # Documentación fuente (endpoints, schema)
├── docker-compose.yml        # Orquestación en desarrollo
└── docker-compose-prod.yml   # Orquestación en producción
```

---

## Inicio rápido

```bash
git clone <repo-url>
cd Credith
docker compose up
```

Para el detalle completo de configuración de entorno, migraciones y datos semilla, revisa el [Quickstart en Mintlify](https://mintlify.wiki/RoyGeova07/Credith/quickstart).

---

## Roles del sistema

| Rol | Vista |
|---|---|
| **Owner** | Reportes, gestión de compañía, categorías |
| **Admin** | Gestión de tiendas, CAI, máquinas de cobro |
| **Employee** | Ventas, clientes, facturación diaria |

Más detalle en [Roles y permisos](https://mintlify.wiki/RoyGeova07/Credith/concepts/roles-permissions).

---

## Autores

- **Roy Umaña** — [@RoyGeova07](https://github.com/RoyGeova07)
- **Josh** — [@D4-CTM](https://github.com/D4-CTM)
- **Jonny Gomez** — [@Alejandrocart4](https://github.com/Alejandrocart4)

### Tutor

- **Miguel Angel Ardon Enriquez** — [@miguepity](https://github.com/miguepity)

---

## Licencia

Proyecto académico desarrollado como parte de la clase de Experiencia de Usuario.
