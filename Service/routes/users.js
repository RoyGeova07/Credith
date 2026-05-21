const router=require("express").Router()
const authMiddleware=require("../middlewares/authMiddleware")

const{createUser,getUsers, getUserById, desactivateUser, activateUser,updatePassword}=require("../controllers/users")

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/users",getUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/users/:id",getUserById)

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - second_name
 *               - first_last_name
 *               - second_last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Juan
 *               second_name:
 *                 type: string
 *                 example: Carlos
 *               first_last_name:
 *                 type: string
 *                 example: Perez
 *               second_last_name:
 *                 type: string
 *                 example: Lopez
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos o email ya existente
 */
router.post("/users",createUser)


/**
 * @swagger
 * /api/users/desactivate/{id}:
 *   put:
 *     summary: Desactivar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       400:
 *         description: El usuario ya está desactivado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.put("/users/desactivate/:id",authMiddleware,desactivateUser)

/**
 * @swagger
 * /api/users/activate/{id}:
 *   put:
 *     summary: Activar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario activado correctamente
 *       400:
 *         description: El usuario ya está activo
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.put("/users/activate/:id",authMiddleware,activateUser)


/**
 * @swagger
 * /api/users/update-password:
 *   put:
 *     summary: Actualizar contraseña del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: nuevaPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Contraseña inválida o incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.put("/users/update-password/",authMiddleware,updatePassword)

module.exports=router