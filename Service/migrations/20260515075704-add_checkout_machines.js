'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'checkout_machines' }, {
            checkout_machine_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            machine_number: { type: Sequelize.INTEGER },
            name: { type: Sequelize.STRING(50) },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            user_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'users' }, key: 'user_id' }
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'checkout_machines' },
            ['machine_number'],
            { name: 'idx_checkout_machine_number' }
        );

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'checkout_machines' },
            ['name'],
            { name: 'idx_checkout_machine_name' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'checkout_machines' });
    }
};
