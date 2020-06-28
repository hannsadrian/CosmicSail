import {verifyJWT} from "../helpers/AuthUtils";
import {getDBHelper} from "../"
import {DBHelper, EntityType} from "../helpers"
import {Entity, Room} from "./Room";

const io = require('socket.io')();


export class SocketHandler {
  rooms: Room[] = []
  helper: DBHelper

  constructor() {
    this.helper = getDBHelper();
  }

  async createRoom(boatId: string) {
    let boat = await this.helper.getBoat(boatId);
    if (boat === null)
      throw new Error("boatId invalid")
    return new Room(boatId);
  }

  registerEvents() {
    io.on('connection', async client => {
      let entity: Entity;
      let boatId: string;
      let room: Room;

      try {
        // get boatId from query
        boatId = client.handshake.query["boatId"];
        if (!boatId)
          throw new Error("boatId not found")
        // verify permission of connection
        let object = verifyJWT(client.handshake.query["token"]);
        entity = new Entity(client, object);

        // check if room with boatId exists
        this.rooms.forEach((r, i) => {
          if (r.id === boatId)
            room = r;
        })
        // create room when there isn't one
        if (!room) {
          room = await this.createRoom(boatId)
          this.rooms.push(room)
        }

        // add entity to room
        room.addEntity(entity);
      } catch(err) {
        client.emit("exception", err.message)
        client.disconnect();
        return;
      }

      // TODO: Register actual events for data transmission

      // Meta event
      client.on("meta", data => {
        if (entity.type !== EntityType.BOAT)
          return;
        room.controllers.forEach((controller: Entity, index) => {
          controller.socket.emit("meta", data)
        })
      })

      client.on("disconnect", () => {
        if (!room || !entity)
          return;

        // remove disconnecting entity
        room.removeEntity(entity);

        // return if room isn't empty
        if (room.getEntities().length > 0)
          return;

        // delete room
        this.rooms.forEach((r, index) => {
          if (room.id === r.id)
            this.rooms.splice(index,1)
        })
      })
    });
  }

  listen() {
    io.listen(3300);
    console.log("Socket listening")
  }
}
