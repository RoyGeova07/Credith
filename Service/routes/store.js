const router = require('express').Router()

const {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deactivateStore,
  activateStore
} = require('../controllers/store')

router.get('/stores', getStores)

router.get('/stores/:id', getStoreById)

router.post('/stores', createStore)

router.put('/stores/:id', updateStore)

router.put('/stores/deactivate/:id', deactivateStore)

router.put('/stores/activate/:id', activateStore)

module.exports = router
