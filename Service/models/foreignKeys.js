const { Stores } = require('./entities/store')
const { CheckoutMachines } = require('./entities/checkoutMachine')
const { Products } = require('./entities/product')
const { Categories } = require('./entities/category')
const { ProductsCategories } = require('./entities/productCategory')
const { Companies } = require('./entities/company')
const { Bills } = require('./entities/bill')
const { Cais } = require('./entities/cai')
const { BillsPaymentPlans } = require('./entities/billPaymentPlan')
const { MonthlyPayments } = require('./entities/monthlyPayment')
const { Employees } = require('./entities/employee')
const { Roles } = require('./entities/role')
const { EmplyeesRoles } = require('./entities/emplyeeRole')
const { BillDetails } = require('./entities/billDetail')
const { Clients } = require('./entities/clients')

function createFKs() {
    Stores.hasMany(Employees, {
        foreignKey: 'storeId',
        as: 'employees'
    });

    Employees.belongsTo(Stores, {
        foreignKey: 'storeId',
        as: 'store'
    })

    Employees.belongsToMany(Roles, {
        through: EmplyeesRoles,
        as: 'roles'
    })

    Roles.belongsToMany(Employees, {
        through: EmplyeesRoles,
        as: 'employee'
    })

    Products.belongsToMany(Categories, {
        through: ProductsCategories,
        as: 'categories',
    })

    Categories.belongsToMany(Products, {
        through: ProductsCategories,
        as: 'products'
    })

    Companies.hasMany(Stores, {
        foreignKey: 'companyId',
        as: 'stores'
    })

    Stores.belongsTo(Companies, {
        foreignKey: 'companyId',
        as: 'company'
    })

    Cais.hasMany(Bills, {
        foreignKey: 'caiId',
        as: 'bills'
    })

    Stores.hasMany(Bills, {
        foreignKey: 'storeId',
        as: 'bills'
    })

    Employees.hasMany(Bills, {
        foreignKey: 'employeeId',
        as: 'bills'
    })

    Clients.hasMany(Bills, {
        foreignKey: 'clientId',
        as: 'bills'
    })

    Bills.belongsTo(Cais, {
        foreignKey: 'caiId',
        as: 'cais'
    })

    Bills.belongsTo(Stores, {
        foreignKey: 'storeId',
        as: 'stores'
    })

    Bills.belongsTo(Employees, {
        foreignKey: 'employeeId',
        as: 'employees'
    })

    Bills.belongsTo(Clients, {
        foreignKey: 'clientId',
        as: 'client'
    })

    BillsPaymentPlans.belongsTo(Bills, {
        foreignKey: 'billId',
        as: 'bill'
    })

    Bills.hasOne(BillsPaymentPlans, {
        foreignKey: 'billId',
        as: 'billPaymentPlan'
    })

    MonthlyPayments.belongsTo(BillsPaymentPlans, {
        foreignKey: 'billPaymentPlanId',
        as: 'billPaymentPlan'
    })

    BillsPaymentPlans.hasMany(MonthlyPayments, {
        foreignKey: 'billPaymentPlanId',
        as: 'monthlyPayments'
    })

    BillDetails.belongsTo(Products, {
        foreignKey: 'productId',
        as: 'product'
    })

    Products.hasMany(BillDetails, {
        foreignKey: 'productId',
        as: 'billDetails'
    })

    BillDetails.belongsTo(Bills, {
        foreignKey: 'billId',
        as: 'bill'
    })

    Bills.hasMany(BillDetails, {
        foreignKey: 'billId',
        as: 'billDetails'
    })

    Employees.hasOne(CheckoutMachines, {
        foreignKey: 'employeeId',
        as: 'checkoutMachine'
    })

    CheckoutMachines.belongsTo(Employees, {
        foreignKey: 'employeeId',
        as: 'employee'
    })
}

module.exports = {
    createFKs
}
