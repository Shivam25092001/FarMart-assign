import jwt from "jsonwebtoken";
import asyncCatch from "./catchAsync.js";
import User from "../models/user.model.js";


const isUserAuthentic = asyncCatch( async (req, res, next) => {
    if(req.cookies.token){
    
        const { token } = req.cookies;

        const decodedData = jwt.verify(token, process.env.JWT_SECRET );

        req.user = await User.findById(decodedData.id);
    }
    next();
});


export default isUserAuthentic;