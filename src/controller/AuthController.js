const userService = require("../services/user.service")
const { randomStringGenerator } = require("../utilities/helper")
const {Status} = require("../config/constants")
const sessionService = require("../services/session.service")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { AppConfig } = require("../config/app.config")

class AuthController {
    userRegister = async (req, res, next) => {
        try {
            // data maping
            const data = await userService.transformForUserRegister(req)
            // data storage
            const userObj = await userService.createUser(data)
            // send email
            await userService.sendActivationEmail(userObj)

            res.json({
                data: userService.getPublicUserProfileFromUser(userObj),
                message: "User registered successfully.",
                status: "OK"
            });
        } catch (exception) {
            next(exception);
        }
    }
    // Making the user's status active through email.
    activateUser = async (req, res, next) =>{
        try{
            const token = req.params.token;
            const userDetail = await userService.getSingleUserByFilter({
                activationToken : token
            });
            if(!userDetail){
                res.redirect("http://localhost:5173/?status=error&msg=Token does not associate with any user.");
                // we are not allowed to throw any error here
            }else{
                const today = Date.now();
                if(today > userDetail.expiryTime){
                    res.redirect("http://localhost:5173/?expired=1&status=error&msg=Activation link is expired, please request another link")
                     // we are not allowed to throw any error here.
                }else{
                    const activationBody = {
                        status: Status.ACTIVE,
                        activationToken: null,
                        expiryTime: null
                    }
                    const updatedUser = await userService.updateSingleRowByFilter({_id:userDetail._id}, activationBody); // We've built a function for this with findOneAndUpdate method whcih takes two parameter: a filter for finding the user and and the data object to update the corresponding data.
                    res.redirect("http://localhost:5173/?stauts=activationSuccess&msg=Your account has been activated successfully")
                }
            }
        }
        catch(exception){
            res.redirect("http://localhost:5173/?status=error&msg=Activation failed.");
        }
    }
    resendActivationLink = async(req, res, next) => {
        try{
            const token = req.params.token;
            const userDetail = await userService.getSingleUserByFilter({
                activationToken : token
            });
            if(!userDetail){
                throw{
                    code:404,
                    message:"Token doen not associate with any user.",
                    status:"INVALID_TOKEN_ERR",
                };
            }
            const today = Date.now();
            if(today <= userDetail.expiryTime){
                throw{
                    code:422,
                    message:"Token is not expired. Please try clicking the link again.",
                    status:"TOKEN_NOT_EXPIRED_ERR"
                }
            }
            // In case of expired
            const activationBody = {
                status: Status.INACTIVE,
                activationToken: randomStringGenerator(),
                expiryTime: new Date(today + 86400000),
            }

            // update
            const user = await userService.updateSingleRowByFilter({_id:userDetail._id}, activationBody);
            // Resending the email 
            await userService.reSendActivationEmail(user);

            res.json({
                data:activationBody,
                message:"Link has been forwarded to your registered email",
                status: "OK"
            });

        }catch(exception){
            next(exception);
        }
    };

    userLogin = async(req, res, next) =>{
        try {
            const {email, password} = req.body;
            const userDetail = await userService.getSingleUserByFilter({email: email})
            // email verify
            if(!userDetail) {
              throw {code: 404, message: "User not registered", status: "USER_NOT_REGISTERED_ERR"}
            }
            // activation verify
            if(userDetail.status !== Status.ACTIVE) {
              throw {code: 422, message: "Your account is not active yet.", status: "NOT_ACTIVATED_ERR"}
            }
            // password verify
            if(!bcrypt.compareSync(password, userDetail.password)) {
              throw {code: 422, message: "Credentials does not match", status: "CREDENTIAL_ERR"}
            }
            // if we found the user and the possword did match
            const accessToken = jwt.sign({sub:userDetail._id}, AppConfig.jwtSecret, {expiresIn:"1d"})

            const session = await sessionService.storeSession({
                user:userDetail._id,
                token: accessToken,
                device:"web"
            })
            res.json({
                data:{
                    token:accessToken,
                    sessionId:session._id
                },
                message:"You are logged in successfully",
                status:"LOGIN_SUCCESS"
            })
            
          } catch(exception) {
            next(exception)
          }
    };
 
    getLoggedInUserProfile = (req, res, next) =>{
        res.json({
            data: req.loggedInUser,
            message: "User ID",
            status: "OK"
        })
    }

        // Logout 
        async logout(req, res, next) {
            try{
                const userId = req.loggedInUser._id;
                await sessionService.deleteSingleRowByFilter({
                    user:userId
                })
                res.json({
                    data:null,
                    message: "You are logged out successfully.",
                    status: "LOGOUT_SUCCESS"
                })
            }catch(exception){
                next(exception);
            }
        }

        updateUserProfile = async(req, res, next) => {
            try{
               const id = req.loggedInUser._id
               const filter = {_id : id};
               const data = {...req.body}
                const updatedUser = await userService.updateSingleRowByFilter(filter, data)
                res.json({
                    data:updatedUser,
                    message:"Data updated successfully.",
                    status: "UPDATE_SUCCESS"
                })
            }catch(exception){
                next(exception);
            }
        }

}

module.exports = new AuthController();