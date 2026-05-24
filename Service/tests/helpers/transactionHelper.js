const db = require('../../models');

let managedTransaction;

async function setupTestTransaction() {
  managedTransaction = await db.sequelize.transaction();

  const original = db.sequelize.transaction.bind(db.sequelize);
  jest.spyOn(db.sequelize, 'transaction').mockImplementation(async (options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    return original({ ...options, transaction: managedTransaction }, callback);
  });
}

async function teardownTestTransaction() {
  jest.restoreAllMocks();
  if (managedTransaction) {
    await managedTransaction.rollback();
    managedTransaction = null;
  }
}

function getTransaction() {
  return managedTransaction;
}

module.exports = { setupTestTransaction, teardownTestTransaction, getTransaction };
