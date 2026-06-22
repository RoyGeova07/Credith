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
            store_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'stores' }, key: 'store_id' }
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

        // Add checkout_machine_id to users now that checkout_machines exists
        await queryInterface.addColumn(
            { schema: 'cd', tableName: 'users' },
            'checkout_machine_id',
            {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'checkout_machines' }, key: 'checkout_machine_id' }
            }
        );

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'users' },
            ['checkout_machine_id'],
            { name: 'idx_user_checkout_machine' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            { schema: 'cd', tableName: 'users' },
            'idx_user_checkout_machine'
        );
        await queryInterface.removeColumn(
            { schema: 'cd', tableName: 'users' },
            'checkout_machine_id'
        );
        await queryInterface.dropTable({ schema: 'cd', tableName: 'checkout_machines' });
    }
};
