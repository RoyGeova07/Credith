const { Users } = require('../models/entities/user')
const { ROLE } = require('../helper/roles')
const { v4: uuidv4 } = require('uuid')
const { generateToken } = require('../helper/jwt')
const { comparePassword, hashPassword } = require('../helper/bycrypt')
const { Stores } = require('../models/entities/store')
const { Roles } = require('../models/entities/role')
const { CheckoutMachines } = require('../models/entities/checkoutMachine')
const COOKIE_OPTIONS = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: parseInt(process.env.COOKIE_LIFETIME_HOURS || 2) * 60 * 60 * 1000 }

//crear usuario
const createUser = async (req, res) => {

    try {

        const { first_name, second_name, first_last_name, second_last_name, email, password, storeId, role: roleParam } = req.body
        const roleName = roleParam && [ROLE.ADMIN, ROLE.EMPLOYEE].includes(roleParam) ? roleParam : ROLE.EMPLOYEE
        const existingUser = await Users.findOne({ where: { email } })
        if (!first_name || first_name.trim() === "") {

            return res.status(400).json({ message: "El primer nombre es requerido" })

        }
        if (!second_name || second_name.trim() === "") {

            return res.status(400).json({ message: "El segundo nombre es requerido" })

        }
        if (!first_last_name || first_last_name.trim() === "") {

            return res.status(400).json({ message: "El primer apellido es requerido" })

        }
        if (!second_last_name || second_last_name.trim() === "") {

            return res.status(400).json({ message: "El segundo apellido es requerido" })

        }
        if (!email || email.trim() === "") {

            return res.status(400).json({ message: "El correo electronico es requerido" })

        }

        if (!password || password.length < 6) {

            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" })

        }

        if (existingUser) {

            return res.status(400).json({ message: "El email ya existe" })

        }

        if (!storeId || storeId.trim() === "") {

            return res.status(400).json({ message: "La tienda es requerida" });

        }

        const store = await Stores.findByPk(storeId)

        if (!store) {

            return res.status(404).json({ message: "Tienda no encontrada" });

        }

        const hashedPassword = await hashPassword(password)

        const user = await Users.create({ userId: uuidv4(), first_name, second_name, first_last_name, second_last_name, email, password: hashedPassword, storeId })
        const assignedRole = await Roles.findOne({ where: { name: roleName } })
        if (!assignedRole) {

            return res.status(404).json({ message: `El rol ${roleName} no existe` })

        }
        await user.addRole(assignedRole)
        const token = generateToken(user, roleName, storeId)

        //Cookie JWT - guardar el token
        res.cookie('token', token, { ...COOKIE_OPTIONS, httpOnly: true })
        //cookie de sesion - guardar datos del usuario (sin httpOnly para que el frontend pueda leerlo)
        res.cookie('session', JSON.stringify
            ({

                userId: user.userId,
                first_name: user.first_name,
                second_name: user.second_name,
                first_last_name: user.first_last_name,
                second_last_name: user.second_last_name,
                email: user.email,
                role: roleName,
                checkoutMachine: null

            }), COOKIE_OPTIONS);


        res.status(201).json({ message: "Usuario registrado existosamente", user })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }



}


//delete usuario
const desactivateUser = async (req, res) => {

    try {

        const { id } = req.params

        const user = await Users.findByPk(id)

        if (!user) {

            return res.status(404).json({ message: "Usuario no encontrado" })

        }

        if (!user.isActive) {

            return res.status(400).json({ message: "El usuario ya esta desactivado" })

        }

        await user.update({ isActive: false })

        res.json({ message: "Usuario desactivado" })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const activateUser = async (req, res) => {

    const { id } = req.params
    try {

        const user = await Users.findByPk(id)
        if (!user) {

            return res.status(404).json({ message: "Usuario no encontrado" })

        }

        //el usuario ya esta activo
        if (user.isActive) {

            return res.status(400).json({ message: "El usuario ya esta activo" })

        }

        await user.update({ isActive: true })

        res.json({ message: "Usuario activado" })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }


}

//actualizar contraseña
const updatePassword = async (req, res) => {

    try {

        const id = req.user.id
        const { currentPassword, newPassword } = req.body
        const user = await Users.findByPk(id)
        if (!user) {

            return res.status(404).json({ message: "Usuario no encontrado" })

        }
        if (!newPassword || newPassword.length < 6) {

            return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" })

        }
        const validPassword = await comparePassword(currentPassword, user.password)
        if (!validPassword) {

            return res.status(400).json({ message: "La contraseña actual es incorrecta" })

        }
        const hashedPassword = await hashPassword(newPassword)//hashear la nueva contra
        await user.update({ password: hashedPassword })//actualizar
        res.json({ message: "Contraseña actualizada correctamente" })



    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}


const getPagedUsers = async (req, res) => {

    try {

        const limit = parseInt(req.query.limit) || 10
        const offset = parseInt(req.query.offset) || 0

        //                      mas profesional :O
        const users = await Users.findAndCountAll({
            limit, offset, attributes: { exclude: ["password"] },

            include: [
                {

                    model: Roles,
                    as: "roles",
                    through: { attributes: [] },
                    attributes: ["roleId", "name", "description",]

                }]

        })

        res.json({ total: users.count, data: users.rows })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}


const getUserById = async (req, res) => {

    try {

        const { id } = req.params
        const user = await Users.findByPk(id, {
            attributes: { exclude: ["password"] },

            include: [
                {

                    model: Roles,
                    as: "roles",
                    through: { attributes: [] },
                    attributes: ["roleId", "name", "description",]

                }]

        })

        if (!user) {

            return res.status(404).json({ message: "Usuario no encontrado" })

        }

        res.json(user)

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}


const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || email.trim() === "") {

            return res.status(400).json({ message: "El correo electronico es requerido" })

        }

        if (!password) {

            return res.status(400).json({ message: "La contraseña es requerida" })

        }

        const user = await Users.findOne(
            {
                where: {
                    email
                },
                include: [
                    {
                        model: Roles,
                        as: 'roles',
                        through: {
                            attributes: []
                        }
                    },
                    {
                        model:
                            CheckoutMachines,
                        as: 'checkoutMachine'
                    },
                    {
                        model: Stores,
                        as: 'store',
                    }
                ]
            }
        )

        if (!user) {

            return res.status(404).json({ message: "Credenciales incorrectas" })

        }

        const validPassword = await comparePassword(password, user.password)

        if (!validPassword) {

            return res.status(404).json({ message: "Credenciales incorrectas" })

        }

        //se toma el primer rol
        const roleName = user.roles?.[0]?.name ?? ROLE.EMPLOYEE

        const token = generateToken(user, roleName, user.storeId)

        //Cookie 1: JWT — HttpOnly,el browser la envia automaticamente
        res.cookie('token', token, { ...COOKIE_OPTIONS, httpOnly: true })

        //Cookie 2: datos de sesion — legible desde el frontend (sin HttpOnly)
        res.cookie('session', JSON.stringify({
            userId: user.userId,
            first_name: user.first_name,
            second_name: user.second_name,
            first_last_name: user.first_last_name,
            second_last_name: user.second_last_name,
            email: user.email,
            role: roleName,
            storeId:user.storeId,
            storeAddress:user.store?.address??null,
            checkoutMachine: user.checkoutMachine
                ? {

                    checkoutMachineId: user.checkoutMachine.checkoutMachineId,
                    name: user.checkoutMachine.name,
                    machineNumber: user.checkoutMachine.machineNumber

                } : null
        }), COOKIE_OPTIONS)

        res.json({ message: "Inicio de sesión exitoso" })

    } catch (error) {

        console.error("LOGIN ERROR:")
        console.error(error)
        res.status(500).json({ message: error.message })

    }

}

const logoutUser = (req, res) => {

    res.clearCookie('token')
    res.clearCookie('session')
    res.json({ message: "Sesión cerrada" })

}

const getPagedEmployees = async (req, res) => {

    try {

        const limit = parseInt(req.query.limit) || 10
        const offset = parseInt(req.query.offset) || 0

        const users = await Users.findAndCountAll({

            limit, offset, attributes: { exclude: ["password"] }, include: [{ model: Roles, as: "roles", through: { attributes: [] }, attributes: ["roleId", "name", "description"] }]

        })
        res.json({ total: users.count, data: users.rows })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}


module.exports = { createUser, desactivateUser, activateUser, getPagedUsers, getUserById, updatePassword, loginUser, logoutUser, getPagedEmployees, }
