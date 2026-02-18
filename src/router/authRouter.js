const authRouter = require("express").Router();
const AuthCtrl = require("../controller/AuthController")


authRouter.post("/Register", AuthCtrl.userRegister);


module.exports = authRouter;