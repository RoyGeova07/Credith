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
const product = require('./entities/product')

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
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
    })

    Roles.belongsToMany(Users, {
        through: UsersRoles,
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'employee'
    })

    Products.belongsToMany(Categories,
    {
        through: ProductsCategories,
        foreignKey: 'product_id',
        otherKey: 'category_id',
        as: 'categories'
    })

    Categories.belongsToMany(Products, 
    {
        through: ProductsCategories,
        foreignKey: 'category_id',
        otherKey: 'product_id',
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
//cada registro de inventario pertenece a un unico producto
    StoresInventories.belongsTo(Products,{

        foreignKey:"productId",
        as:"product"

    })
//========================esto nuevo me servira para ==============================
//¿Cuanto stock tiene este producto? ¿Cual es el inventario completo? ¿Muestrame producto + tienda + stock?
//Un producto puede tener muchos registros de inventario
    Products.hasMany(StoresInventories,{

        foreignKey:"productId",
        as:"inventories"

    })
//cada registro de inventario pertenece a una unica tienda
    StoresInventories.belongsTo(Stores,{

        foreignKey:"storeId",
        as:"store"

    })
//Una tienda tiene muchos registros de inventario
    Stores.hasMany(StoresInventories,{

        foreignKey:"storeId",
        as:"inventories"

    })
//==============================================================================
    Companies.hasMany(Stores, {
        foreignKey: 'companyId',
        as: 'store'
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
