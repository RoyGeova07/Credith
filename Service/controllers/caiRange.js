const db = require('../models')
const { CaiRanges } = require('../models/entities/caiRange')
const { Cais } = require('../models/entities/cai')
const { Bills } = require('../models/entities/bill')
const { getStoreMaxRange } = require('./cai')

const createCaiRange = async (req, res) => {
    try {
        const { caiId, minRange, maxRange } = req.body

        if (!caiId || caiId.trim() === '') {
            return res.status(400).json({ message: 'El id del CAI es requerido' })
        }

        const cai = await Cais.findByPk(caiId)
        if (!cai) {
            return res.status(404).json({ message: 'CAI no encontrado' })
        }
        if (!cai.isActive) {
            return res.status(400).json({ message: 'El CAI debe estar activo para agregar un rango' })
        }
        if (new Date(cai.expirationDate) <= new Date()) {
            return res.status(400).json({ message: 'El CAI ha expirado' })
        }

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

        const storeMax = await getStoreMaxRange(cai.storeId)
        if (storeMax > 0 && parsedMin <= storeMax) {
            return res.status(400).json({
                message: `El rango inicial debe ser mayor al ultimo rango registrado para esta tienda (${storeMax})`
            })
        }

        const caiRange = await db.sequelize.transaction(async (transaction) => {
            await CaiRanges.update(
                { isActive: false },
                { where: { caiId, isActive: true }, transaction }
            )

            return await CaiRanges.create(
                { minRange: parsedMin, maxRange: parsedMax, currentNumber: 0, caiId, isActive: true },
                { transaction }
            )
        })

        res.status(201).json({ message: 'Rango de CAI creado correctamente', caiRange })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getPagedCaiRanges = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const offset = parseInt(req.query.offset) || 0

        const caiRanges = await CaiRanges.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Cais, as: 'cai' }]
        })

        res.json({ total: caiRanges.count, data: caiRanges.rows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getPagedCaiRangesByCai = async (req, res) => {
    try {
        const { caiId } = req.params
        const limit = parseInt(req.query.limit) || 10
        const offset = parseInt(req.query.offset) || 0

        const cai = await Cais.findByPk(caiId)
        if (!cai) {
            return res.status(404).json({ message: 'CAI no encontrado' })
        }

        const caiRanges = await CaiRanges.findAndCountAll({
            where: { caiId },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Cais, as: 'cai' }]
        })

        res.json({ total: caiRanges.count, data: caiRanges.rows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getCaiRangeById = async (req, res) => {
    try {
        const { id } = req.params

        const caiRange = await CaiRanges.findByPk(id, {
            include: [{ model: Cais, as: 'cai' }]
        })

        if (!caiRange) {
            return res.status(404).json({ message: 'Rango de CAI no encontrado' })
        }

        res.json(caiRange)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateCaiRange = async (req, res) => {
    try {
        const { id } = req.params
        const { maxRange } = req.body

        const caiRange = await CaiRanges.findByPk(id)
        if (!caiRange) {
            return res.status(404).json({ message: 'Rango de CAI no encontrado' })
        }

        const billCount = await Bills.count({ where: { caiRangeId: caiRange.caiRangeId } })

        const dataToUpdate = {}

        if (maxRange !== undefined) {
            const parsedMax = Number(maxRange)

            if (isNaN(parsedMax) || parsedMax < 0) {
                return res.status(400).json({ message: 'El rango final no es un numero valido' })
            }
            if (parsedMax < caiRange.currentNumber) {
                return res.status(400).json({ message: 'El rango final no puede ser menor al numero de factura actual' })
            }
            if (parsedMax <= caiRange.maxRange) {
                return res.status(400).json({ message: 'El nuevo rango final debe ser mayor al actual' })
            }
            if (billCount > 0) {
                return res.status(400).json({ message: 'No se puede modificar el rango porque ya existen facturas emitidas' })
            }

            dataToUpdate.maxRange = parsedMax
        }

        await caiRange.update(dataToUpdate)

        res.json({ message: 'Rango de CAI actualizado correctamente', caiRange })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteCaiRange = async (req, res) => {
    try {
        const { id } = req.params

        const caiRange = await CaiRanges.findByPk(id)
        if (!caiRange) {
            return res.status(404).json({ message: 'Rango de CAI no encontrado' })
        }

        const billCount = await Bills.count({ where: { caiRangeId: caiRange.caiRangeId } })
        if (billCount > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el rango porque tiene facturas asociadas' })
        }

        await caiRange.destroy()

        res.json({ message: 'Rango de CAI eliminado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createCaiRange,
    getPagedCaiRanges,
    getPagedCaiRangesByCai,
    getCaiRangeById,
    updateCaiRange,
    deleteCaiRange
}
