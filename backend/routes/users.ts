import { verifyJWT, sendError } from "./auth";
import { getDBHelper } from "..";

var express = require('express');
var router = express.Router();

router.get("/boats", async (req, res) => {
  try {
    const entity = verifyJWT(req, res);
  } catch(error) {
    sendError("JWT invalid", res)
    return;
  }

  if (!req.query.username) {
    sendError("No username specified", res);
    return;
  }

  const helper = getDBHelper();
  const boats = await helper.getBoats(req.query.username).catch(err => {
    sendError(err, res);
  })

  res.json(boats)
})

export default router;
