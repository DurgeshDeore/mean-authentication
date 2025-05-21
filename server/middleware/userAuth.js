import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;
    if(!token) {
        return res.json({sucess: false, message: "Not Authorized user, Login Again!"});
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode.id){
            // req.body.userId = tokenDecode.id;
            req.user = { id: tokenDecode.id }; // standard practice
        }else{
            return res.json({sucess: false, message: "Not Authorized user, Login Again!"});
        }
        next();
    } catch (error) {
        res.json({sucess: false, message: error.message});
    }
}
export default userAuth;

