const SessionModel = require("../models/Session.model");

class SessionService{
    async storeSession(data){
        try{
            const session = new SessionModel(data)
            return await session.save()
        }catch(exception){
            throw exception;
        }
    }
    async getSingleRowByFilter(filter){
        try{
            const session = await SessionModel.findOne(filter)
            .populate("user", ["_id","name","email","bloodGroup","status","role","address","availability"])
            return session
        }catch(exception){
            throw exception;
        }
    }
    async deleteSingleRowByFilter(filter){
        try{
            const deletedData = await SessionModel.findOneAndDelete(filter);
            return deletedData;
        }catch(exception){
            throw exception;
        }
    }
}

module.exports = new SessionService();