const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

const { Stores } = require('./store')

class CheckoutMachine extends Model { }

function initialize(sequelize, _) {
    return CheckoutMachine.init(
        {
            checkoutMachineId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            machineNumber: {
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING(50),
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            sequelize: sequelize,
            schema: 'cd',
            paranoid: true,
            underscored: true,
            omitNull: true,
        }
    );
}

module.exports = {
    CheckoutMachines: CheckoutMachine,
    initialize
}
