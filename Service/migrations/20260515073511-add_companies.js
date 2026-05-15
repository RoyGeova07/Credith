'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createSchema('cd');

        await queryInterface.createTable({ schema: 'cd', tableName: 'companies' }, {
            company_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: { type: Sequelize.STRING(100) },
            rtn: { type: Sequelize.STRING(25), allowNull: false },
            email: { type: Sequelize.STRING(100) },
            address: { type: Sequelize.STRING },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'companies' },
            [ 'name' ],
            { name: 'idx_company_name' }
        )

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'companies' },
            [ 'email' ],
            { name: 'idx_company_email' }
        )

        await queryInterface.addIndex(
            { schema: 'cd', tableName: 'companies' },
            [ 'rtn' ],
            { name: 'idx_company_rtn' }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'companies' });
        await queryInterface.dropSchema('cd')
    }
};
