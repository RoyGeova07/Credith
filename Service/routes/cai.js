const router = require('express').Router()

const {
  createCai,
  getPagedCais,
  deleteCai
} = require('../controllers/cai')

/**
 * @swagger
 * /api/cais:
 *   get:
 *     summary: Obtener todos los CAI
 *     tags: [CAI]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           example: 0
 *     responses:
 *       200:
 *         description: Lista de CAI obtenida correctamente
 */
router.get('/cais', getPagedCais)

/**
 * @swagger
 * /api/cais:
 *   post:
 *     summary: Crear un nuevo CAI para una tienda
 *     tags: [CAI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - governmentId
 *               - storeId
 *               - expirationDate
 *               - minRange
 *               - maxRange
 *             properties:
 *               governmentId:
 *                 type: string
 *                 example: A1B2C3-D4E5F6-G7H8I9-J0K1L2-M3N4O5-06
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: 2027-06-30
 *               range:
 *                 type: object
 *                 required:
 *                   - minRange
 *                   - maxRange
 *                 properties:
 *                   minRange:
 *                     type: integer
 *                     example: 1
 *                   maxRange:
 *                     type: integer
 *                     example: 50000
 *               isRenewal:
 *                 type: boolean
 *                 description: true cuando se renueva un CAI existente (omite la validación de CAI activo)
 *                 example: false
 *     responses:
 *       201:
 *         description: CAI creado correctamente
 *       400:
 *         description: Datos inválidos, CAI duplicado o rango no es mayor al último
 *       404:
 *         description: Tienda no encontrada
 *       409:
 *         description: La tienda ya tiene un CAI activo y isRenewal no fue enviado como true
 */
router.post('/cais', createCai)

/**
 * @swagger
 * /api/cais/{id}:
 *   delete:
 *     summary: Eliminar un CAI (solo si no tiene facturas asociadas)
 *     tags: [CAI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CAI eliminado correctamente
 *       400:
 *         description: CAI tiene facturas asociadas
 *       404:
 *         description: CAI no encontrado
 */
router.delete('/cais/:id', deleteCai)

module.exports = router
