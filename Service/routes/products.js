const router = require("express").Router()
const Products =require("../controllers/products")


router.get("/products", Products.selectProduct)

router.get("/products/:id", Products.selectProductById)

router.post("/products", Products.createProduct)

router.put("/products/:id", Products.updateProduct)

router.delete("/products/:id", Products.deleteProduct)

router.post("/products/:id/recover", Products.recoverProduct)

module.exports=router
