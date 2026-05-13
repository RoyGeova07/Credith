const user = require('../models/entities/user')
const{Users}=require('../models/entities/user')
const{v4:uuidv4}=require('uuid')
const{generateToken}=require('../helper/jwt')
const{comparePassword,hashPassword}=require('../helper/bycrypt')

//crear usuario
const createUser=async(req,res)=>
{

    try
    {

        const{first_name,second_name,first_last_name,second_last_name,email,password}=req.body
        const existingUser=await Users.findOne({where:{email}})
        const hashedPassword=await hashPassword(password)
        if(!first_name||first_name.trim()==="")
        {

            return res.status(400).json({message:"El primer nombre es requerido"})

        }
        if(!second_name||second_name.trim()==="")
        {

            return res.status(400).json({message:"El segundo nombre es requerido"})

        }
        if(!first_last_name||first_last_name.trim()==="")
        {

            return res.status(400).json({message:"El primer apellido es requerido"})

        }
        if(!second_last_name||second_last_name.trim()==="")
        {

            return res.status(400).json({message:"El segundo apellido es requerido"})

        }
        if(!email||email.trim()==="")
        {

            return res.status(400).json({message:"El correo electronico es requerido"})

        }

        if(!password||password.length<6){

            return res.status(400).json({message:"La contraseña debe tener al menos 6 caracteres"})

        }

        if(existingUser)
        {

            return res.status(400).json({message:"El email ya existe"})

        }

        //                                                                                                          contra encriptada :O
        const user=await Users.create({userId:uuidv4(),first_name,second_name,first_last_name,second_last_name,email,password:hashedPassword})

        const token=generateToken(user)

        res.status(201).json({message:"Usuario registrado existosamente",token,user})

    }catch(error){

        res.status(500).json({message:error.message})

    }

   

}


//delete usuario
const desactivateUser=async(req,res)=>
{

    try
    {

        const{id}=req.params

        const user=await Users.findByPk(id)

        if(!user)
        {

            return res.status(404).json({message:"Usuario no encontrado"})

        }

        if(!user.isActive)
        {

            return res.status(400).json({message:"El usuario ya esta desactivado"})

        }

        await user.update({isActive:false})

        res.json({message:"Usuario desactivado"})

    }catch(error){

        res.status(500).json({message:error.message})

    }

}

const activateUser=async(req,res)=>
{

    const{id}=req.params
    try
    {

        const user=await Users.findByPk(id)
        if(!user)
        {

            return res.status(404).json({message:"Usuario no encontrado"})

        }

        //el usuario ya esta activo
        if(user.isActive)
        {

            return res.status(400).json({message:"El usuario ya esta activo"})

        }

        await user.update({isActive:true})

        res.json({message:"Usuario activado"})

    }catch(error){

        res.status(500).json({message:error.message})

    }


}

//actualizar contraseña
const updatePassword=async(req,res)=>
{

    try
    {

        const id=req.user.id
        const{currentPassword,newPassword}=req.body
        const user=await Users.findByPk(id)
        if(!user)
        {

            return res.status(404).json({message:"Usuario no encontrado"})

        }
        if(!newPassword||newPassword.length<6)
        {

            return res.status(400).json({message:"La nueva contraseña debe tener al menos 6 caracteres"})

        }
        const validPassword=await comparePassword(currentPassword,user.password)
        if(!validPassword)
        {

            return res.status(400).json({message:"La contraseña actual es incorrecta"})

        }
        const hashedPassword=await hashPassword(newPassword)//hashear la nueva contra
        await user.update({password:hashedPassword})//actualizar
        res.json({message:"Contraseña actualizada correctamente"})



    }catch(error){

        res.status(500).json({message:error.message})

    }   

}

//obtener todos los usuario
//=================AVISO=======================================
//RECORDATORIO:QUITAR LA PASSWORD DE LOS USUARIOS AL LISTARLOS, NO LO QUITO PORQUE SE ME OLVIDAN LAS CONTRASEÑAS XD
//=================AVISO=======================================

const getUsers=async(req,res)=>
{

    try
    {

        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0

        //                      mas profesional :O
        const users=await Users.findAndCountAll({limit,offset})

        res.json({total:users.count,users:users.rows})

    }catch(error){

        res.status(500).json({message:error.message})

    }

}

//get by id
//recordatorio de quitar la password al momento de mostrar el usuario
const getUserById=async(req,res)=>
{

    try
    {

        const{id}=req.params
        const user=await Users.findByPk(id)

        if(!user)
        {

            return res.status(404).json({message:"Usuario no encontrado"})

        }

        res.json(user)

    }catch(error){

        res.status(500).json({message:error.message})

    }

}


module.exports={createUser,desactivateUser,activateUser,getUsers,getUserById,updatePassword}