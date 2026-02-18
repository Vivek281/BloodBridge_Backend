// http, https third party library
const http = require("http");
//Importing the express instance in app
const app = require("./src/config/express.config");



// Creating the server instance.
const server = http.createServer(app)


const PORT= 9005;
const HOST = "localhost";

server.listen(PORT, HOST, (err)=>{
    if(!err){
        console.log("Server is running on port: " +PORT);
        console.log("Press Ctrl + C to disconnect the server..........")
    }
})