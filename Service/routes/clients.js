const router = require('express').Router()

const {
  createClient,
  getPagedClients,
  getClientById,
  updateClient,
  deleteClient
} = require('../controllers/clients')

router.get('/clients', getPagedClients)

router.get('/clients/:id', getClientById)

router.post('/clients', createClient)

router.put('/clients/:id', updateClient)

router.delete('/clients/:id', deleteClient)

module.exports = router
