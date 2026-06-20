const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Cai extends Model { }

function initialize(sequelize, _) {
    return Cai.init(
        {
            caiId: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            governmentId: {
                type: DataTypes.STRING(75),
                allowNull: false,
            },
            expirationDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            documentType: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: '01'
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
                    fields: ['government_id']
                }
            ]
        }
    );
}

module.exports = {
    Cais: Cai,
    initialize
};
