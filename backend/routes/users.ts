import { sendError } from "../helpers/ErrorUtils";
import { verifyJWTRequest} from "../helpers/AuthUtils";
import { getDBHelper } from "..";

var express = require('express');
var router = express.Router();

router.get("/boats", async (req, res) => {
  try {
    verifyJWTRequest(req, res);
  } catch(error) {
    sendError("JWT invalid", res)
    return;
  }

  if (!req.query.username) {
    sendError("No username specified", res);
    return;
  }

  const helper = getDBHelper();
  await helper.getBoats(req.query.username).catch(err => {
    sendError(err, res);
  }).then(boats => {
    res.json(boats)
  })
})

export default router;
