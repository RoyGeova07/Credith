const request = require('supertest');

jest.mock('../controllers/bill', () => ({
  postBill: jest.fn((_req, res) => res.status(201).json({ billId: 1 })),
}));

jest.mock('../models', () => ({}));

const app = require('../app');

describe('POST /api/bills', () => {
  it('should return 201 from the mocked controller', async () => {
    const res = await request(app)
      .post('/api/bills')
      .send({ test: true });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ billId: 1 });
  });
});
