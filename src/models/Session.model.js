const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required : true
    },
    token:{
        type : String,
        required : true,
    },
    device:{
        type : String,
        enum:['web','mobile'],
        default : "web"
    }
},{
    timestamps:true,
    autoCreate:true,
    autoIndex:true
})


const SessionModel = mongoose.model("Session", SessionSchema)
module.exports = SessionModel
