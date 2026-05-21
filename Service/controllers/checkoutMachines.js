const { CheckoutMachines } = require('../models/entities/checkoutMachine')
const { Users } = require('../models/entities/user')

// Crear caja/maquina de checkout
const createCheckoutMachine = async (req, res) => {
  try {
    const { machineNumber, name, userId } = req.body

    if (machineNumber === undefined || machineNumber === null || machineNumber === '') {
      return res.status(400).json({ message: 'El numero de maquina es requerido' })
    }

    const parsedMachineNumber = Number(machineNumber)

    if (!Number.isInteger(parsedMachineNumber)) {
      return res.status(400).json({ message: 'El numero de maquina debe ser un numero entero' })
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre de la maquina es requerido' })
    }

    if (!userId || userId.trim() === '') {
      return res.status(400).json({ message: 'El id del usuario es requerido' })
    }

    const user = await Users.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const existingMachineForUser = await CheckoutMachines.findOne({
      where: { userId }
    })

    if (existingMachineForUser) {
      return res.status(400).json({ message: 'El usuario ya tiene una maquina asignada' })
    }

    const checkoutMachine = await CheckoutMachines.create({
      machineNumber: parsedMachineNumber,
      name,
      userId
    })

    res.status(201).json({
      message: 'Maquina de checkout creada correctamente',
      checkoutMachine
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener maquinas de checkout paginadas
const getCheckoutMachines = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const checkoutMachines = await CheckoutMachines.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Users,
          as: 'users',
          attributes: ['userId', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'email']
        }
      ],
      order: [['machineNumber', 'ASC']]
    })

    res.json({
      total: checkoutMachines.count,
      checkoutMachines: checkoutMachines.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener maquina de checkout por id
const getCheckoutMachineById = async (req, res) => {
  try {
    const { id } = req.params

    const checkoutMachine = await CheckoutMachines.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'users',
          attributes: ['userId', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'email']
        }
      ]
    })

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    res.json(checkoutMachine)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar maquina de checkout
const updateCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params
    const { machineNumber, name, userId } = req.body

    const checkoutMachine = await CheckoutMachines.findByPk(id)

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    const dataToUpdate = {}

    if (machineNumber !== undefined) {
      if (machineNumber === null || machineNumber === '') {
        return res.status(400).json({ message: 'El numero de maquina no puede estar vacio' })
      }

      const parsedMachineNumber = Number(machineNumber)

      if (!Number.isInteger(parsedMachineNumber)) {
        return res.status(400).json({ message: 'El numero de maquina debe ser un numero entero' })
      }

      dataToUpdate.machineNumber = parsedMachineNumber
    }

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre de la maquina no puede estar vacio' })
      }

      dataToUpdate.name = name
    }

    if (userId !== undefined) {
      if (!userId || userId.trim() === '') {
        return res.status(400).json({ message: 'El id del usuario no puede estar vacio' })
      }

      const user = await Users.findByPk(userId)

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      if (userId !== checkoutMachine.userId) {
        const existingMachineForUser = await CheckoutMachines.findOne({
          where: { userId }
        })

        if (existingMachineForUser) {
          return res.status(400).json({ message: 'El usuario ya tiene una maquina asignada' })
        }
      }

      dataToUpdate.userId = userId
    }

    await checkoutMachine.update(dataToUpdate)

    res.json({
      message: 'Maquina de checkout actualizada correctamente',
      checkoutMachine
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Desactivar maquina de checkout
const deactivateCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params

    const checkoutMachine = await CheckoutMachines.findByPk(id)

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    if (!checkoutMachine.isActive) {
      return res.status(400).json({ message: 'La maquina de checkout ya esta desactivada' })
    }

    await checkoutMachine.update({ isActive: false })

    res.json({ message: 'Maquina de checkout desactivada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Activar maquina de checkout
const activateCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params

    const checkoutMachine = await CheckoutMachines.findByPk(id)

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    if (checkoutMachine.isActive) {
      return res.status(400).json({ message: 'La maquina de checkout ya esta activa' })
    }

    await checkoutMachine.update({ isActive: true })

    res.json({ message: 'Maquina de checkout activada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Asociar usuario a maquina de checkout
const associateUserToCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId || userId.trim() === '') {
      return res.status(400).json({ message: 'El id del usuario es requerido' })
    }

    const checkoutMachine = await CheckoutMachines.findByPk(id)

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    const user = await Users.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (userId !== checkoutMachine.userId) {
      const existingMachineForUser = await CheckoutMachines.findOne({
        where: { userId }
      })

      if (existingMachineForUser) {
        return res.status(400).json({ message: 'El usuario ya tiene una maquina asignada' })
      }
    }

    await checkoutMachine.update({ userId })

    res.json({
      message: 'Usuario asociado a la maquina de checkout correctamente',
      checkoutMachine
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar maquina de checkout
const deleteCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params

    const checkoutMachine = await CheckoutMachines.findByPk(id)

    if (!checkoutMachine) {
      return res.status(404).json({ message: 'Maquina de checkout no encontrada' })
    }

    await checkoutMachine.destroy()

    res.json({ message: 'Maquina de checkout eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCheckoutMachine,
  getCheckoutMachines,
  getCheckoutMachineById,
  updateCheckoutMachine,
  deactivateCheckoutMachine,
  activateCheckoutMachine,
  associateUserToCheckoutMachine,
  deleteCheckoutMachine
}
