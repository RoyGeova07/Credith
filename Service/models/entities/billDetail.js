const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class BillDetail extends Model { }

function initialize(sequelize, _) {
    return BillDetail.init(
        {
            billDetailId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            sellPrice: {
                type: DataTypes.DECIMAL(18, 6),
                allowNull: false
            },
            discountPercentage: {
                type: DataTypes.SMALLINT,
                defaultValue: 0
            },
            discountAmount: {
                type: DataTypes.DECIMAL(18, 6),
                defaultValue: 0
            },
            total: {
                type: DataTypes.DECIMAL(18, 6),
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
    BillDetails: BillDetail,
    initialize
}
