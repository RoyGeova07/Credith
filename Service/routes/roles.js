const router = require('express').Router()

const {
  createRole,
  getPagedRoles,
  getRoleById,
  updateRole,
  deleteRole,
  associateRoleToUser
} = require('../controllers/roles')

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de roles a mostrar
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
 *         description: Lista de roles obtenida correctamente
 */
router.get('/roles', getPagedRoles)

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 */
router.get('/roles/:id', getRoleById)

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
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
 *                 enum: [Employee, Admin, Owner]
 *                 example: Admin
 *               description:
 *                 type: string
 *                 example: Rol con acceso administrativo
 *     responses:
 *       201:
 *         description: Rol creado correctamente
 *       400:
 *         description: Datos inválidos o rol ya existente
 */
router.post('/roles', createRole)

/**
 * @swagger
 * /api/roles/associate-user:
 *   post:
 *     summary: Asociar un rol a un usuario
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *               roleId:
 *                 type: string
 *                 example: a12345e5-9ae8-4597-b95e-9889028f1111
 *     responses:
 *       201:
 *         description: Rol asociado al usuario correctamente
 *       400:
 *         description: Datos inválidos o el usuario ya tiene ese rol
 *       404:
 *         description: Usuario o rol no encontrado
 */
router.post('/roles/associate-user', associateRoleToUser)

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rol
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
 *                 enum: [Employee, Admin, Owner]
 *                 example: Owner
 *               description:
 *                 type: string
 *                 example: Rol propietario del sistema
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 *       400:
 *         description: Datos inválidos o rol duplicado
 *       404:
 *         description: Rol no encontrado
 */
router.put('/roles/:id', updateRole)

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rol eliminado correctamente
 *       404:
 *         description: Rol no encontrado
 */
router.delete('/roles/:id', deleteRole)

module.exports = router
