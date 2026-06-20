'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'stores' }, {
            store_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            store_number: { type: Sequelize.INTEGER, allowNull: false },
            address: { type: Sequelize.STRING, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            company_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'companies' }, key: 'company_id' }
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'stores' });
    }
};
