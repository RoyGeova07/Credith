const router = require('express').Router()

const {
  createCheckoutMachine,
  getCheckoutMachines,
  getCheckoutMachineById,
  updateCheckoutMachine,
  deactivateCheckoutMachine,
  activateCheckoutMachine,
  associateUserToCheckoutMachine,
  deleteCheckoutMachine
} = require('../controllers/checkoutMachines')

router.get('/checkout-machines', getCheckoutMachines)

router.get('/checkout-machines/:id', getCheckoutMachineById)

router.post('/checkout-machines', createCheckoutMachine)

router.put('/checkout-machines/:id', updateCheckoutMachine)

router.put('/checkout-machines/deactivate/:id', deactivateCheckoutMachine)

router.put('/checkout-machines/activate/:id', activateCheckoutMachine)

router.put('/checkout-machines/:id/associate-user', associateUserToCheckoutMachine)

router.delete('/checkout-machines/:id', deleteCheckoutMachine)

module.exports = router
