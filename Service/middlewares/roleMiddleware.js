const { ROLE } = require('../helper/roles')

const roleMiddleware=(...allowedRoles)=>
{

    return(req,res,next)=>
    {

        if(!req.user)
        {

            return res.status(401).json({message:"Usuario no autenticado"})

        }
        const userRole=req.user.role||ROLE.EMPLOYEE
        if(!allowedRoles.includes(userRole))
        {

            return res.status(403).json({message:"No tienes permiso para realizar esta accion"})

        }
        next()

    }

}

module.exports=roleMiddleware