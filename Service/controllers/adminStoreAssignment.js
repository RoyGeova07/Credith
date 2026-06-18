const{Users}=require('../models/entities/user')
const { Stores }= require('../models/entities/store')
const { Roles }=require('../models/entities/role')


async function removeStoreAdmin(req,res) 
{

    try
    {

        const{userId}=req.params
        const user=await Users.findByPk(userId)
        if(!user){

            return res.status(404).json({message:'Usuario no encontrado'})

        }
        await user.update({storeId:null})

        return res.status(200).json({message:'Tienda removida correctamente'})

    }catch(error){

        return res.status(500).json({message:error.message})

    }

}

async function getAdminsWithStores(req,res) 
{

    try
    {

        const admins=await Users.findAll({

            include:[

                {

                    model:Roles,as:'roles',where:{name:"ADMIN"},attributes:['roleId','name'],through:{attributes:[]},},
                    {

                        model:Stores,as:'store'

                    }

            ]

        })  
        return res.status(200).json(admins)

    }catch(error){

        return res.status(500).json({message:error.message})

    }

}

module.exports={removeStoreAdmin,getAdminsWithStores}