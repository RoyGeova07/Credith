const router = require('express').Router()

const {
  postBill,
} = require('../controllers/bill')

router.post('/bills', postBill)

module.exports = router

