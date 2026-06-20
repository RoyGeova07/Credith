const router = require('express').Router()

const {
    createCaiRange,
    getPagedCaiRanges,
    getPagedCaiRangesByCai,
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
 *         description: Lista de rangos obtenida correctamente
 */
router.get('/cai-ranges', getPagedCaiRanges)

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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rangos del CAI obtenidos correctamente
 *       404:
 *         description: CAI no encontrado
 */
router.get('/cais/:caiId/ranges', getPagedCaiRangesByCai)

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
 *     summary: Crear un nuevo rango bajo un CAI activo (el rango debe ser mayor al último de la tienda)
 *     tags: [CAI Ranges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caiId
 *               - minRange
 *               - maxRange
 *             properties:
 *               caiId:
 *                 type: string
 *                 format: uuid
 *               minRange:
 *                 type: integer
 *                 example: 50001
 *               maxRange:
 *                 type: integer
 *                 example: 100000
 *     responses:
 *       201:
 *         description: Rango de CAI creado correctamente
 *       400:
 *         description: Datos inválidos o rango no es mayor al último
 *       404:
 *         description: CAI no encontrado
 */
router.post('/cai-ranges', createCaiRange)

/**
 * @swagger
 * /api/cai-ranges/{id}:
 *   put:
 *     summary: Extender el maxRange de un rango existente (solo si no tiene facturas emitidas)
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxRange:
 *                 type: integer
 *                 example: 75000
 *     responses:
 *       200:
 *         description: Rango de CAI actualizado correctamente
 *       400:
 *         description: Datos inválidos o tiene facturas asociadas
 *       404:
 *         description: Rango no encontrado
 */
router.put('/cai-ranges/:id', updateCaiRange)

/**
 * @swagger
 * /api/cai-ranges/{id}:
 *   delete:
 *     summary: Eliminar un rango de CAI (solo si no tiene facturas asociadas)
 *     tags: [CAI Ranges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rango de CAI eliminado correctamente
 *       400:
 *         description: Tiene facturas asociadas
 *       404:
 *         description: Rango no encontrado
 */
router.delete('/cai-ranges/:id', deleteCaiRange)

module.exports = router
