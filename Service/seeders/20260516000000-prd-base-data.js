'use strict';

const companyId = '11111111-0000-4000-a000-000000000001';
const storeId = '22222222-0000-4000-a000-000000000001';
const roleIds = {
  employee:     '33333333-0000-4000-a000-000000000001',
  storeAdmin:   '33333333-0000-4000-a000-000000000002',
  companyAdmin: '33333333-0000-4000-a000-000000000003',
};

const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'roles' },
      [
        { role_id: roleIds.employee,     name: 'EMPLOYEE',      description: 'Store employee with basic access' },
        { role_id: roleIds.storeAdmin,   name: 'STORE_ADMIN',   description: 'Store administrator' },
        { role_id: roleIds.companyAdmin, name: 'COMPANY_ADMIN', description: 'Company-level administrator' },
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
          address: 1,
          is_active: true,
          company_id: companyId,
          created_at: now,
          updated_at: now,
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'stores' }, { store_id: storeId });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'companies' }, { company_id: companyId });
    await queryInterface.bulkDelete({ schema: 'cd', tableName: 'roles' }, {
      role_id: [roleIds.employee, roleIds.storeAdmin, roleIds.companyAdmin],
    });
  },

  companyId,
  storeId,
  roleIds,
};
