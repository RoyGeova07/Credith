const request = require('supertest');
const app = require('../app');
const db = require('../models');

const SEED_USER_ID = 'f6a7b8c9-d0e1-4c0d-ef01-234567891234';
const SEED_STORE_ID = 'c3d4e5f6-a7b8-490a-bcde-f01234567891';
const SEED_COMPANY_ID = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';
const SEED_CAI_RANGE_ID = 'b6c7d8e9-f0a1-4e21-2345-678912345694';
const SEED_PRODUCT_ID = 'f8a9b0c1-d2e3-4c11-2345-678912345686';
const SEED_CLIENT_ID = 'a1b2c3d4-e5f6-4d31-2345-678912345699';
const SEED_CLIENT_DNI = '0801199901234';
const SEED_OTHER_CLIENT_DNI = '0501199805678';

const testBillIds = [];
const testPlanIds = [];

async function cleanTestData() {
    try {
        const billIds = testBillIds.filter(Boolean);
        if (billIds.length > 0) {
            const bids = billIds.map(id => `'${id}'`).join(',');
            const [plans] = await db.sequelize.query(
                `SELECT bill_payment_plan_id FROM cd.bill_payment_plans WHERE bill_id IN (${bids})`
            );
            const allPlanIds = [...new Set([
                ...testPlanIds.filter(Boolean),
                ...plans.map(r => r.bill_payment_plan_id)
            ])];
            if (allPlanIds.length > 0) {
                const pids = allPlanIds.map(id => `'${id}'`).join(',');
                await db.sequelize.query(`DELETE FROM cd.monthly_payments WHERE bill_payment_plan_id IN (${pids})`);
                await db.sequelize.query(`DELETE FROM cd.clients_payment_plans WHERE bill_payment_plan_id IN (${pids})`);
                await db.sequelize.query(`DELETE FROM cd.bill_payment_plans WHERE bill_payment_plan_id IN (${pids})`);
            }
            await db.sequelize.query(`DELETE FROM cd.bill_details WHERE bill_id IN (${bids})`);
            await db.sequelize.query(`DELETE FROM cd.bills WHERE bill_id IN (${bids})`);
            await db.sequelize.query(
                `UPDATE cd.stores_inventories SET in_stock = in_stock + 1
                 WHERE product_id = '${SEED_PRODUCT_ID}' AND store_id = '${SEED_STORE_ID}'`
            );
        }
    } catch (err) {
        console.error('Cleanup error:', err.message);
    }
    testBillIds.length = 0;
    testPlanIds.length = 0;
}

beforeAll(async () => {
    await db.sequelize.query(`DELETE FROM cd.monthly_payments`);
    await db.sequelize.query(`DELETE FROM cd.clients_payment_plans`);
    await db.sequelize.query(`DELETE FROM cd.bill_payment_plans`);
    await db.sequelize.query(`DELETE FROM cd.bill_details`);
    await db.sequelize.query(`DELETE FROM cd.bills`);

    const seedInv = [
        { pid: 'f8a9b0c1-d2e3-4c11-2345-678912345686', sid: 'c3d4e5f6-a7b8-490a-bcde-f01234567891', s: 20 },
        { pid: 'f8a9b0c1-d2e3-4c11-2345-678912345686', sid: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912', s: 30 },
        { pid: 'a9b0c1d2-e3f4-4d11-2345-678912345687', sid: 'c3d4e5f6-a7b8-490a-bcde-f01234567891', s: 10 },
        { pid: 'a9b0c1d2-e3f4-4d11-2345-678912345687', sid: 'e5f6a7b8-c9d0-4b0c-def0-123456789123', s: 10 },
        { pid: 'b0c1d2e3-f4a5-4e11-2345-678912345688', sid: 'c3d4e5f6-a7b8-490a-bcde-f01234567891', s: 40 },
        { pid: 'b0c1d2e3-f4a5-4e11-2345-678912345688', sid: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912', s: 35 },
        { pid: 'b0c1d2e3-f4a5-4e11-2345-678912345688', sid: 'e5f6a7b8-c9d0-4b0c-def0-123456789123', s: 25 },
        { pid: 'c1d2e3f4-a5b6-4f11-2345-678912345689', sid: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912', s: 50 },
        { pid: 'c1d2e3f4-a5b6-4f11-2345-678912345689', sid: 'e5f6a7b8-c9d0-4b0c-def0-123456789123', s: 30 },
        { pid: 'd2e3f4a5-b6c7-4a21-2345-678912345690', sid: 'c3d4e5f6-a7b8-490a-bcde-f01234567891', s: 100 },
        { pid: 'd2e3f4a5-b6c7-4a21-2345-678912345690', sid: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912', s: 60 },
        { pid: 'd2e3f4a5-b6c7-4a21-2345-678912345690', sid: 'e5f6a7b8-c9d0-4b0c-def0-123456789123', s: 40 },
    ];
    for (const i of seedInv) {
        await db.sequelize.query(
            `UPDATE cd.stores_inventories SET in_stock = ${i.s}
             WHERE product_id = '${i.pid}' AND store_id = '${i.sid}'`
        );
    }
});

afterEach(cleanTestData);

afterAll(async () => {
    await db.sequelize.close();
});

function defaultInstallmentBill() {
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
        ],
        customer: {
            clientId: SEED_CLIENT_ID,
            customerName: 'Juan Pérez Rodríguez',
            customerPhone: '9999-0001',
            customerAddress: 'Residencial El Hatillo, Tegucigalpa',
        },
        paymentData: {
            payment: 2000,
            startingDate: '2026-07-01',
            monthsToPay: 3,
            paymentDay: 15,
            interestRate: 0,
        },
    };
}

function defaultCashBill() {
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
        ],
        customer: {
            customerName: 'Test Customer',
            customerPhone: '9999-9999',
            customerAddress: 'Test Address',
        },
        paymentData: {
            payment: 10999,
        },
    };
}

async function createInstallmentBill(overrides = {}) {
    const body = { ...defaultInstallmentBill(), ...overrides };
    if (overrides.paymentData) {
        body.paymentData = { ...defaultInstallmentBill().paymentData, ...overrides.paymentData };
    }
    if (overrides.customer) {
        body.customer = { ...defaultInstallmentBill().customer, ...overrides.customer };
    }
    if (overrides.details) {
        body.details = overrides.details;
    }
    const res = await request(app).post('/api/bills').send(body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('billId');
    testBillIds.push(res.body.billId);
    return res;
}

async function createCashBill(overrides = {}) {
    const body = { ...defaultCashBill(), ...overrides };
    if (overrides.paymentData) {
        body.paymentData = { ...defaultCashBill().paymentData, ...overrides.paymentData };
    }
    const res = await request(app).post('/api/bills').send(body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('billId');
    testBillIds.push(res.body.billId);
    return res;
}

async function getPlanId(billRes) {
    const plan = await db.BillPaymentPlan.findOne({
        where: { billId: billRes.body.billId },
    });
    testPlanIds.push(plan.billPaymentPlanId);
    return plan.billPaymentPlanId;
}

describe('POST /api/payment-plan/:planId/recalculate', () => {
    describe('2xx success cases', () => {
        it('should recalculate a plan with fewer months', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/recalculate`)
                .send({ newMonths: 2 });

            expect(res.status).toBe(200);
            expect(res.body.monthsToPay).toBe(2);
            expect(res.body.monthlyPayments).toHaveLength(2);
        });
    });

    describe('4xx validation errors', () => {
        it('should return 404 for a non-existent plan', async () => {
            const res = await request(app)
                .post('/api/payment-plan/00000000-0000-0000-0000-000000000000/recalculate')
                .send({ newMonths: 2 });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when the plan is already PAYED', async () => {
            const billRes = await createCashBill();
            const planId = await getPlanId(billRes);

            const plan = await db.BillPaymentPlan.findByPk(planId);
            expect(plan.status).toBe('PAYED');

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/recalculate`)
                .send({ newMonths: 1 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when newMonths is zero or negative', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/recalculate`)
                .send({ newMonths: 0 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when newMonths exceeds original monthsToPay', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/recalculate`)
                .send({ newMonths: 4 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when there are open months with pending interest', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const mp = await db.MonthlyPayment.findOne({
                where: { billPaymentPlanId: planId, isPayed: false },
            });
            await mp.update({ interestToPay: 100 });

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/recalculate`)
                .send({ newMonths: 2 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });
    });
});

describe('POST /api/payment-plan/:planId/pay', () => {
    describe('2xx success cases', () => {
        it('should apply a partial payment to the plan from the first month', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: 3000, month: 0 });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('payedAmount');
            expect(Number(res.body.payedAmount)).toBeGreaterThan(2000);

            const plan = await db.BillPaymentPlan.findByPk(planId);
            expect(Number(plan.payedAmount)).toBeGreaterThan(2000);
        });

        it('should pay the full remaining balance and mark the plan as PAYED', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const plan = await db.BillPaymentPlan.findByPk(planId);
            const remaining = Number(plan.totalToPay) - Number(plan.payedAmount);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: remaining, month: 0 });

            expect(res.status).toBe(200);

            const updatedPlan = await db.BillPaymentPlan.findByPk(planId);
            expect(updatedPlan.status).toBe('PAYED');
        });

        it('should apply payment from a specific month onwards', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const monthlyPaymentsBefore = await db.MonthlyPayment.findAll({
                where: { billPaymentPlanId: planId },
                order: [['paymentDeadline', 'ASC']],
            });

            expect(monthlyPaymentsBefore).toHaveLength(3);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: 6000, month: 1 });

            expect(res.status).toBe(200);

            const monthlyPaymentsAfter = await db.MonthlyPayment.findAll({
                where: { billPaymentPlanId: planId },
                order: [['paymentDeadline', 'ASC']],
            });

            expect(monthlyPaymentsAfter[0].isPayed).toBe(false);
        });

        it('should accept month equal to monthsToPay (no-op pay)', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: 5000, month: 3 });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('payedAmount');
        });
    });

    describe('4xx validation errors', () => {
        it('should return 404 for a non-existent plan', async () => {
            const res = await request(app)
                .post('/api/payment-plan/00000000-0000-0000-0000-000000000000/pay')
                .send({ amount: 1000, month: 0 });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when the plan is already PAYED', async () => {
            const billRes = await createCashBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: 100, month: 0 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 when month exceeds monthsToPay', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const res = await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: 1000, month: 4 });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });
    });
});

describe('GET /api/payment-plan/:dni', () => {
    describe('2xx success cases', () => {
        it('should return a payment plan for a valid DNI with active debt', async () => {
            await createInstallmentBill();

            const res = await request(app)
                .get(`/api/payment-plan/${SEED_CLIENT_DNI}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('paymentPlan');
            expect(res.body.paymentPlan.status).toMatch(/PENDING|OVERDUE/);
        });
    });

    describe('4xx validation errors', () => {
        it('should return 400 for an empty DNI', async () => {
            const res = await request(app)
                .get('/api/payment-plan/%20');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 for a DNI with no active debt', async () => {
            const res = await request(app)
                .get(`/api/payment-plan/${SEED_OTHER_CLIENT_DNI}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 when the only plan for the DNI is PAYED', async () => {
            const billRes = await createInstallmentBill();
            const planId = await getPlanId(billRes);

            const plan = await db.BillPaymentPlan.findByPk(planId);
            const remaining = Number(plan.totalToPay) - Number(plan.payedAmount);

            await request(app)
                .post(`/api/payment-plan/${planId}/pay`)
                .send({ amount: remaining, month: 0 });

            const updatedPlan = await db.BillPaymentPlan.findByPk(planId);
            expect(updatedPlan.status).toBe('PAYED');

            const res = await request(app)
                .get(`/api/payment-plan/${SEED_CLIENT_DNI}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });
    });
});
