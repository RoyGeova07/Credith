const Sequelize = require('sequelize');
const Model = Sequelize.Model;

class EmplyeeRole extends Model { }

function initialize(sequelize, _) {
    return EmplyeeRole.init(
        {
        },
        {
            sequelize: sequelize,
            tableName: 'employee_role',
            schema: 'cd',
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    EmplyeesRoles: EmplyeeRole,
    initialize
}
