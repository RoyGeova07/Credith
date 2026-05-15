'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'users' }, {
            user_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            first_name:{ type: Sequelize.STRING(100), allowNull: false },
            second_name:{ type: Sequelize.STRING(100), allowNull: false },
            first_last_name:{ type: Sequelize.STRING(100), allowNull:false },
            second_last_name:{ type: Sequelize.STRING(100), allowNull:false },
            email: { type: Sequelize.STRING(100) },
            password: { type: Sequelize.STRING },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            store_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'stores' }, key: 'store_id' }
            },
            created_at: { type: Sequelize.DATE },
            updated_at: { type: Sequelize.DATE },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'users' },
            [ 'email' ],
            { unique: true, name: 'idx_user_email_unique' }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'users' });
    }
};
