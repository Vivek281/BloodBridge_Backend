const admin = require("../utilities/firebase");
const UserModel = require("../models/User.model"); // Ensure you import your User model
const { pruneDeadTokens } = require("../utilities/helper");

class NotificationService {
    static async sendNotificationWithData (deviceTokens, notificationBlock, data) {
        if (!deviceTokens || deviceTokens.length === 0) return null;

            const messages = deviceTokens.map(token => ({
                notification: notificationBlock,
                data: data,
                token: token
            }));
            

        try {
            // Using sendEach for individual status reporting per token
            const response = await admin.messaging().sendEach(messages)
            // Prune dead tokens
            await pruneDeadTokens(response, deviceTokens);

            return response;
        } catch (error) {
            console.error("FCM Send Error:", error);
        }
    }

    static async sendNotificationWithOutData (deviceTokens, notificationBlock) {
        if (!deviceTokens || deviceTokens.length === 0) return null;

            const messages = deviceTokens.map(token => ({
                notification: notificationBlock,
                token: token
            }));
            

        try {
            // Using sendEach for individual status reporting per token
            const response = await admin.messaging().sendEach(messages)
            // Prune dead tokens
            await pruneDeadTokens(response, deviceTokens);

            return response;
        } catch (error) {
            console.error("FCM Send Error:", error);
        }
    }
}

module.exports = NotificationService;