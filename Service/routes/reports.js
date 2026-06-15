const router = require('express').Router()
const authMiddleware=require('../middlewares/authMiddleware')
const roleMiddleware=require('../middlewares/roleMiddleware')

const {
  getProductReport,
  getStoreReport,
  getCompanyReport
} = require('../controllers/reports')

/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Obtener reporte de rendimiento por producto
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         description: ID de la compania para limitar el reporte.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         required: false
 *         description: Mes a filtrar. Puede enviarse como YYYY-MM o como numero de 1 a 12 junto con year.
 *         schema:
 *           type: string
 *           example: "2026-05"
 *       - in: query
 *         name: year
 *         required: false
 *         description: Year requerido cuando month se envia como numero.
 *         schema:
 *           type: integer
 *           example: 2026
 *       - in: query
 *         name: storeId
 *         required: false
 *         description: Filtrar ventas e inventario por tienda.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Cantidad maxima de productos a devolver. Maximo 100.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *       - in: query
 *         name: offset
 *         required: false
 *         description: Cantidad de productos a omitir.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *     responses:
 *       200:
 *         description: Reporte de productos obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [historical, month]
 *                 filters:
 *                   type: object
 *                   properties:
 *                     companyId:
 *                       type: string
 *                       format: uuid
 *                     storeId:
 *                       type: string
 *                       nullable: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       quantitySold:
 *                         type: integer
 *                       inStock:
 *                         type: integer
 *                       grossGain:
 *                         type: number
 *                       netGain:
 *                         type: number
 *                       stores:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             storeId:
 *                               type: string
 *                               format: uuid
 *                             address:
 *                               type: integer
 *                             quantitySold:
 *                               type: integer
 *                             inStock:
 *                               type: integer
 *                             grossGain:
 *                               type: number
 *                             netGain:
 *                               type: number
 *       400:
 *         description: Filtros invalidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reports/products', authMiddleware,roleMiddleware("Owner"),getProductReport)

/**
 * @swagger
 * /api/reports/stores:
 *   get:
 *     summary: Obtener reporte mensual de una tienda
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         description: ID de la tienda a reportar.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         required: false
 *         description: Mes a filtrar. Si no se envia, se usa el mes actual. Puede enviarse como YYYY-MM o como numero de 1 a 12 junto con year.
 *         schema:
 *           type: string
 *           example: "2026-05"
 *       - in: query
 *         name: year
 *         required: false
 *         description: Year requerido cuando month se envia como numero.
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Reporte mensual de tienda obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [month]
 *                     year:
 *                       type: integer
 *                     month:
 *                       type: integer
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                 filters:
 *                   type: object
 *                   properties:
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                 store:
 *                   type: object
 *                   properties:
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                     address:
 *                       type: integer
 *                     isOperating:
 *                       type: boolean
 *                     monthlyGrossGain:
 *                       type: number
 *                     monthlyNetGain:
 *                       type: number
 *                     employees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *       400:
 *         description: Filtros invalidos
 *       404:
 *         description: Tienda no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reports/stores', authMiddleware,roleMiddleware("Owner"),getStoreReport)

/**
 * @swagger
 * /api/reports/companies:
 *   get:
 *     summary: Obtener reporte mensual de una compania
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         description: ID de la compania a reportar.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         required: false
 *         description: Mes a filtrar. Si no se envia, se usa el mes actual. Puede enviarse como YYYY-MM o como numero de 1 a 12 junto con year.
 *         schema:
 *           type: string
 *           example: "2026-05"
 *       - in: query
 *         name: year
 *         required: false
 *         description: Year requerido cuando month se envia como numero.
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Reporte mensual de compania obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [month]
 *                     year:
 *                       type: integer
 *                     month:
 *                       type: integer
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                 filters:
 *                   type: object
 *                   properties:
 *                     companyId:
 *                       type: string
 *                       format: uuid
 *                 company:
 *                   type: object
 *                   properties:
 *                     companyId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     rtn:
 *                       type: string
 *                     email:
 *                       type: string
 *                     totalMonthlyGrossGain:
 *                       type: number
 *                     totalMonthlyNetGain:
 *                       type: number
 *                     stores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           storeId:
 *                             type: string
 *                             format: uuid
 *                           address:
 *                             type: integer
 *                           isOperating:
 *                             type: boolean
 *                           monthlyGrossGain:
 *                             type: number
 *                           monthlyNetGain:
 *                             type: number
 *       400:
 *         description: Filtros invalidos
 *       404:
 *         description: Compania no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reports/companies', authMiddleware,roleMiddleware("Owner"),getCompanyReport)

// Admin o owner
//router.get("/reports", authMiddleware, roleMiddleware('Admin', 'owner'), getReports)


module.exports = router
