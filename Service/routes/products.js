const router = require("express").Router()
const Products =require("../controllers/products")
const authMiddleware=require('../middlewares/authMiddleware')
const roleMiddleware=require('../middlewares/roleMiddleware')


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *       - in: query
 *         name: storeId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar productos por tienda
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 */
router.get("/products", Products.getProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/products/:id", Products.getProductById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sellPrice
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop HP
 *               description:
 *                 type: string
 *                 example: Laptop HP Core i7
 *               buyPrice:
 *                 type: number
 *                 example: 15000
 *               sellPrice:
 *                 type: number
 *                 example: 18000
 *               minGainPercentage:
 *                 type: integer
 *                 example: 20
 *               inStock:
 *                 type: integer
 *                 example: 5
 *               stores:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post("/products", Products.postProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - name
 *               - sellPrice
 *             properties:
 *               productId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *               name:
 *                 type: string
 *                 example: Laptop Lenovo
 *               buyPrice:
 *                 type: number
 *                 example: 12000
 *               sellPrice:
 *                 type: number
 *                 example: 15000
 *               minGainPercentage:
 *                 type: integer
 *                 example: 15
 *               inStock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.put("/products/:id", Products.updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/products/:id", Products.deleteProduct)

/**
 * @swagger
 * /api/products/{id}/recover:
 *   post:
 *     summary: Restaurar un producto eliminado
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto restaurado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.post("/products/:id/recover", Products.recoverProduct)

// Solo admins
//router.delete("/products/:id", authMiddleware, roleMiddleware('Admin'), deleteProduct)


module.exports=router
