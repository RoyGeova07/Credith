const Sequelize = require('sequelize');
const DataType = Sequelize.DataTypes;
const Model = Sequelize.Model;

class Employee extends Model { }

function initialize(sequelize, _) {
    return Employee.init(
        {
            employeeId: {
                type: DataType.UUID,
                primaryKey: true,
                defaultValue: DataType.UUIDV4
            },
            name: {
                type: DataType.STRING(100),
                allowNull: false
            },
            email: {
                type: DataType.STRING(100),
            },
            password: {
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
    Employees: Employee,
    initialize
}
