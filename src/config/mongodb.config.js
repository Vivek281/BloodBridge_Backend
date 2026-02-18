const mongoose = require('mongoose');  
const { DBConfig } = require('./app.config');

(async()=>{
    try{
        await mongoose.connect(DBConfig.mongoDB.url, {
           dbName: DBConfig.mongoDB.name,
           autoCreate: true,
           autoIndex: true
        })
        console.log("*********MongoDb Connection Established*************")
    }catch(exception){
        console.log("******Error while connecting mongoDB Server.***********")
    }
})()