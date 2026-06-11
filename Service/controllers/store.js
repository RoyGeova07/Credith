const { Stores } = require('../models/entities/store')
const { Companies } = require('../models/entities/company')

// Crear tienda
const createStore = async (req, res) => {
  try {
    const { address, companyId } = req.body

    if (address === undefined || address === null || address === '') {
      return res.status(400).json({ message: 'La direccion de la tienda es requerida' })
    }

    const parsedAddress = Number(address)

    if (!Number.isInteger(parsedAddress)) {
      return res.status(400).json({ message: 'La direccion debe ser un numero' })
    }

    if (!companyId || companyId.trim() === '') {
      return res.status(400).json({ message: 'El id de la empresa es requerido' })
    }

    const company = await Companies.findByPk(companyId)

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    const store = await Stores.create({
      address: parsedAddress,
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

// Obtener tiendas
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
          attributes: ['companyId', 'name', 'rtn']
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

// Obtener tienda por id
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params

    const store = await Stores.findByPk(id, {
      include: [
        {
          model: Companies,
          as: 'company',
          attributes: ['companyId', 'name', 'rtn']
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

// Actualizar tienda
const updateStore = async (req, res) => {
  try {
    const { id } = req.params
    const { address, companyId } = req.body

    const store = await Stores.findByPk(id)

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    const dataToUpdate = {}

    if (address !== undefined) {
      if (address === null || address === '') {
        return res.status(400).json({ message: 'La direccion no puede estar vacia' })
      }

      const parsedAddress = Number(address)

      if (!Number.isInteger(parsedAddress)) {
        return res.status(400).json({ message: 'La direccion debe ser un numero' })
      }

      dataToUpdate.address = parsedAddress
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

// Desactivar tienda
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

// Activar tienda
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
