const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class StoreInventory extends Model { }

function initialize(sequelize, _) {
    return StoreInventory.init(
        {
            productId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            },
            storeId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            },
            inStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            isActive:{

                type:DataTypes.BOOLEAN,allowNull:false,defaultValue:true,field:'is_active'

            },
        },
        {
            sequelize: sequelize,
            tableName: 'stores_inventories',
            schema: 'cd',
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    StoresInventories: StoreInventory,
    initialize
}
