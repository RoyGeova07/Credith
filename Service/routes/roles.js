const router = require('express').Router()

const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require('../controllers/roles')

router.get('/roles', getRoles)

router.get('/roles/:id', getRoleById)

router.post('/roles', createRole)

router.put('/roles/:id', updateRole)

router.delete('/roles/:id', deleteRole)

module.exports = router
