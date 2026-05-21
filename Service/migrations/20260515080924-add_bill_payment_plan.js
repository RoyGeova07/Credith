'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable({ schema: 'cd', tableName: 'bill_payment_plans' }, {
            bill_payment_plan_id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            initial_payment: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
            total_to_pay: { type: Sequelize.DECIMAL(18, 6), allowNull: false },
            payed_amount: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
            starting_date: { type: Sequelize.DATE },
            months_to_pay: { type: Sequelize.INTEGER },
            payment_day: { type: Sequelize.SMALLINT },
            interest_rate: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false },
            last_payment_time: { type: Sequelize.DATE },
            status: { type: Sequelize.ENUM('PAYED', 'PENDING', 'OVERDUE') },
            bill_id: {
                type: Sequelize.UUID,
                references: { model: { schema: 'cd', tableName: 'bills' }, key: 'bill_id' }
            },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE }
        });

        await queryInterface.createTable({ schema: 'cd', tableName: 'clients_payment_plans' }, {
            bill_payment_plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'bill_payment_plans' }, key: 'bill_payment_plan_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            client_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: { schema: 'cd', tableName: 'clients' }, key: 'client_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'cd', tableName: 'clients_payment_plans' });
        await queryInterface.dropTable({ schema: 'cd', tableName: 'bill_payment_plans' });
    }
};
