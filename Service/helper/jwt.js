const jwt=require("jsonwebtoken")

const generateToken=(user)=>
{

    return jwt.sign({id:user.userId,email:user.email},process.env.JWT_SECRET,{expiresIn:"23h"})

}

const verifyToken=(token)=>
{

    return jwt.verify(token,process.env.JWT_SECRET)

}

module.exports={generateToken,verifyToken}