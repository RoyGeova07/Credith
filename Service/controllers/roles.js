const db = require('../models')
const { Roles } = require('../models/entities/role')
const { Users } = require('../models/entities/user')

const allowedRoleNames = ['Employee', 'Admin', 'Owner']

const normalizeRoleName = (name) => {
  if (!name || name.trim() === '') {
    return null
  }

  return allowedRoleNames.find((roleName) => roleName.toLowerCase() === name.trim().toLowerCase())
}

// Crear rol
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body

    const normalizedName = normalizeRoleName(name)

    if (!normalizedName) {
      return res.status(400).json({ message: 'El rol debe ser Employee, Admin u Owner' })
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre del rol es requerido' })
    }

    const existingRole = await Roles.findOne({ where: { name: normalizedName } })

    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' })
    }

    const role = await Roles.create({
      name: normalizedName,
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
      const normalizedName = normalizeRoleName(name)

      if (!normalizedName) {
        return res.status(400).json({ message: 'El rol debe ser Employee, Admin u Owner' })
      }

      if (normalizedName !== role.name) {
        const existingRole = await Roles.findOne({ where: { name: normalizedName } })

        if (existingRole) {
          return res.status(400).json({ message: 'Ya existe un rol con ese nombre' })
        }
      }

      dataToUpdate.name = normalizedName
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

// Asociar rol a usuario
const associateRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body

    if (!userId || userId.trim() === '') {
      return res.status(400).json({ message: 'El id del usuario es requerido' })
    }

    if (!roleId || roleId.trim() === '') {
      return res.status(400).json({ message: 'El id del rol es requerido' })
    }

    const user = await Users.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const role = await Roles.findByPk(roleId)

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    const existingUserRole = await db.sequelize.query(
      'SELECT 1 FROM cd.users_roles WHERE user_id = :userId AND role_id = :roleId LIMIT 1',
      {
        replacements: { userId, roleId },
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    if (existingUserRole.length > 0) {
      return res.status(400).json({ message: 'El usuario ya tiene asignado ese rol' })
    }

    await db.sequelize.query(
      'INSERT INTO cd.users_roles (user_id, role_id) VALUES (:userId, :roleId)',
      {
        replacements: { userId, roleId },
        type: db.Sequelize.QueryTypes.INSERT
      }
    )

    res.status(201).json({
      message: 'Rol asociado al usuario correctamente',
      userId,
      role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  associateRoleToUser
}
