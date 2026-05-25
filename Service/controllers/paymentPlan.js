const { Op } = require('sequelize');
const db = require('../models')
const { BillsPaymentPlans } = require('../models/entities/billPaymentPlan');
const { MonthlyPayments } = require('../models/entities/monthlyPayment');
const { Clients } = require('../models/entities/clients');
const { PaymentStatus } = require('../models/dbEnums');
const { normalizeDate } = require('../helper/dateHelper');

async function postRecalculatePlan(req, res) {
    const { newMonths } = req.body;
    const { planId } = req.params;

    const plan = await BillsPaymentPlans.findByPk(
        planId,
        {
            include: ['monthlyPayments']
        }
    );

    if (!plan)
        return res.status(404).json({ message: `No se ha encontrado plan de pago con id: ${planId}` });

    if (plan.status === PaymentStatus.PAYED)
        return res.status(400).json({ message: `El plan de pago ya ha sido cubierto!` });

    if (newMonths <= 0)
        return res.status(400).json({ message: `El numero de meses debe ser mayor a cero.` });

    if (newMonths > plan.monthsToPay)
        return res.status(400).json({ message: `No se puede alargar el pago a plazos.` });

    const openMonthsWithInterest = await MonthlyPayments.findAll({
        where: {
            billPaymentPlanId: planId,
            isPayed: false,
            interestToPay: { [Op.gt]: 0 }
        }
    });

    if (openMonthsWithInterest.length > 0)
        return res.status(400).json({ message: 'No se puede recalcular por meses pendientes' });

    try {
        await db.sequelize.transaction(async (transaction) => {
            const remainingBalance = Number(plan.totalToPay) - Number(plan.payedAmount);

            await MonthlyPayments.destroy({
                where: { billPaymentPlanId: planId },
                transaction
            });

            const now = new Date();
            const baseYear = now.getUTCFullYear();
            const baseMonth = now.getUTCMonth();

            const monthlyPaymentAmount = remainingBalance / newMonths;

            const payments = [];
            for (let i = 0; i < newMonths; i++) {
                const paymentDate = normalizeDate(baseYear, baseMonth + i, plan.paymentDay);
                payments.push({
                    paymentAmount: monthlyPaymentAmount,
                    interestToPay: 0,
                    paymentDeadline: paymentDate,
                    billPaymentPlanId: planId
                });
            }

            await MonthlyPayments.bulkCreate(payments, { transaction });

            await plan.update({
                monthsToPay: newMonths,
                status: remainingBalance === 0 ? PaymentStatus.PAYED : PaymentStatus.PENDING
            }, { transaction });
        });

        const updatedPlan = await BillsPaymentPlans.findByPk(planId, {
            include: ['monthlyPayments']
        });

        return res.status(200).json(updatedPlan);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
}

async function postPayPlan(req, res) {
    const { amount, month } = req.body;
    const { planId } = req.params;

    const plan = await BillsPaymentPlans.findByPk(
        planId,
    );

    if (!plan)
        return res.status(404).json({ message: `No se ha encontrado plan de pago con id: ${planId}` });

    if (plan.status === PaymentStatus.PAYED)
        return res.status(400).json({ message: `El plan de pago ya ha sido cubierto!` });

    if (plan.monthsToPay < month)
        return res.status(400).json({ message: `El plan de pago solo cuenta con ${plan.monthsToPay} meses` });

    try {
        const finalPayedAmount = await db.sequelize.transaction(async (transaction) => {
            const mps = await MonthlyPayments.findAll({
                where: { billPaymentPlanId: plan.billPaymentPlanId },
                order: [['paymentDeadline', 'ASC']],
                transaction: transaction
            });

            let remainingAmount = amount;
            let finalPayedAmount = Number(plan.payedAmount);
            for (let mp of mps.slice(month)) {
                if (mp.isPayed) continue;

                const amountToPay = Number(mp.interestToPay) + Number(mp.paymentAmount);
                const remainingToPay = amountToPay - Number(mp.payedAmount);

                const actualPayment = Math.min(remainingToPay, remainingAmount);
                if (actualPayment <= 0) break;

                finalPayedAmount += actualPayment;
                remainingAmount -= actualPayment;

                const finalMonthPayment = Number(mp.payedAmount) + actualPayment;
                await mp.update(
                    { 
                        payedAmount: finalMonthPayment,
                        isPayed: finalMonthPayment >= amountToPay
                    },
                    { transaction }
                );

                if (remainingAmount <= 0) break;
            }

            await BillsPaymentPlans.update(
                {
                    payedAmount: finalPayedAmount,
                    status: Number(plan.totalToPay) <= finalPayedAmount ? PaymentStatus.PAYED : plan.status
                },
                {
                    where: {
                        billPaymentPlanId: planId
                    },
                    transaction: transaction
                }
            )

            return finalPayedAmount;
        });

        return res.status(200).json({ message: `El pago se ha realizado con exito!`, payedAmount: finalPayedAmount });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
}

async function getPaymentPlan(req, res) {
    const { dni } = req.params;

    if (!dni || dni.trim() === '') {
        return res.status(400).json({ message: 'Por favor especifique el DNI' })
    }

    const paymentPlan = await BillsPaymentPlans.findOne({
        where: {
            status: { [Op.or]: [PaymentStatus.OVERDUE, PaymentStatus.PENDING] }
        },
        include: [{
            model: Clients,
            as: 'client',
            required: true,
            where: { dni }
        }]
    });

    if (!paymentPlan)
        return res.status(404).json({ message: `No se ha encontrado deuda activa para el cliente [DNI: ${dni}]` });

    return res.status(200).json({ paymentPlan });
}

module.exports = {
    postPayPlan,
    getPaymentPlan,
    postRecalculatePlan,
}
