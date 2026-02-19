module.exports = (schema) => {

    return async(req, res, next) =>{
        try{
            const data = req.body;
            if(!data){
                next({code: 422, message:"Empty Payload...", status: "EMPTY_DATA_ERR"})
            }
            await schema.validateAsync(data, {abortEarly:false})
            next()
        }catch(exception){
            //validation failed
            // console.error(exception)
            let errBag ={}
                if(exception.details){
                    exception.details.map((error) => {
                        let field = error.path.pop();
                        errBag[field] = error.message;
                    })
                }
                next({code:400, message:"Validation Failed", status:"VALIDATION_FAILED", details:errBag})
            
        }
    }
}