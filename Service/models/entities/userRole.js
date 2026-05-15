const Sequelize = require('sequelize');
const Model = Sequelize.Model;

class UserRole extends Model { }

function initialize(sequelize, _) {
    return UserRole.init(
        {
        },
        {
            sequelize: sequelize,
            tableName: 'users_roles',
            schema: 'cd',
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    UsersRoles: UserRole,
    initialize
}
