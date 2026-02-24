require("dotenv").config();

const CloudinaryConfig = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
}

const DBConfig = {
    mongoDB:{
        url:process.env.MONGODB_URL,
        name: process.env.MONGODB_NAME
    }
}

const SMTPConfig = {
    provider:process.env.SMTP_PROVIDER,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM_ADDRESS
}

const AppConfig = {
    url:process.env.APP_URL,
    jwtSecret: process.env.JWT_TOKEN

}

module.exports = {
    DBConfig,
    AppConfig,
    SMTPConfig,
    CloudinaryConfig
}