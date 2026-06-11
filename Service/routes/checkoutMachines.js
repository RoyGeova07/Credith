const router = require('express').Router()

const {
  createCheckoutMachine,
  getPagedCheckoutMachines,
  getCheckoutMachineById,
  updateCheckoutMachine,
  deactivateCheckoutMachine,
  activateCheckoutMachine,
  associateUserToCheckoutMachine,
  deleteCheckoutMachine
} = require('../controllers/checkoutMachines')

/**
 * @swagger
 * /api/checkout-machines:
 *   get:
 *     summary: Obtener todas las maquinas de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de registros a mostrar
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
 *         description: Lista de maquinas de checkout obtenida correctamente
 */
router.get('/checkout-machines', getPagedCheckoutMachines)

/**
 * @swagger
 * /api/checkout-machines/{id}:
 *   get:
 *     summary: Obtener maquina de checkout por ID
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maquina de checkout encontrada
 *       404:
 *         description: Maquina de checkout no encontrada
 */
router.get('/checkout-machines/:id', getCheckoutMachineById)

/**
 * @swagger
 * /api/checkout-machines:
 *   post:
 *     summary: Crear una nueva maquina de checkout
 *     tags: [Checkout Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machineNumber
 *               - name
 *               - userId
 *             properties:
 *               machineNumber:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Caja Principal
 *               userId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       201:
 *         description: Maquina de checkout creada correctamente
 *       400:
 *         description: Datos inválidos o usuario ya asignado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/checkout-machines', createCheckoutMachine)

/**
 * @swagger
 * /api/checkout-machines/{id}:
 *   put:
 *     summary: Actualizar una maquina de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               machineNumber:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Caja Secundaria
 *               userId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       200:
 *         description: Maquina de checkout actualizada correctamente
 *       400:
 *         description: Datos inválidos o usuario ya asignado
 *       404:
 *         description: Maquina o usuario no encontrado
 */
router.put('/checkout-machines/:id', updateCheckoutMachine)

/**
 * @swagger
 * /api/checkout-machines/deactivate/{id}:
 *   put:
 *     summary: Desactivar una maquina de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maquina de checkout desactivada correctamente
 *       400:
 *         description: La maquina ya está desactivada
 *       404:
 *         description: Maquina de checkout no encontrada
 */
router.put('/checkout-machines/deactivate/:id', deactivateCheckoutMachine)

/**
 * @swagger
 * /api/checkout-machines/activate/{id}:
 *   put:
 *     summary: Activar una maquina de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maquina de checkout activada correctamente
 *       400:
 *         description: La maquina ya está activa
 *       404:
 *         description: Maquina de checkout no encontrada
 */
router.put('/checkout-machines/activate/:id', activateCheckoutMachine)

/**
 * @swagger
 * /api/checkout-machines/{id}/associate-user:
 *   put:
 *     summary: Asociar usuario a una maquina de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       200:
 *         description: Usuario asociado correctamente
 *       400:
 *         description: Usuario ya tiene una maquina asignada
 *       404:
 *         description: Usuario o maquina no encontrada
 */
router.put('/checkout-machines/:id/associate-user', associateUserToCheckoutMachine)

/**
 * @swagger
 * /api/checkout-machines/{id}:
 *   delete:
 *     summary: Eliminar una maquina de checkout
 *     tags: [Checkout Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquina de checkout
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maquina de checkout eliminada correctamente
 *       404:
 *         description: Maquina de checkout no encontrada
 */
router.delete('/checkout-machines/:id', deleteCheckoutMachine)

module.exports = router
