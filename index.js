const express = require("express");
const bodyParser = require("body-parser");
const router = require('./stripe');
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
const app = express();


//Middlwares
app.use(bodyParser.json());
app.use(cors());

// Pass the HTTP server instance to the Socket.IO module
socketIO.init(server)

//Routes
app.use(router);


//Connect Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Your app is running on PORT ${PORT}`);
});

