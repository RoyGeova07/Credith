const sequelize = require('./models/index.js')
require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000


app.use(express.json())

const userRoutes=require('./routes/users')
const productsRoutes=require('./routes/products.js')

app.use("/api",userRoutes)
app.use("/api",productsRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, ()=>
{

  console.log(`Example app listening on port ${port}`)
  
})

