const { Op } = require('sequelize');
const db = require('../models')
const { BillsPaymentPlans } = require('../models/entities/billPaymentPlan');
const { MonthlyPayments } = require('../models/entities/monthlyPayment');
const { Clients } = require('../models/entities/clients');
const { PaymentStatus } = require('../models/dbEnums');
const { normalizeDate } = require('../helper/dateHelper');

function padMonth(month) {
    return String(month).padStart(2, '0');
}

function buildCurrentMonthLimit(currentDate = new Date()) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    return {
        period: {
            type: 'upToCurrentMonth',
            year: currentYear,
            month: currentMonth,
            endDate: `${nextYear}-${padMonth(nextMonth)}-01`
        },
        replacements: {
            endDate: `${nextYear}-${padMonth(nextMonth)}-01`
        }
    };
}

function toMoney(value) {
    return Number(Number(value || 0).toFixed(2));
}

function mapPendingPaymentRows(rows) {
    return rows.map((row) => ({
        monthlyPaymentId: row.monthlyPaymentId,
        billPaymentPlanId: row.billPaymentPlanId,
        paymentDeadline: row.paymentDeadline,
        paymentAmount: toMoney(row.paymentAmount),
        interestToPay: toMoney(row.interestToPay),
        payedAmount: toMoney(row.payedAmount),
        amountToPay: toMoney(row.amountToPay),
        planStatus: row.planStatus,
        client: {
            clientId: row.clientId,
            name: row.clientName,
            dni: row.clientDni,
            phone: row.clientPhone
        }
    }));
}

async function getPendingPayments(req, res) {
    try {
        const currentMonthLimit = buildCurrentMonthLimit();

        const pendingPayments = await db.sequelize.query(
            `
            SELECT
                mp.monthly_payment_id AS "monthlyPaymentId",
                mp.payment_deadline AS "paymentDeadline",
                mp.payment_amount AS "paymentAmount",
                COALESCE(mp.interest_to_pay, 0) AS "interestToPay",
                COALESCE(mp.payed_amount, 0) AS "payedAmount",
                (
                    COALESCE(mp.payment_amount, 0)
                    + COALESCE(mp.interest_to_pay, 0)
                    - COALESCE(mp.payed_amount, 0)
                ) AS "amountToPay",
                bpp.bill_payment_plan_id AS "billPaymentPlanId",
                bpp.status AS "planStatus",
                c.client_id AS "clientId",
                c.name AS "clientName",
                c.dni AS "clientDni",
                c.phone AS "clientPhone"
            FROM cd.monthly_payments mp
            INNER JOIN cd.bill_payment_plans bpp
                ON bpp.bill_payment_plan_id = mp.bill_payment_plan_id
            INNER JOIN cd.clients_payment_plans cpp
                ON cpp.bill_payment_plan_id = bpp.bill_payment_plan_id
            INNER JOIN cd.clients c
                ON c.client_id = cpp.client_id
            WHERE mp.deleted_at IS NULL
                AND bpp.deleted_at IS NULL
                AND c.deleted_at IS NULL
                AND mp.is_payed = false
                AND bpp.status IN (:pendingStatus, :overdueStatus)
                AND mp.payment_deadline < :endDate
                AND (
                    COALESCE(mp.payment_amount, 0)
                    + COALESCE(mp.interest_to_pay, 0)
                    - COALESCE(mp.payed_amount, 0)
                ) > 0
            ORDER BY mp.payment_deadline ASC, c.name ASC
            `,
            {
                replacements: {
                    ...currentMonthLimit.replacements,
                    pendingStatus: PaymentStatus.PENDING,
                    overdueStatus: PaymentStatus.OVERDUE
                },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        return res.status(200).json({
            period: currentMonthLimit.period,
            pendingPayments: mapPendingPaymentRows(pendingPayments)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
    getPendingPayments,
    buildCurrentMonthLimit,
    mapPendingPaymentRows,
}
