'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'categories' }, {
            category_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });


        await queryInterface.createTable({ schema: 'cd', tableName: 'products_categories' }, {
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'products' }, key: 'product_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'categories' }, key: 'category_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });

        await queryInterface.createTable({ schema: 'cd', tableName: 'stores_inventories' }, {
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'products' }, key: 'product_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            store_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'stores' }, key: 'store_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            in_stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'categories' },
            ['name'],
            { name: 'idx_category_name_unique' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'stores_inventories' });
        await queryInterface.dropTable({ schema: 'cd', tableName: 'products_categories' });
        await queryInterface.dropTable({ schema: 'cd', tableName: 'categories' });
    }
};
