const router = require("express").Router()
const Products =require("../controllers/products")


router.get("/products", Products.getProduct)

router.get("/products/:id", Products.getProductById)

router.post("/products", Products.postProduct)

router.put("/products/:id", Products.updateProduct)

router.delete("/products/:id", Products.deleteProduct)

router.post("/products/:id/recover", Products.recoverProduct)

module.exports=router
