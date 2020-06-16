import {verifyJWT} from "../helpers/AuthUtils";
import {getDBHelper} from "../"
import {DBHelper} from "../helpers"
const io = require('socket.io')();

class Entity {
  socket: any
  data: any

  constructor(socket: any, data: any) {
    this.socket = socket;
    this.data = data;
  }
}

export class SocketHandler {
  boats = []
  controllers: any[]
  helper: DBHelper

  constructor() {
    this.helper = getDBHelper();
  }

  registerEvents() {
    io.on('connection', async client => {
      let object: object;
      try {
        object = verifyJWT(client.handshake.query["token"])
        // @ts-ignore
        if (object.type === "boat") {
          // @ts-ignore
          this.boats.push(new Entity(client, await this.helper.getBoat(object.id)))
        } else {
          // @ts-ignore
          this.controllers.push(new Entity(client, await  this.helper.findUser(object.username)))
        }
      } catch(err) {
        client.disconnect();
        return;
      }

      // TODO: Register actual events for data transmission

      client.on("disconnect", () => {
        // @ts-ignore
        if (object.type === "boat")
          this.boats.forEach((boat: Entity, index: number) => {
            // @ts-ignore
            if (boat.data.id == object.id)
              this.boats.splice(index,1)
          })
        else
          this.controllers.forEach((controller: Entity, index: number) => {
            // @ts-ignore
            if (controller.data.username == object.username)
              this.controllers.splice(index,1)
          })
      })
    });
  }

  listen() {
    io.listen(3333);
  }
}
