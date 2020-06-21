import { sendError } from "../helpers/ErrorUtils";
import { verifyJWTRequest} from "../helpers/AuthUtils";
import { getDBHelper } from "..";

var express = require('express');
var router = express.Router();

router.get("/boats", async (req, res) => {
  try {
    var entity = verifyJWTRequest(req, res);
  } catch(error) {
    sendError("JWT invalid", res)
    return;
  }

  // @ts-ignore
  if (!req.query.username || entity.username !== req.query.username) {
    sendError("No username specified", res);
    return;
  }

  const helper = getDBHelper();
  // @ts-ignore
  await helper.getBoats(entity.username).catch(err => {
    sendError(err, res);
  }).then(boats => {
    res.json(boats)
  })
})

router.get("/boats/:id", async (req, res) => {
  try {
    var entity = verifyJWTRequest(req, res);
  } catch(error) {
    sendError("JWT invalid", res)
    return;
  }

  const helper = getDBHelper();
  // @ts-ignore
  const user = await helper.findUser(entity.username)

  await helper.getBoat(req.params.id).catch(err => {
    sendError(err, res)
  }).then(boat => {
    if (boat == null) {
      sendError("Boat not found", res);
      return;
    }
    if (!user.boats.includes(boat._id)) {
      sendError("Boat doesn't belong to user", res);
      return;
    }
    res.json({...boat._doc, token: undefined})
  })
})

export default router;
