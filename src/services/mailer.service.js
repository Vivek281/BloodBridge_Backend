const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set this in Render Env Vars

class MailService {
    async sendMail({ to, subject, message }) {
        const msg = {
            to: to,
            from: process.env.SENDGRID_FROM_EMAIL, // Must match your SendGrid Sender Identity
            subject: subject,
            html: message,
        };

        try {
            await sgMail.send(msg);
            console.log("Email sent successfully via Web API");
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body);
            }
            throw { code: 500, message: "Email failed", status: "ERR_SENDGRID" };
        }
    }
}

module.exports = new MailService();