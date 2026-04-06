const nodemailer = require("nodemailer");

const { SMTPConfig } = require("../config/app.config")

class MailService {
    #transport

    // Replace your constructor with this:
    constructor() {
        try {
            this.#transport = nodemailer.createTransport({
                // Use host instead of service for stricter control
                host: SMTPConfig.host, // Ensure this is "smtp.gmail.com"
                port: SMTPConfig.port,
                secure: false, // false for 587, true for 465
                auth: {
                    user: SMTPConfig.user,
                    pass: SMTPConfig.password,
                },
                // CRITICAL: Force IPv4 to avoid Render's IPv6 reachability issues
                family: 4,
                connectionTimeout: 10000
            });

            // Log to verify it's working
            console.log("**SMTP Transport Initialized***");
        } catch (exception) {
            console.error("***Error while connecting the SMTP server***", exception);
            // Careful with "satatu" typo in your original code
            throw { code: 500, message: "SMTP server connection failed", status: "ERR_SMTP_CONNECT" };
        }
    }

    // sending and email
    async sendMail({ to, subject, message }) {
        try {
            return await this.#transport.sendMail({
                to: to,
                subject: subject,
                html: message,
                from: SMTPConfig.from
            })
        } catch (exception) {
            console.log(exception)
            throw { code: 500, message: "Failed to send an email", status: "ERR_SENDING_EMAIL" };
        }
    }

}

module.exports = new MailService()
