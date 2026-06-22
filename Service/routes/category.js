const router = require('express').Router()
const authMiddleware=require("../middlewares/authMiddleware")
const roleMiddleware=require("../middlewares/roleMiddleware")
const { ROLE } = require('../helper/roles')


const{createCategory,getPagedCategories,updateCategory,activateCategory,deactivateCategory,}=require('../controllers/category')

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tecnologia
 *               description:
 *                 type: string
 *                 example: Categoria de productos tecnologicos
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Datos inválidos o categoría ya existente
 */
router.post('/categories',authMiddleware,roleMiddleware(ROLE.OWNER),createCategory)

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente
 */
router.get('/categories',authMiddleware,roleMiddleware(ROLE.OWNER,ROLE.ADMIN,ROLE.EMPLOYEE),getPagedCategories)

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hogar
 *               description:
 *                 type: string
 *                 example: Categoria de productos para el hogar
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *       400:
 *         description: Datos inválidos o categoría duplicada
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/categories/:categoryId',authMiddleware,roleMiddleware(ROLE.OWNER),updateCategory)

/**
 * @swagger
 * /api/categories/{categoryId}/activate:
 *   patch:
 *     summary: Activar una categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría activada correctamente
 *       404:
 *         description: Categoría no encontrada
 */
router.patch('/categories/:categoryId/activate',authMiddleware,roleMiddleware(ROLE.OWNER),activateCategory)

/**
 * @swagger
 * /api/categories/{categoryId}/deactivate:
 *   patch:
 *     summary: Desactivar una categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría desactivada correctamente
 *       404:
 *         description: Categoría no encontrada
 */
router.patch('/categories/:categoryId/deactivate',authMiddleware,roleMiddleware(ROLE.OWNER),deactivateCategory)

module.exports=router