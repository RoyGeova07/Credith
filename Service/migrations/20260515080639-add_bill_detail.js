'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'bill_details' }, {
            bill_detail_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
            sell_price: { type: Sequelize.DECIMAL(18, 6), allowNull: false },
            discount_percentage: { type: Sequelize.SMALLINT, defaultValue: 0 },
            discount_amount: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
            total: { type: Sequelize.DECIMAL(18, 6) },
            product_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'products' }, key: 'product_id' }
            },
            bill_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'bills' }, key: 'bill_id' }
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'bill_details' });
    }
};
