const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

const {
  postBill,
  getBills,
  getBillById,
} = require('../controllers/bill')

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - limitDate
 *               - paymentType
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
 *                 type: integer
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
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: c98765e5-9ae8-4597-b95e-9889028f2222
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 example: d55555e5-9ae8-4597-b95e-9889028f3333
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
 *                       type: string
 *                       format: uuid
 *                       example: e11111e5-9ae8-4597-b95e-9889028f4444
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
 *                   clientId:
 *                     type: string
 *                     format: uuid
 *                     description: Requerido cuando paymentType es INSTALLMENT
 *                     example: "f22222e5-9ae8-4597-b95e-9889028f5555"
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
router.get('/bills', authMiddleware, getBills)
router.get('/bills/:id', authMiddleware, getBillById)

module.exports = router
