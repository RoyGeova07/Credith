const{verifyToken}=require('../helper/jwt')


const authMidleware=(req,res,next)=>
{

    try
    {

        const token=req.cookies?.token

        if(!token)
        {

            return res.status(401).json({message:"Token requerido"})

        }
        const decoded=verifyToken(token)
        req.user=decoded

        next()

    }catch(error){

        return res.status(401).json({message:"Token invalido"})

    }

}

module.exports=authMidleware
