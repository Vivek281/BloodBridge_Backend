const userService = require("../services/user.service")

class AuthController {
    userRegister = async (req, res, next) => {
        try {
            // data maping
            const data = await userService.transformForUserRegister(req)
            // data storage
            const userObj = await userService.createUser(data)
            // send email


            res.json({
                data: userService.getPublicUserProfileFromUser(userObj),
                message: "User registered successfully.",
                status: "OK"
            });
        } catch (exception) {
            next(exception);
        }
    }
}

module.exports = new AuthController();