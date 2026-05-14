const router = require("express").Router()
const Products =require("../controllers/products")


router.get("/products", Products.selectProduct)

router.get("/products/:id", Products.selectProductById)

router.post("/products", Products.createProduct)

router.put("/products", Products.updateProduct)

router.delete("/products", Products.deleteProduct)

module.exports=router
