const nodemailer = require("nodemailer");

const {SMTPConfig} = require("../config/app.config")

class MailService {
    #transport

    //smtp server connect 
    constructor(){
        try{
            this.#transport = nodemailer.createTransport({
                host: SMTPConfig.host,
                port:  SMTPConfig.port,
                service:SMTPConfig.provider,
                auth:{
                    user:SMTPConfig.user,
                    pass:SMTPConfig.password,
                }
            })
            console.log("**SMTP Server connected***")
        }catch(exception){
            console.error("***Error while connecting the SMTP server***")
            throw{code: 500, message: "SMTP server connection failed", satatu:"ERR_SMTP_CONNECT"}
        }
    }

    // sending and email
    async sendMail({to, subject, message}) {
        try{
            return await this.#transport.sendMail({
                to:to,
                subject:subject,
                html:message,
                from: SMTPConfig.from
            })
        }catch(exception){
            console.log(exception)
            throw{code:500, message:"Failed to send and email", status:"ERR_SENDING_EMAIL"};
        }
    }

}

module.exports = new MailService()
