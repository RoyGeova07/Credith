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
const { getProductReport } = require('../controllers/reports')

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }
}

describe('GET /api/reports/products controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a historical product report without filters', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const res = mockResponse()

    await getProductReport({ query: {} }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][1]).toEqual({
      replacements: {},
      type: 'SELECT'
    })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'historical'
      },
      filters: {
        storeId: null
      },
      products: []
    })
  })

  it('returns monthly product performance grouped with store details', async () => {
    const storeId = 'd4e5f6a7-b8c9-4a0b-cdef-012345678912'

    db.sequelize.query
      .mockResolvedValueOnce([
        {
          productId: 'f8a9b0c1-d2e3-4c11-2345-678912345686',
          name: 'Smartphone X200',
          quantitySold: '2',
          inStock: '30',
          grossGain: '5998.000000',
          netGain: '5498.500000'
        }
      ])
      .mockResolvedValueOnce([
        {
          productId: 'f8a9b0c1-d2e3-4c11-2345-678912345686',
          storeId,
          address: 202,
          quantitySold: '2',
          inStock: '30',
          grossGain: '5998.000000',
          netGain: '5498.500000'
        }
      ])

    const res = mockResponse()

    await getProductReport({ query: { month: '2026-05', storeId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][0]).toContain('b.created_at >= :startDate')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('b.store_id = :storeId')
    expect(db.sequelize.query.mock.calls[0][1].replacements).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-06-01',
      storeId
    })
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'month',
        year: 2026,
        month: 5,
        startDate: '2026-05-01',
        endDate: '2026-06-01'
      },
      filters: {
        storeId
      },
      products: [
        {
          productId: 'f8a9b0c1-d2e3-4c11-2345-678912345686',
          name: 'Smartphone X200',
          quantitySold: 2,
          inStock: 30,
          grossGain: 5998,
          netGain: 5498.5,
          stores: [
            {
              storeId,
              address: 202,
              quantitySold: 2,
              inStock: 30,
              grossGain: 5998,
              netGain: 5498.5
            }
          ]
        }
      ]
    })
  })

  it('returns 400 for invalid month filters', async () => {
    const res = mockResponse()

    await getProductReport({ query: { month: '13', year: '2026' } }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El month debe ser un numero entre 1 y 12 o formato YYYY-MM'
    })
  })

  it('returns 400 for invalid storeId filters', async () => {
    const res = mockResponse()

    await getProductReport({ query: { storeId: 'not-a-uuid' } }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El storeId debe ser un UUID valido'
    })
  })
})
