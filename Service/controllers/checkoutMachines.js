const { CheckoutMachines } = require('../models/entities/checkoutMachine')
const { Users } = require('../models/entities/user')
const { Stores } = require('../models/entities/store')
const { Companies } = require('../models/entities/company')

const createCheckoutMachine = async (req, res) => {
  try {
    const { machineNumber, name, storeId } = req.body

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

    if (!storeId || storeId.trim() === '') {
      return res.status(400).json({ message: 'La tienda es requerida' })
    }

    const store = await Stores.findByPk(storeId)
    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    const checkoutMachine = await CheckoutMachines.create({
      machineNumber: parsedMachineNumber,
      name,
      storeId
    })

    res.status(201).json({
      message: 'Maquina de checkout creada correctamente',
      checkoutMachine
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPagedCheckoutMachines = async (req, res) => {
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
        },
        {
          model: Stores,
          as: 'store',
          attributes: ['storeId', 'storeNumber', 'address'],
          include: [{ model: Companies, as: 'company', attributes: ['name'] }]
        }
      ],
      order: [['machineNumber', 'ASC']]
    })

    res.json({
      total: checkoutMachines.count,
      data: checkoutMachines.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getCheckoutMachineById = async (req, res) => {
  try {
    const { id } = req.params

    const checkoutMachine = await CheckoutMachines.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'users',
          attributes: ['userId', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'email']
        },
        {
          model: Stores,
          as: 'store',
          attributes: ['storeId', 'storeNumber', 'address'],
          include: [{ model: Companies, as: 'company', attributes: ['name'] }]
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

const updateCheckoutMachine = async (req, res) => {
  try {
    const { id } = req.params
    const { machineNumber, name, storeId } = req.body

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

    if (storeId !== undefined) {
      const store = await Stores.findByPk(storeId)
      if (!store) {
        return res.status(404).json({ message: 'Tienda no encontrada' })
      }
      dataToUpdate.storeId = storeId
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

// Associates a user with a machine by setting user.checkoutMachineId
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

    // Check if user already has a different machine
    if (user.checkoutMachineId && user.checkoutMachineId !== id) {
      return res.status(400).json({ message: 'El usuario ya tiene una maquina asignada' })
    }

    await user.update({ checkoutMachineId: id })

    res.json({
      message: 'Usuario asociado a la maquina de checkout correctamente',
      checkoutMachine
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

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
  getPagedCheckoutMachines,
  getCheckoutMachineById,
  updateCheckoutMachine,
  deactivateCheckoutMachine,
  activateCheckoutMachine,
  associateUserToCheckoutMachine,
  deleteCheckoutMachine
}
