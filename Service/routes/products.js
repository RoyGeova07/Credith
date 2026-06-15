const router = require("express").Router()
const Products =require("../controllers/products")
const authMiddleware=require('../middlewares/authMiddleware')
const roleMiddleware=require('../middlewares/roleMiddleware')
const role = require("../models/entities/role")


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
router.get("/products", authMiddleware,roleMiddleware("Admin","Owner"),Products.getPagedProducts)

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
router.get("/products/:id", authMiddleware,roleMiddleware("Admin","Owner"),Products.getProductById)

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
 *               - categoryId
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
 *               imageUrl:
 *                 type: string
 *                 example: https://miservidor.com/images/laptop.jpg
 *               categoryId:
 *                 type: string
 *                 description: ID de la categoría del producto
 *                 example: 7d4d0f83-f2d7-4d58-a48b-cf2d2f75d4d1
 *               stores:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: La categoría no existe
 */
router.post("/products", authMiddleware,roleMiddleware("Admin","Owner"),Products.postProduct)

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
 *               description:
 *                 type: string
 *                 example: Laptop Lenovo Core i7 16GB RAM
 *               buyPrice:
 *                 type: number
 *                 example: 12000
 *               sellPrice:
 *                 type: number
 *                 example: 15000
 *               minGainPercentage:
 *                 type: integer
 *                 example: 15
 *               imageUrl:
 *                 type: string
 *                 example: https://miservidor.com/images/laptop.jpg
 *               categoryId:
 *                 type: string
 *                 description: ID de la categoría del producto
 *                 example: 7d4d0f83-f2d7-4d58-a48b-cf2d2f75d4d1
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto o categoría no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.put("/products/:id",authMiddleware,roleMiddleware("Admin","Owner"),Products.updateProduct)

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
router.delete("/products/:id", authMiddleware,roleMiddleware("Admin","Owner"),Products.deleteProduct)

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
router.post("/products/:id/recover", authMiddleware,roleMiddleware("Admin","Owner"),Products.recoverProduct)

// Solo admins
//router.delete("/products/:id", authMiddleware, roleMiddleware('Admin'), deleteProduct)

module.exports=router
