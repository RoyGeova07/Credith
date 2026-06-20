'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'cais' }, {
            cai_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            government_id: { type: Sequelize.STRING(75), allowNull: false },
            expiration_date: { type: Sequelize.DATE, allowNull: false },
            document_type: { type: Sequelize.STRING(10), allowNull: false, defaultValue: '01' },
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
            { schema: 'cd', tableName: 'cais' },
            ['government_id'],
            { unique: true, name: 'idx_cais_government_id_unique' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'cais' });
    }
};
