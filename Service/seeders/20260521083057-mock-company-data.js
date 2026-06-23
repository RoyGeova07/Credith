'use strict';

const now = new Date();
const futureDate = new Date('2027-12-31');
const pastDate = new Date('2025-01-01');
const bcrypt = require("bcrypt")

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

// ── Bills (21 bills across Jan–Jun 2026, store[0]) ──────────────────────────
const billIds = [
  'aa000001-0000-4000-8000-000000000001', // Jan bill 1
  'aa000002-0000-4000-8000-000000000002', // Jan bill 2
  'aa000003-0000-4000-8000-000000000003', // Jan bill 3
  'aa000004-0000-4000-8000-000000000004', // Feb bill 1 (CASH)
  'aa000005-0000-4000-8000-000000000005', // Feb bill 2 (CASH)
  'aa000006-0000-4000-8000-000000000006', // Feb bill 3 (INSTALLMENT)
  'aa000007-0000-4000-8000-000000000007', // Mar bill 1 (CASH)
  'aa000008-0000-4000-8000-000000000008', // Mar bill 2 (CASH)
  'aa000009-0000-4000-8000-000000000009', // Mar bill 3 (INSTALLMENT)
  'aa000010-0000-4000-8000-000000000010', // Apr bill 1 (CASH)
  'aa000011-0000-4000-8000-000000000011', // Apr bill 2 (CASH)
  'aa000012-0000-4000-8000-000000000012', // Apr bill 3 (CASH)
  'aa000013-0000-4000-8000-000000000013', // Apr bill 4 (INSTALLMENT)
  'aa000014-0000-4000-8000-000000000014', // May bill 1 (CASH)
  'aa000015-0000-4000-8000-000000000015', // May bill 2 (CASH)
  'aa000016-0000-4000-8000-000000000016', // May bill 3 (CASH)
  'aa000017-0000-4000-8000-000000000017', // May bill 4 (INSTALLMENT)
  'aa000018-0000-4000-8000-000000000018', // Jun bill 1 (CASH)
  'aa000019-0000-4000-8000-000000000019', // Jun bill 2 (CASH)
  'aa000020-0000-4000-8000-000000000020', // Jun bill 3 (CASH)
  'aa000021-0000-4000-8000-000000000021', // Jun bill 4 (INSTALLMENT)
];

// ── Bill payment plan IDs (one per INSTALLMENT bill) ────────────────────────
const bppIds = [
  'bb000001-0000-4000-8000-000000000001', // Feb plan
  'bb000002-0000-4000-8000-000000000002', // Mar plan
  'bb000003-0000-4000-8000-000000000003', // Apr plan
  'bb000004-0000-4000-8000-000000000004', // May plan
  'bb000005-0000-4000-8000-000000000005', // Jun plan
];

// ── Monthly payment IDs ──────────────────────────────────────────────────────
const mpIds = [
  // Feb plan (4 months: Feb–May): Feb paid, Mar paid, Apr paid, May overdue
  'cc000001-0000-4000-8000-000000000001',
  'cc000002-0000-4000-8000-000000000002',
  'cc000003-0000-4000-8000-000000000003',
  'cc000004-0000-4000-8000-000000000004',
  // Mar plan (3 months: Mar–May): Mar paid, Apr overdue, May overdue
  'cc000005-0000-4000-8000-000000000005',
  'cc000006-0000-4000-8000-000000000006',
  'cc000007-0000-4000-8000-000000000007',
  // Apr plan (6 months: Apr–Sep): Apr paid, May–Aug pending/overdue (< Sep 1)
  'cc000008-0000-4000-8000-000000000008',
  'cc000009-0000-4000-8000-000000000009',
  'cc000010-0000-4000-8000-000000000010',
  'cc000011-0000-4000-8000-000000000011',
  'cc000012-0000-4000-8000-000000000012',
  'cc000013-0000-4000-8000-000000000013',
  // May plan (4 months: May–Aug): all overdue/pending (< Sep 1)
  'cc000014-0000-4000-8000-000000000014',
  'cc000015-0000-4000-8000-000000000015',
  'cc000016-0000-4000-8000-000000000016',
  'cc000017-0000-4000-8000-000000000017',
  // Jun plan (3 months: Jun–Aug): all pending (< Sep 1)
  'cc000018-0000-4000-8000-000000000018',
  'cc000019-0000-4000-8000-000000000019',
  'cc000020-0000-4000-8000-000000000020',
];

// ── Bill detail IDs (22 details for 21 bills; bill 13 has 2 line items) ─────
const bdIds = [
  'dd000001-0000-4000-8000-000000000001',
  'dd000002-0000-4000-8000-000000000002',
  'dd000003-0000-4000-8000-000000000003',
  'dd000004-0000-4000-8000-000000000004',
  'dd000005-0000-4000-8000-000000000005',
  'dd000006-0000-4000-8000-000000000006',
  'dd000007-0000-4000-8000-000000000007',
  'dd000008-0000-4000-8000-000000000008',
  'dd000009-0000-4000-8000-000000000009',
  'dd000010-0000-4000-8000-000000000010',
  'dd000011-0000-4000-8000-000000000011',
  'dd000012-0000-4000-8000-000000000012',
  'dd000013-0000-4000-8000-000000000013', // bill 13 detail 1 (Laptop)
  'dd000014-0000-4000-8000-000000000014', // bill 13 detail 2 (Smartphone)
  'dd000015-0000-4000-8000-000000000015',
  'dd000016-0000-4000-8000-000000000016',
  'dd000017-0000-4000-8000-000000000017',
  'dd000018-0000-4000-8000-000000000018',
  'dd000019-0000-4000-8000-000000000019',
  'dd000020-0000-4000-8000-000000000020',
  'dd000021-0000-4000-8000-000000000021',
  'dd000022-0000-4000-8000-000000000022',
];

// ── Shared bill header values ─────────────────────────────────────────────────
const COMPANY_NAME    = 'Credith S.A. de C.V.';
const COMPANY_RTN     = '08019000123456';
const COMPANY_EMAIL   = 'contacto@credith.hn';
const COMPANY_ADDRESS = 'Boulevard Morazán, Tegucigalpa';
const CASHIER         = 'María García';
const MACHINE_NUM     = 1;
const MACHINE_NAME    = 'Caja Principal';

function d(dateStr) { return new Date(dateStr); }
function limitDate(dateStr) {
  const dt = new Date(dateStr);
  dt.setDate(dt.getDate() + 30);
  return dt.toISOString().slice(0, 10);
}
function billNum(n) { return `001-001-01-${String(n).padStart(8, '0')}`; }

// ── Product prices (for quick reference) ─────────────────────────────────────
// [0] Smartphone: buy=8000,  sell=10999
// [1] Laptop:     buy=15000, sell=19999
// [2] Auriculares:buy=800,   sell=1499
// [3] Lámpara:    buy=250,   sell=499
// [4] Camiseta:   buy=150,   sell=349
// [5] Tablet:     buy=2000,  sell=3299

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── Companies ────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'companies' }, [
      { company_id: companyIds[0], name: 'Credith S.A. de C.V.', rtn: '08019000123456', email: 'contacto@credith.hn', address: 'Boulevard Morazán, Tegucigalpa', created_at: now, updated_at: now },
      { company_id: companyIds[1], name: 'Fintech Solutions HN', rtn: '08019000654321', email: 'info@fintechsolutions.hn', address: 'Colonia Palmira, San Pedro Sula', created_at: now, updated_at: now },
    ]);

    // ── Stores ───────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'stores' }, [
      { store_id: storeIds[0], store_number: 1, address: 'Boulevard Morazán, Tegucigalpa', is_active: true, company_id: companyIds[0], created_at: now, updated_at: now },
      { store_id: storeIds[1], store_number: 2, address: 'Colonia Palmira, Tegucigalpa', is_active: true, company_id: companyIds[0], created_at: now, updated_at: now },
      { store_id: storeIds[2], store_number: 1, address: 'Centro Comercial Mega Plaza, San Pedro Sula', is_active: true, company_id: companyIds[1], created_at: now, updated_at: now },
    ]);

    // ── Roles ────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'roles' }, [
      { role_id: roleIds[0], name: 'ADMIN', description: 'Administrador del sistema con acceso completo' },
      { role_id: roleIds[1], name: 'OWNER', description: 'Dueño de todo puede hacer lo que sea' },
      { role_id: roleIds[2], name: 'EMPLOYEE', description: 'Encargado de inventario y productos' },
    ]);

    // ── Checkout Machines ────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'checkout_machines' }, [
      { checkout_machine_id: checkoutMachineIds[0], machine_number: 1, name: 'Caja Principal', is_active: true, store_id: storeIds[0], created_at: now, updated_at: now },
      { checkout_machine_id: checkoutMachineIds[1], machine_number: 2, name: 'Caja Secundaria', is_active: true, store_id: storeIds[1], created_at: now, updated_at: now },
      { checkout_machine_id: checkoutMachineIds[2], machine_number: 3, name: 'Caja Móvil', is_active: true, store_id: storeIds[2], created_at: now, updated_at: now },
    ]);

    // ── Users ────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'users' }, [
      { user_id: userIds[0], first_name: 'Carlos', second_name: 'Eduardo', first_last_name: 'Martínez', second_last_name: 'López', email: 'carlos.martinez@credith.hn', password: await bcrypt.hash("123456", 10), is_active: true, store_id: storeIds[0], created_at: now, updated_at: now },
      { user_id: userIds[1], first_name: 'María', second_name: 'Fernanda', first_last_name: 'García', second_last_name: 'Ramírez', email: 'maria.garcia@credith.hn', password: await bcrypt.hash("123456", 10), is_active: true, store_id: storeIds[0], checkout_machine_id: checkoutMachineIds[0], created_at: now, updated_at: now },
      { user_id: userIds[2], first_name: 'José', second_name: 'Antonio', first_last_name: 'Hernández', second_last_name: 'Cruz', email: 'jose.hernandez@credith.hn', password: await bcrypt.hash("123456", 10), is_active: true, store_id: storeIds[1], checkout_machine_id: checkoutMachineIds[1], created_at: now, updated_at: now },
      { user_id: userIds[3], first_name: 'Ana', second_name: 'Lucía', first_last_name: 'Pérez', second_last_name: 'Flores', email: 'ana.perez@credith.hn', password: await bcrypt.hash("123456", 10), is_active: true, store_id: storeIds[2], checkout_machine_id: checkoutMachineIds[2], created_at: now, updated_at: now },
      { user_id: userIds[4], first_name: 'Pedro', second_name: 'Pascal', first_last_name: 'Sánchez', second_last_name: 'Vargas', email: 'pedro.sanchez@credith.hn', password: await bcrypt.hash("123456", 10), is_active: false, store_id: storeIds[1], created_at: now, updated_at: now },
    ]);

    // ── Users-Roles ──────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'users_roles' }, [
      { user_id: userIds[0], role_id: roleIds[1] }, // Carlos -> OWNER
      { user_id: userIds[1], role_id: roleIds[0] }, // María  -> ADMIN
      { user_id: userIds[2], role_id: roleIds[2] }, // José   -> EMPLOYEE
      { user_id: userIds[3], role_id: roleIds[2] }, // Ana    -> EMPLOYEE
      { user_id: userIds[4], role_id: roleIds[0] }, // Pedro  -> ADMIN
    ]);

    // ── Categories ───────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'categories' }, [
      { category_id: categoryIds[0], name: 'Electrónicos', description: 'Dispositivos electrónicos y accesorios', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[1], name: 'Hogar', description: 'Artículos para el hogar y decoración', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[2], name: 'Ropa', description: 'Prendas de vestir y accesorios de moda', is_active: true, created_at: now, updated_at: now },
      { category_id: categoryIds[3], name: 'Alimentos', description: 'Productos alimenticios y bebidas', is_active: false, created_at: now, updated_at: now },
    ]);

    // ── Products ─────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'products' }, [
      { product_id: productIds[0], name: 'Smartphone X200', image_url: 'https://picsum.photos/seed/smartphone-x200/400/400', description: 'Smartphone de última generación con 256GB', buy_price: 8000, sell_price: 10999, min_gain_percentage: 25, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[1], name: 'Laptop Pro 15"', image_url: 'https://picsum.photos/seed/laptop-pro15/400/400', description: 'Laptop profesional con 16GB RAM y 512GB SSD', buy_price: 15000, sell_price: 19999, min_gain_percentage: 20, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[2], name: 'Auriculares Bluetooth', image_url: 'https://picsum.photos/seed/bluetooth-headphones/400/400', description: 'Auriculares inalámbricos con cancelación de ruido', buy_price: 800, sell_price: 1499, min_gain_percentage: 30, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[3], name: 'Lámpara LED Escritorio', image_url: 'https://picsum.photos/seed/led-lamp/400/400', description: 'Lámpara LED ajustable con puerto USB', buy_price: 250, sell_price: 499, min_gain_percentage: 35, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[4], name: 'Camiseta Algodón Premium', image_url: 'https://picsum.photos/seed/premium-shirt/400/400', description: 'Camiseta de algodón orgánico, varios colores', buy_price: 150, sell_price: 349, min_gain_percentage: 40, is_active: true, created_at: now, updated_at: now },
      { product_id: productIds[5], name: 'Tablet Infantil', image_url: 'https://picsum.photos/seed/kids-tablet/400/400', description: 'Tablet educativa para niños con control parental', buy_price: 2000, sell_price: 3299, min_gain_percentage: 25, is_active: false, created_at: now, updated_at: now },
    ]);

    // ── Products-Categories ──────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'products_categories' }, [
      { product_id: productIds[0], category_id: categoryIds[0] },
      { product_id: productIds[1], category_id: categoryIds[0] },
      { product_id: productIds[2], category_id: categoryIds[0] },
      { product_id: productIds[3], category_id: categoryIds[1] },
      { product_id: productIds[4], category_id: categoryIds[2] },
      { product_id: productIds[5], category_id: categoryIds[0] },
    ]);

    // ── Stores-Inventories (some items intentionally low for the dashboard) ──
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'stores_inventories' }, [
      { product_id: productIds[0], store_id: storeIds[0], in_stock: 20  },
      { product_id: productIds[0], store_id: storeIds[1], in_stock: 30  },
      { product_id: productIds[1], store_id: storeIds[0], in_stock: 3   }, // LOW
      { product_id: productIds[1], store_id: storeIds[2], in_stock: 10  },
      { product_id: productIds[2], store_id: storeIds[0], in_stock: 40  },
      { product_id: productIds[2], store_id: storeIds[1], in_stock: 35  },
      { product_id: productIds[2], store_id: storeIds[2], in_stock: 25  },
      { product_id: productIds[3], store_id: storeIds[1], in_stock: 50  },
      { product_id: productIds[3], store_id: storeIds[2], in_stock: 30  },
      { product_id: productIds[4], store_id: storeIds[0], in_stock: 2   }, // LOW
      { product_id: productIds[4], store_id: storeIds[1], in_stock: 60  },
      { product_id: productIds[4], store_id: storeIds[2], in_stock: 40  },
      { product_id: productIds[5], store_id: storeIds[0], in_stock: 4   }, // LOW
      { product_id: productIds[5], store_id: storeIds[1], in_stock: 10  },
    ]);

    // ── CAIs ─────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'cais' }, [
      { cai_id: caiIds[0], government_id: 'A1B2C3-D4E5F6-G7H8I9-J0K1L2-M3N4O5-01', expiration_date: futureDate, is_active: true, store_id: storeIds[0], created_at: now, updated_at: now },
      { cai_id: caiIds[1], government_id: 'A1B2C3-D4E5F6-G7H8I9-J0K1L2-M3N4O5-02', expiration_date: pastDate, is_active: false, store_id: storeIds[1], created_at: now, updated_at: now },
    ]);

    // ── CAI Ranges (current_number = 21 to match bills seeded below) ─────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'cai_ranges' }, [
      { cai_range_id: caiRangeIds[0], min_range: 1, max_range: 50000, current_number: 21, is_active: true,  cai_id: caiIds[0], created_at: now, updated_at: now },
      { cai_range_id: caiRangeIds[1], min_range: 1, max_range: 10000, current_number: 5000, is_active: false, cai_id: caiIds[1], created_at: now, updated_at: now },
    ]);

    // ── Clients ──────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'clients' }, [
      { client_id: clientIds[0], name: 'Juan Pérez Rodríguez',    dni: '0801199901234', phone: '9999-0001', address: 'Residencial El Hatillo, Tegucigalpa', is_active: true },
      { client_id: clientIds[1], name: 'Laura Méndez Castillo',   dni: '0501199805678', phone: '9999-0002', address: 'Barrio El Centro, Comayagua',          is_active: true },
      { client_id: clientIds[2], name: 'Roberto Alvarado Cruz',   dni: '0801199709012', phone: '9999-0003', address: 'Colonia Kennedy, San Pedro Sula',       is_active: true },
      { client_id: clientIds[3], name: 'Sofía Gutiérrez Vega',    dni: '0801199612345', phone: '9999-0004', address: 'Colonia Lomas del Guijarro, Tegucigalpa', is_active: false },
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // ── Bills  (store[0], caiRange[0], cashier = María / userIds[1])  ────────
    // ─────────────────────────────────────────────────────────────────────────
    // sell prices: Smartphone=10999 Laptop=19999 Auriculares=1499 Lámpara=499
    //              Camiseta=349     Tablet=3299
    // INSTALLMENT bills carry a 10% discount so gross > net in the chart.
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'bills' }, [
      // ── January 2026 ──────────────────────────────────────────────────────
      { bill_id: billIds[0],  bill_number: 1,  created_at: d('2026-01-05'), limit_date: limitDate('2026-01-05'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 10999, total: 10999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(1),  updated_at: now },
      { bill_id: billIds[1],  bill_number: 2,  created_at: d('2026-01-12'), limit_date: limitDate('2026-01-12'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 2998,  total: 2998,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(2),  updated_at: now },
      { bill_id: billIds[2],  bill_number: 3,  created_at: d('2026-01-20'), limit_date: limitDate('2026-01-20'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Juan Pérez Rodríguez', customer_phone: '9999-0001', customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 19999, total: 19999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[0], bill_number_final: billNum(3),  updated_at: now },
      // ── February 2026 ─────────────────────────────────────────────────────
      { bill_id: billIds[3],  bill_number: 4,  created_at: d('2026-02-03'), limit_date: limitDate('2026-02-03'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 10999, total: 10999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(4),  updated_at: now },
      { bill_id: billIds[4],  bill_number: 5,  created_at: d('2026-02-15'), limit_date: limitDate('2026-02-15'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 1497,  total: 1497,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(5),  updated_at: now },
      { bill_id: billIds[5],  bill_number: 6,  created_at: d('2026-02-22'), limit_date: limitDate('2026-02-22'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Laura Méndez Castillo', customer_phone: '9999-0002', customer_address: null, payment_type: 'INSTALLMENT', isv15_amount: 0, isv18_amount: 0, discount_percentage: 10, discount_amount: 2000, exonerated: 0, exempt: 0, subtotal: 17999, total: 17999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[1], bill_number_final: billNum(6),  updated_at: now },
      // ── March 2026 ────────────────────────────────────────────────────────
      { bill_id: billIds[6],  bill_number: 7,  created_at: d('2026-03-08'), limit_date: limitDate('2026-03-08'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 1047,  total: 1047,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(7),  updated_at: now },
      { bill_id: billIds[7],  bill_number: 8,  created_at: d('2026-03-17'), limit_date: limitDate('2026-03-17'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 1499,  total: 1499,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(8),  updated_at: now },
      { bill_id: billIds[8],  bill_number: 9,  created_at: d('2026-03-25'), limit_date: limitDate('2026-03-25'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Roberto Alvarado Cruz', customer_phone: '9999-0003', customer_address: null, payment_type: 'INSTALLMENT', isv15_amount: 0, isv18_amount: 0, discount_percentage: 10, discount_amount: 2200, exonerated: 0, exempt: 0, subtotal: 19798, total: 19798, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[2], bill_number_final: billNum(9),  updated_at: now },
      // ── April 2026 ────────────────────────────────────────────────────────
      { bill_id: billIds[9],  bill_number: 10, created_at: d('2026-04-05'), limit_date: limitDate('2026-04-05'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 2495,  total: 2495,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(10), updated_at: now },
      { bill_id: billIds[10], bill_number: 11, created_at: d('2026-04-10'), limit_date: limitDate('2026-04-10'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Juan Pérez Rodríguez', customer_phone: '9999-0001', customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 19999, total: 19999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[0], bill_number_final: billNum(11), updated_at: now },
      { bill_id: billIds[11], bill_number: 12, created_at: d('2026-04-18'), limit_date: limitDate('2026-04-18'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 10999, total: 10999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(12), updated_at: now },
      { bill_id: billIds[12], bill_number: 13, created_at: d('2026-04-28'), limit_date: limitDate('2026-04-28'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Juan Pérez Rodríguez', customer_phone: '9999-0001', customer_address: null, payment_type: 'INSTALLMENT', isv15_amount: 0, isv18_amount: 0, discount_percentage: 10, discount_amount: 3100, exonerated: 0, exempt: 0, subtotal: 27898, total: 27898, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[0], bill_number_final: billNum(13), updated_at: now },
      // ── May 2026 ──────────────────────────────────────────────────────────
      { bill_id: billIds[13], bill_number: 14, created_at: d('2026-05-05'), limit_date: limitDate('2026-05-05'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 5996,  total: 5996,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(14), updated_at: now },
      { bill_id: billIds[14], bill_number: 15, created_at: d('2026-05-12'), limit_date: limitDate('2026-05-12'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 1745,  total: 1745,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(15), updated_at: now },
      { bill_id: billIds[15], bill_number: 16, created_at: d('2026-05-20'), limit_date: limitDate('2026-05-20'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 10999, total: 10999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(16), updated_at: now },
      { bill_id: billIds[16], bill_number: 17, created_at: d('2026-05-28'), limit_date: limitDate('2026-05-28'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Laura Méndez Castillo', customer_phone: '9999-0002', customer_address: null, payment_type: 'INSTALLMENT', isv15_amount: 0, isv18_amount: 0, discount_percentage: 10, discount_amount: 750,  exonerated: 0, exempt: 0, subtotal: 6746,  total: 6746,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[1], bill_number_final: billNum(17), updated_at: now },
      // ── June 2026 ─────────────────────────────────────────────────────────
      { bill_id: billIds[17], bill_number: 18, created_at: d('2026-06-03'), limit_date: limitDate('2026-06-03'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 998,   total: 998,   cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(18), updated_at: now },
      { bill_id: billIds[18], bill_number: 19, created_at: d('2026-06-10'), limit_date: limitDate('2026-06-10'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Juan Pérez Rodríguez', customer_phone: '9999-0001', customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 10999, total: 10999, cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[0], bill_number_final: billNum(19), updated_at: now },
      { bill_id: billIds[19], bill_number: 20, created_at: d('2026-06-15'), limit_date: limitDate('2026-06-15'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: null, customer_phone: null, customer_address: null, payment_type: 'CASH',        isv15_amount: 0, isv18_amount: 0, discount_percentage: 0, discount_amount: 0, exonerated: 0, exempt: 0, subtotal: 3490,  total: 3490,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: null,          bill_number_final: billNum(20), updated_at: now },
      { bill_id: billIds[20], bill_number: 21, created_at: d('2026-06-20'), limit_date: limitDate('2026-06-20'), company_name: COMPANY_NAME, company_rtn: COMPANY_RTN, company_email: COMPANY_EMAIL, company_address: COMPANY_ADDRESS, checkout_machine_number: MACHINE_NUM, checkout_machine_name: MACHINE_NAME, cashier_name: CASHIER, customer_name: 'Roberto Alvarado Cruz', customer_phone: '9999-0003', customer_address: null, payment_type: 'INSTALLMENT', isv15_amount: 0, isv18_amount: 0, discount_percentage: 10, discount_amount: 330,  exonerated: 0, exempt: 0, subtotal: 2969,  total: 2969,  cai_range_id: caiRangeIds[0], store_id: storeIds[0], user_id: userIds[1], client_id: clientIds[2], bill_number_final: billNum(21), updated_at: now },
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // ── Bill Details ─────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'bill_details' }, [
      // Jan
      { bill_detail_id: bdIds[0],  quantity: 1, sell_price: 10999, discount_percentage: 0, discount_amount: 0, total: 10999, product_id: productIds[0], bill_id: billIds[0],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[1],  quantity: 2, sell_price: 1499,  discount_percentage: 0, discount_amount: 0, total: 2998,  product_id: productIds[2], bill_id: billIds[1],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[2],  quantity: 1, sell_price: 19999, discount_percentage: 0, discount_amount: 0, total: 19999, product_id: productIds[1], bill_id: billIds[2],  created_at: now, updated_at: now },
      // Feb
      { bill_detail_id: bdIds[3],  quantity: 1, sell_price: 10999, discount_percentage: 0, discount_amount: 0, total: 10999, product_id: productIds[0], bill_id: billIds[3],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[4],  quantity: 3, sell_price: 499,   discount_percentage: 0, discount_amount: 0, total: 1497,  product_id: productIds[3], bill_id: billIds[4],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[5],  quantity: 1, sell_price: 19999, discount_percentage: 10, discount_amount: 2000, total: 17999, product_id: productIds[1], bill_id: billIds[5], created_at: now, updated_at: now },
      // Mar
      { bill_detail_id: bdIds[6],  quantity: 3, sell_price: 349,   discount_percentage: 0, discount_amount: 0, total: 1047,  product_id: productIds[4], bill_id: billIds[6],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[7],  quantity: 1, sell_price: 1499,  discount_percentage: 0, discount_amount: 0, total: 1499,  product_id: productIds[2], bill_id: billIds[7],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[8],  quantity: 2, sell_price: 10999, discount_percentage: 10, discount_amount: 2200, total: 19798, product_id: productIds[0], bill_id: billIds[8], created_at: now, updated_at: now },
      // Apr
      { bill_detail_id: bdIds[9],  quantity: 5, sell_price: 499,   discount_percentage: 0, discount_amount: 0, total: 2495,  product_id: productIds[3], bill_id: billIds[9],  created_at: now, updated_at: now },
      { bill_detail_id: bdIds[10], quantity: 1, sell_price: 19999, discount_percentage: 0, discount_amount: 0, total: 19999, product_id: productIds[1], bill_id: billIds[10], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[11], quantity: 1, sell_price: 10999, discount_percentage: 0, discount_amount: 0, total: 10999, product_id: productIds[0], bill_id: billIds[11], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[12], quantity: 1, sell_price: 19999, discount_percentage: 10, discount_amount: 2000, total: 17999, product_id: productIds[1], bill_id: billIds[12], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[13], quantity: 1, sell_price: 10999, discount_percentage: 10, discount_amount: 1100, total: 9899,  product_id: productIds[0], bill_id: billIds[12], created_at: now, updated_at: now },
      // May
      { bill_detail_id: bdIds[14], quantity: 4, sell_price: 1499,  discount_percentage: 0, discount_amount: 0, total: 5996,  product_id: productIds[2], bill_id: billIds[13], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[15], quantity: 5, sell_price: 349,   discount_percentage: 0, discount_amount: 0, total: 1745,  product_id: productIds[4], bill_id: billIds[14], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[16], quantity: 1, sell_price: 10999, discount_percentage: 0, discount_amount: 0, total: 10999, product_id: productIds[0], bill_id: billIds[15], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[17], quantity: 5, sell_price: 1499,  discount_percentage: 10, discount_amount: 750, total: 6746,  product_id: productIds[2], bill_id: billIds[16], created_at: now, updated_at: now },
      // Jun
      { bill_detail_id: bdIds[18], quantity: 2, sell_price: 499,   discount_percentage: 0, discount_amount: 0, total: 998,   product_id: productIds[3], bill_id: billIds[17], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[19], quantity: 1, sell_price: 10999, discount_percentage: 0, discount_amount: 0, total: 10999, product_id: productIds[0], bill_id: billIds[18], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[20], quantity: 10, sell_price: 349,  discount_percentage: 0, discount_amount: 0, total: 3490,  product_id: productIds[4], bill_id: billIds[19], created_at: now, updated_at: now },
      { bill_detail_id: bdIds[21], quantity: 1, sell_price: 3299,  discount_percentage: 10, discount_amount: 330, total: 2969,  product_id: productIds[5], bill_id: billIds[20], created_at: now, updated_at: now },
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // ── Bill Payment Plans ────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'bill_payment_plans' }, [
      // Feb plan: 4 months (Feb–May), Feb/Mar/Apr paid, May OVERDUE
      { bill_payment_plan_id: bppIds[0], total_to_pay: 18000, payed_amount: 14375, initial_payment: 3500, starting_date: d('2026-02-22'), months_to_pay: 4, payment_day: 22, interest_rate: 0, created_at: now, status: 'OVERDUE', bill_id: billIds[5],  updated_at: now },
      // Mar plan: 3 months (Mar–May), Mar paid, Apr+May OVERDUE
      { bill_payment_plan_id: bppIds[1], total_to_pay: 20000, payed_amount: 8889,  initial_payment: 3333, starting_date: d('2026-03-25'), months_to_pay: 3, payment_day: 25, interest_rate: 0, created_at: now, status: 'OVERDUE', bill_id: billIds[8],  updated_at: now },
      // Apr plan: 6 months (Apr–Sep), Apr paid, May–Sep OVERDUE
      { bill_payment_plan_id: bppIds[2], total_to_pay: 30000, payed_amount: 9167,  initial_payment: 5000, starting_date: d('2026-04-28'), months_to_pay: 6, payment_day: 28, interest_rate: 0, created_at: now, status: 'OVERDUE', bill_id: billIds[12], updated_at: now },
      // May plan: 4 months (May–Aug), all OVERDUE/PENDING
      { bill_payment_plan_id: bppIds[3], total_to_pay: 7500,  payed_amount: 1500,  initial_payment: 1500, starting_date: d('2026-05-28'), months_to_pay: 4, payment_day: 28, interest_rate: 0, created_at: now, status: 'OVERDUE', bill_id: billIds[16], updated_at: now },
      // Jun plan: 3 months (Jun–Aug), all PENDING
      { bill_payment_plan_id: bppIds[4], total_to_pay: 3000,  payed_amount: 900,   initial_payment: 900,  starting_date: d('2026-06-25'), months_to_pay: 3, payment_day: 25, interest_rate: 0, created_at: now, status: 'PENDING', bill_id: billIds[20], updated_at: now },
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // ── Clients-Payment-Plans (junction) ─────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'clients_payment_plans' }, [
      { bill_payment_plan_id: bppIds[0], client_id: clientIds[1] }, // Laura  – Feb plan
      { bill_payment_plan_id: bppIds[1], client_id: clientIds[2] }, // Roberto – Mar plan
      { bill_payment_plan_id: bppIds[2], client_id: clientIds[0] }, // Juan   – Apr plan
      { bill_payment_plan_id: bppIds[3], client_id: clientIds[1] }, // Laura  – May plan
      { bill_payment_plan_id: bppIds[4], client_id: clientIds[2] }, // Roberto – Jun plan
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // ── Monthly Payments ──────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert({ schema: 'cd', tableName: 'monthly_payments' }, [
      // ── Feb plan (4 × 3625) ───────────────────────────────────────────────
      { monthly_payment_id: mpIds[0],  payment_amount: 3625, interest_to_pay: 0, payment_deadline: d('2026-02-22'), payed_amount: 3625, is_payed: true,  bill_payment_plan_id: bppIds[0], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[1],  payment_amount: 3625, interest_to_pay: 0, payment_deadline: d('2026-03-22'), payed_amount: 3625, is_payed: true,  bill_payment_plan_id: bppIds[0], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[2],  payment_amount: 3625, interest_to_pay: 0, payment_deadline: d('2026-04-22'), payed_amount: 3625, is_payed: true,  bill_payment_plan_id: bppIds[0], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[3],  payment_amount: 3625, interest_to_pay: 0, payment_deadline: d('2026-05-22'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[0], created_at: now, updated_at: now },
      // ── Mar plan (3 × 5556) ───────────────────────────────────────────────
      { monthly_payment_id: mpIds[4],  payment_amount: 5556, interest_to_pay: 0, payment_deadline: d('2026-03-25'), payed_amount: 5556, is_payed: true,  bill_payment_plan_id: bppIds[1], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[5],  payment_amount: 5556, interest_to_pay: 0, payment_deadline: d('2026-04-25'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[1], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[6],  payment_amount: 5556, interest_to_pay: 0, payment_deadline: d('2026-05-25'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[1], created_at: now, updated_at: now },
      // ── Apr plan (6 × 4167) ───────────────────────────────────────────────
      { monthly_payment_id: mpIds[7],  payment_amount: 4167, interest_to_pay: 0, payment_deadline: d('2026-04-28'), payed_amount: 4167, is_payed: true,  bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[8],  payment_amount: 4167, interest_to_pay: 0, payment_deadline: d('2026-05-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[9],  payment_amount: 4167, interest_to_pay: 0, payment_deadline: d('2026-06-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[10], payment_amount: 4167, interest_to_pay: 0, payment_deadline: d('2026-07-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[11], payment_amount: 4167, interest_to_pay: 0, payment_deadline: d('2026-08-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[12], payment_amount: 4165, interest_to_pay: 0, payment_deadline: d('2026-09-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[2], created_at: now, updated_at: now },
      // ── May plan (4 × 1500) ───────────────────────────────────────────────
      { monthly_payment_id: mpIds[13], payment_amount: 1500, interest_to_pay: 0, payment_deadline: d('2026-05-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[3], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[14], payment_amount: 1500, interest_to_pay: 0, payment_deadline: d('2026-06-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[3], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[15], payment_amount: 1500, interest_to_pay: 0, payment_deadline: d('2026-07-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[3], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[16], payment_amount: 1500, interest_to_pay: 0, payment_deadline: d('2026-08-28'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[3], created_at: now, updated_at: now },
      // ── Jun plan (3 × 700) ────────────────────────────────────────────────
      { monthly_payment_id: mpIds[17], payment_amount: 700,  interest_to_pay: 0, payment_deadline: d('2026-06-25'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[4], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[18], payment_amount: 700,  interest_to_pay: 0, payment_deadline: d('2026-07-25'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[4], created_at: now, updated_at: now },
      { monthly_payment_id: mpIds[19], payment_amount: 700,  interest_to_pay: 0, payment_deadline: d('2026-08-25'), payed_amount: 0,    is_payed: false, bill_payment_plan_id: bppIds[4], created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'monthly_payments',
      'clients_payment_plans',
      'bill_payment_plans',
      'bill_details',
      'bills',
      'clients',
      'users_roles',
      'users',
      'checkout_machines',
      'cai_ranges',
      'cais',
      'stores_inventories',
      'products_categories',
      'products',
      'categories',
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
  clientIds,
  billIds,
  bppIds,
  mpIds,
};
