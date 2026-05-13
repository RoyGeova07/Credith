const router=require("express").Router()
const authMiddleware=require("../middlewares/authMiddleware")

const{createUser,getUsers, getUserById, desactivateUser, activateUser,updatePassword}=require("../controllers/users")

router.get("/users",getUsers)

router.get("/users/:id",getUserById)

router.post("/users",createUser)

router.put("/users/desactivate/:id",authMiddleware,desactivateUser)

router.put("/users/activate/:id",authMiddleware,activateUser)

router.put("/users/update-password/",authMiddleware,updatePassword)

module.exports=router