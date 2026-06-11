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
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de CAI a mostrar
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
 *         description: Lista de CAI obtenida correctamente
 */
router.get('/cais', getPagedCais)

/**
 * @swagger
 * /api/cais:
 *   post:
 *     summary: Crear un nuevo CAI con rango
 *     tags: [CAI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - governmentId
 *               - expirationDate
 *               - range
 *             properties:
 *               governmentId:
 *                 type: string
 *                 example: CAI-123456789
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               range:
 *                 type: object
 *                 required:
 *                   - minRange
 *                   - maxRange
 *                   - expirationDate
 *                 properties:
 *                   minRange:
 *                     type: integer
 *                     example: 1
 *                   maxRange:
 *                     type: integer
 *                     example: 1000
 *                   expirationDate:
 *                     type: string
 *                     format: date
 *                     example: 2026-12-31
 *     responses:
 *       201:
 *         description: CAI creado correctamente
 *       400:
 *         description: Datos inválidos o CAI duplicado
 */
router.post('/cais', createCai)

/**
 * @swagger
 * /api/cais/{id}:
 *   delete:
 *     summary: Eliminar un CAI
 *     tags: [CAI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del CAI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CAI eliminado correctamente
 *       404:
 *         description: CAI no encontrado
 */
router.delete('/cais/:id', deleteCai)

module.exports = router