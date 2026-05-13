const { DataTypes, BIGINT } = require('sequelize')

const BillTypes = Object.freeze({
    CASH: 'CASH',
    INSTALLMENT: 'INSTALLMENT',
});

const BillTypesDbEnum = DataTypes.ENUM(BillTypes.CASH, BillTypes.INSTALLMENT);

const PaymentStatus = Object.freeze({
    PAYED: 'PAYED',
    PENDING: 'PENDING',
    OVERDUE: 'OVERDUE'
});

const PaymentStatusDbEnum = DataTypes.ENUM(PaymentStatus.PAYED, PaymentStatus.PENDING, PaymentStatus.OVERDUE);

module.exports = {
    BillTypes,
    BillTypesDbEnum,
    PaymentStatus,
    PaymentStatusDbEnum
}
