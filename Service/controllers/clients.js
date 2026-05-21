const db = require('../models')
const { Clients } = require('../models/entities/clients')
const { Bills } = require('../models/entities/bill')

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

// Asociar cliente a factura
const associateClientToBill = async (req, res) => {
  try {
    const { clientId, billId } = req.body

    if (!clientId || clientId.trim() === '') {
      return res.status(400).json({ message: 'El id del cliente es requerido' })
    }

    if (!billId || billId.trim() === '') {
      return res.status(400).json({ message: 'El id de la factura es requerido' })
    }

    const result = await db.sequelize.transaction(async (transaction) => {
      const client = await Clients.findByPk(clientId, { transaction })

      if (!client) {
        throw { status: 404, message: 'Cliente no encontrado' }
      }

      const bill = await Bills.findByPk(billId, { transaction })

      if (!bill) {
        throw { status: 404, message: 'Factura no encontrada' }
      }

      await bill.update({
        customerName: client.name,
        customerPhone: client.phone,
        customerAddress: client.address
      }, { transaction })

      const billPaymentPlans = await db.sequelize.query(
        `SELECT bill_payment_plan_id AS "billPaymentPlanId"
         FROM cd.bill_payment_plans
         WHERE bill_id = :billId
         AND deleted_at IS NULL
         LIMIT 1`,
        {
          replacements: { billId },
          type: db.Sequelize.QueryTypes.SELECT,
          transaction
        }
      )

      let paymentPlanAssociation = null
      const billPaymentPlan = billPaymentPlans[0]

      if (billPaymentPlan) {
        const existingAssociations = await db.sequelize.query(
          `SELECT bill_payment_plan_id AS "billPaymentPlanId", client_id AS "clientId"
           FROM cd.clients_payment_plans
           WHERE bill_payment_plan_id = :billPaymentPlanId
           AND client_id = :clientId
           LIMIT 1`,
          {
            replacements: {
              clientId,
              billPaymentPlanId: billPaymentPlan.billPaymentPlanId
            },
            type: db.Sequelize.QueryTypes.SELECT,
            transaction
          }
        )

        if (existingAssociations.length === 0) {
          await db.sequelize.query(
            `INSERT INTO cd.clients_payment_plans (bill_payment_plan_id, client_id)
             VALUES (:billPaymentPlanId, :clientId)`,
            {
              replacements: {
                clientId,
                billPaymentPlanId: billPaymentPlan.billPaymentPlanId
              },
              type: db.Sequelize.QueryTypes.INSERT,
              transaction
            }
          )

          paymentPlanAssociation = {
            clientId,
            billPaymentPlanId: billPaymentPlan.billPaymentPlanId
          }
        } else {
          paymentPlanAssociation = existingAssociations[0]
        }
      }

      return {
        bill,
        client,
        paymentPlanAssociation
      }
    })

    res.json({
      message: 'Cliente asociado a la factura correctamente',
      ...result
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  associateClientToBill
}
