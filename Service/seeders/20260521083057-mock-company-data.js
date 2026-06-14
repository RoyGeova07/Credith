'use strict';

const now = new Date();
const futureDate = new Date('2027-12-31');
const pastDate = new Date('2025-01-01');

const companyIds = [
  'a1b2c3d4-e5f6-4789-abcd-ef0123456789',
  'b2c3d4e5-f6a7-489a-bcde-f01234567890',
];
const storeIds = [
  'c3d4e5f6-a7b8-490a-bcde-f01234567891',
  'd4e5f6a7-b8c9-4a0b-cdef-012345678912',
  'e5f6a7b8-c9d0-4b0c-def0-123456789123',
];
const userIds = [
  'f6a7b8c9-d0e1-4c0d-ef01-234567891234',
  'a7b8c9d0-e1f2-4d0e-f012-345678912345',
  'b8c9d0e1-f2a3-4e0f-0123-456789123456',
  'c9d0e1f2-a3b4-4f01-1234-567891234567',
  'd0e1f2a3-b4c5-4a01-2345-678912345678',
];
const roleIds = [
  'e1f2a3b4-c5d6-4b01-2345-678912345679',
  'f2a3b4c5-d6e7-4c01-2345-678912345680',
  'a3b4c5d6-e7f8-4d01-2345-678912345681',
];
const categoryIds = [
  'b4c5d6e7-f8a9-4e01-2345-678912345682',
  'c5d6e7f8-a9b0-4f01-2345-678912345683',
  'd6e7f8a9-b0c1-4a11-2345-678912345684',
  'e7f8a9b0-c1d2-4b11-2345-678912345685',
];
const productIds = [
  'f8a9b0c1-d2e3-4c11-2345-678912345686',
  'a9b0c1d2-e3f4-4d11-2345-678912345687',
  'b0c1d2e3-f4a5-4e11-2345-678912345688',
  'c1d2e3f4-a5b6-4f11-2345-678912345689',
  'd2e3f4a5-b6c7-4a21-2345-678912345690',
  'e3f4a5b6-c7d8-4b21-2345-678912345691',
];
const caiIds = [
  'f4a5b6c7-d8e9-4c21-2345-678912345692',
  'a5b6c7d8-e9f0-4d21-2345-678912345693',
];
const caiRangeIds = [
  'b6c7d8e9-f0a1-4e21-2345-678912345694',
  'c7d8e9f0-a1b2-4f21-2345-678912345695',
];
const checkoutMachineIds = [
  'd8e9f0a1-b2c3-4a31-2345-678912345696',
  'e9f0a1b2-c3d4-4b31-2345-678912345697',
  'f0a1b2c3-d4e5-4c31-2345-678912345698',
];
const clientIds = [
  'a1b2c3d4-e5f6-4d31-2345-678912345699',
  'b2c3d4e5-f6a7-4e31-2345-678912345700',
  'c3d4e5f6-a7b8-4f31-2345-678912345701',
  'd4e5f6a7-b8c9-4a41-2345-678912345702',
];

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
      { product_id: productIds[0], name: 'Smartphone X200', image_url: 'https://picsum.photos/seed/smartphone-x200/400/400', description: 'Smartphone de última generación con 256GB', buy_price: 8000.00000000, sell_price: 10999.00000000, min_gain_percentage: 25, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[1], name: 'Laptop Pro 15"', image_url: 'https://picsum.photos/seed/laptop-pro15/400/400', description: 'Laptop profesional con 16GB RAM y 512GB SSD', buy_price: 15000.00000000, sell_price: 19999.00000000, min_gain_percentage: 20, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[2], name: 'Auriculares Bluetooth', image_url: 'https://picsum.photos/seed/bluetooth-headphones/400/400', description: 'Auriculares inalámbricos con cancelación de ruido', buy_price: 800.00000000, sell_price: 1499.00000000, min_gain_percentage: 30, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[3], name: 'Lámpara LED Escritorio', image_url: 'https://picsum.photos/seed/led-lamp/400/400', description: 'Lámpara LED ajustable con puerto USB', buy_price: 250.00000000, sell_price: 499.00000000, min_gain_percentage: 35, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[4], name: 'Camiseta Algodón Premium', image_url: 'https://picsum.photos/seed/premium-shirt/400/400', description: 'Camiseta de algodón orgánico, varios colores', buy_price: 150.00000000, sell_price: 349.00000000, min_gain_percentage: 40, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[5], name: 'Tablet Infantil', image_url: 'https://picsum.photos/seed/kids-tablet/400/400', description: 'Tablet educativa para niños con control parental', buy_price: 2000.00000000, sell_price: 3299.00000000, min_gain_percentage: 25, is_active: false, created_at: now, updated_at: now },
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
      { cai_range_id: caiRangeIds[0], min_range: 1, max_range: 5000,current_number:0,expiration_date: futureDate, is_active: true, cai_id: caiIds[0], created_at: now, updated_at: now },
      { cai_range_id: caiRangeIds[1], min_range: 5001, max_range: 10000,current_number:5000,expiration_date: pastDate, is_active: false, cai_id: caiIds[1], created_at: now, updated_at: now },
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
  },
  companyIds,
  storeIds,
  userIds,
  roleIds,
  categoryIds,
  productIds,
  caiIds,
  caiRangeIds,
  checkoutMachineIds,
  clientIds
};
