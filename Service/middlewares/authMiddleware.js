const{verifyToken}=require('../helper/jwt')


const authMidleware=(req,res,next)=>
{

    try
    {

        const authHeader=req.headers.authorization

        if(!authHeader)
        {

            return res.status(401).json({message:"Token requerido"})

        }

        const token=authHeader.split(" ")[1]
        const decoded=verifyToken(token)

        req.user=decoded

        next()

    }catch(error){

        return res.status(401).json({message:"Token invalido"})

    }

}

module.exports=authMidleware
