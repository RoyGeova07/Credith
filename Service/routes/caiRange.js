const router = require('express').Router()

const {
  createCaiRange,
  getCaiRanges,
  getCaiRangesByCai,
  getCaiRangeById,
  updateCaiRange,
  deleteCaiRange
} = require('../controllers/caiRange')

router.get('/cai-ranges', getCaiRanges)

router.get('/cais/:caiId/ranges', getCaiRangesByCai)

router.get('/cai-ranges/:id', getCaiRangeById)

router.post('/cai-ranges', createCaiRange)

router.put('/cai-ranges/:id', updateCaiRange)

router.delete('/cai-ranges/:id', deleteCaiRange)

module.exports = router