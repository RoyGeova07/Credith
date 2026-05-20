const router = require('express').Router()

const {
  createCheckoutMachine,
  getCheckoutMachines,
  getCheckoutMachineById,
  updateCheckoutMachine,
  deactivateCheckoutMachine,
  activateCheckoutMachine,
  deleteCheckoutMachine
} = require('../controllers/checkoutMachines')

router.get('/checkout-machines', getCheckoutMachines)

router.get('/checkout-machines/:id', getCheckoutMachineById)

router.post('/checkout-machines', createCheckoutMachine)

router.put('/checkout-machines/:id', updateCheckoutMachine)

router.put('/checkout-machines/deactivate/:id', deactivateCheckoutMachine)

router.put('/checkout-machines/activate/:id', activateCheckoutMachine)

router.delete('/checkout-machines/:id', deleteCheckoutMachine)

module.exports = router
