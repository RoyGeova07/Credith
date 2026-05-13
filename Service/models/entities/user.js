const Sequelize = require('sequelize');
const DataType = Sequelize.DataTypes;
const Model = Sequelize.Model;

class User extends Model { }

function initialize(sequelize, _) {
    return User.init(
        {
            userId: {
                type: DataType.UUID,
                primaryKey: true,
                defaultValue: DataType.UUIDV4
            },
            first_name:{

                type: DataType.STRING(100),
                allowNull: false

            },
            second_name:{

                type: DataType.STRING(100),
                allowNull: false

            },
            first_last_name:{

                type:DataType.STRING(100),
                allowNull:false

            },
            second_last_name:{

                type:DataType.STRING(100),
                allowNull:false

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
                
            }
        },
        {
            sequelize: sequelize,
            schema: 'cd',
            paranoid: true,
            timestamps: true,
            underscored: true,
        }
    )
}

module.exports = {
    Users: User,
    initialize
}
