const router = require('express').Router()

const {
    postRecalculatePlan,
    postPayPlan,
    getPaymentPlan
} = require('../controllers/paymentPlan');

/**
 * @swagger
 * /api/payment-plan/{planId}/recalculate:
 *   post:
 *     summary: Recalcular un plan de pago
 *     tags: [PaymentPlan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: ID del plan de pago
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newMonths
 *             properties:
 *               newMonths:
 *                 type: integer
 *                 example: 6
 *                 description: Nuevo número de meses para el plan
 *     responses:
 *       200:
 *         description: Plan recalculado correctamente
 *       400:
 *         description: No se puede recalcular el plan (ya pagado, meses inválidos o intereses pendientes)
 *       404:
 *         description: Plan de pago no encontrado
 */
router.post('/payment-plan/:planId/recalculate', postRecalculatePlan)

/**
 * @swagger
 * /api/payment-plan/{planId}/pay:
 *   post:
 *     summary: Realizar un pago a un plan
 *     tags: [PaymentPlan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: ID del plan de pago
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - month
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *                 description: Monto a acreditar
 *               month:
 *                 type: integer
 *                 example: 1
 *                 description: Mes desde el cual aplicar el pago
 *     responses:
 *       200:
 *         description: Pago acreditado correctamente
 *       400:
 *         description: No se puede pagar el plan (ya pagado o mes inválido)
 *       404:
 *         description: Plan de pago no encontrado
 */
router.post('/payment-plan/:planId/pay', postPayPlan)

/**
 * @swagger
 * /api/payment-plan/{dni}:
 *   get:
 *     summary: Obtener plan de pago activo por DNI del cliente
 *     tags: [PaymentPlan]
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         description: DNI del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan de pago encontrado
 *       400:
 *         description: DNI no especificado
 *       404:
 *         description: No se encontró deuda activa para el cliente
 */
router.get('/payment-plan/:dni', getPaymentPlan)

module.exports = router
