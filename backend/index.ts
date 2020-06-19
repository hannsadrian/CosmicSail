import users from "./routes/users";
import auth from "./routes/auth";

import express = require("express");
import path = require("path");
require('dotenv').config();
const cors = require("cors");
const app = express();
app.use(cors())

import {DBHelper} from "./helpers";

let helper = new DBHelper();
helper.connect();
export function getDBHelper(): DBHelper {
  return helper;
}

import {SocketHandler} from "./socket";
let socket = new SocketHandler();
socket.registerEvents();
socket.listen();

// Static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/static/index.html'));
})
app.get("/logo.svg", (req, res) => {
  res.sendFile(path.join(__dirname + '/static/Beach.svg'));
})

// Authentication handling
app.use("/auth", auth)

// Frontend methods
app.use("/user", users)

app.listen(3000);
console.log("server listening");
