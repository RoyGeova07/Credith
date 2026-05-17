const router = require('express').Router()

const {
  createCai,
  getCais,
  deleteCai
} = require('../controllers/cai')

router.get('/cais', getCais)

router.post('/cais', createCai)

router.delete('/cais/:id', deleteCai)

module.exports = router