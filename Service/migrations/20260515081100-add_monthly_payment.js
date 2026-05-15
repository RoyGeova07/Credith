'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'monthly_payments' }, {
            monthly_payment_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            payment_amount: { type: Sequelize.DECIMAL(18, 6), allowNull: false },
            interest_to_pay: { type: Sequelize.DECIMAL(18, 6) },
            payment_deadline: { type: Sequelize.DATE },
            payed_amount: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
            is_payed: { type: Sequelize.BOOLEAN, defaultValue: false },
            bill_payment_plan_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'bill_payment_plans' }, key: 'bill_payment_plan_id' }
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'monthly_payments' });
    }
};
