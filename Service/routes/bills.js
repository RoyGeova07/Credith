const router = require('express').Router()

const {
  postBill,
} = require('../controllers/bill')

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - limitDate
 *               - paymentType
 *               - companyId
 *               - caiRangeId
 *               - userId
 *               - storeId
 *               - details
 *               - customer
 *               - paymentData
 *             properties:
 *               limitDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               paymentType:
 *                 type: string
 *                 enum: [CASH, INSTALLMENT]
 *                 example: "CASH"
 *               discountPercentage:
 *                 type: number
 *                 example: 0
 *               discountAmount:
 *                 type: number
 *                 example: 0
 *               exonerated:
 *                 type: number
 *                 example: 0
 *               exempt:
 *                 type: number
 *                 example: 0
 *               companyId:
 *                 type: integer
 *                 example: 1
 *               caiRangeId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 1
 *               storeId:
 *                 type: integer
 *                 example: 1
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - sellPrice
 *                     - total
 *                     - productName
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     sellPrice:
 *                       type: number
 *                       example: 150.00
 *                     discountPercentage:
 *                       type: number
 *                       example: 0
 *                     discountAmount:
 *                       type: number
 *                       example: 0
 *                     total:
 *                       type: number
 *                       example: 300.00
 *                     productName:
 *                       type: string
 *                       example: "Producto de prueba"
 *               customer:
 *                 type: object
 *                 required:
 *                   - customerName
 *                 properties:
 *                   customerName:
 *                     type: string
 *                     example: "Juan Perez"
 *                   customerPhone:
 *                     type: string
 *                     example: "9999-9999"
 *                   customerAddress:
 *                     type: string
 *                     example: "Tegucigalpa, Honduras"
 *               paymentData:
 *                 type: object
 *                 properties:
 *                   payment:
 *                     type: number
 *                     example: 100.00
 *                   startingDate:
 *                     type: string
 *                     format: date
 *                     example: "2025-01-01"
 *                   monthsToPay:
 *                     type: integer
 *                     example: 6
 *                   paymentDay:
 *                     type: integer
 *                     example: 15
 *                   interestRate:
 *                     type: number
 *                     example: 0
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario, CAI o compañía no encontrados
 *       406:
 *         description: Conflicto con rango CAI, sucursal o inventario
 *       500:
 *         description: Error interno del servidor
 */
router.post('/bills', postBill)

module.exports = router
