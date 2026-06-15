const router = require('express').Router()
const authMiddleware=require("../middlewares/authMiddleware")
const roleMiddleware=require("../middlewares/roleMiddleware")

const {
  createCompany,
  getPagedCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/company')


/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Obtener todas las empresas
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Cantidad de empresas a mostrar
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *         description: Cantidad de registros a omitir
 *     responses:
 *       200:
 *         description: Lista de empresas obtenida correctamente
 */
router.get('/companies', authMiddleware,roleMiddleware("OWNER"),getPagedCompanies)

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Obtener empresa por ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: Empresa no encontrada
 */
router.get('/companies/:id', authMiddleware,roleMiddleware("OWNER"),getCompanyById)


/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Crear una nueva empresa
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rtn
 *             properties:
 *               name:
 *                 type: string
 *                 example: ServiCredit
 *               rtn:
 *                 type: string
 *                 example: 08011999123456
 *               email:
 *                 type: string
 *                 example: contacto@servicredit.com
 *               address:
 *                 type: string
 *                 example: San Pedro Sula, Cortes
 *     responses:
 *       201:
 *         description: Empresa creada correctamente
 *       400:
 *         description: Datos inválidos o RTN ya existente
 */
router.post('/companies',authMiddleware,roleMiddleware("OWNER"),createCompany)

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Actualizar una empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ServiCredit Updated
 *               rtn:
 *                 type: string
 *                 example: 08011999123456
 *               email:
 *                 type: string
 *                 example: nuevo@servicredit.com
 *               address:
 *                 type: string
 *                 example: Tegucigalpa, Honduras
 *     responses:
 *       200:
 *         description: Empresa actualizada correctamente
 *       400:
 *         description: Datos inválidos o RTN duplicado
 *       404:
 *         description: Empresa no encontrada
 */
router.put('/companies/:id', authMiddleware,roleMiddleware("OWNER"),updateCompany)

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Eliminar una empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa eliminada correctamente
 *       404:
 *         description: Empresa no encontrada
 */
router.delete('/companies/:id', authMiddleware,roleMiddleware("OWNER"),deleteCompany)

module.exports = router
