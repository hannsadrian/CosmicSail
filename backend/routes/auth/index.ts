import {ClientType} from "../../enums";
import {getDBHelper} from "../../";
import bcrypt = require('bcrypt');
const saltRounds = 10;

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

class AuthenticatedEntity {
  id: string
  type: ClientType
  admin: boolean
  username?: string

  constructor(id: string, type: ClientType, admin: boolean, username?: string) {
    this.id = id;
    this.type = type;
    this.admin = admin;
    if (username)
      this.username = username;
  }
}

router.get('/', function (req, res) {
  res.json({message: "Auth endpoint"});
});

router.post('/status', function (req, res) {
  try {
    var entity = verifyJWT(req, res);
  } catch(error) {
    return;
  }

  res.json(entity);
});

router.post('/login', function (req, res) {
  if (req.query.username == null || req.query.password == null){
    sendError("username or password not specified", res);
    return;
  }

  // TODO: replace with db connection
  if (req.query.username === "client" && req.query.password === "client") {
    const token = jwt.sign({
      username: "client",
      type: 0,
      admin: false
    }, process.env.SECRET, { expiresIn: '10h' });
    res.json({message: "generated jwt", token: token})
    return;
  }

  sendError("username or password invalid", res);
});

router.post('/register', async function (req, res) {
  try {
    //res.send(await registerUser("adwirawien", "asd", ClientType.CONTROLLER));
    res.status(403).send("403 Forbidden");
  } catch(err) {
    sendError(err.message, res);
  }
})

export async function registerUser(username:string, password:string, type:ClientType): Promise<any> {
  let helper = getDBHelper();

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) {
        throw new Error(err.message)
      }

      helper.registerUser(username, hash, type).then(() => {
        resolve({message: username + " registered!"})
      }).catch(err => {
        reject(new Error(err))
      });
    });
  })
}

export function verifyJWT(req, res): AuthenticatedEntity {
  if (!req.query.jwt) {
    sendError("JWT not specified", res);
    throw new Error("JWT not specified");
  }

  try {
    let decoded = jwt.verify(req.query.jwt, process.env.SECRET);
    let type: ClientType;
    switch (decoded.type) {
      case 0:
        type = ClientType.BOAT;
        break;
      case 1:
        type = ClientType.CONTROLLER;
        break;
    }
    return new AuthenticatedEntity(decoded.id, type, decoded.admin, decoded.username);
  } catch (error) {
    throw new Error(error.message);
  }
}

export function sendError(error: string, res) {
  res.json({error: true, message: error})
}

export default router
