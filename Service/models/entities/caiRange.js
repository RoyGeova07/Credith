const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class CaiRange extends Model { }

function initialize(sequelize, _) {
    return CaiRange.init(
        {
            caiRangeId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            minRange: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            maxRange: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            currentNumber: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
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
    CaiRanges: CaiRange,
    initialize
};
