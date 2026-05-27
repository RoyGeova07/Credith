const router = require('express').Router()

const {
  getProductReport
} = require('../controllers/reports')

/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Obtener reporte de rendimiento por producto
 *     tags: [Reports]
 *     parameters:
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
 *                     storeId:
 *                       type: string
 *                       nullable: true
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
router.get('/reports/products', getProductReport)

module.exports = router
