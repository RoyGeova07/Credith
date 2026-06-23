const { Op } = require('sequelize');
const db = require('../models')
const { Bills } = require('../models/entities/bill');
const { Users } = require('../models/entities/user');
const { Companies } = require('../models/entities/company');
const { CaiRanges } = require('../models/entities/caiRange');
const { Cais } = require('../models/entities/cai');
const { BillDetails } = require('../models/entities/billDetail');
const { BillsPaymentPlans } = require('../models/entities/billPaymentPlan');
const { MonthlyPayments } = require('../models/entities/monthlyPayment');
const { StoresInventories } = require('../models/entities/storeInventory');
const { BillTypes, PaymentStatus } = require('../models/dbEnums');
const { Clients } = require('../models/entities/clients');
const { Products } = require('../models/entities/product');
const { ROLE } = require('../helper/roles');

function normalizeDate(year, month, day) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const maxDay = Math.min(day, lastDay);

    return new Date(
        Date.UTC(year, month, maxDay)
    );
}

async function calculateMonthlyPayments(plan, startingMonth, transaction) {
    const baseDate = new Date(plan.startingDate);

    const baseYear = baseDate.getUTCFullYear();
    const baseMonth = baseDate.getUTCMonth();

    const totalMonthly = Number(plan.totalToPay) - Number(plan.payedAmount);
    const base = Math.round((totalMonthly / plan.monthsToPay) * 100) / 100;

    const payments = [];
    for (let i = 0; i < plan.monthsToPay; i++) {
        const paymentDate = normalizeDate(baseYear, baseMonth + startingMonth + i, plan.paymentDay);
        const amount = i === plan.monthsToPay - 1
            ? Math.round((totalMonthly - base * (plan.monthsToPay - 1)) * 100) / 100
            : base;
        payments.push({
            paymentAmount: amount,
            interestToPay: 0,
            paymentDeadline: paymentDate,
            billPaymentPlanId: plan.billPaymentPlanId
        });
    }

    return await MonthlyPayments.bulkCreate(payments, {transaction: transaction});
}

async function createInstallmentPaymentPlan(paymentPlan, customer, billTotal, billId, transaction) {
    const activePlan = await BillsPaymentPlans.findOne({
        include: [{
            model: Clients,
            as: 'client',
            required: true,
            where: { clientId: customer.clientId }
        }],
        where: {
            status: { [Op.in]: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] }
        },
        transaction
    });

    if (activePlan) {
        throw { status: 400, message: 'El cliente ya tiene un plan de pago activo' };
    }

    const totalToPay = Math.max(0, billTotal)
    const fullyPaid = paymentPlan.payment >= totalToPay || paymentPlan.monthsToPay <= 0;

    const plan = await BillsPaymentPlans.create(
        {
            initialPayment: fullyPaid ? totalToPay : paymentPlan.payment,
            totalToPay: totalToPay,
            startingDate: paymentPlan.startingDate,
            monthsToPay: fullyPaid ? 0 : paymentPlan.monthsToPay,
            paymentDay: paymentPlan.paymentDay,
            payedAmount: fullyPaid ? totalToPay : paymentPlan.payment,
            interestRate: paymentPlan.interestRate || 0,
            status: fullyPaid ? PaymentStatus.PAYED : PaymentStatus.PENDING,
            billId: billId
        },
        { transaction }
    );

    if (!fullyPaid) {
        const monthlyPayments = await calculateMonthlyPayments(plan, 0, transaction);
        plan.monthlyPayments = monthlyPayments;
    }

    await plan.setClient(customer.clientId, { transaction });
    return plan;
}

async function createCashPaymentPlan(paymentData, billTotal, billId, transaction) {
    const totalToPay = Math.max(0, billTotal - paymentData.payment)
    return await BillsPaymentPlans.create(
        {
            initialPayment: paymentData.payment,
            totalToPay: totalToPay,
            payedAmount: paymentData.payment,
            interestRate: paymentData.interestRate || 0,
            status: PaymentStatus.PAYED,
            billId: billId
        },
        { transaction }
    );
}

async function postBill(req, res) {
    const {
        limitDate,
        paymentType,
        discountPercentage,
        discountAmount,
        exonerated,
        exempt,
        userId,
        storeId,
        details,
        customer,
        paymentData
    } = req.body;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let billSubtotal = 0;
    for (let idx = 0; idx < details.length; ++idx) {

        const detail = details[idx];

        if (!detail.productId || !UUID_RE.test(detail.productId))
            return res.status(400).json({
                message: `ID del producto ${idx + 1} es inválido. Recarga el catálogo e intenta de nuevo.`
            });

        const subtotal = detail.quantity * detail.sellPrice;
        if (subtotal < 0)
            return res.status(400).json({
                message: `Subtotal [${subtotal}] del producto ${idx + 1} es invalido`
            })

        const detailDiscountAmount = (detail.discountPercentage / 100) * subtotal;
        const total = subtotal - detailDiscountAmount;

        if (detail.total !== total)
            return res.status(400).json({
                message: `Total [${total}] del producto #${idx + 1} es invalido`
            })

        billSubtotal += total;
    }

    if (paymentType !== BillTypes.CASH && paymentType !== BillTypes.INSTALLMENT) {
        return res.status(400).json({
            message: `El tipo de pago [${paymentType}] es invalido`
        })
    }

    try {
        const bill = await db.sequelize.transaction(async (transaction) => {
            const user = await Users.findByPk(userId, {
                include: ['checkoutMachine', 'store'],
                transaction
            });

            if (!user)
                throw { status: 404, message: 'Usuario no encontrado' }

            if (!user.checkoutMachine)
                throw { status: 404, message: 'Usuario no tiene asignado una caja de facturacion' }

            if (!user.store)
                throw { status: 404, message: 'Usuario no trabaja en una sucursal valida' }

            if (user.store.storeId != storeId)
                throw { status: 406, message: 'La sucursal donde trabaja el usuario no es la misma especificada en la factura' }

            const activeCai = await Cais.findOne({
                where: { storeId, isActive: true },
                transaction
            });

            if (!activeCai)
                throw { status: 404, message: 'La sucursal no tiene un CAI activo' }

            const caiRange = await CaiRanges.findOne({
                where: { caiId: activeCai.caiId, isActive: true },
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!caiRange)
                throw { status: 404, message: 'Rango de CAI no encontrado' }

            const company = await Companies.findByPk(user.store.companyId, { transaction });

            if (!company)
                throw { status: 404, message: 'Compañia no encontrada' }

            const nextBillNumber = caiRange.minRange + caiRange.currentNumber;

            if (nextBillNumber > caiRange.maxRange)
                throw { status: 406, message: 'El rango de CAI se ha agotado' }

            await caiRange.update({ currentNumber: caiRange.currentNumber + 1 }, { transaction });

            const cashierName = [user.first_name, user.second_name, user.first_last_name, user.second_last_name]
                .filter(Boolean).join(' ');

            const billNumberFinal = [
                String(user.store.storeNumber).padStart(3, '0'),
                String(user.checkoutMachine.machineNumber).padStart(3, '0'),
                activeCai.documentType,
                String(nextBillNumber).padStart(8, '0')
            ].join('-');

            const billDiscount = discountAmount || 0;
            const discountedSubtotal = billSubtotal - billDiscount;
            const isv_15_amount = discountedSubtotal * 0.15;

            const total = discountedSubtotal + isv_15_amount;

            const createdBill = await Bills.create({
                billNumber: nextBillNumber,
                billNumberFinal,
                limitDate,
                companyName: company.name,
                companyRtn: company.rtn,
                companyEmail: company.email,
                companyAddress: company.address,
                checkoutMachineNumber: user.checkoutMachine.machineNumber,
                checkoutMachineName: user.checkoutMachine.name,
                cashierName,
                customerName: customer.customerName,
                customerPhone: customer.customerPhone,
                customerAddress: customer.customerAddress,
                paymentType,
                isv15Amount: isv_15_amount,
                isv18Amount: 0,
                discountPercentage: discountPercentage || 0,
                discountAmount: billDiscount,
                exonerated: exonerated || 0,
                exempt: exempt || 0,
                subtotal: billSubtotal,
                total,
                caiRangeId: caiRange.caiRangeId,
                storeId,
                userId,
                clientId: paymentType === BillTypes.INSTALLMENT ? customer.clientId : null,
            }, { transaction });

            for (const detail of details) {
                const productInventory = await StoresInventories.findOne(
                    {
                        where: {
                            storeId: storeId,
                            productId: detail.productId
                        },
                        transaction: transaction
                    }
                );

                if (!productInventory)
                    throw { status: 404, message: `El producto ${detail.productName} no existe en el inventario de esta sucursal` }

                if (productInventory.inStock < detail.quantity) {
                    throw { status: 406, message: `La sucursal [${storeId}] no cuenta con tantos ${detail.productName} en existencia!` }
                }

                await productInventory.update({ inStock: productInventory.inStock - detail.quantity }, { transaction });

                await BillDetails.create({
                    quantity: detail.quantity,
                    sellPrice: detail.sellPrice,
                    discountPercentage: detail.discountPercentage || 0,
                    discountAmount: detail.discountAmount || 0,
                    total: detail.total,
                    productId: detail.productId,
                    billId: createdBill.billId,
                }, { transaction });
            }

            if (paymentType === BillTypes.CASH) {
                createdBill.plan = await createCashPaymentPlan(paymentData, total, createdBill.billId, transaction);
            } else {
                createdBill.plan = await createInstallmentPaymentPlan(paymentData, customer, total, createdBill.billId, transaction);
            }

            return createdBill;
        });

        res.status(201).json(bill);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
}

async function getBills(req, res) {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;
    const { from, to } = req.query;
    const { role, storeId, id: userId } = req.user;

    const where = {};

    if (role === ROLE.ADMIN) {
        where.storeId = storeId;
    } else if (role === ROLE.EMPLOYEE) {
        where.userId = userId;
    }

    if (from) {
        where.createdAt = { ...(where.createdAt || {}), [Op.gte]: new Date(`${from}T00:00:00.000Z`) };
    }
    if (to) {
        where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(`${to}T23:59:59.999Z`) };
    }

    try {
        const { count, rows } = await Bills.findAndCountAll({
            where,
            include: [{
                model: BillDetails,
                as: 'billDetails',
                include: [{ model: Products, as: 'product', attributes: ['buyPrice', 'name'] }],
            }],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        const data = rows.map(bill => {
            const details = bill.billDetails || [];
            const grossGain = details.reduce((sum, d) => {
                const buy = Number(d.product?.buyPrice || 0);
                return sum + (Number(d.sellPrice) - buy) * Number(d.quantity);
            }, 0);
            const netGain = details.reduce((sum, d) => {
                const buy = Number(d.product?.buyPrice || 0);
                return sum + (Number(d.total) - buy * Number(d.quantity));
            }, 0);

            return {
                billId: bill.billId,
                billNumberFinal: bill.billNumberFinal,
                cashierName: bill.cashierName,
                customerName: bill.customerName,
                paymentType: bill.paymentType,
                total: Number(bill.total).toFixed(2),
                grossGain: grossGain.toFixed(2),
                netGain: netGain.toFixed(2),
                createdAt: bill.createdAt,
            };
        });

        res.json({ data, total: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getBillById(req, res) {
    const { id } = req.params;
    const { role, storeId, id: userId } = req.user;

    try {
        const bill = await Bills.findByPk(id, {
            include: [{
                model: BillDetails,
                as: 'billDetails',
                include: [{ model: Products, as: 'product', attributes: ['name', 'buyPrice'] }],
            }],
        });

        if (!bill) return res.status(404).json({ message: 'Factura no encontrada' });

        if (role === ROLE.ADMIN && bill.storeId !== storeId)
            return res.status(403).json({ message: 'No tienes acceso a esta factura' });
        if (role === ROLE.EMPLOYEE && bill.userId !== userId)
            return res.status(403).json({ message: 'No tienes acceso a esta factura' });

        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    postBill,
    getBills,
    getBillById,
}
