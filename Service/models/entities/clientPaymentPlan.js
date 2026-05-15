const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class ClientPaymentPlan extends Model { }

function initialize(sequelize, _) {
    return ClientPaymentPlan.init(
        {
            billPaymentPlanId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            },
            clientId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            }
        },
        {
            sequelize: sequelize,
            tableName: 'clients_payment_plans',
            schema: 'cd',
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    ClientsPaymentPlans: ClientPaymentPlan,
    initialize
}
