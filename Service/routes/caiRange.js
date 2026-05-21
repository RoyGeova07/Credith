const router = require('express').Router()

const {
  createCaiRange,
  getCaiRanges,
  getCaiRangesByCai,
  getCaiRangeById,
  updateCaiRange,
  deleteCaiRange
} = require('../controllers/caiRange')

/**
 * @swagger
 * /api/cai-ranges:
 *   get:
 *     summary: Obtener todos los rangos de CAI
 *     tags: [CAI Ranges]
 *     responses:
 *       200:
 *         description: Lista de rangos obtenida correctamente
 */
router.get('/cai-ranges', getCaiRanges)

/**
 * @swagger
 * /api/cais/{caiId}/ranges:
 *   get:
 *     summary: Obtener rangos de un CAI específico
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: caiId
 *         required: true
 *         description: ID del CAI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rangos del CAI obtenidos correctamente
 *       404:
 *         description: CAI no encontrado
 */
router.get('/cais/:caiId/ranges', getCaiRangesByCai)

/**
 * @swagger
 * /api/cai-ranges/{id}:
 *   get:
 *     summary: Obtener un rango de CAI por ID
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rango de CAI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rango encontrado
 *       404:
 *         description: Rango no encontrado
 */
router.get('/cai-ranges/:id', getCaiRangeById)

/**
 * @swagger
 * /api/cai-ranges:
 *   post:
 *     summary: Crear un nuevo rango de CAI
 *     tags: [CAI Ranges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - minRange
 *               - maxRange
 *               - expirationDate
 *               - caiId
 *             properties:
 *               minRange:
 *                 type: integer
 *                 example: 1
 *               maxRange:
 *                 type: integer
 *                 example: 1000
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               caiId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       201:
 *         description: Rango de CAI creado correctamente
 *       400:
 *         description: Datos inválidos o rango incorrecto
 *       404:
 *         description: CAI no encontrado
 */
router.post('/cai-ranges', createCaiRange)

/**
 * @swagger
 * /api/cai-ranges/{id}:
 *   put:
 *     summary: Actualizar un rango de CAI
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rango de CAI
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minRange:
 *                 type: integer
 *                 example: 100
 *               maxRange:
 *                 type: integer
 *                 example: 2000
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: 2027-01-01
 *     responses:
 *       200:
 *         description: Rango de CAI actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Rango de CAI no encontrado
 */
router.put('/cai-ranges/:id', updateCaiRange)

/**
 * @swagger
 * /api/cai-ranges/{id}:
 *   delete:
 *     summary: Eliminar un rango de CAI
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rango de CAI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rango de CAI eliminado correctamente
 *       404:
 *         description: Rango de CAI no encontrado
 */
router.delete('/cai-ranges/:id', deleteCaiRange)

module.exports = router