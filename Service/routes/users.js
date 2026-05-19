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

router.post("/users",createUser)

router.put("/users/desactivate/:id",authMiddleware,desactivateUser)

router.put("/users/activate/:id",authMiddleware,activateUser)

router.put("/users/update-password/",authMiddleware,updatePassword)

module.exports=router