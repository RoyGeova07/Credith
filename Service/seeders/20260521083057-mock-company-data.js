'use strict';

const { v4: uuidv4 } = require('uuid');

const now = new Date();
const futureDate = new Date('2027-12-31');
const pastDate = new Date('2025-01-01');

const companyIds = [uuidv4(), uuidv4()];
const storeIds = [uuidv4(), uuidv4(), uuidv4()];
const userIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
const roleIds = [uuidv4(), uuidv4(), uuidv4()];
const categoryIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
const productIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
const caiIds = [uuidv4(), uuidv4()];
const caiRangeIds = [uuidv4(), uuidv4()];
const checkoutMachineIds = [uuidv4(), uuidv4(), uuidv4()];
const clientIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Companies
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'companies' }, [
      { company_id: companyIds[0], name: 'Credith S.A. de C.V.', rtn: '08019000123456', email: 'contacto@credith.hn', address: 'Boulevard Morazán, Tegucigalpa', created_at: now, updated_at: now },
      { company_id: companyIds[1], name: 'Fintech Solutions HN', rtn: '08019000654321', email: 'info@fintechsolutions.hn', address: 'Colonia Palmira, San Pedro Sula', created_at: now, updated_at: now },
    ]);

    // Stores
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'stores' }, [
      { store_id: storeIds[0], address: 101, is_active: true, company_id: companyIds[0], created_at: now, updated_at: now },
      { store_id: storeIds[1], address: 202, is_active: true, company_id: companyIds[0], created_at: now, updated_at: now },
      { store_id: storeIds[2], address: 303, is_active: true, company_id: companyIds[1], created_at: now, updated_at: now },
    ]);

    // Roles
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'roles' }, [
      { role_id: roleIds[0], name: 'ADMIN', description: 'Administrador del sistema con acceso completo' },
      { role_id: roleIds[1], name: 'CASHIER', description: 'Cajero puede facturar y cobrar' },
      { role_id: roleIds[2], name: 'INVENTORY_MANAGER', description: 'Encargado de inventario y productos' },
    ]);

    // Users
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'users' }, [
      { user_id: userIds[0], first_name: 'Carlos', second_name: 'Eduardo', first_last_name: 'Martínez', second_last_name: 'López', email: 'carlos.martinez@credith.hn', password: '$2b$10$hashedpassword1', is_active: true, store_id: storeIds[0], created_at: now, updated_at: now },
      { user_id: userIds[1], first_name: 'María', second_name: 'Fernanda', first_last_name: 'García', second_last_name: 'Ramírez', email: 'maria.garcia@credith.hn', password: '$2b$10$hashedpassword2', is_active: true, store_id: storeIds[0], created_at: now, updated_at: now },
      { user_id: userIds[2], first_name: 'José', second_name: 'Antonio', first_last_name: 'Hernández', second_last_name: 'Cruz', email: 'jose.hernandez@credith.hn', password: '$2b$10$hashedpassword3', is_active: true, store_id: storeIds[1], created_at: now, updated_at: now },
      { user_id: userIds[3], first_name: 'Ana', second_name: 'Lucía', first_last_name: 'Pérez', second_last_name: 'Flores', email: 'ana.perez@credith.hn', password: '$2b$10$hashedpassword4', is_active: true, store_id: storeIds[2], created_at: now, updated_at: now },
      { user_id: userIds[4], first_name: 'Pedro', second_name: 'Pascal', first_last_name: 'Sánchez', second_last_name: 'Vargas', email: 'pedro.sanchez@credith.hn', password: '$2b$10$hashedpassword5', is_active: false, store_id: storeIds[1], created_at: now, updated_at: now },
    ]);

    // Users-Roles junction
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'users_roles' }, [
      { user_id: userIds[0], role_id: roleIds[0] },
      { user_id: userIds[0], role_id: roleIds[1] },
      { user_id: userIds[1], role_id: roleIds[1] },
      { user_id: userIds[2], role_id: roleIds[1] },
      { user_id: userIds[2], role_id: roleIds[2] },
      { user_id: userIds[3], role_id: roleIds[1] },
      { user_id: userIds[4], role_id: roleIds[2] },
    ]);

    // Categories
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'categories' }, [
      { category_id: categoryIds[0], name: 'Electrónicos', description: 'Dispositivos electrónicos y accesorios', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[1], name: 'Hogar', description: 'Artículos para el hogar y decoración', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[2], name: 'Ropa', description: 'Prendas de vestir y accesorios de moda', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[3], name: 'Alimentos', description: 'Productos alimenticios y bebidas', is_active: false, created_at: now, updated_at: now },
    ]);

    // Products
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'products' }, [
      { product_id: productIds[0], name: 'Smartphone X200', image_url: '/images/phones/x200.jpg', description: 'Smartphone de última generación con 256GB', buy_price: 8000.00000000, sell_price: 10999.00000000, min_gain_percentage: 25, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[1], name: 'Laptop Pro 15"', image_url: '/images/laptops/pro15.jpg', description: 'Laptop profesional con 16GB RAM y 512GB SSD', buy_price: 15000.00000000, sell_price: 19999.00000000, min_gain_percentage: 20, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[2], name: 'Auriculares Bluetooth', image_url: '/images/audio/bt-headphones.jpg', description: 'Auriculares inalámbricos con cancelación de ruido', buy_price: 800.00000000, sell_price: 1499.00000000, min_gain_percentage: 30, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[3], name: 'Lámpara LED Escritorio', image_url: '/images/hogar/lampara-led.jpg', description: 'Lámpara LED ajustable con puerto USB', buy_price: 250.00000000, sell_price: 499.00000000, min_gain_percentage: 35, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[4], name: 'Camiseta Algodón Premium', image_url: '/images/ropa/camiseta-premium.jpg', description: 'Camiseta de algodón orgánico, varios colores', buy_price: 150.00000000, sell_price: 349.00000000, min_gain_percentage: 40, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[5], name: 'Tablet Infantil', image_url: '/images/tablets/kids-tablet.jpg', description: 'Tablet educativa para niños con control parental', buy_price: 2000.00000000, sell_price: 3299.00000000, min_gain_percentage: 25, is_active: false, created_at: now, updated_at: now },
    ]);

    // Products-Categories junction
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'products_categories' }, [
      { product_id: productIds[0], category_id: categoryIds[0] },
      { product_id: productIds[1], category_id: categoryIds[0] },
      { product_id: productIds[2], category_id: categoryIds[0] },
      { product_id: productIds[3], category_id: categoryIds[1] },
      { product_id: productIds[4], category_id: categoryIds[2] },
      { product_id: productIds[5], category_id: categoryIds[0] },
    ]);

    // Stores-Inventories
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'stores_inventories' }, [
      { product_id: productIds[0], store_id: storeIds[0], in_stock: 20 },
      { product_id: productIds[0], store_id: storeIds[1], in_stock: 30 },
      { product_id: productIds[1], store_id: storeIds[0], in_stock: 10 },
      { product_id: productIds[1], store_id: storeIds[2], in_stock: 10 },
      { product_id: productIds[2], store_id: storeIds[0], in_stock: 40 },
      { product_id: productIds[2], store_id: storeIds[1], in_stock: 35 },
      { product_id: productIds[2], store_id: storeIds[2], in_stock: 25 },
      { product_id: productIds[3], store_id: storeIds[1], in_stock: 50 },
      { product_id: productIds[3], store_id: storeIds[2], in_stock: 30 },
      { product_id: productIds[4], store_id: storeIds[0], in_stock: 100 },
      { product_id: productIds[4], store_id: storeIds[1], in_stock: 60 },
      { product_id: productIds[4], store_id: storeIds[2], in_stock: 40 },
    ]);

    // CAIs
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'cais' }, [
      { cai_id: caiIds[0], government_id: 'CAI-0001-2025-ABCDEF', expiration_date: futureDate, is_active: true, created_at: now, updated_at: now },
      { cai_id: caiIds[1], government_id: 'CAI-0002-2025-GHIJKL', expiration_date: pastDate, is_active: false, created_at: now, updated_at: now },
    ]);

    // CAI Ranges
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'cai_ranges' }, [
      { cai_range_id: caiRangeIds[0], min_range: 1, max_range: 5000, expiration_date: futureDate, is_active: true, cai_id: caiIds[0], created_at: now, updated_at: now },
      { cai_range_id: caiRangeIds[1], min_range: 5001, max_range: 10000, expiration_date: pastDate, is_active: false, cai_id: caiIds[1], created_at: now, updated_at: now },
    ]);

    // Checkout Machines
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'checkout_machines' }, [
      { checkout_machine_id: checkoutMachineIds[0], machine_number: 1, name: 'Caja Principal', is_active: true, user_id: userIds[0], created_at: now, updated_at: now },
      { checkout_machine_id: checkoutMachineIds[1], machine_number: 2, name: 'Caja Secundaria', is_active: true, user_id: userIds[1], created_at: now, updated_at: now },
      { checkout_machine_id: checkoutMachineIds[2], machine_number: 3, name: 'Caja Móvil', is_active: false, user_id: null, created_at: now, updated_at: now },
    ]);

    // Clients
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'clients' }, [
      { client_id: clientIds[0], name: 'Juan Pérez Rodríguez', dni: '0801199901234', phone: '9999-0001', address: 'Residencial El Hatillo, Tegucigalpa', is_active: true },
      { client_id: clientIds[1], name: 'Laura Méndez Castillo', dni: '0501199805678', phone: '9999-0002', address: 'Barrio El Centro, Comayagua', is_active: true },
      { client_id: clientIds[2], name: 'Roberto Alvarado Cruz', dni: '0801199709012', phone: '9999-0003', address: 'Colonia Kennedy, San Pedro Sula', is_active: true },
      { client_id: clientIds[3], name: 'Sofía Gutiérrez Vega', dni: '0801199612345', phone: '9999-0004', address: 'Colonia Lomas del Guijarro, Tegucigalpa', is_active: false },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'clients',
      'checkout_machines',
      'cai_ranges',
      'cais',
      'stores_inventories',
      'products_categories',
      'products',
      'categories',
      'users_roles',
      'users',
      'roles',
      'stores',
      'companies',
    ];

    for (const table of tables) {
      await queryInterface.bulkDelete({ schema: 'cd', tableName: table }, null, {});
    }
  }
};
