const bcrypt = require("bcryptjs");
const { Status } = require("../config/constants");
const { randomStringGenerator } = require("../utilities/helper");
const UserModel = require("../models/User.model")

class userService {
    transformForUserRegister = (req) => {
        try {
            const data = req.body;
            //password hashing (bcrypt, argon)
            data.password = bcrypt.hashSync(data.password, 12) // the password and salt values as parameters
            //activation step
            data.status = Status.INACTIVE
            data.activationToken = randomStringGenerator();
            data.expiryTime = new Date(Date.now() + 86400000)
            // Expecting longitude and latitude from the frontend
            if (data.longitude && data.latitude) {
                data.location = {
                    type: "Point",
                    coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
                };
            }
            return data
        } catch (exception) {
            throw exception;
        }
    }
    createUser = async(data)=> {
        try{
          const userObj = new UserModel(data)
          await userObj.save()
          return userObj
        }catch(exception){
          throw exception
        }
      }
      getPublicUserProfileFromUser = (userObj)=>{
        return{
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          address: userObj.address,
          bloodGroup: userObj.bloodGroup,
          phone: userObj.phone,
          status: userObj.status,
          _id: userObj._id,
          location : userObj.location,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
            

        }
    }
}

module.exports = new userService;