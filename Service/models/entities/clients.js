const Sequelize = require('sequelize');
const DataType = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Client extends Model { }

function initialize(sequelize, _) {
    return Client.init(
        {
            clientId: {
                type: DataType.UUID,
                primaryKey: true,
                defaultValue: DataType.UUIDV4
            },
            name: {
                type: DataType.STRING(100),
                allowNull: false
            },
            phone: {
                type: DataType.STRING(25),
            },
            address: {
                type: DataType.STRING,
            },
            isActive: {
                type: DataType.BOOLEAN,
                defaultValue: true,
                onDelete: 'SET FALSE'
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
    Clients: Client,
    initialize
}
