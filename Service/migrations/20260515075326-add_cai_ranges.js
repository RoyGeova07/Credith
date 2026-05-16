'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'cai_ranges' }, {
            cai_range_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            min_range: { type: Sequelize.INTEGER, allowNull: false },
            max_range: { type: Sequelize.INTEGER, allowNull: false },
            expiration_date: { type: Sequelize.DATE, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            cai_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'cais' }, key: 'cai_id' }
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'cai_ranges' },
            ['expiration_date'],
            { name: 'idx_cai_ranges_expiration_date' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'cai_ranges' });
    }
};
