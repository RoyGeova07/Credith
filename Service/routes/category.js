const router = require('express').Router()


const{createCategory,getCategories,updateCategory,activateCategory,deactivateCategory}=require('../controllers/category')


router.post('/categories',createCategory)
router.get('/categories',getCategories)
router.put('/categories/:categoryId',updateCategory)
router.patch('/categories/:categoryId/activate',activateCategory)
router.patch('/categories/:categoryId/deactivate',deactivateCategory)

module.exports=router