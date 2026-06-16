const router = require('express').Router()

const {
  createClient,
  getPagedClients,
  getClientById,
  updateClient,
  deleteClient
} = require('../controllers/clients')

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Obtener todos los clientes paginados
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de clientes a mostrar
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *         description: Cantidad de registros a omitir
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clientId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       dni:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       500:
 *         description: Error interno del servidor
 */
router.get('/clients', getPagedClients)

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/clients/:id', getClientById)

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               dni:
 *                 type: string
 *                 example: "0801-1990-12345"
 *               phone:
 *                 type: string
 *                 example: "9999-9999"
 *               address:
 *                 type: string
 *                 example: Tegucigalpa, Honduras
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       400:
 *         description: Nombre requerido o DNI ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/clients', createClient)

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               dni:
 *                 type: string
 *                 example: "0801-1990-12345"
 *               phone:
 *                 type: string
 *                 example: "8888-8888"
 *               address:
 *                 type: string
 *                 example: San Pedro Sula, Cortés
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       400:
 *         description: Nombre vacío o DNI ya existe en otro cliente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/clients/:id', updateClient)

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/clients/:id', deleteClient)

module.exports = router
