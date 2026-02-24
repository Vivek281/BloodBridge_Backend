const jwt = require("jsonwebtoken");
const { AppConfig } = require("../config/app.config");
const { Roles } = require("../config/constants");
const sessionService = require("../services/session.service");


//login and permission

module.exports = (role = null) => {
    return async(req, res, next) => {
        try{
            let token = req.headers["authorization"];
            if(!token){
                next({code: 401, message:"Token is empty", status:"TOKEN_EMPTY_ERR"})
            }else{
                token = token.replace("Bearer ", "");
                const sessionDetail = await sessionService.getSingleRowByFilter({token:token})

                if(!sessionDetail){
                    next({code:404, message:"Token not found...", status:"TOKEN_NOT_FOUND_ERR"});
                }else{
                    jwt.verify(token, AppConfig.jwtSecret)

                    req.loggedInUser = sessionDetail.user;

                    if(role === null || sessionDetail.user.role === Roles.ADMIN || (role && role.includes(sessionDetail.user.role))){
                        next();
                    }else{
                        next({code:403, message:"Access Denied", status:"ACCESS_DENIED_ERROR"})
                    }
                }
            }
        }catch(exception){
            let errorBag ={
                code: 401,
                message:exception.message,
                status:"AUTH_ERR"
            }
            next(errorBag)
        }
    }
}