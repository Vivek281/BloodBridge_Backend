// http, https third party library
const http = require("http");
// Importing the express instance in app
const app = require("./src/config/express.config");

// Creating the server instance.
const server = http.createServer(app);

/**
 * 1. DYNAMIC PORT: 
 * Render assigns a port via environment variables. 
 * If it's not found (like on your local PC), it defaults to 9005.
 */
const PORT = process.env.PORT || 10000;

/**
 * 2. REMOVE "localhost":
 * On Render, the server must listen on "0.0.0.0" (all interfaces) 
 * to be reachable from the internet. Removing the "localhost" 
 * argument achieves this automatically.
 */
server.listen(PORT, '0.0.0.0', (err) => {
    if (!err) {
        console.log(`Server is running on port: ${PORT}`);
        console.log("Press Ctrl + C to disconnect the server..........");
    } else {
        console.error("Failed to start server:", err);
    }
});