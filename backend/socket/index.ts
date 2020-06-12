import {onlyVerifyJWT} from "../routes/auth"
import {getDBHelper} from "../"
import {DBHelper} from "../helpers"
const io = require('socket.io')();

class Boat {
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
        object = onlyVerifyJWT(client.handshake.query["token"])
        if (object.type === "boat") {
          this.boats.push(new Boat(client, await this.helper.getBoat(object.id)))
        }
      } catch(err) {
        client.disconnect();
        return;
      }

      client.on("disconnect", () => {
        if (object.type === "boat")
          this.boats.forEach((boat: Boat, index: number) => {
            if (boat.data.id == object.id)
              this.boats.splice(index,1)
          })
      })

    });
  }

  listen() {
    io.listen(3333);
  }
}
