const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Company extends Model { }

function initialize(sequelize, _) {
    return Company.init(
        {
            companyId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            companyName: {
                type: DataTypes.STRING(100)
            },
            rtn: {
                type: DataTypes.STRING(25),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(100)
            },
            address: {
                type: DataTypes.STRING
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
    Companies: Company,
    initialize
}
