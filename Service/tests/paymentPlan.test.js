jest.mock('../models/dbEnums', () => ({
    PaymentStatus: { PAYED: 'PAYED', PENDING: 'PENDING', OVERDUE: 'OVERDUE' }
}))

jest.mock('../models/entities/billPaymentPlan')
jest.mock('../models/entities/monthlyPayment')
jest.mock('../models/entities/clients')

jest.mock('../models', () => ({
    sequelize: {
        transaction: jest.fn(cb => cb('mock-transaction'))
    },
    Sequelize: {}
}))

const { postRecalculatePlan, postPayPlan, getPaymentPlan } = require('../controllers/paymentPlan')
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

const SEED_CLIENT_DNI = '0801199901234'
const SEED_OTHER_CLIENT_DNI = '0501199805678'
const PLAN_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'

beforeEach(() => {
    jest.clearAllMocks()
})

function buildMockPlan(overrides = {}) {
    return {
        billPaymentPlanId: PLAN_ID,
        monthsToPay: 3,
        totalToPay: '10648.850000',
        payedAmount: '2000.000000',
        initialPayment: 2000,
        status: 'PENDING',
        paymentDay: 15,
        update: jest.fn().mockResolvedValue(true),
        ...overrides,
    }
}

function buildMockMonthlyPayments() {
    const mocks = [
        { paymentAmount: 3549.62, interestToPay: 0, payedAmount: 0, isPayed: false, update: jest.fn().mockResolvedValue(true) },
        { paymentAmount: 3549.62, interestToPay: 0, payedAmount: 0, isPayed: false, update: jest.fn().mockResolvedValue(true) },
        { paymentAmount: 3549.61, interestToPay: 0, payedAmount: 0, isPayed: false, update: jest.fn().mockResolvedValue(true) },
    ]
    mocks.forEach(mp => {
        const origUpdate = mp.update
        mp.update = jest.fn(async (data) => {
            Object.assign(mp, data)
            return origUpdate(data)
        })
    })
    return mocks
}

describe('POST /api/payment-plan/:planId/recalculate', () => {
    describe('2xx success cases', () => {
        it('should recalculate a plan with fewer months', async () => {
            const mockPlan = buildMockPlan()
            BillsPaymentPlans.findByPk
                .mockResolvedValueOnce(mockPlan)
                .mockResolvedValueOnce({ ...mockPlan, monthsToPay: 2, monthlyPayments: [{}, {}] })
            MonthlyPayments.findAll.mockResolvedValue([])
            MonthlyPayments.destroy.mockResolvedValue(3)
            MonthlyPayments.bulkCreate.mockResolvedValue([{}, {}])

            const req = mockReq({ newMonths: 2 }, { planId: PLAN_ID })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ monthsToPay: 2 })
            )
            const updatedPlan = res.json.mock.calls[0][0]
            expect(updatedPlan.monthlyPayments).toHaveLength(2)
        })
    })

    describe('4xx validation errors', () => {
        it('should return 404 for a non-existent plan', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(null)

            const req = mockReq({ newMonths: 2 }, { planId: '00000000-0000-0000-0000-000000000000' })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when the plan is already PAYED', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan({ status: 'PAYED' }))

            const req = mockReq({ newMonths: 1 }, { planId: PLAN_ID })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when newMonths is zero or negative', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())

            const req = mockReq({ newMonths: 0 }, { planId: PLAN_ID })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when newMonths exceeds original monthsToPay', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())

            const req = mockReq({ newMonths: 4 }, { planId: PLAN_ID })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when there are open months with pending interest', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())
            MonthlyPayments.findAll.mockResolvedValue([
                { monthlyPaymentId: 'some-id', interestToPay: 100 }
            ])

            const req = mockReq({ newMonths: 2 }, { planId: PLAN_ID })
            const res = mockRes()

            await postRecalculatePlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })
    })
})

describe('POST /api/payment-plan/:planId/pay', () => {
    describe('2xx success cases', () => {
        it('should apply a partial payment to the plan from the first month', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())
            const mps = buildMockMonthlyPayments()
            MonthlyPayments.findAll.mockResolvedValue(mps)
            BillsPaymentPlans.update.mockResolvedValue([1])

            const req = mockReq({ amount: 3000, month: 0 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            const payedAmount = res.json.mock.calls[0][0].payedAmount
            expect(payedAmount).toBeGreaterThan(2000)
        })

        it('should pay the full remaining balance and mark the plan as PAYED', async () => {
            const plan = buildMockPlan()
            BillsPaymentPlans.findByPk.mockResolvedValue(plan)
            const mps = buildMockMonthlyPayments()
            MonthlyPayments.findAll.mockResolvedValue(mps)
            BillsPaymentPlans.update.mockResolvedValue([1])

            const remaining = Number(plan.totalToPay) - Number(plan.payedAmount)

            const req = mockReq({ amount: remaining, month: 0 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(BillsPaymentPlans.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'PAYED' }),
                expect.anything()
            )
        })

        it('should apply payment from a specific month onwards', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())
            const mps = buildMockMonthlyPayments()
            MonthlyPayments.findAll.mockResolvedValue(mps)
            BillsPaymentPlans.update.mockResolvedValue([1])

            const req = mockReq({ amount: 6000, month: 1 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(mps[0].isPayed).toBe(false)
        })

        it('should accept month equal to monthsToPay (no-op pay)', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())
            const mps = buildMockMonthlyPayments()
            MonthlyPayments.findAll.mockResolvedValue(mps)
            BillsPaymentPlans.update.mockResolvedValue([1])

            const req = mockReq({ amount: 5000, month: 3 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ payedAmount: 2000 })
            )
        })
    })

    describe('4xx validation errors', () => {
        it('should return 404 for a non-existent plan', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(null)

            const req = mockReq({ amount: 1000, month: 0 }, { planId: '00000000-0000-0000-0000-000000000000' })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when the plan is already PAYED', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan({ status: 'PAYED' }))

            const req = mockReq({ amount: 100, month: 0 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 400 when month exceeds monthsToPay', async () => {
            BillsPaymentPlans.findByPk.mockResolvedValue(buildMockPlan())

            const req = mockReq({ amount: 1000, month: 4 }, { planId: PLAN_ID })
            const res = mockRes()

            await postPayPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })
    })
})

describe('GET /api/payment-plan/:dni', () => {
    describe('2xx success cases', () => {
        it('should return a payment plan for a valid DNI with active debt', async () => {
            BillsPaymentPlans.findOne.mockResolvedValue(
                buildMockPlan({ status: 'PENDING' })
            )

            const req = mockReq({}, { dni: SEED_CLIENT_DNI })
            const res = mockRes()

            await getPaymentPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentPlan: expect.objectContaining({ status: expect.stringMatching(/PENDING|OVERDUE/) })
                })
            )
        })
    })

    describe('4xx validation errors', () => {
        it('should return 400 for an empty DNI', async () => {
            const req = mockReq({}, { dni: ' ' })
            const res = mockRes()

            await getPaymentPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 for a DNI with no active debt', async () => {
            BillsPaymentPlans.findOne.mockResolvedValue(null)

            const req = mockReq({}, { dni: SEED_OTHER_CLIENT_DNI })
            const res = mockRes()

            await getPaymentPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })

        it('should return 404 when the only plan for the DNI is PAYED', async () => {
            BillsPaymentPlans.findOne.mockResolvedValue(null)

            const req = mockReq({}, { dni: SEED_CLIENT_DNI })
            const res = mockRes()

            await getPaymentPlan(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String) })
            )
        })
    })
})
