const router=require("express").Router()
const authMiddleware=require("../middlewares/authMiddleware")

const{/*addProductToStore,*/addStock,removeStock,getStoreInventory,getProductStock,getPagedStoresInventories,updateStock, getMyStoreInventory, getLowStockInventory,transferStock}=require("../controllers/StoreInventory")
const roleMiddleware = require("../middlewares/roleMiddleware")
const { ROLE } = require('../helper/roles')

// /**
//  * @swagger
//  * /api/store-inventory:
//  *   post:
//  *     summary: Agregar producto a una tienda con stock inicial
//  *     tags: [StoreInventory]
//  *     requestBody:
//  *       required: truei
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - productId
//  *               - storeId
//  *             properties:
//  *               productId:
//  *                 type: string
//  *                 format: uuid
//  *               storeId:
//  *                 type: string
//  *                 format: uuid 
//  *               inStock:
//  *                 type: integer
//  *                 example: 100
//  *     responses:
//  *       201:
//  *         description: Producto agregado a la tienda
//  *       404:
//  *         description: Producto o tienda no encontrada
//  */
// router.post("/",addProductToStore)//tendra el middelaware dependiendo el admin y tendra el owner tambien

/**
 * @swagger
 * /api/store-inventory/stock:
 *   patch:
 *     summary: Actualizar stock de un producto en una tienda
 *     tags: [StoreInventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - storeId
 *               - stock
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto
 *                 example: b9102c31-783a-4194-9d89-ff91103a8fe8
 *
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la tienda
 *                 example: d4e5f6a7-b8c9-4a0b-cdef-012345678912
 *
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nuevo stock del producto en la tienda
 *                 example: 150
 *
 *     responses:
 *       200:
 *         description: Stock actualizado correctamente
 *       404:
 *         description: Inventario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/stock",authMiddleware,roleMiddleware(ROLE.OWNER,ROLE.ADMIN),updateStock)

/**
 * @swagger
 * /api/store-inventory:
 *   get:
 *     summary: Obtener inventario paginado de todas las tiendas
 *     tags: [StoreInventory]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *     responses:
 *       200:
 *         description: Inventario obtenido correctamente
 */
router.get("/",authMiddleware,roleMiddleware(ROLE.OWNER),getPagedStoresInventories)//solo para owner 

/**
 * @swagger
 * /api/store-inventory/store/{storeId}:
 *   get:
 *     summary: Obtener inventario completo de una tienda
 *     tags: [StoreInventory]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Inventario encontrado
 *       404:
 *         description: Tienda no encontrada
 */
router.get("/store/:storeId",authMiddleware,roleMiddleware(ROLE.OWNER),getStoreInventory)//tendra el middelaware dependiendo el admin y tendra el owner tambien

/**
 * @swagger
 * /api/store-inventory/{storeId}/{productId}:
 *   get:
 *     summary: Obtener stock de un producto específico en una tienda
 *     tags: [StoreInventory]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Stock encontrado
 *       404:
 *         description: Registro de inventario no encontrado
 */
router.get("/:storeId/:productId",authMiddleware,roleMiddleware(ROLE.OWNER),getProductStock)//tendra el middelaware dependiendo el admin y tendra el owner tambien

/**
 * @swagger
 * /api/store-inventory/my-store:
 *   get:
 *     summary: Obtener el inventario de la tienda asignada al usuario autenticado
 *     tags: [StoreInventory]
 *     security:
 *       - cookieAuth: []
 *
 *     description: |
 *       Obtiene todos los productos y existencias de la tienda
 *       asociada al usuario autenticado mediante su storeId.
 *
 *       Este endpoint está pensado principalmente para usuarios ADMIN.
 *
 *     responses:
 *       200:
 *         description: Inventario obtenido correctamente
 *
 *       400:
 *         description: El usuario no tiene una tienda asignada
 *
 *       401:
 *         description: Usuario no autenticado
 *
 *       500:
 *         description: Error interno del servidor
 */
router.post("/transfer",authMiddleware,roleMiddleware(ROLE.OWNER),transferStock)
router.get("/low-stock", authMiddleware, roleMiddleware(ROLE.OWNER, ROLE.ADMIN), getLowStockInventory)
router.get("/my-store",authMiddleware, getMyStoreInventory)

module.exports=router