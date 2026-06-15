const router = require('express').Router()
const authMiddleware=require("../middlewares/authMiddleware")
const roleMiddleware=require("../middlewares/roleMiddleware")


const {
  createStore,
  getPagedStores,
  getStoreById,
  updateStore,
  deactivateStore,
  activateStore
} = require('../controllers/store')

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Obtener todas las tiendas
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de tiendas a mostrar
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *         description: Cantidad de registros a omitir
 *     responses:
 *       200:
 *         description: Lista de tiendas obtenida correctamente
 */
router.get('/stores',getPagedStores)

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Obtener tienda por ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tienda
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tienda encontrada
 *       404:
 *         description: Tienda no encontrada
 */
router.get('/stores/:id', getStoreById)

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Crear una nueva tienda
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - companyId
 *             properties:
 *               address:
 *                 type: integer
 *                 example: 101
 *               companyId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       201:
 *         description: Tienda creada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Empresa no encontrada
 */
router.post('/stores',authMiddleware,createStore,roleMiddleware("Admin","Owner"))

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Actualizar una tienda
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tienda
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: integer
 *                 example: 202
 *               companyId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       200:
 *         description: Tienda actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tienda o empresa no encontrada
 */
router.put('/stores/:id', authMiddleware,roleMiddleware("Admin","Owner"),updateStore)

/**
 * @swagger
 * /api/stores/deactivate/{id}:
 *   put:
 *     summary: Desactivar una tienda
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tienda
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tienda desactivada correctamente
 *       400:
 *         description: La tienda ya está desactivada
 *       404:
 *         description: Tienda no encontrada
 */
router.put('/stores/deactivate/:id',authMiddleware,roleMiddleware("Admin","Owner"), deactivateStore)

/**
 * @swagger
 * /api/stores/activate/{id}:
 *   put:
 *     summary: Activar una tienda
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tienda
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tienda activada correctamente
 *       400:
 *         description: La tienda ya está activa
 *       404:
 *         description: Tienda no encontrada
 */
router.put('/stores/activate/:id',authMiddleware,roleMiddleware("Admin","Owner"), activateStore)

module.exports = router
