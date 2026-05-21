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
const { Users } = require('./entities/user')
const { Roles } = require('./entities/role')
const { UsersRoles } = require('./entities/userRole')
const { BillDetails } = require('./entities/billDetail')
const { ClientsPaymentPlans } = require('./entities/clientPaymentPlan')
const { Clients } = require('./entities/clients')
const { CaiRanges } = require('./entities/caiRange')
const { StoresInventories } = require('./entities/storeInventory')

function createFKs() {
    Stores.hasMany(Users, {
        foreignKey: 'storeId',
        as: 'employees'
    });

    Users.belongsTo(Stores, {
        foreignKey: 'storeId',
        as: 'store'
    })

    Users.belongsToMany(Roles, {
        through: UsersRoles,
        as: 'roles'
    })

    Roles.belongsToMany(Users, {
        through: UsersRoles,
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

    Products.belongsToMany(Stores, {
        through: StoresInventories,
        foreignKey: 'productId',
        otherKey: 'storeId',
        as: 'stores',
    })

    Stores.belongsToMany(Products, {
        through: StoresInventories,
        foreignKey: 'storeId',
        otherKey: 'productId',
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

    CaiRanges.hasMany(Bills, {
        foreignKey: 'caiRangeId',
        as: 'bills'
    })

    Stores.hasMany(Bills, {
        foreignKey: 'storeId',
        as: 'bills'
    })

    Users.hasMany(Bills, {
        foreignKey: 'userId',
        as: 'bills'
    })

    BillsPaymentPlans.belongsToMany(Clients, {
        through: ClientsPaymentPlans,
        foreignKey: 'billPaymentPlanId',
        otherKey: 'clientId',
        as: 'client'
    })

    Clients.belongsToMany(BillsPaymentPlans, {
        through: ClientsPaymentPlans,
        foreignKey: 'clientId',
        otherKey: 'billPaymentPlanId',
        as: 'paymentPlans'
    })

    Bills.belongsTo(CaiRanges, {
        foreignKey: 'caiRangeId',
        as: 'caiRange'
    })

    Bills.belongsTo(Stores, {
        foreignKey: 'storeId',
        as: 'stores'
    })

    Bills.belongsTo(Users, {
        foreignKey: 'userId',
        as: 'users'
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

    Users.hasOne(CheckoutMachines, {
        foreignKey: 'userId',
        as: 'checkoutMachine'
    })

    CheckoutMachines.belongsTo(Users, {
        foreignKey: 'userId',
        as: 'users'
    })

    Cais.hasMany(CaiRanges, {
        foreignKey: 'caiId',
        as: 'caiRanges'
    })

    CaiRanges.belongsTo(Cais, {
        foreignKey: 'caiId',
        as: 'Cai'
    })
}

module.exports = {
    createFKs
}
