'use strict';

const companyId = '11111111-0000-4000-a000-000000000001';
const storeId = '22222222-0000-4000-a000-000000000001';
const checkoutMachineId = '55555555-0000-4000-a000-000000000001';
const employeeId = '33333333-0000-4000-a000-000000000001';
const roleIds = {
  employee:     '33333333-0000-4000-a000-000000000001',
  storeAdmin:   '33333333-0000-4000-a000-000000000002',
  companyAdmin: '33333333-0000-4000-a000-000000000003',
};

const bcrypt = require("bcrypt")
const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'roles' },
      [
        { role_id: roleIds.employee,     name: 'EMPLOYEE',      description: 'Store employee with basic access' },
        { role_id: roleIds.storeAdmin,   name: 'ADMIN',   description: 'Store administrator' },
        { role_id: roleIds.companyAdmin, name: 'OWNER', description: 'Company-level administrator' },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'companies' },
      [
        {
          company_id: companyId,
          name: 'ServiCredith',
          rtn: '00000000000000',
          email: 'admin@servicredith.hn',
          address: 'ServiCredith HQ',
          created_at: now,
          updated_at: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'stores' },
      [
        {
          store_id: storeId,
          store_number: 1,
          address: 'ServiCredith HQ',
          is_active: true,
          company_id: companyId,
          created_at: now,
          updated_at: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'checkout_machines' },
      [
        {
          checkout_machine_id: checkoutMachineId,
          machine_number: 1,
          name: 'Caja Principal',
          is_active: true,
          store_id: storeId,
          created_at: now,
          updated_at: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'categories' },
      [
        { category_id: '44444444-0000-4000-a000-000000000001', name: 'electrodomesticos',  description: 'Linea blanca y pequenos aparatos',       is_active: true, created_at: now, updated_at: now },
        { category_id: '44444444-0000-4000-a000-000000000002', name: 'electronica',       description: 'Audio, video y entretenimiento',        is_active: true, created_at: now, updated_at: now },
        { category_id: '44444444-0000-4000-a000-000000000003', name: 'tecnologia',        description: 'Computacion y accesorios',              is_active: true, created_at: now, updated_at: now },
        { category_id: '44444444-0000-4000-a000-000000000004', name: 'cocina',            description: 'Preparacion y cuidado del hogar',        is_active: true, created_at: now, updated_at: now },
        { category_id: '44444444-0000-4000-a000-000000000005', name: 'muebles',           description: 'Salas, comedores y soluciones funcionales', is_active: true, created_at: now, updated_at: now },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
        { schema: 'cd', tableName: 'users' },
        [
            { 
                user_id: employeeId, 
                first_name: 'Josue', 
                second_name: 'Gabriel', 
                first_last_name: 'Delcid', 
                second_last_name: 'Reyes', 
                email: 'admin@credith.hn', 
                password: await bcrypt.hash("123456", 10), 
                is_active: true, 
                store_id: storeId,
                checkout_machine_id: checkoutMachineId,
                created_at: now,
                updated_at: now },
        ]
    );

    await queryInterface.bulkInsert(
        { schema: 'cd', tableName: 'users_roles' },
        [
            { user_id: employeeId, role_id: roleIds.companyAdmin }
        ]
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'categories' }, {
      category_id: [
        '44444444-0000-4000-a000-000000000001',
        '44444444-0000-4000-a000-000000000002',
        '44444444-0000-4000-a000-000000000003',
        '44444444-0000-4000-a000-000000000004',
        '44444444-0000-4000-a000-000000000005',
      ],
    });

    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'users_roles' }, { role_id: roleIds.companyAdmin });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'users'}, { user_id: employeeId })
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'checkout_machines' }, { checkout_machine_id: checkoutMachineId });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'stores' }, { store_id: storeId });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'companies' }, { company_id: companyId });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'roles' }, {
      role_id: [roleIds.employee, roleIds.storeAdmin, roleIds.companyAdmin],
    });
  },

  companyId,
  storeId,
  checkoutMachineId,
  roleIds,
};
