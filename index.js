const express = require("express");
const bodyParser = require("body-parser");
const router = require('./stripe');
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketIO = require('./socket')
require("dotenv").config();



//Middlwares
app.use(bodyParser.json());
app.use(cors());

// Pass the HTTP server instance to the Socket.IO module
socketIO.init(server)

//Routes
app.use(router);


//Connect Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Your app is running on PORT ${PORT}`);
});

