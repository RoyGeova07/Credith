const sequelize = require('./models/index.js')
require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

const LoggerMiddleware=require('./middlewares/loggerMiddleware.js')
app.use(express.json())
app.use(LoggerMiddleware)

const userRoutes=require('./routes/users')
const productsRoutes=require('./routes/products.js')
const companyRoutes = require('./routes/company')
const storeRoutes = require('./routes/store')
const caiRoutes = require('./routes/cai')
const caiRangeRoutes = require('./routes/caiRange')
const checkoutMachineRoutes = require('./routes/checkoutMachines')
const roleRoutes = require('./routes/roles')
const billRoutes = require('./routes/bills')
const categoryRoutes=require('./routes/category')

const swaggerUi=require('swagger-ui-express')
const swaggerSpecs=require('./config/swagger.js')

app.use('/api', userRoutes)
app.use('/api', companyRoutes)
app.use('/api', productsRoutes)
app.use('/api', caiRoutes)
app.use('/api', storeRoutes)
app.use('/api', caiRangeRoutes)
app.use('/api', checkoutMachineRoutes)
app.use('/api', billRoutes)
app.use('/api', roleRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use('/api',categoryRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
