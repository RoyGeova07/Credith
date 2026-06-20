const db = require('../models')
const { Cais } = require('../models/entities/cai')
const { CaiRanges } = require('../models/entities/caiRange')
const { Stores } = require('../models/entities/store')
const { Companies } = require('../models/entities/company')
const { Bills } = require('../models/entities/bill')

async function getStoreMaxRange(storeId, excludeRangeId = null) {
    const cais = await Cais.findAll({ where: { storeId }, attributes: ['caiId'] })
    if (!cais.length) return 0

    const caiIds = cais.map((c) => c.caiId)
    const where = { caiId: caiIds }
    if (excludeRangeId) where.caiRangeId = { [db.Sequelize.Op.ne]: excludeRangeId }

    const ranges = await CaiRanges.findAll({ where, attributes: ['maxRange'] })
    return ranges.reduce((max, r) => Math.max(max, r.maxRange), 0)
}

const createCai = async (req, res) => {
    try {
        const { governmentId, storeId, expirationDate, range, isRenewal } = req.body

        if (!governmentId || governmentId.trim() === '') {
            return res.status(400).json({ message: 'El numero de CAI es requerido' })
        }

        if (!storeId || storeId.trim() === '') {
            return res.status(400).json({ message: 'El id de la tienda es requerido' })
        }

        const store = await Stores.findByPk(storeId)
        if (!store) {
            return res.status(404).json({ message: 'Tienda no encontrada' })
        }

        if (!expirationDate || expirationDate.trim() === '') {
            return res.status(400).json({ message: 'La fecha de expiracion del CAI es requerida' })
        }

        const parsedCaiDate = new Date(expirationDate)
        if (isNaN(parsedCaiDate.getTime())) {
            return res.status(400).json({ message: 'La fecha de expiracion del CAI no es valida' })
        }
        if (parsedCaiDate <= new Date()) {
            return res.status(400).json({ message: 'La fecha de expiracion del CAI debe ser futura' })
        }

        if (!range) {
            return res.status(400).json({ message: 'El rango del CAI es requerido' })
        }

        const { minRange, maxRange } = range

        if (minRange === undefined || minRange === null) {
            return res.status(400).json({ message: 'El rango inicial es requerido' })
        }
        if (maxRange === undefined || maxRange === null) {
            return res.status(400).json({ message: 'El rango final es requerido' })
        }

        const parsedMin = Number(minRange)
        const parsedMax = Number(maxRange)

        if (isNaN(parsedMin) || isNaN(parsedMax)) {
            return res.status(400).json({ message: 'Los rangos deben ser numeros validos' })
        }
        if (parsedMin < 0 || parsedMax < 0) {
            return res.status(400).json({ message: 'Los rangos no pueden ser negativos' })
        }
        if (parsedMin > parsedMax) {
            return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
        }

        const existingCai = await Cais.findOne({ where: { governmentId } })
        if (existingCai) {
            return res.status(400).json({ message: 'Ya existe un CAI con ese numero' })
        }

        if (!isRenewal) {
            const activeCai = await Cais.findOne({ where: { storeId, isActive: true } })
            if (activeCai) {
                return res.status(409).json({ message: 'Esta tienda ya tiene un CAI activo. Use la opción Renovar.' })
            }
        }

        const storeMax = await getStoreMaxRange(storeId)
        if (storeMax > 0 && parsedMin <= storeMax) {
            return res.status(400).json({
                message: `El rango inicial debe ser mayor al ultimo rango registrado para esta tienda (${storeMax})`
            })
        }

        const cai = await db.sequelize.transaction(async (transaction) => {
            await Cais.update(
                { isActive: false },
                { where: { storeId, isActive: true }, transaction }
            )

            return await Cais.create(
                {
                    governmentId,
                    storeId,
                    expirationDate,
                    isActive: true,
                    caiRanges: [
                        {
                            minRange: parsedMin,
                            maxRange: parsedMax,
                            currentNumber: 0,
                            isActive: true
                        }
                    ]
                },
                {
                    include: [{ model: CaiRanges, as: 'caiRanges' }],
                    transaction
                }
            )
        })

        res.status(201).json({ message: 'CAI creado correctamente', cai })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getPagedCais = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const offset = parseInt(req.query.offset) || 0

        const allCais = await Cais.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: CaiRanges, as: 'caiRanges' },
                {
                    model: Stores, as: 'store', attributes: ['storeId', 'storeNumber', 'address'],
                    include: [{ model: Companies, as: 'company', attributes: ['name'] }]
                }
            ]
        })

        const seen = new Set()
        const deduplicated = allCais.filter((cai) => {
            if (seen.has(cai.storeId)) return false
            seen.add(cai.storeId)
            return true
        })

        res.json({ total: deduplicated.length, data: deduplicated.slice(offset, offset + limit) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteCai = async (req, res) => {
    try {
        const { id } = req.params

        const cai = await Cais.findByPk(id, {
            include: [{ model: CaiRanges, as: 'caiRanges' }]
        })

        if (!cai) {
            return res.status(404).json({ message: 'CAI no encontrado' })
        }

        for (const range of cai.caiRanges || []) {
            const billCount = await Bills.count({ where: { caiRangeId: range.caiRangeId } })
            if (billCount > 0) {
                return res.status(400).json({ message: 'No se puede eliminar el CAI porque tiene facturas asociadas' })
            }
        }

        await db.sequelize.transaction(async (transaction) => {
            await CaiRanges.destroy({ where: { caiId: cai.caiId }, transaction })
            await cai.destroy({ transaction })
        })

        res.json({ message: 'CAI eliminado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createCai,
    getPagedCais,
    deleteCai,
    getStoreMaxRange
}
