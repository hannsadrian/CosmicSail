import {sendError} from "./ErrorUtils";
const jwt = require("jsonwebtoken");

/**
 * This function is a wrapper for the verifyJWT function and returns an Error
 * express error if the jwt is invalid
 *
 * @param req - Express Request
 * @param res - Express Response
 */
export function verifyJWTRequest(req, res): object {
    if (!req.query.jwt) {
        sendError("JWT not specified", res);
        throw new Error("JWT not specified");
    }

    try {
        return verifyJWT(req.query.jwt)
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * This function checks wheter a token is valid and returns the entity type.
 *
 * @param token - JWT to be verified
 */
export function verifyJWT(token: string): object {
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