const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class MonthlyPayment extends Model { }

function initialize(sequelize, _) {
    return MonthlyPayment.init(
        {
            monthlyPaymentId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            paymentAmount: {
                type: DataTypes.DECIMAL(18,6),
                allowNull: false
            },
            interestToPay: {
                type: DataTypes.DECIMAL(18,6)
            },
            paymentDeadline: {
                type: DataTypes.DATE
            },
            payedAmount: {
                type: DataTypes.DECIMAL(18,6),
                defaultValue: 0
            },
            isPayed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
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
    MonthlyPayments: MonthlyPayment,
    initialize
}
