import {EntityType} from "../helpers";

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

    constructor(id: any) {
        this.id = id;
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
            // TODO: set online in DB
        }
        if (entity.data.type === "controller") {
            entity.type = EntityType.CONTROLLER;
            this.controllers.push(entity);
        }
    }

    removeEntity(entity:Entity) {
        if (entity.type === EntityType.BOAT)
            this.boat = undefined;
            // TODO: set offline and lastSeen in DB
        if (entity.type === EntityType.CONTROLLER)
            this.controllers.forEach((controller: Entity, index: number) => {
                if (controller.data.username == entity.data.username)
                    this.controllers.splice(index,1)
            })
    }
}