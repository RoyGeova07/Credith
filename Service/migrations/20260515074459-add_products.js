'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'products' }, {
            product_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: { type: Sequelize.STRING, allowNull: false },
            image_url: { type: Sequelize.STRING, allowNull: true },
            description: { type: Sequelize.STRING, allowNull: false },
            buy_price: { type: Sequelize.DECIMAL(16, 8), defaultValue: 0 },
            sell_price: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
            min_gain_percentage: { type: Sequelize.SMALLINT },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'products' },
            [ 'name' ],
            { name: 'idx_product_name_unique' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'products' });
    }
};
