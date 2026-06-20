const { createCai, getStoreMaxRange } = require('../controllers/cai')
const { createCaiRange, updateCaiRange } = require('../controllers/caiRange')
const { Cais } = require('../models/entities/cai')
const { CaiRanges } = require('../models/entities/caiRange')
const { Stores } = require('../models/entities/store')
const { Bills } = require('../models/entities/bill')
const db = require('../models')

jest.mock('../models/entities/cai')
jest.mock('../models/entities/caiRange')
jest.mock('../models/entities/store')
jest.mock('../models/entities/bill', () => ({ Bills: { count: jest.fn() } }))
jest.mock('../models', () => ({
    sequelize: { transaction: jest.fn((cb) => cb('mock-transaction')) },
    Sequelize: { Op: { ne: Symbol('ne') } }
}))

const mockReq = (body = {}, params = {}) => ({ body, params })
const mockRes = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

beforeEach(() => {
    jest.clearAllMocks()
    Bills.count.mockResolvedValue(0)
    Stores.findByPk.mockResolvedValue({ storeId: 'store-1' })
    Cais.findOne.mockResolvedValue(null)
    Cais.findAll.mockResolvedValue([])
    CaiRanges.findAll.mockResolvedValue([])
})

// =============================================================================
// TEST 1 — Validacion de campos requeridos al crear un CAI
// =============================================================================

describe('CAI - Validacion de campos requeridos', () => {

    test('Rechaza si falta governmentId', async () => {
        const req = mockReq({ storeId: 'store-1', expirationDate: '2030-01-01', range: { minRange: 1, maxRange: 1000 } })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'El numero de CAI es requerido' })
    })

    test('Rechaza si la tienda no existe', async () => {
        Stores.findByPk.mockResolvedValue(null)
        const req = mockReq({ governmentId: 'CAI-001', storeId: 'store-404', expirationDate: '2030-01-01', range: { minRange: 1, maxRange: 1000 } })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: 'Tienda no encontrada' })
    })

    test('Rechaza si falta el objeto range', async () => {
        const req = mockReq({ governmentId: 'CAI-001', storeId: 'store-1', expirationDate: '2030-01-01' })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'El rango del CAI es requerido' })
    })

})

// =============================================================================
// TEST 2 — Validacion de rangos
// =============================================================================

describe('CAI - Validacion de rangos', () => {

    test('Rechaza si minRange no es un numero valido', async () => {
        const req = mockReq({ governmentId: 'CAI-001', storeId: 'store-1', expirationDate: '2030-01-01', range: { minRange: 'abc', maxRange: 1000 } })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'Los rangos deben ser numeros validos' })
    })

    test('Rechaza si minRange es negativo', async () => {
        const req = mockReq({ governmentId: 'CAI-001', storeId: 'store-1', expirationDate: '2030-01-01', range: { minRange: -1, maxRange: 1000 } })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'Los rangos no pueden ser negativos' })
    })

    test('Rechaza si minRange es mayor que maxRange', async () => {
        const req = mockReq({ governmentId: 'CAI-001', storeId: 'store-1', expirationDate: '2030-01-01', range: { minRange: 5000, maxRange: 1000 } })
        const res = mockRes()
        await createCai(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'El rango inicial no puede ser mayor al rango final' })
    })

})

// =============================================================================
// TEST 3 — Validacion secuencial por tienda
// El nuevo rango debe comenzar despues del ultimo maxRange de la tienda
// =============================================================================

describe('CAI - El rango inicial debe ser mayor al ultimo de la tienda', () => {

    test('Rechaza si el nuevo rango se solapa con el ultimo rango de la tienda', async () => {
        Cais.findAll.mockResolvedValue([{ caiId: 'cai-existente' }])
        CaiRanges.findAll.mockResolvedValue([{ maxRange: 1000 }])

        const req = mockReq({
            governmentId: 'CAI-002',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 500, maxRange: 1500 }
        })
        const res = mockRes()
        await createCai(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('1000') })
        )
    })

    test('Permite crear el CAI si el rango inicia despues del ultimo maxRange', async () => {
        Cais.findAll.mockResolvedValue([{ caiId: 'cai-existente' }])
        CaiRanges.findAll.mockResolvedValue([{ maxRange: 1000 }])
        Cais.update.mockResolvedValue([1])
        Cais.create.mockResolvedValue({
            caiId: 'cai-nuevo',
            governmentId: 'CAI-002',
            isActive: true,
            caiRanges: [{ minRange: 1001, maxRange: 2000, isActive: true }]
        })

        const req = mockReq({
            governmentId: 'CAI-002',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 1001, maxRange: 2000 }
        })
        const res = mockRes()
        await createCai(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
    })

    test('Permite crear el primer CAI de una tienda desde 1', async () => {
        Cais.findAll.mockResolvedValue([])
        Cais.update.mockResolvedValue([1])
        Cais.create.mockResolvedValue({
            caiId: 'cai-nuevo',
            governmentId: 'CAI-001',
            isActive: true,
            caiRanges: [{ minRange: 1, maxRange: 50000, isActive: true }]
        })

        const req = mockReq({
            governmentId: 'CAI-001',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 1, maxRange: 50000 }
        })
        const res = mockRes()
        await createCai(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
    })

})

// =============================================================================
// TEST 4 — Nuevo CAI rechaza si la tienda ya tiene un CAI activo (sin isRenewal)
// =============================================================================

describe('CAI - Rechaza nuevo CAI si la tienda ya tiene uno activo', () => {

    test('Retorna 409 si la tienda tiene un CAI activo y no es renovacion', async () => {
        Cais.findOne
            .mockResolvedValueOnce(null)                      // governmentId check → ok
            .mockResolvedValueOnce({ caiId: 'cai-activo' }) // storeId+isActive check → existe

        const req = mockReq({
            governmentId: 'CAI-NUEVO',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 1, maxRange: 1000 }
        })
        const res = mockRes()
        await createCai(req, res)

        expect(res.status).toHaveBeenCalledWith(409)
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('Renovar') })
        )
    })

    test('Permite renovar aunque la tienda ya tenga un CAI activo (isRenewal: true)', async () => {
        Cais.findOne.mockResolvedValue(null) // governmentId check → ok (no duplicate code)
        Cais.update.mockResolvedValue([1])
        Cais.create.mockResolvedValue({
            caiId: 'cai-renovado',
            governmentId: 'CAI-NUEVO',
            isActive: true,
            caiRanges: [{ minRange: 1, maxRange: 1000, isActive: true }]
        })

        const req = mockReq({
            governmentId: 'CAI-NUEVO',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 1, maxRange: 1000 },
            isRenewal: true
        })
        const res = mockRes()
        await createCai(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
    })

})

// =============================================================================
// TEST 5 — Crear CAI desactiva el anterior de la misma tienda
// =============================================================================

describe('CAI - Nuevo CAI desactiva el anterior de la misma tienda', () => {

    test('Llama a Cais.update filtrando por storeId antes de crear el nuevo', async () => {
        Cais.update.mockResolvedValue([1])
        Cais.create.mockResolvedValue({ caiId: 'cai-nuevo', isActive: true, caiRanges: [] })

        const req = mockReq({
            governmentId: 'CAI-002',
            storeId: 'store-1',
            expirationDate: '2030-01-01',
            range: { minRange: 1, maxRange: 1000 }
        })
        const res = mockRes()
        await createCai(req, res)

        expect(Cais.update).toHaveBeenCalledWith(
            { isActive: false },
            expect.objectContaining({ where: expect.objectContaining({ storeId: 'store-1', isActive: true }) })
        )
    })

})

// =============================================================================
// TEST 5 — CaiRange: validacion secuencial por tienda
// =============================================================================

describe('CaiRange - El rango inicial debe ser mayor al ultimo de la tienda', () => {

    test('Rechaza si el nuevo rango no comienza despues del ultimo maxRange', async () => {
        const caiActivo = { caiId: 'cai-1', storeId: 'store-1', isActive: true, expirationDate: '2030-01-01' }
        Cais.findByPk.mockResolvedValue(caiActivo)
        Cais.findAll.mockResolvedValue([{ caiId: 'cai-1' }])
        CaiRanges.findAll.mockResolvedValue([{ maxRange: 1000 }])

        const req = mockReq({ caiId: 'cai-1', minRange: 500, maxRange: 1500 })
        const res = mockRes()
        await createCaiRange(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('1000') })
        )
    })

})

// =============================================================================
// TEST 6 — updateCaiRange: solo permite extender maxRange
// =============================================================================

describe('CaiRange - updateCaiRange solo extiende maxRange', () => {

    test('Rechaza si el nuevo maxRange es menor al currentNumber', async () => {
        CaiRanges.findByPk.mockResolvedValue({ caiRangeId: 'r-1', currentNumber: 500, maxRange: 1000, update: jest.fn() })

        const req = mockReq({ maxRange: 300 }, { id: 'r-1' })
        const res = mockRes()
        await updateCaiRange(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'El rango final no puede ser menor al numero de factura actual' })
    })

    test('Rechaza si el nuevo maxRange no es mayor al actual', async () => {
        CaiRanges.findByPk.mockResolvedValue({ caiRangeId: 'r-1', currentNumber: 200, maxRange: 1000, update: jest.fn() })

        const req = mockReq({ maxRange: 1000 }, { id: 'r-1' })
        const res = mockRes()
        await updateCaiRange(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'El nuevo rango final debe ser mayor al actual' })
    })

    test('Rechaza si ya tiene facturas emitidas', async () => {
        CaiRanges.findByPk.mockResolvedValue({ caiRangeId: 'r-1', currentNumber: 5, maxRange: 1000, update: jest.fn() })
        Bills.count.mockResolvedValue(3)

        const req = mockReq({ maxRange: 2000 }, { id: 'r-1' })
        const res = mockRes()
        await updateCaiRange(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'No se puede modificar el rango porque ya existen facturas emitidas' })
    })

    test('Actualiza maxRange correctamente cuando es valido', async () => {
        const rangeMock = { caiRangeId: 'r-1', currentNumber: 0, maxRange: 1000, update: jest.fn().mockResolvedValue(true) }
        CaiRanges.findByPk.mockResolvedValue(rangeMock)
        Bills.count.mockResolvedValue(0)

        const req = mockReq({ maxRange: 2000 }, { id: 'r-1' })
        const res = mockRes()
        await updateCaiRange(req, res)

        expect(rangeMock.update).toHaveBeenCalledWith({ maxRange: 2000 })
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Rango de CAI actualizado correctamente' }))
    })

})
