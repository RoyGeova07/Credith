const db = require('../models')
const { Bills } = require('../models/entities/bill');
const { Users } = require('../models/entities/user');
const { Companies } = require('../models/entities/company');
const { CaiRanges } = require('../models/entities/caiRange');
const { BillDetails } = require('../models/entities/billDetail');
const { StoresInventories } = require('../models/entities/storeInventory');

async function postBill(req, res) {
    const {
        limitDate,
        customerName,
        customerPhone,
        customerAddress,
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
                include: ['Cai'],
                transaction
            });

            if (!caiRange)
                throw { status: 404, message: 'Rango de cai no encontrado' }

            if (!caiRange.isActive)
                throw { status: 406, message: 'Rango de cai ha expirado' }

            if (!caiRange.Cai)
                throw { status: 404, message: 'Cai no encontrado' }

            if (!caiRange.Cai.isActive)
                throw { status: 406, message: 'El cai ha expirado' }

            const company = await Companies.findByPk(companyId, { transaction });

            if (!company)
                throw { status: 404, message: 'Compañia no encontrada' }

            const maxBill = await Bills.findOne({
                where: { caiRangeId },
                order: [['billNumber', 'DESC']],
                transaction,
                paranoid: false,
            });

            const nextBillNumber = maxBill ? maxBill.billNumber + 1 : caiRange.minRange;

            if (nextBillNumber > caiRange.maxRange)
                throw { status: 406, message: 'El rango de CAI se ha agotado' }

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
                customerName,
                customerPhone,
                customerAddress,
                paymentType,
                isv_15_amount: isv_15_amount,
                isv_15_amount: 0,
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
                    await transaction.rollback();
                    return res.status(406).json({
                        message: `La sucursal [${storeId}] no cuenta con tantos ${detail.productName} en existencia!`
                    })
                }

                productInventory.update({ inStock: productInventory.inStock - detail.quantity }, {transaction});

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
