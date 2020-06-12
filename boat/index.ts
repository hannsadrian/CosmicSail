import io = require("socket.io-client");
require('dotenv').config();

var socket = io('http://localhost:3333',
  { query: "token="+process.env.TOKEN });

socket.on("connect", () => {
  console.log("connected");
})
socket.on("disconnect", () => {
  console.log("disconnected");
})
socket.on('error', (ex) => {
  console.log("handled error");
  console.log(ex);
});
