const router=require("express").Router()
const authMiddleware=require("../middlewares/authMiddleware")

const{createUser,getPagedUsers, getUserById, desactivateUser, activateUser,updatePassword,loginUser,logoutUser}=require("../controllers/users")

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios paginados
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         description: Cantidad de usuarios a mostrar
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
 *         description: Lista de usuarios obtenida correctamente
 */
router.get("/users",getPagedUsers)

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
 *               - storeId
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
 *                 format: email
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la tienda a la que pertenece el usuario
 *                 example: b75438e5-9ae8-4597-b95e-9889028f4737
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos, email existente o tienda inválida
 *       404:
 *         description: Tienda no encontrada
 */
router.post("/users",createUser)


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       404:
 *         description: Credenciales incorrectas
 */
router.post("/users/login",loginUser)

/**
 * @swagger
 * /api/users/desactivate/{id}:
 *   put:
 *     summary: Desactivar un usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Cerrar sesión del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post("/users/logout", logoutUser)

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


module.exports=router