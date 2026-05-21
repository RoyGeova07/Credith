const router = require('express').Router()

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} = require('../controllers/clients')

router.get('/clients', getClients)

router.get('/clients/:id', getClientById)

router.post('/clients', createClient)

router.put('/clients/:id', updateClient)

router.delete('/clients/:id', deleteClient)

module.exports = router
