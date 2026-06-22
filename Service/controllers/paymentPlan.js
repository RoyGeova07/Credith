const { Op } = require('sequelize');
const db = require('../models')
const { BillsPaymentPlans } = require('../models/entities/billPaymentPlan');
const { MonthlyPayments } = require('../models/entities/monthlyPayment');
const { Clients } = require('../models/entities/clients');
const { Bills } = require('../models/entities/bill');
const { ROLE } = require('../helper/roles');
const { PaymentStatus } = require('../models/dbEnums');
const { normalizeDate } = require('../helper/dateHelper');

function padMonth(month) {
    return String(month).padStart(2, '0');
}

function buildCurrentMonthLimit(currentDate = new Date(), monthsAhead = 3) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const totalOffset = currentMonth + monthsAhead;
    let targetMonth = totalOffset + 1;
    let targetYear = currentYear;
    while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
    }

    return {
        period: {
            type: 'upToMonthsAhead',
            year: currentYear,
            month: currentMonth,
            endDate: `${targetYear}-${padMonth(targetMonth)}-01`,
            monthsAhead
        },
        replacements: {
            endDate: `${targetYear}-${padMonth(targetMonth)}-01`
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
        totalToPay: toMoney(row.totalToPay),
        planPayedAmount: toMoney(row.planPayedAmount),
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
        const { role, storeId } = req.user;

        const storeJoin = role !== ROLE.OWNER
            ? 'INNER JOIN cd.bills b ON b.bill_id = bpp.bill_id AND b.store_id = :storeId'
            : '';

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
                bpp.total_to_pay AS "totalToPay",
                bpp.initial_payment AS "initialPayment",
                bpp.payed_amount AS "planPayedAmount",
                c.client_id AS "clientId",
                c.name AS "clientName",
                c.dni AS "clientDni",
                c.phone AS "clientPhone"
            FROM cd.monthly_payments mp
            INNER JOIN cd.bill_payment_plans bpp
                ON bpp.bill_payment_plan_id = mp.bill_payment_plan_id
            ${storeJoin}
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
                    overdueStatus: PaymentStatus.OVERDUE,
                    ...(role !== ROLE.OWNER ? { storeId } : {})
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

            const base = Math.round((remainingBalance / newMonths) * 100) / 100;

            const payments = [];
            for (let i = 0; i < newMonths; i++) {
                const paymentDate = normalizeDate(baseYear, baseMonth + i, plan.paymentDay);
                const amount = i === newMonths - 1
                    ? Math.round((remainingBalance - base * (newMonths - 1)) * 100) / 100
                    : base;
                payments.push({
                    paymentAmount: amount,
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

            const healedPayedAmount = (Number(plan.initialPayment) || 0)
                + mps.reduce((sum, mp) => sum + Number(mp.payedAmount), 0);

            await BillsPaymentPlans.update(
                {
                    payedAmount: healedPayedAmount,
                    status: mps.every(mp => mp.isPayed) || Number(plan.totalToPay) <= healedPayedAmount ? PaymentStatus.PAYED : plan.status
                },
                {
                    where: {
                        billPaymentPlanId: planId
                    },
                    transaction: transaction
                }
            )

            return healedPayedAmount;
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

    const scopedInclude = [{
        model: Clients,
        as: 'client',
        required: true,
        where: { dni }
    }, {
        model: MonthlyPayments,
        as: 'monthlyPayments',
        required: false
    }];

    if (req.user && req.user.role !== ROLE.OWNER) {
        scopedInclude.push({
            model: Bills,
            as: 'bill',
            required: true,
            where: { storeId: req.user.storeId }
        });
    }

    const paymentPlan = await BillsPaymentPlans.findOne({
        include: scopedInclude,
        order: [['createdAt', 'DESC']]
    });

    if (!paymentPlan)
        return res.status(404).json({ message: `No se ha encontrado un plan de pago para el cliente con DNI: ${dni}` });

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
