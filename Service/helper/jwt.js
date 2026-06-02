const jwt=require("jsonwebtoken")

const generateToken=(user,role)=>
{

    return jwt.sign({id:user.userId,email:user.email,role},process.env.JWT_SECRET,{expiresIn:`${process.env.COOKIE_LIFETIME_HOURS||2}h`})

}

const verifyToken=(token)=>
{

    return jwt.verify(token,process.env.JWT_SECRET)

}

module.exports={generateToken,verifyToken}