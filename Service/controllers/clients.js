const { Clients } = require('../models/entities/clients')

// Crear cliente
const createClient = async (req, res) => {
  try {
    const { name, dni, phone, address } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre del cliente es requerido' })
    }

    if (dni && dni.trim() !== '') {
      const existingClient = await Clients.findOne({ where: { dni } })

      if (existingClient) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese DNI' })
      }
    }

    const client = await Clients.create({
      name,
      dni,
      phone,
      address
    })

    res.status(201).json({
      message: 'Cliente creado correctamente',
      client
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener clientes paginados
const getClients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const clients = await Clients.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']]
    })

    res.json({
      total: clients.count,
      clients: clients.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener cliente por id
const getClientById = async (req, res) => {
  try {
    const { id } = req.params

    const client = await Clients.findByPk(id)

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params
    const { name, dni, phone, address } = req.body

    const client = await Clients.findByPk(id)

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    const dataToUpdate = {}

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre del cliente no puede estar vacio' })
      }

      dataToUpdate.name = name
    }

    if (dni !== undefined) {
      if (dni && dni.trim() !== '' && dni !== client.dni) {
        const existingClient = await Clients.findOne({ where: { dni } })

        if (existingClient) {
          return res.status(400).json({ message: 'Ya existe un cliente con ese DNI' })
        }
      }

      dataToUpdate.dni = dni
    }

    if (phone !== undefined) {
      dataToUpdate.phone = phone
    }

    if (address !== undefined) {
      dataToUpdate.address = address
    }

    await client.update(dataToUpdate)

    res.json({
      message: 'Cliente actualizado correctamente',
      client
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar cliente
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params

    const client = await Clients.findByPk(id)

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    await client.destroy()

    res.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
}
