const { BillTypesDbEnum, PaymentStatusDbEnum } = require('../dbEnums');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Bill extends Model { }

function initialize(sequelize, _) {
    return Bill.init(
        {
            billId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            billNumber: {
                type: DataTypes.INTEGER
            },
            createdAt: {
                type: DataTypes.DATE
            },
            limitDate: {
                type: DataTypes.DATEONLY
            },
            companyName: {
                type: DataTypes.STRING(100)
            },
            companyRtn: {
                type: DataTypes.STRING(25)
            },
            companyEmail: {
                type: DataTypes.STRING(100)
            },
            companyAddress: {
                type: DataTypes.STRING
            },
            checkoutMachineNumber: {
                type: DataTypes.INTEGER
            },
            checkoutMachineName: {
                type: DataTypes.STRING(50)
            },
            cashierName: {
                type: DataTypes.STRING(50)
            },
            customerName: {
                type: DataTypes.STRING(100) 
            },
            customerPhone: {
                type: DataTypes.STRING(25)
            },
            customerAddress: {
                type: DataTypes.STRING
            },
            paymentType: {
                type: BillTypesDbEnum
            },
            isv15Amount: {
                type: DataTypes.DECIMAL(18, 6)
            },
            isv18Amount: {
                type: DataTypes.DECIMAL(18, 6)
            },
            discountPercentage: {
                type: DataTypes.SMALLINT
            },
            discountAmount: {
                type: DataTypes.DECIMAL(18, 6)
            },
            exonerated: {
                type: DataTypes.DECIMAL(18, 6)
            },
            exempt: {
                type: DataTypes.DECIMAL(18, 6)
            },
            subtotal: {
                type: DataTypes.DECIMAL(18, 6)
            },
            total: {
                type: DataTypes.DECIMAL(18, 6)
            },
            clientId: {
                type: DataTypes.UUID
            },
            billNumberFinal: {
                type: DataTypes.STRING(30)
            },
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
    Bills: Bill,
    initialize
}
