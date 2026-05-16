const Sequelize = require('sequelize');
const DataType = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Role extends Model { }

function initialize(sequelize, _) {
    return Role.init(
        {
            roleId: {
                type: DataType.UUID,
                primaryKey: true,
                defaultValue: DataType.UUIDV4
            },
            name: {
                type: DataType.STRING(50),
                allowNull: false
            },
            description: {
                type: DataType.STRING
            }
        },
        {
            sequelize: sequelize,
            schema: 'cd',
            paranoid: true,
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    Roles: Role,
    initialize
}
