'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable({ schema: 'cd', tableName: 'roles' }, {
            role_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: { type: Sequelize.STRING(50), allowNull: false },
            description: { type: Sequelize.STRING },
            deleted_at: { type: Sequelize.DATE }
        });

        // User-Role junction table
        await queryInterface.createTable({ schema: 'cd', tableName: 'users_roles' }, {
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'users' }, key: 'user_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'roles' }, key: 'role_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'roles' },
            [ 'name' ],
            { unique: true, name: 'idx_role_name_unique' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'users_roles' });
        await queryInterface.dropTable({ schema: 'cd', tableName: 'roles' });
    }
};
