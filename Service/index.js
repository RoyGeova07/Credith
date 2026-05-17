const sequelize = require('./models/index.js')
require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000


app.use(express.json())

const userRoutes=require('./routes/users')
const companyRoutes = require('./routes/company')
const storeRoutes = require('./routes/store')
const caiRoutes = require('./routes/cai')


const swaggerUi=require('swagger-ui-express')
const swaggerSpecs=require('./config/swagger.js') 


app.use("/api",userRoutes)
app.use('/api', companyRoutes)
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpecs))
app.use('/api', caiRoutes)
app.use('/api', storeRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, ()=>
{

  console.log(`Example app listening on port ${port}`)
  
})

