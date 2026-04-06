const bcrypt = require("bcryptjs");
const { Status } = require("../config/constants");
const { randomStringGenerator } = require("../utilities/helper");
const UserModel = require("../models/User.model")
const mailerSerivce = require("./mailer.service");
const {AppConfig} = require("../config/app.config");

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
  createUser = async (data) => {
    try {
      const userObj = new UserModel(data)
      await userObj.save()
      return userObj
    } catch (exception) {
      throw exception
    }
  }

  //Sending and activaation email
  async sendActivationEmail(userObj) {
    try {
      return await mailerSerivce.sendMail({
        to: userObj.email,
        subject: "Activate your account",
        message: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #fff5f5; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(185, 28, 28, 0.1); border: 1px solid #fee2e2;">

                      <!-- Header/Logo Area -->
                      <div style="background-color: #b91c1c; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">BloodBridge</h1>
                        <p style="color: #fecaca; margin: 5px 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">Connecting Life, One Drop at a Time</p>
                      </div>

                      <div style="padding: 40px 30px;">
                        <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Welcome to the Bridge, ${userObj.name}!</h2>
                        
                        <!-- Hero Quote Section -->
                        <div style="border-left: 4px solid #b91c1c; color: #b91c1c; padding: 15px 20px; background: #fef2f2; border-radius: 4px; margin: 25px 0;">
                          <p style="margin: 0; font-style: italic; font-size: 16px; line-height: 1.5;">
                            "Every drop of blood donated is a sunrise for someone else."
                          </p>
                          <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold; opacity: 0.8;">Activate your account to start saving lives.</p>
                        </div>

                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                          Your registration as a potential lifesaver is <strong style="color: #b91c1c;">successful</strong>. You are now one step away from joining a community that bridges the gap between donors and patients in urgent need.
                        </p>

                        <!-- Action Button -->
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}"
                            style="background-color: #b91c1c; color: #ffffff; padding: 18px 45px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; transition: all 0.2s ease;">
                            Verify My Account
                          </a>
                        </div>

                        <!-- Alternate Link Section -->
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px;">
                          <p style="color: #4b5563; font-size: 14px; margin-top: 0; font-weight: bold;">Problem with the button? Copy and paste this link:</p>
                          <p style="margin: 5px 0 0; word-break: break-all;">
                            <a href="${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}" style="color: #b91c1c; font-size: 13px; text-decoration: underline;">
                              ${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}
                            </a>
                          </p>
                        </div>

                        <!-- Footer Disclaimer -->
                        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 40px 0;">
                        
                        <p style="color: #111827; font-size: 15px; margin-bottom: 4px;">Thank you,<br/><span style="font-weight: bold; color: #b91c1c;">BloodBridge Admin Team</span></p>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                            <em>You received this email because you signed up for BloodBridge. If this wasn't you, please ignore this email. No further action is required.</em>
                          </p>
                          <p style="color: #b91c1c; font-size: 12px; font-weight: bold; margin-top: 10px;">
                            Privacy Policy | Community Guidelines
                          </p>
                        </div>
                      </div>
                </div>
          </div>
            `,
      });
    } catch (exception) {
      throw exception;
    }
  }
  // Re-sending the activation email
  async reSendActivationEmail(userObj) {
    try {
      return await mailerSerivce.sendMail({
        to: userObj.email,
        subject: "Re-activate your account",
        message: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #fff5f5; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(185, 28, 28, 0.1); border: 1px solid #fee2e2;">

                      <!-- Header/Logo Area -->
                      <div style="background-color: #b91c1c; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">BloodBridge</h1>
                        <p style="color: #fecaca; margin: 5px 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">Connecting Life, One Drop at a Time</p>
                      </div>

                      <div style="padding: 40px 30px;">
                        <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Welcome to the Bridge, ${userObj.name}!</h2>
                        
                        <!-- Hero Quote Section -->
                        <div style="border-left: 4px solid #b91c1c; color: #b91c1c; padding: 15px 20px; background: #fef2f2; border-radius: 4px; margin: 25px 0;">
                          <p style="margin: 0; font-style: italic; font-size: 16px; line-height: 1.5;">
                            "Every drop of blood donated is a sunrise for someone else."
                          </p>
                          <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold; opacity: 0.8;">Activate your account to start saving lives.</p>
                        </div>

                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                          Your registration as a potential lifesaver is <strong style="color: #b91c1c;">successful</strong>. You are now one step away from joining a community that bridges the gap between donors and patients in urgent need.
                        </p>

                        <!-- Action Button -->
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}"
                            style="background-color: #b91c1c; color: #ffffff; padding: 18px 45px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; transition: all 0.2s ease;">
                            Verify My Account
                          </a>
                        </div>

                        <!-- Alternate Link Section -->
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px;">
                          <p style="color: #4b5563; font-size: 14px; margin-top: 0; font-weight: bold;">Problem with the button? Copy and paste this link:</p>
                          <p style="margin: 5px 0 0; word-break: break-all;">
                            <a href="${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}" style="color: #b91c1c; font-size: 13px; text-decoration: underline;">
                              ${AppConfig.url}bloodbridge/v1/auth/activate/${userObj.activationToken}
                            </a>
                          </p>
                        </div>

                        <!-- Footer Disclaimer -->
                        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 40px 0;">
                        
                        <p style="color: #111827; font-size: 15px; margin-bottom: 4px;">Thank you,<br/><span style="font-weight: bold; color: #b91c1c;">BloodBridge Admin Team</span></p>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                            <em>You received this email because you signed up for BloodBridge. If this wasn't you, please ignore this email. No further action is required.</em>
                          </p>
                          <p style="color: #b91c1c; font-size: 12px; font-weight: bold; margin-top: 10px;">
                            Privacy Policy | Community Guidelines
                          </p>
                        </div>
                      </div>
                </div>
          </div>
            `,
      });
    } catch (exception) {
      throw exception;
    }
  }

  getPublicUserProfileFromUser = (userObj) => {
    return {
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      address: userObj.address,
      bloodGroup: userObj.bloodGroup,
      phone: userObj.phone,
      status: userObj.status,
      _id: userObj._id,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    }
  }

  async getSingleUserByFilter(filter){
    try{
      const data = await UserModel.findOne(filter);
      return data;
    }catch(exception){
      throw(exception);
    }
  }

  async updateSingleRowByFilter(filter, data){
    try{
      const updatedUser = await UserModel.findOneAndUpdate(filter, {$set:data}, {new:true})
      return updatedUser;
    }catch(exception){
      throw(exception)
    }
  }
  async addToSet(filter, data){
    try{
      const updatedUser = await UserModel.findOneAndUpdate(filter, {$addToSet:data}, {new:true})
      return updatedUser;
    }catch(exception){
      throw(exception)
    }
  }
}

module.exports = new userService;