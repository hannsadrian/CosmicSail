import {DBHelper, EntityType} from "../helpers";
import {getDBHelper} from "../index";

export class Entity {
    type: EntityType = EntityType.CONTROLLER;
    socket: any;
    data: any;

    constructor(socket: any, data: object, type?: EntityType) {
        this.type = type;
        this.socket = socket;
        this.data = data;
    }
}

export class Room {
    id = null;
    boat = undefined;
    controllers = [];
    dbHelper: DBHelper;

    constructor(id: any) {
        this.id = id;
        this.dbHelper = getDBHelper();
    }

    getEntities() {
        if (this.boat)
            return [this.boat, ...this.controllers];
        else
            return this.controllers;
    }

    addEntity(entity:Entity) {
        if (entity.data.type === "boat") {
            entity.type = EntityType.BOAT;
            this.boat = entity;
            this.dbHelper.setOnline(entity.data.id);
            this.controllers.forEach((controller) => {
                controller.socket.emit("online", {online: true})
            })
        }
        if (entity.data.type === "controller") {
            entity.type = EntityType.CONTROLLER;
            this.controllers.push(entity);
            entity.socket.emit("online", {online: !!this.boat});
        }
    }

    removeEntity(entity:Entity) {
        if (entity.type === EntityType.BOAT) {
            this.boat = undefined;
            this.dbHelper.setOffline(entity.data.id)
            this.controllers.forEach((controller) => {
                controller.socket.emit("online", {online: false})
            })
        }
        if (entity.type === EntityType.CONTROLLER)
            this.controllers.forEach((controller: Entity, index: number) => {
                if (controller.data.username == entity.data.username)
                    this.controllers.splice(index,1)
            })
    }
}