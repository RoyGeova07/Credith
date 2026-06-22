jest.mock('../models', () => ({
    sequelize: {
        query: jest.fn()
    },
    Sequelize: {
        QueryTypes: {
            SELECT: 'SELECT'
        }
    }
}))

const db = require('../models')
const { getPendingPayments } = require('../controllers/paymentPlan')

function mockResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
}

describe('GET /api/payment-plan/pending-payments controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers().setSystemTime(new Date('2026-05-27T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns pending payments up to 3 months ahead', async () => {
        db.sequelize.query.mockResolvedValueOnce([
            {
                monthlyPaymentId: '11111111-1111-4111-8111-111111111111',
                billPaymentPlanId: '22222222-2222-4222-8222-222222222222',
                paymentDeadline: '2026-05-15T00:00:00.000Z',
                paymentAmount: '3000.000000',
                interestToPay: '100.000000',
                payedAmount: '500.000000',
                amountToPay: '2600.000000',
                totalToPay: '3600.000000',
                planPayedAmount: '500.000000',
                planStatus: 'PENDING',
                clientId: '33333333-3333-4333-8333-333333333333',
                clientName: 'Juan Perez',
                clientDni: '0801199901234',
                clientPhone: '9999-0001'
            }
        ])

        const res = mockResponse()

        await getPendingPayments({ user: { role: 'OWNER', storeId: null } }, res)

        expect(db.sequelize.query).toHaveBeenCalledTimes(1)
        expect(db.sequelize.query.mock.calls[0][0]).toContain('mp.payment_deadline < :endDate')
        expect(db.sequelize.query.mock.calls[0][0]).toContain('bpp.status IN (:pendingStatus, :overdueStatus)')
        expect(db.sequelize.query.mock.calls[0][1]).toEqual({
            replacements: {
                endDate: '2026-09-01',
                pendingStatus: 'PENDING',
                overdueStatus: 'OVERDUE'
            },
            type: 'SELECT'
        })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            period: {
                type: 'upToMonthsAhead',
                year: 2026,
                month: 5,
                endDate: '2026-09-01',
                monthsAhead: 3
            },
            pendingPayments: [
                {
                    monthlyPaymentId: '11111111-1111-4111-8111-111111111111',
                    billPaymentPlanId: '22222222-2222-4222-8222-222222222222',
                    paymentDeadline: '2026-05-15T00:00:00.000Z',
                    paymentAmount: 3000,
                    interestToPay: 100,
                    payedAmount: 500,
                    amountToPay: 2600,
                    totalToPay: 3600,
                    planPayedAmount: 500,
                    planStatus: 'PENDING',
                    client: {
                        clientId: '33333333-3333-4333-8333-333333333333',
                        name: 'Juan Perez',
                        dni: '0801199901234',
                        phone: '9999-0001'
                    }
                }
            ]
        })
    })
})
