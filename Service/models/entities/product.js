const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Product extends Model { }

function initialize(sequelize, _) {
    return Product.init(
        {
            productId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            imageUrl: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            buyPrice: {
                type: DataTypes.DECIMAL(16, 8),
                defaultValue: 0
            },
            sellPrice: {
                type: DataTypes.DECIMAL(16, 8),
                allowNull: false,
            },
            minGainPercentage: {
                type: DataTypes.SMALLINT
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
            indexes: [
                {
                    unique: true,
                    fields: ['name']
                }
            ]
        }
    )
}

module.exports = {
    Products: Product,
    initialize
};
