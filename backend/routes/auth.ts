import {sendError} from "../helpers/ErrorUtils";
import {verifyJWTRequest} from "../helpers/AuthUtils";
import {EntityType} from "../helpers";
import {getDBHelper} from "../index";
import bcrypt = require('bcrypt');

const saltRounds = 10;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * Route to get authorization status
 */
router.post('/status', function (req, res) {
    try {
        var entity = verifyJWTRequest(req, res);
    } catch (error) {
        sendError("JWT invalid", res)
        return;
    }

    res.json({
        message: "JWT valid",
        authenticated: true,
        payload: entity
    });
});

/**
 * Route to generate a jwt for valid users
 */
router.post('/login', async function (req, res) {
    if (req.query.username == null || req.query.password == null) {
        sendError("username or password not specified", res);
        return;
    }

    let helper = getDBHelper();

    let user = await helper.findUser(req.query.username);
    if (user == null) {
        sendError("user not found", res);
        return;
    }
    let passwordMatches = await bcrypt.compare(req.query.password, user.password)
    if (passwordMatches) {
        let payload = {...user.toObject(), password: undefined, isAdmin: undefined, __v: undefined};
        const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: '10h',
            issuer: "Funzel Environment",
            subject: "CosmicSail"
        });
        res.json({message: "generated jwt", token: token, payload: payload})
        return;
    }

    sendError("username or password invalid", res);
});

/**
 * Route to be potentially used for registering a new user
 */
router.post('/register', async function (req, res) {
    try {
        //res.send(await registerUser("adwirawien", "asd"));
        res.status(403).send("403 Forbidden");
    } catch (err) {
        sendError(err.message, res);
    }
})

/**
 * Registers a new user
 *
 * @param username
 * @param password
 */
export async function registerUser(username: string, password: string): Promise<any> {
    let helper = getDBHelper();

    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) {
                throw new Error(err.message)
            }

            helper.registerUser(username, hash, EntityType.CONTROLLER).then(() => {
                resolve({message: username + " registered!"})
            }).catch(err => {
                reject(new Error(err))
            });
        });
    })
}

export default router
