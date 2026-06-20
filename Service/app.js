const express = require('express')
const cors = require('cors')
const app = express()
const cookieParser=require('cookie-parser')

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))//permite solicitudes desde el frontend y el envio de cookies
app.use(cookieParser())
app.use(express.json())
if (process.env.NODE_ENV !== 'test') {
    const LoggerMiddleware=require('./middlewares/loggerMiddleware.js')
    app.use(LoggerMiddleware)
}

const userRoutes=require('./routes/users')
const productsRoutes=require('./routes/products.js')
const companyRoutes = require('./routes/company')
const storeRoutes = require('./routes/store')
const caiRoutes = require('./routes/cai')
const caiRangeRoutes = require('./routes/caiRange')
const checkoutMachineRoutes = require('./routes/checkoutMachines')
const roleRoutes = require('./routes/roles')
const billRoutes = require('./routes/bills')
const clientRoutes = require('./routes/clients')
const categoryRoutes=require('./routes/category')
const paymentPlanRoutes=require('./routes/paymentPlan')
const reportRoutes=require('./routes/reports')
const storeinventory=require('./routes/StoreInventory')
const adminStoreAssignamentRoutes=require('./routes/adminStoreAssignment.js')

app.use('/api', userRoutes)
app.use('/api', companyRoutes)
app.use('/api', productsRoutes)
app.use('/api', caiRoutes)
app.use('/api', caiRangeRoutes)
app.use('/api', storeRoutes)
app.use('/api', checkoutMachineRoutes)
app.use('/api', billRoutes)
app.use('/api', roleRoutes)
app.use('/api', clientRoutes)
app.use('/api', categoryRoutes)
app.use('/api', paymentPlanRoutes)
app.use('/api', reportRoutes)
app.use('/api/store-inventory', storeinventory)
app.use('/api/admin-stores',adminStoreAssignamentRoutes)

app.get('/', (_, res) => {
  res.json({ message: 'Hello from the backend!' })
})

if (process.env.NODE_ENV === 'development') {
    const swaggerUi=require('swagger-ui-express')

    const swaggerSpecs=require('./config/swagger.js')
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
}

module.exports = app;
