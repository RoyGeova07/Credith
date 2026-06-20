jest.mock('../models/dbEnums', () => ({
    BillTypes: { CASH: 'CASH', INSTALLMENT: 'INSTALLMENT' },
    PaymentStatus: { PAYED: 'PAYED', PENDING: 'PENDING', OVERDUE: 'OVERDUE' }
}))

jest.mock('../models/entities/user')
jest.mock('../models/entities/cai')
jest.mock('../models/entities/caiRange')
jest.mock('../models/entities/company')
jest.mock('../models/entities/bill')
jest.mock('../models/entities/storeInventory')
jest.mock('../models/entities/billDetail')
jest.mock('../models/entities/billPaymentPlan')
jest.mock('../models/entities/monthlyPayment')

jest.mock('../models', () => {
    const mockTransaction = {
        LOCK: { UPDATE: 'UPDATE' }
    }
    return {
        sequelize: {
            transaction: jest.fn(cb => cb(mockTransaction))
        },
        Sequelize: {}
    }
})

const { postBill } = require('../controllers/bill')
const { Users } = require('../models/entities/user')
const { Cais } = require('../models/entities/cai')
const { CaiRanges } = require('../models/entities/caiRange')
const { Companies } = require('../models/entities/company')
const { Bills } = require('../models/entities/bill')
const { StoresInventories } = require('../models/entities/storeInventory')
const { BillDetails } = require('../models/entities/billDetail')
const { BillsPaymentPlans } = require('../models/entities/billPaymentPlan')
const { MonthlyPayments } = require('../models/entities/monthlyPayment')

function mockReq(body = {}, params = {}) {
    return { body, params }
}

function mockRes() {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

const SEED_USER_ID = 'f6a7b8c9-d0e1-4c0d-ef01-234567891234'
const SEED_STORE_ID = 'c3d4e5f6-a7b8-490a-bcde-f01234567891'
const SEED_COMPANY_ID = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789'
const SEED_PRODUCT_ID = 'f8a9b0c1-d2e3-4c11-2345-678912345686'
const SEED_CLIENT_ID = 'a1b2c3d4-e5f6-4d31-2345-678912345699'
const SEED_NO_INVENTORY_PRODUCT_ID = 'c1d2e3f4-a5b6-4f11-2345-678912345689'
const SEED_CAI_RANGE_ID = 'b2c3d4e5-f6a7-4b11-cdef-012345678910'

function validCashBill() {
    return {
        limitDate: '2026-06-23',
        paymentType: 'CASH',
        discountPercentage: 0,
        discountAmount: 0,
        exonerated: 0,
        exempt: 0,
        companyId: SEED_COMPANY_ID,
        caiRangeId: SEED_CAI_RANGE_ID,
        userId: SEED_USER_ID,
        storeId: SEED_STORE_ID,
        details: [{
            productId: SEED_PRODUCT_ID,
            productName: 'Smartphone X200',
            quantity: 1,
            sellPrice: 10999,
            discountPercentage: 0,
            discountAmount: 0,
            total: 10999,
        }],
        customer: {
            customerName: 'Test Customer',
            customerPhone: '9999-9999',
            customerAddress: 'Test Address',
        },
        paymentData: { payment: 10999 },
    }
}

function validInstallmentBill() {
    return {
        limitDate: '2026-06-23',
        paymentType: 'INSTALLMENT',
        discountPercentage: 0,
        discountAmount: 0,
        exonerated: 0,
        exempt: 0,
        companyId: SEED_COMPANY_ID,
        caiRangeId: SEED_CAI_RANGE_ID,
        userId: SEED_USER_ID,
        storeId: SEED_STORE_ID,
        details: [{
            productId: SEED_PRODUCT_ID,
            productName: 'Smartphone X200',
            quantity: 1,
            sellPrice: 10999,
            discountPercentage: 0,
            discountAmount: 0,
            total: 10999,
        }],
        customer: {
            clientId: SEED_CLIENT_ID,
            customerName: 'Test Customer',
            customerPhone: '9999-9999',
            customerAddress: 'Test Address',
        },
        paymentData: {
            payment: 2000,
            startingDate: '2026-07-01',
            monthsToPay: 3,
            paymentDay: 15,
            interestRate: 0,
        },
    }
}

const mockUser = {
    userId: SEED_USER_ID,
    first_name: 'Test',
    second_name: 'User',
    first_last_name: 'Test',
    second_last_name: 'User',
    checkoutMachine: { machineNumber: 1, name: 'Caja 1' },
    store: { storeId: SEED_STORE_ID },
}

const mockCai = {
    caiId: 'mock-cai-id',
    storeId: SEED_STORE_ID,
    isActive: true,
}

const mockCaiRange = {
    caiRangeId: SEED_CAI_RANGE_ID,
    caiId: 'mock-cai-id',
    isActive: true,
    currentNumber: 0,
    maxRange: 1000,
    update: jest.fn().mockResolvedValue(true),
}

const mockCompany = {
    companyId: SEED_COMPANY_ID,
    name: 'Test Company',
    rtn: '1234567890',
    email: 'test@test.com',
    address: 'Test Address',
}

const mockInventory = {
    inStock: 100,
    update: jest.fn().mockResolvedValue(true),
}

const mockBill = {
    billId: 'mock-bill-id',
    paymentType: 'CASH',
    total: '12648.850000',
    discountAmount: '0.000000',
    subtotal: '10999.000000',
    billNumber: 1,
}

const mockCashPlan = {
    billPaymentPlanId: 'mock-plan-id',
    status: 'PAYED',
    payedAmount: '10999.000000',
    totalToPay: '1649.850000',
    initialPayment: 10999,
    setClient: jest.fn().mockResolvedValue(true),
}

const mockInstallmentPlan = {
    billPaymentPlanId: 'mock-plan-id-2',
    status: 'PENDING',
    payedAmount: '2000.000000',
    totalToPay: '10648.850000',
    monthsToPay: 3,
    paymentDay: 15,
    startingDate: '2026-07-01',
    initialPayment: 2000,
    interestRate: 0,
    setClient: jest.fn().mockResolvedValue(true),
}

beforeEach(() => {
    jest.clearAllMocks()

    Users.findByPk.mockResolvedValue(mockUser)
    CaiRanges.findByPk.mockResolvedValue({ ...mockCaiRange, update: jest.fn().mockResolvedValue(true) })
    Cais.findByPk.mockResolvedValue(mockCai)
    Companies.findByPk.mockResolvedValue(mockCompany)
    Bills.create.mockResolvedValue(mockBill)
    StoresInventories.findOne.mockResolvedValue(mockInventory)
    BillsPaymentPlans.create.mockResolvedValue(mockCashPlan)
    MonthlyPayments.bulkCreate.mockResolvedValue([])
})

describe('POST /api/bills', () => {
    describe('2xx success cases', () => {
        it('should return 201 for a valid CASH bill', async () => {
            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    billId: expect.any(String),
                    paymentType: 'CASH',
                })
            )
            expect(BillsPaymentPlans.create).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'PAYED' }),
                expect.anything()
            )
        })

        it('should return 201 for a CASH bill with discount', async () => {
            Bills.create.mockResolvedValue({ ...mockBill, discountAmount: '500.000000' })

            const req = mockReq({ ...validCashBill(), discountAmount: 500 })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ discountAmount: '500.000000' })
            )
        })

        it('should return 201 for a CASH bill with multiple products', async () => {
            const req = mockReq({
                ...validCashBill(),
                details: [
                    {
                        productId: SEED_PRODUCT_ID,
                        productName: 'Smartphone X200',
                        quantity: 1,
                        sellPrice: 10999,
                        discountPercentage: 0,
                        discountAmount: 0,
                        total: 10999,
                    },
                    {
                        productId: 'a9b0c1d2-e3f4-4d11-2345-678912345687',
                        productName: 'Laptop Pro 15"',
                        quantity: 1,
                        sellPrice: 19999,
                        discountPercentage: 0,
                        discountAmount: 0,
                        total: 19999,
                    },
                ],
                paymentData: { payment: 30998 },
            })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(BillDetails.create).toHaveBeenCalledTimes(2)
        })

        it('should return 201 for a valid INSTALLMENT bill', async () => {
            Bills.create.mockResolvedValue({ ...mockBill, paymentType: 'INSTALLMENT' })
            BillsPaymentPlans.create.mockResolvedValue(mockInstallmentPlan)

            const req = mockReq(validInstallmentBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ paymentType: 'INSTALLMENT' })
            )
            expect(BillsPaymentPlans.create).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'PENDING', payedAmount: 2000, monthsToPay: 3 }),
                expect.anything()
            )
            expect(MonthlyPayments.bulkCreate).toHaveBeenCalledTimes(1)
        })
    })

    describe('4xx validation errors', () => {
        it('should return 400 for an invalid payment type', async () => {
            const req = mockReq({ ...validCashBill(), paymentType: 'INVALID' })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 for negative detail subtotal', async () => {
            const req = mockReq({
                ...validCashBill(),
                details: [{
                    productId: SEED_PRODUCT_ID,
                    productName: 'Smartphone X200',
                    quantity: 1,
                    sellPrice: -100,
                    discountPercentage: 0,
                    discountAmount: 0,
                    total: -100,
                }],
            })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 for mismatched detail total', async () => {
            const req = mockReq({
                ...validCashBill(),
                details: [{
                    productId: SEED_PRODUCT_ID,
                    productName: 'Smartphone X200',
                    quantity: 1,
                    sellPrice: 10999,
                    discountPercentage: 0,
                    discountAmount: 0,
                    total: 9999,
                }],
            })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 for a non-existent user', async () => {
            Users.findByPk.mockResolvedValue(null)

            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 for a user without checkout machine', async () => {
            Users.findByPk.mockResolvedValue({ ...mockUser, checkoutMachine: null })

            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 406 when store does not match user store', async () => {
            const WRONG_STORE_ID = 'e5f6a7b8-c9d0-4b0c-def0-123456789123'

            const req = mockReq({ ...validCashBill(), storeId: WRONG_STORE_ID })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(406)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 when cai range is not found', async () => {
            CaiRanges.findByPk.mockResolvedValue(null)

            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 406 when the CAI is inactive', async () => {
            Cais.findByPk.mockResolvedValue({ ...mockCai, isActive: false })

            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(406)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 for a non-existent company', async () => {
            Companies.findByPk.mockResolvedValue(null)

            const req = mockReq(validCashBill())
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 406 for insufficient stock', async () => {
            StoresInventories.findOne.mockResolvedValue({ ...mockInventory, inStock: 0 })

            const req = mockReq({
                ...validCashBill(),
                details: [{
                    productId: SEED_PRODUCT_ID,
                    productName: 'Smartphone X200',
                    quantity: 9999,
                    sellPrice: 10999,
                    discountPercentage: 0,
                    discountAmount: 0,
                    total: 10999 * 9999,
                }],
                paymentData: { payment: 10999 * 9999 },
            })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(406)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 500 when product has no inventory record in the store', async () => {
            StoresInventories.findOne.mockResolvedValue(null)

            const req = mockReq({
                ...validCashBill(),
                details: [{
                    productId: SEED_NO_INVENTORY_PRODUCT_ID,
                    productName: 'Lámpara LED Escritorio',
                    quantity: 1,
                    sellPrice: 499,
                    discountPercentage: 0,
                    discountAmount: 0,
                    total: 499,
                }],
                paymentData: { payment: 499 },
            })
            const res = mockRes()

            await postBill(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })
    })
})
