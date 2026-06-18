const router=require('express').Router()
const authMiddleware=require('../middlewares/authMiddleware')
const roleMiddleware=require('../middlewares/roleMiddleware')
const{ROLE}=require('../helper/roles')

const{removeStoreAdmin,getAdminsWithStores}=require('../controllers/adminStoreAssignment')

router.use(authMiddleware,roleMiddleware(ROLE.OWNER))

/**
 * @swagger
 * /api/admin-stores:
 *   get:
 *     summary: Obtener todos los administradores con su tienda asignada
 *     tags: [Admin Stores]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida correctamente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 */
router.get('/',authMiddleware,roleMiddleware(ROLE.OWNER),getAdminsWithStores)



/**
 * @swagger
 * /api/admin-stores/{userId}/store:
 *   delete:
 *     summary: Remover la tienda asignada a un administrador
 *     tags: [Admin Stores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del administrador
 *     responses:
 *       200:
 *         description: Tienda removida correctamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:userId/store',authMiddleware,roleMiddleware(ROLE.OWNER),removeStoreAdmin)

module.exports=router