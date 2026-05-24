const request = require('supertest');
const app = require('../app');
const db = require('../models');
const { setupTestTransaction, teardownTestTransaction, getTransaction } = require('./helpers/transactionHelper');

const SEED_USER_ID = 'f6a7b8c9-d0e1-4c0d-ef01-234567891234';
const SEED_STORE_ID = 'c3d4e5f6-a7b8-490a-bcde-f01234567891';
const SEED_COMPANY_ID = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';
const SEED_CAI_RANGE_ID = 'b6c7d8e9-f0a1-4e21-2345-678912345694';
const SEED_PRODUCT_ID = 'f8a9b0c1-d2e3-4c11-2345-678912345686';
const SEED_INACTIVE_CAI_RANGE_ID = 'c7d8e9f0-a1b2-4f21-2345-678912345695';
const SEED_ALT_PRODUCT_ID = 'a9b0c1d2-e3f4-4d11-2345-678912345687';
const SEED_NO_INVENTORY_PRODUCT_ID = 'c1d2e3f4-a5b6-4f11-2345-678912345689';
const SEED_CLIENT_ID = 'a1b2c3d4-e5f6-4d31-2345-678912345699';

beforeEach(setupTestTransaction);
afterEach(teardownTestTransaction);

afterAll(async () => {
    await db.sequelize.close();
});

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

describe('POST /api/bills', () => {
    describe('2xx success cases', () => {
        it('should return 201 for a valid CASH bill', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send(validCashBill());

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('billId');
            expect(res.body).toHaveProperty('total');
            expect(res.body.paymentType).toBe('CASH');

            const plan = await db.BillPaymentPlan.findOne({
                where: { billId: res.body.billId },
                transaction: getTransaction(),
            });
            expect(plan).not.toBeNull();
            expect(plan.status).toBe('PAYED');
            expect(Number(plan.payedAmount)).toBe(10999);
            expect(Number(plan.initialPayment)).toBe(10999);
        });

        it('should return 201 for a CASH bill with discount', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({ ...validCashBill(), discountAmount: 500 });

            expect(res.status).toBe(201);
            expect(res.body.discountAmount).toBe('500.000000');
        });

        it('should return 201 for a CASH bill with multiple products', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
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
                            productId: SEED_ALT_PRODUCT_ID,
                            productName: 'Laptop Pro 15"',
                            quantity: 1,
                            sellPrice: 19999,
                            discountPercentage: 0,
                            discountAmount: 0,
                            total: 19999,
                        },
                    ],
                    paymentData: { payment: 30998 },
                });

            expect(res.status).toBe(201);
        });

        it('should return 201 for a valid INSTALLMENT bill', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    paymentType: 'INSTALLMENT',
                    paymentData: {
                        payment: 2000,
                        startingDate: '2026-07-01',
                        monthsToPay: 3,
                        paymentDay: 15,
                        interestRate: 0,
                    },
                    customer: {
                        clientId: SEED_CLIENT_ID,
                        customerName: 'Test Customer',
                        customerPhone: '9999-9999',
                        customerAddress: 'Test Address',
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body.paymentType).toBe('INSTALLMENT');

            const plan = await db.BillPaymentPlan.findOne({
                where: { billId: res.body.billId },
                transaction: getTransaction(),
            });
            expect(plan).not.toBeNull();
            expect(plan.status).toBe('PENDING');
            expect(Number(plan.initialPayment)).toBe(2000);
            expect(Number(plan.totalToPay)).toBeGreaterThan(0);
            expect(plan.monthsToPay).toBe(3);

            const monthlyPayments = await db.MonthlyPayment.findAll({
                where: { billPaymentPlanId: plan.billPaymentPlanId },
                transaction: getTransaction(),
            });
            expect(monthlyPayments).toHaveLength(3);
            for (const mp of monthlyPayments) {
                expect(Number(mp.paymentAmount)).toBeGreaterThan(0);
                expect(mp.paymentDeadline).toBeTruthy();
            }

            const clientPlan = await db.ClientPaymentPlan.findOne({
                where: {
                    billPaymentPlanId: plan.billPaymentPlanId,
                    clientId: SEED_CLIENT_ID,
                },
                transaction: getTransaction(),
            });
            expect(clientPlan).not.toBeNull();
        });

        it('should return 201 for an INSTALLMENT bill paid in full', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    paymentType: 'INSTALLMENT',
                    paymentData: {
                        payment: 12648.85,
                        startingDate: '2026-07-01',
                        monthsToPay: 1,
                        paymentDay: 15,
                        interestRate: 0,
                    },
                    customer: {
                        clientId: SEED_CLIENT_ID,
                        customerName: 'Test Customer',
                        customerPhone: '9999-9999',
                        customerAddress: 'Test Address',
                    },
                });

            expect(res.status).toBe(201);

            const plan = await db.BillPaymentPlan.findOne({
                where: { billId: res.body.billId },
                transaction: getTransaction(),
            });
            expect(plan).not.toBeNull();
            expect(plan.status).toBe('PAYED');
            expect(plan.monthsToPay).toBe(1);

            const monthlyPayments = await db.MonthlyPayment.findAll({
                where: { billPaymentPlanId: plan.billPaymentPlanId },
                transaction: getTransaction(),
            });
            expect(monthlyPayments).toHaveLength(1);
            expect(Number(monthlyPayments[0].paymentAmount)).toBe(0);
        });
    });

    describe('4xx validation errors', () => {
        it('should return 400 for an invalid payment type', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({ ...validCashBill(), paymentType: 'INVALID' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 for negative detail subtotal', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    details: [
                        {
                            productId: SEED_PRODUCT_ID,
                            productName: 'Smartphone X200',
                            quantity: 1,
                            sellPrice: -100,
                            discountPercentage: 0,
                            discountAmount: 0,
                            total: -100,
                        },
                    ],
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 for mismatched detail total', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    details: [
                        {
                            productId: SEED_PRODUCT_ID,
                            productName: 'Smartphone X200',
                            quantity: 1,
                            sellPrice: 10999,
                            discountPercentage: 0,
                            discountAmount: 0,
                            total: 9999,
                        },
                    ],
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 for a non-existent user', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    userId: '00000000-0000-0000-0000-000000000000',
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 for a user without checkout machine', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    userId: 'd0e1f2a3-b4c5-4a01-2345-678912345678',
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 406 when store does not match user store', async () => {
            const WRONG_STORE_ID = 'e5f6a7b8-c9d0-4b0c-def0-123456789123';
            const res = await request(app)
                .post('/api/bills')
                .send({ ...validCashBill(), storeId: WRONG_STORE_ID });

            expect(res.status).toBe(406);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 for a non-existent CAI range', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    caiRangeId: '00000000-0000-0000-0000-000000000000',
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 406 for an inactive CAI range', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    caiRangeId: SEED_INACTIVE_CAI_RANGE_ID,
                });

            expect(res.status).toBe(406);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 404 for a non-existent company', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    companyId: '00000000-0000-0000-0000-000000000000',
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 406 for insufficient stock', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    details: [
                        {
                            productId: SEED_PRODUCT_ID,
                            productName: 'Smartphone X200',
                            quantity: 9999,
                            sellPrice: 10999,
                            discountPercentage: 0,
                            discountAmount: 0,
                            total: 10999 * 9999,
                        },
                    ],
                    paymentData: { payment: 10999 * 9999 },
                });

            expect(res.status).toBe(406);
            expect(res.body).toHaveProperty('message');
        });

        it('should return 500 when product has no inventory record in the store', async () => {
            const res = await request(app)
                .post('/api/bills')
                .send({
                    ...validCashBill(),
                    details: [
                        {
                            productId: SEED_NO_INVENTORY_PRODUCT_ID,
                            productName: 'Lámpara LED Escritorio',
                            quantity: 1,
                            sellPrice: 499,
                            discountPercentage: 0,
                            discountAmount: 0,
                            total: 499,
                        },
                    ],
                    paymentData: { payment: 499 },
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message');
        });
    });
});
