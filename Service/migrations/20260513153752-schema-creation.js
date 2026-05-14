'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('cd');

    // Companies
    await queryInterface.createTable({ schema: 'cd', tableName: 'companies' }, {
      company_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      company_name: { type: Sequelize.STRING(100) },
      rtn: { type: Sequelize.STRING(25), allowNull: false },
      email: { type: Sequelize.STRING(100) },
      address: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: {   type: Sequelize.DATE }
    });

    // Stores
    await queryInterface.createTable({ schema: 'cd', tableName: 'stores' }, {
      store_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      address: { type: Sequelize.INTEGER, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      company_id: {
        type: Sequelize.UUID,
        references: { model: { schema: 'cd', tableName: 'companies' }, key: 'company_id' }
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Users
    await queryInterface.createTable({ schema: 'cd', tableName: 'users' }, {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100) },
      password: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      store_id: {
        type: Sequelize.UUID,
        references: { model: { schema: 'cd', tableName: 'stores' }, key: 'store_id' }
      },
      deleted_at: { type: Sequelize.DATE }
    });

    // Roles
    await queryInterface.createTable({ schema: 'cd', tableName: 'roles' }, {
      role_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: { type: Sequelize.STRING(50), allowNull: false },
      deleted_at: { type: Sequelize.DATE }
    });

    // User-Role junction table
    await queryInterface.createTable({ schema: 'cd', tableName: 'user_role' }, {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: { schema: 'cd', tableName: 'users' }, key: 'user_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: { schema: 'cd', tableName: 'roles' }, key: 'role_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    // Products
    await queryInterface.createTable({ schema: 'cd', tableName: 'products' }, {
      product_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: { type: Sequelize.STRING, allowNull: false },
      buy_price: { type: Sequelize.DECIMAL(16, 8), defaultValue: 0 },
      sell_price: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      min_gain_percentage: { type: Sequelize.SMALLINT },
      in_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Categories
    await queryInterface.createTable({ schema: 'cd', tableName: 'categories' }, {
      category_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      description: { type: Sequelize.STRING(100), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Products-Categories junction table
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

    // Cais
    await queryInterface.createTable({ schema: 'cd', tableName: 'cais' }, {
      cai_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      government_id: { type: Sequelize.STRING(75), allowNull: false },
      expiration_date: { type: Sequelize.DATE, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Cai Ranges
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

    // Checkout Machines
    await queryInterface.createTable({ schema: 'cd', tableName: 'checkout_machines' }, {
      checkout_machine_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      machine_number: { type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING(50) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      user_id: {
        type: Sequelize.UUID,
        references: { model: { schema: 'cd', tableName: 'users' }, key: 'user_id' }
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Clients
    await queryInterface.createTable({ schema: 'cd', tableName: 'clients' }, {
      client_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      phone: { type: Sequelize.STRING(25) },
      address: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      deleted_at: { type: Sequelize.DATE }
    });

    // Bills
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
      isv_15_amount: { type: Sequelize.DECIMAL(18, 6) },
      isv_18_amount: { type: Sequelize.DECIMAL(18, 6) },
      discount_percentage: { type: Sequelize.SMALLINT },
      discount_amount: { type: Sequelize.DECIMAL(18, 6) },
      exonerated: { type: Sequelize.DECIMAL(18, 6) },
      exempt: { type: Sequelize.DECIMAL(18, 6) },
      subtotal: { type: Sequelize.DECIMAL(18, 6) },
      total: { type: Sequelize.DECIMAL(18, 6) },
      cai_id: {
        type: Sequelize.UUID,
        references: { model: { schema: 'cd', tableName: 'cais' }, key: 'cai_id' }
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
        references: { model: { schema: 'cd', tableName: 'clients' }, key: 'client_id' }
      },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    // Bill Details
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

    // Bill Payment Plans
    await queryInterface.createTable({ schema: 'cd', tableName: 'bill_payment_plans' }, {
      bill_payment_plan_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      initial_payment: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
      total_to_pay: { type: Sequelize.DECIMAL(18, 6), allowNull: false },
      payed_amount: { type: Sequelize.DECIMAL(18, 6), defaultValue: 0 },
      months_to_pay: { type: Sequelize.INTEGER, defaultValue: 1 },
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

    // Monthly Payments
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

    // Indexes
    await queryInterface.addIndex(
      { schema: 'cd', tableName: 'products' },
      ['name'],
      { unique: true, name: 'products_name_unique' }
    );
    await queryInterface.addIndex(
      { schema: 'cd', tableName: 'cais' },
      ['government_id'],
      { unique: true, name: 'cais_government_id_unique' }
    );
    await queryInterface.addIndex(
      { schema: 'cd', tableName: 'cai_ranges' },
      ['expiration_date'],
      { name: 'cai_ranges_expiration_date' }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ schema: 'cd', tableName: 'monthly_payments' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'bill_payment_plans' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'bill_details' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'bills' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'clients' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'checkout_machines' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'cai_ranges' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'cais' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'products_categories' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'categories' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'products' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'user_role' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'roles' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'users' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'stores' });
    await queryInterface.dropTable({ schema: 'cd', tableName: 'companies' });
    await queryInterface.dropSchema('cd')
  }
};
