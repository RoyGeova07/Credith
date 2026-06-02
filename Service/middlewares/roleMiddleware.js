const roleMiddleware=(...allowedRoles)=>
{

    return(req,res,next)=>
    {

        if(!req.user)
        {

            return res.status(401).json({message:"Usuario no autenticado"})

        }
        if(!allowedRoles.includes(req.user.role))
        {

            return res.status(403).json({message:"No tienes permiso para realizar esta accion"})

        }
        next()

    }

}

module.exports=roleMiddleware