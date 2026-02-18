const mongoose = require("mongoose");
const { BloodGroup, Roles, Gender, Status } = require("../config/constants");


//schema
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        min:2,
        max:50,
        required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    bloodGroup:{
        type: String,
        enum: Object.values(BloodGroup)
    },
    // Store the browser's notification token here
    fcmToken: String, 
    // GeoJSON location
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    availability: {
        isAvailable: {
          type: Boolean,
          default: true
        },
        activeRequestId: {
          type: mongoose.Types.ObjectId,
          ref: "BloodRequest",
          default: null
        },
        lastDonationDate: {
          type: Date,
          default: null
        }
      },
      donationHistory: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Donation"
        }
      ],
      role:{
        type:String,
        enum:Object.values(Roles)
      },
      status : {
        type : String,
        enum : Object.values(Status), 
        default : Status.INACTIVE
    },
      gender:{
        type:String,
        enum: Object.values(Gender)
      },
      activationToken : String,
      expiryTime : Date
},{
    timestamps: true,
    autoCreate: true,
    autoIndex: true
})

// Geo Index
UserSchema.index({ location: "2dsphere" });

const UserModel = new mongoose.model("User", UserSchema)
module.exports = UserModel;