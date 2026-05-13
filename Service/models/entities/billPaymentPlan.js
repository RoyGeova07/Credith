const { PaymentStatusDbEnum } = require('../dbEnums')
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class BillPaymentPlan extends Model { }

function initialize(sequelize, _) {
    return BillPaymentPlan.init(
        {
            billPaymentPlanId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            initialPayment: {
                type: DataTypes.DECIMAL(18,6),
                defaultValue: 0
            },
            totalToPay: {
                type: DataTypes.DECIMAL(18,6),
                allowNull: false
            },
            payedAmount: {
                type: DataTypes.DECIMAL(18,6),
                defaultValue: 0,
            },
            monthsToPay: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            paymentDay: {
                type: DataTypes.SMALLINT
            },
            interestRate: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            lastPaymentTime: {
                type: DataTypes.DATE
            },
            status: {
                type: PaymentStatusDbEnum
            }
        },
        {
            sequelize: sequelize,
            schema: 'cd',
            paranoid: true,
            underscored: true,
            omitNull: true,
        }
    )
}

module.exports = {
    BillsPaymentPlans: BillPaymentPlan,
    initialize
}
