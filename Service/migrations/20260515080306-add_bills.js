'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'bills' }, {
            bill_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            bill_number: { type: Sequelize.INTEGER },
            created_at: { type: Sequelize.DATE },
            limit_date: { type: Sequelize.DATEONLY },
            company_name: { type: Sequelize.STRING(100) },
            company_rtn: { type: Sequelize.STRING(25) },
            company_email: { type: Sequelize.STRING(100) },
            company_address: { type: Sequelize.STRING },
            checkout_machine_number: { type: Sequelize.INTEGER },
            checkout_machine_name: { type: Sequelize.STRING(50) },
            cashier_name: { type: Sequelize.STRING(50) },
            customer_name: { type: Sequelize.STRING(100) },
            customer_phone: { type: Sequelize.STRING(25) },
            customer_address: { type: Sequelize.STRING },
            payment_type: { type: Sequelize.ENUM('CASH', 'INSTALLMENT') },
            isv15_amount: { type: Sequelize.DECIMAL(18, 6) },
            isv18_amount: { type: Sequelize.DECIMAL(18, 6) },
            discount_percentage: { type: Sequelize.SMALLINT },
            discount_amount: { type: Sequelize.DECIMAL(18, 6) },
            exonerated: { type: Sequelize.DECIMAL(18, 6) },
            exempt: { type: Sequelize.DECIMAL(18, 6) },
            subtotal: { type: Sequelize.DECIMAL(18, 6) },
            total: { type: Sequelize.DECIMAL(18, 6) },
            cai_range_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'cai_ranges' }, key: 'cai_range_id' }
            },
            store_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'stores' }, key: 'store_id' }
            },
            user_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'users' }, key: 'user_id' }
            },
            client_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: { schema: 'cd', tableName: 'clients' }, key: 'client_id' }
            },
            bill_number_final: { type: Sequelize.STRING(30) },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'bills' });
    }
};
