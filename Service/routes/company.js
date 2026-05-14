const router = require('express').Router()

const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/company')

router.get('/companies', getCompanies)

router.get('/companies/:id', getCompanyById)

router.post('/companies', createCompany)

router.put('/companies/:id', updateCompany)

router.delete('/companies/:id', deleteCompany)

module.exports = router
