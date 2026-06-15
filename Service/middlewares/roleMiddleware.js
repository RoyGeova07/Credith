const roleMiddleware=(...allowedRoles)=>
{

    return(req,res,next)=>
    {

        if(!req.user)
        {

            return res.status(401).json({message:"Usuario no autenticado"})

        }
        let userRole=req.user.role
        if(!userRole||userRole==="sin-rol")
        {

            userRole="Employee"

        }
        if(!allowedRoles.includes(userRole))
        {

            return res.status(403).json({message:"No tienes permiso para realizar esta accion"})

        }
        next()

    }

}

module.exports=roleMiddleware