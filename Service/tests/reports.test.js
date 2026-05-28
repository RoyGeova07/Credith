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
const { getProductReport, getStoreReport, getCompanyReport } = require('../controllers/reports')

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }
}

describe('GET /api/reports/products controller', () => {
  const companyId = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a historical product report scoped by company with default pagination', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const res = mockResponse()

    await getProductReport({ query: { companyId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][1]).toEqual({
      replacements: {
        companyId,
        limit: 10,
        offset: 0
      },
      type: 'SELECT'
    })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'historical'
      },
      filters: {
        companyId,
        storeId: null
      },
      pagination: {
        limit: 10,
        offset: 0
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

    await getProductReport({
      query: {
        companyId,
        month: '2026-05',
        storeId,
        limit: '25',
        offset: '5'
      }
    }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][0]).toContain('b.created_at >= :startDate')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('b.store_id = :storeId')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('st.company_id = :companyId')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('LIMIT :limit')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('INNER JOIN cd.stores st ON st.store_id = b.store_id')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('INNER JOIN cd.stores st ON st.store_id = si.store_id')
    expect(db.sequelize.query.mock.calls[0][0]).toContain('st.deleted_at IS NULL')
    expect(db.sequelize.query.mock.calls[0][1].replacements).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-06-01',
      storeId,
      companyId,
      limit: 25,
      offset: 5
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
        companyId,
        storeId
      },
      pagination: {
        limit: 25,
        offset: 5
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

  it('returns 400 when companyId is missing', async () => {
    const res = mockResponse()

    await getProductReport({ query: {} }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El companyId es requerido para generar el reporte de compañia'
    })
  })

  it('returns 400 for invalid month filters', async () => {
    const res = mockResponse()

    await getProductReport({ query: { month: '13', year: '2026' } }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El mes debe ser un numero entre 1 y 12 o formato YYYY-MM'
    })
  })

  it('returns 400 for invalid YYYY-MM month filters', async () => {
    const res = mockResponse()

    await getProductReport({ query: { month: '2026-13', companyId } }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El mes debe ser un numero entre 1 y 12 o formato YYYY-MM'
    })
  })

})

describe('GET /api/reports/stores controller', () => {
  const storeId = 'd4e5f6a7-b8c9-4a0b-cdef-012345678912'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the current month store report when month is not provided', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-27T12:00:00.000Z'))

    db.sequelize.query
      .mockResolvedValueOnce([
        {
          storeId,
          address: 202,
          isOperating: true,
          monthlyGrossGain: '30998.000000',
          monthlyNetGain: '7998.000000'
        }
      ])
      .mockResolvedValueOnce([
        {
          userId: 'b8c9d0e1-f2a3-4e0f-0123-456789123456',
          firstName: 'Jose',
          secondName: 'Antonio',
          firstLastName: 'Hernandez',
          secondLastName: 'Cruz',
          email: 'jose.hernandez@credith.hn',
          isActive: true
        }
      ])

    const res = mockResponse()

    await getStoreReport({ query: { storeId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][0]).toContain('st.store_id = :storeId')
    expect(db.sequelize.query.mock.calls[0][1].replacements).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-06-01',
      storeId
    })
    expect(res.status).not.toHaveBeenCalled()
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
      store: {
        storeId,
        address: 202,
        isOperating: true,
        monthlyGrossGain: 30998,
        monthlyNetGain: 7998,
        employees: [
          {
            userId: 'b8c9d0e1-f2a3-4e0f-0123-456789123456',
            fullName: 'Jose Antonio Hernandez Cruz',
            email: 'jose.hernandez@credith.hn',
            isActive: true
          }
        ]
      }
    })
  })

  it('returns a store report for a specific month', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([
        {
          storeId,
          address: 202,
          isOperating: false,
          monthlyGrossGain: '499.400000',
          monthlyNetGain: '249.400000'
        }
      ])
      .mockResolvedValueOnce([])

    const res = mockResponse()

    await getStoreReport({ query: { storeId, month: '2026-04' } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[0][1].replacements).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-05-01',
      storeId
    })
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'month',
        year: 2026,
        month: 4,
        startDate: '2026-04-01',
        endDate: '2026-05-01'
      },
      filters: {
        storeId
      },
      store: {
        storeId,
        address: 202,
        isOperating: false,
        monthlyGrossGain: 499.4,
        monthlyNetGain: 249.4,
        employees: []
      }
    })
  })

  it('returns 400 when storeId is missing', async () => {
    const res = mockResponse()

    await getStoreReport({ query: {} }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El storeId es requerido para generar el reporte de tienda'
    })
  })

  it('returns 404 when the store does not exist', async () => {
    db.sequelize.query.mockResolvedValueOnce([])

    const res = mockResponse()

    await getStoreReport({ query: { storeId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Tienda no encontrada'
    })
  })
})

describe('GET /api/reports/companies controller', () => {
  const companyId = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the current month company report when month is not provided', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-27T12:00:00.000Z'))

    db.sequelize.query
      .mockResolvedValueOnce([
        {
          companyId,
          name: 'Credith S.A. de C.V.',
          rtn: '08019000123456',
          email: 'contacto@credith.hn'
        }
      ])
      .mockResolvedValueOnce([
        {
          storeId: 'c3d4e5f6-a7b8-490a-bcde-f01234567891',
          address: 101,
          isOperating: true,
          monthlyGrossGain: '10999.000000',
          monthlyNetGain: '2999.000000'
        },
        {
          storeId: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912',
          address: 202,
          isOperating: true,
          monthlyGrossGain: '19999.500000',
          monthlyNetGain: '4999.500000'
        }
      ])

    const res = mockResponse()

    await getCompanyReport({ query: { companyId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[1][0]).toContain('st.company_id = :companyId')
    expect(db.sequelize.query.mock.calls[1][0]).toContain('st.is_active = true')
    expect(db.sequelize.query.mock.calls[1][1].replacements).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-06-01',
      companyId
    })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'month',
        year: 2026,
        month: 5,
        startDate: '2026-05-01',
        endDate: '2026-06-01'
      },
      filters: {
        companyId
      },
      company: {
        companyId,
        name: 'Credith S.A. de C.V.',
        rtn: '08019000123456',
        email: 'contacto@credith.hn',
        stores: [
          {
            storeId: 'c3d4e5f6-a7b8-490a-bcde-f01234567891',
            address: 101,
            isOperating: true,
            monthlyGrossGain: 10999,
            monthlyNetGain: 2999
          },
          {
            storeId: 'd4e5f6a7-b8c9-4a0b-cdef-012345678912',
            address: 202,
            isOperating: true,
            monthlyGrossGain: 19999.5,
            monthlyNetGain: 4999.5
          }
        ],
        totalMonthlyGrossGain: 30998.5,
        totalMonthlyNetGain: 7998.5
      }
    })
  })

  it('returns a company report for a specific month', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([
        {
          companyId,
          name: 'Credith S.A. de C.V.',
          rtn: '08019000123456',
          email: 'contacto@credith.hn'
        }
      ])
      .mockResolvedValueOnce([])

    const res = mockResponse()

    await getCompanyReport({ query: { companyId, month: '2026-04' } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(2)
    expect(db.sequelize.query.mock.calls[1][1].replacements).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-05-01',
      companyId
    })
    expect(res.json).toHaveBeenCalledWith({
      period: {
        type: 'month',
        year: 2026,
        month: 4,
        startDate: '2026-04-01',
        endDate: '2026-05-01'
      },
      filters: {
        companyId
      },
      company: {
        companyId,
        name: 'Credith S.A. de C.V.',
        rtn: '08019000123456',
        email: 'contacto@credith.hn',
        stores: [],
        totalMonthlyGrossGain: 0,
        totalMonthlyNetGain: 0
      }
    })
  })

  it('returns 400 when companyId is missing', async () => {
    const res = mockResponse()

    await getCompanyReport({ query: {} }, res)

    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'El companyId es requerido para generar el reporte de compañia'
    })
  })

  it('returns 404 when the company does not exist', async () => {
    db.sequelize.query.mockResolvedValueOnce([])

    const res = mockResponse()

    await getCompanyReport({ query: { companyId } }, res)

    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Compañia no encontrada'
    })
  })
})
