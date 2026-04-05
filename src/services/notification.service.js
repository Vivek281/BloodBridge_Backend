const admin = require("../utilities/firebase");
const UserModel = require("../models/User.model"); // Ensure you import your User model
const { pruneDeadTokens } = require("../utilities/helper");

class NotificationService {
    static async sendNotification(deviceTokens, bloodRequest) {
        if (!deviceTokens || deviceTokens.length === 0) return null;

        const messages = deviceTokens.map(token => ({
            notification: {
                title: "Urgent Blood Request 🩸",
                body: `Immediate need for ${bloodRequest.patientBloodGroup} at ${bloodRequest.hospitalName}.`
            },
            data: {
                requestId: bloodRequest._id.toString(), // The ID from MongoDB
            },
            token: token
        }));

        try {
            // Using sendEach for individual status reporting per token
            const response = await admin.messaging().sendEach(messages);
            // Prune dead tokens
            await pruneDeadTokens(response, deviceTokens);

            return response;
        } catch (error) {
            console.error("FCM Send Error:", error);
            throw error;
        }
    }

    static async notifyRequester (deviceTokens, notificationBlock, donor) {
        if (!deviceTokens || deviceTokens.length === 0) return null;

        const messages = deviceTokens.map(token => ({
            notification: notificationBlock,
            data: {
                donorId: donor._id.toString(), // The Donor ID from MongoDB
            },
            token: token
        }));

        try {
            // Using sendEach for individual status reporting per token
            const response = await admin.messaging().sendEach(messages);
            // Prune dead tokens
            await pruneDeadTokens(response, deviceTokens);

            return response;
        } catch (error) {
            console.error("FCM Send Error:", error);
        }
    }
}

module.exports = NotificationService;