const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Store extends Model { }

function initialize(sequelize, _) {
    return Store.init(
        {
            storeId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            address: {
                type: DataTypes.INTEGER,
                allowNull: false
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
    )
}

module.exports = {
    Stores: Store,
    initialize
}
