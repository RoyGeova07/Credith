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

    const monthlyAmount = Number(plan.totalToPay) / plan.monthsToPay;

    const payments = [];
    for (let i = 0; i < plan.monthsToPay; i++) {
        const paymentDate = normalizeDate(baseYear, baseMonth + startingMonth + i, plan.paymentDay);
        payments.push({
            paymentAmount: monthlyAmount,
            interestToPay: 0,
            paymentDeadline: paymentDate,
            billPaymentPlanId: plan.billPaymentPlanId
        });
    }

    return await MonthlyPayments.bulkCreate(payments, {transaction: transaction});
}

async function createInstallmentPaymentPlan(paymentPlan, customer, billTotal, billId, transaction) {
    const totalToPay = Math.max(0, billTotal - paymentPlan.payment)
    const plan = await BillsPaymentPlans.create(
        {
            initialPayment: paymentPlan.payment,
            totalToPay: totalToPay,
            startingDate: paymentPlan.startingDate,
            monthsToPay: paymentPlan.monthsToPay,
            paymentDay: paymentPlan.paymentDay,
            payedAmount: paymentPlan.payment,
            interestRate: paymentPlan.interestRate || 0,
            status: totalToPay == 0 ? PaymentStatus.PAYED : PaymentStatus.PENDING,
            billId: billId
        },
        { transaction }
    );

    const monthlyPayments = await calculateMonthlyPayments(plan, 0, transaction);
    plan.monthlyPayments = monthlyPayments;
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
        companyId,
        caiRangeId,
        userId,
        storeId,
        details,
        customer,
        paymentData
    } = req.body;

    let billSubtotal = 0;
    for (let idx = 0; idx < details.length; ++idx) {

        const detail = details[idx];
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

            const caiRange = await CaiRanges.findByPk(caiRangeId, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!caiRange)
                throw { status: 404, message: 'Rango de CAI no encontrado' }

            if (!caiRange.isActive)
                throw { status: 406, message: 'El rango de CAI ha expirado' }

            const cai = await Cais.findByPk(caiRange.caiId, { transaction });

            if (!cai)
                throw { status: 404, message: 'CAI no encontrado' }

            if (!cai.isActive)
                throw { status: 406, message: 'El CAI ha expirado' }

            const company = await Companies.findByPk(companyId, { transaction });

            if (!company)
                throw { status: 404, message: 'Compañia no encontrada' }

            const nextBillNumber = caiRange.currentNumber + 1;

            if (nextBillNumber > caiRange.maxRange)
                throw { status: 406, message: 'El rango de CAI se ha agotado' }

            await caiRange.update({ currentNumber: nextBillNumber }, { transaction });

            const cashierName = [user.first_name, user.second_name, user.first_last_name, user.second_last_name]
                .filter(Boolean).join(' ');

            const isv_15_amount = billSubtotal * 0.15;
            const billDiscount = discountAmount || 0;

            const total = billSubtotal - billDiscount + isv_15_amount;

            const createdBill = await Bills.create({
                billNumber: nextBillNumber,
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
                isv_15_amount: isv_15_amount,
                isv_18_amount: 0,
                discountPercentage: discountPercentage || 0,
                discountAmount: billDiscount,
                exonerated: exonerated || 0,
                exempt: exempt || 0,
                subtotal: billSubtotal,
                total,
                caiRangeId,
                storeId,
                userId,
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

module.exports = {
    postBill,
}
