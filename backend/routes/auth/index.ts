import {ClientType} from "../../enums";
import {getDBHelper} from "../../";
import bcrypt = require('bcrypt');
const saltRounds = 10;

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.get('/', function (req, res) {
  res.json({message: "Auth endpoint"});
});

router.post('/status', function (req, res) {
  try {
    var entity = verifyJWT(req, res);
  } catch(error) {
    sendError("JWT invalid", res)
    return;
  }

  res.json({
    message: "JWT valid",
    authenticated: true,
    payload: entity
  });
});

router.post('/login', async function (req, res) {
  if (req.query.username == null || req.query.password == null){
    sendError("username or password not specified", res);
    return;
  }

  if (req.query.username != null && req.query.password != null) {
    let helper = getDBHelper();

    let user = await helper.findUser(req.query.username);
    if (user == null) {
      sendError("user not found", res);
      return;
    }
    let passwordMatches = await bcrypt.compare(req.query.password, user.password)
    if (passwordMatches) {
      const token = jwt.sign({...user.toObject(), isAdmin: undefined}, process.env.SECRET, {
        expiresIn: '10h',
        issuer: "Funzel Environment",
        subject: "CosmicSail"
      });
      res.json({message: "generated jwt", token: token, payload: user.toObject()})
      return;
    }
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

export function verifyJWT(req, res): object {
  if (!req.query.jwt) {
    sendError("JWT not specified", res);
    throw new Error("JWT not specified");
  }

  try {
    return onlyVerifyJWT(req.query.jwt)
  } catch (error) {
    throw new Error(error.message);
  }
}

export function onlyVerifyJWT(token:string): object {
  try {
    let decoded = jwt.verify(token, process.env.SECRET);
    if (decoded.model)
      decoded.type = "boat"
    else
      decoded.type = "controller"
    return decoded;
  } catch (error) {
    throw new Error(error.message);
  }
}

export function sendError(error: string, res) {
  res.json({error: true, message: error})
}

export default router
