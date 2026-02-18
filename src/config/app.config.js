require("dotenv").config();


const DBConfig = {
    mongoDB:{
        url:process.env.MONGODB_URL,
        name: process.env.MONGODB_NAME
    }
}

module.exports = {
    DBConfig
}