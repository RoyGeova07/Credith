const { Stores } = require('../models/entities/store')
const { Companies } = require('../models/entities/company')

const createStore = async (req, res) => {
  try {
    const { storeNumber, address, companyId } = req.body

    if (storeNumber === undefined || storeNumber === null || storeNumber === '') {
      return res.status(400).json({ message: 'El numero de tienda es requerido' })
    }

    const parsedStoreNumber = Number(storeNumber)

    if (!Number.isInteger(parsedStoreNumber) || parsedStoreNumber <= 0) {
      return res.status(400).json({ message: 'El numero de tienda debe ser un entero positivo' })
    }

    if (!companyId || companyId.trim() === '') {
      return res.status(400).json({ message: 'El id de la empresa es requerido' })
    }

    const company = await Companies.findByPk(companyId)

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    const store = await Stores.create({
      storeNumber: parsedStoreNumber,
      address: address || null,
      companyId
    })

    res.status(201).json({
      message: 'Tienda creada correctamente',
      store
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPagedStores = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const stores = await Stores.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Companies,
          as: 'company',
          attributes: ['companyId', 'name', 'rtn'],
          required: true,
        }
      ]
    })

    res.json({
      total: stores.count,
      data: stores.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params

    const store = await Stores.findByPk(id, {
      include: [
        {
          model: Companies,
          as: 'company',
          attributes: ['companyId', 'name', 'rtn'],
          required: true,
        }
      ]
    })

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    res.json(store)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateStore = async (req, res) => {
  try {
    const { id } = req.params
    const { storeNumber, address, companyId } = req.body

    const store = await Stores.findByPk(id)

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    const dataToUpdate = {}

    if (storeNumber !== undefined) {
      const parsedStoreNumber = Number(storeNumber)

      if (!Number.isInteger(parsedStoreNumber) || parsedStoreNumber <= 0) {
        return res.status(400).json({ message: 'El numero de tienda debe ser un entero positivo' })
      }

      dataToUpdate.storeNumber = parsedStoreNumber
    }

    if (address !== undefined) {
      dataToUpdate.address = address || null
    }

    if (companyId !== undefined) {
      if (!companyId || companyId.trim() === '') {
        return res.status(400).json({ message: 'El id de la empresa no puede estar vacio' })
      }

      const company = await Companies.findByPk(companyId)

      if (!company) {
        return res.status(404).json({ message: 'Empresa no encontrada' })
      }

      dataToUpdate.companyId = companyId
    }

    await store.update(dataToUpdate)

    res.json({
      message: 'Tienda actualizada correctamente',
      store
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deactivateStore = async (req, res) => {
  try {
    const { id } = req.params

    const store = await Stores.findByPk(id)

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    if (!store.isActive) {
      return res.status(400).json({ message: 'La tienda ya esta desactivada' })
    }

    await store.update({ isActive: false })

    res.json({ message: 'Tienda desactivada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const activateStore = async (req, res) => {
  try {
    const { id } = req.params

    const store = await Stores.findByPk(id)

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    if (store.isActive) {
      return res.status(400).json({ message: 'La tienda ya esta activa' })
    }

    await store.update({ isActive: true })

    res.json({ message: 'Tienda activada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createStore,
  getPagedStores,
  getStoreById,
  updateStore,
  deactivateStore,
  activateStore
}
