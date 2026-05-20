const { Roles } = require('../models/entities/role')

// Crear rol
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre del rol es requerido' })
    }

    const existingRole = await Roles.findOne({ where: { name } })

    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' })
    }

    const role = await Roles.create({
      name,
      description
    })

    res.status(201).json({
      message: 'Rol creado correctamente',
      role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener roles paginados
const getRoles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const roles = await Roles.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']]
    })

    res.json({
      total: roles.count,
      roles: roles.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rol por id
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params

    const role = await Roles.findByPk(id)

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    res.json(role)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar rol
const updateRole = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const role = await Roles.findByPk(id)

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    const dataToUpdate = {}

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre del rol no puede estar vacio' })
      }

      if (name !== role.name) {
        const existingRole = await Roles.findOne({ where: { name } })

        if (existingRole) {
          return res.status(400).json({ message: 'Ya existe un rol con ese nombre' })
        }
      }

      dataToUpdate.name = name
    }

    if (description !== undefined) {
      dataToUpdate.description = description
    }

    await role.update(dataToUpdate)

    res.json({
      message: 'Rol actualizado correctamente',
      role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar rol
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params

    const role = await Roles.findByPk(id)

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    await role.destroy()

    res.json({ message: 'Rol eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
}
