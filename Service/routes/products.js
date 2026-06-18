const router = require("express").Router()
const Products =require("../controllers/products")
const authMiddleware=require('../middlewares/authMiddleware')
const roleMiddleware=require('../middlewares/roleMiddleware')
const { ROLE } = require('../helper/roles')


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener productos paginados
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       OWNER:
 *       - Puede ver todos los productos del sistema.
 *       - Puede ver el inventario de todas las tiendas.
 *
 *       ADMIN:
 *       - Solo puede ver los productos asociados a su tienda.
 *       - Solo recibe el inventario de su tienda asignada.
 *
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar productos por nombre de categoría
 *          
 *       - in: query
 *         name: storeId
 *         required: false 
 *         schema:
 *           type: string
 *           format: uuid
 *         description: |
 *          solo para OWNER.
 *          Permite filtrar productos por una tienda específica.
 * 
 *       - in: query
 *         name: archived
 *         required: false
 *         schema:
 *           type: boolean
 *           example: false
 *         description: Mostrar productos archivados
 *
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *
 *       401:
 *         description: Usuario no autenticado
 *
 *       403:
 *         description: Acceso denegado
 */
router.get("/products",authMiddleware,roleMiddleware(ROLE.OWNER,ROLE.ADMIN),Products.getPagedProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
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
router.get("/products/:id",authMiddleware,roleMiddleware(ROLE.ADMIN,ROLE.OWNER),Products.getProductById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
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
 *               - storeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Coca Cola 3L
 *               description:
 *                 type: string
 *                 example: Refresco Coca Cola 3 litros
 *               buyPrice:
 *                 type: number
 *                 example: 35
 *               sellPrice:
 *                 type: number
 *                 example: 45
 *               minGainPercentage:
 *                 type: integer
 *                 example: 20
 *               imageUrl:
 *                 type: string
 *                 example: https://miservidor.com/images/cocacola.jpg
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la categoría
 *                 example: 7d4d0f83-f2d7-4d58-a48b-cf2d2f75d4d1
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: Tienda donde se registrará inicialmente el producto
 *                 example: c3d4e5f6-a7b8-490a-bcde-f01234567891
 *               initialStock:
 *                 type: integer
 *                 description: Stock inicial del producto en la tienda
 *                 example: 100
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: La categoría o la tienda no existen
 */
router.post("/products",authMiddleware,roleMiddleware(ROLE.OWNER),Products.postProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto y opcionalmente su inventario
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *           format: uuid
 *
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
 *
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *
 *               name:
 *                 type: string
 *                 example: Coca Cola 3L
 *
 *               description:
 *                 type: string
 *                 example: Refresco Coca Cola 3 litros
 *
 *               buyPrice:
 *                 type: number
 *                 example: 35
 *
 *               sellPrice:
 *                 type: number
 *                 example: 45
 *
 *               minGainPercentage:
 *                 type: integer
 *                 example: 20
 *
 *               imageUrl:
 *                 type: string
 *                 example: https://miservidor.com/images/cocacola.jpg
 *
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: Nueva categoría del producto
 *                 example: 7d4d0f83-f2d7-4d58-a48b-cf2d2f75d4d1
 *
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: Tienda cuyo inventario será actualizado (opcional)
 *                 example: d4e5f6a7-b8c9-4a0b-cdef-012345678912
 *
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nuevo stock para la tienda indicada (opcional)
 *                 example: 150
 *
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *
 *       400:
 *         description: Datos inválidos o stock inválido
 *
 *       404:
 *         description: Producto, categoría o inventario no encontrados
 *
 *       500:
 *         description: Error interno del servidor
 */
router.put("/products/:id",authMiddleware,roleMiddleware(ROLE.ADMIN,ROLE.OWNER),Products.updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto o quitarlo de una tienda
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: storeId
 *         required: false
 *         description: |
 *           Opcional para OWNER.
 *           Obligatorio para ADMIN.
 *           Si se envía, el producto únicamente se elimina de esa tienda.
 *           Si no se envía, el producto completo se archiva.
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       400:
 *         description: storeId obligatorio para ADMIN
 *       403:
 *         description: Solo OWNER puede archivar productos globalmente
 *       404:
 *         description: Producto o inventario no encontrado
 */
router.delete("/products/:id",authMiddleware,roleMiddleware(ROLE.ADMIN,ROLE.OWNER),Products.deleteProduct)

/**
 * @swagger
 * /api/products/{id}/recover:
 *   post:
 *     summary: Restaurar un producto eliminado
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
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
router.post("/products/:id/recover",authMiddleware,roleMiddleware(ROLE.ADMIN,ROLE.OWNER),Products.recoverProduct)


module.exports=router
