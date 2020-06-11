import {ClientType} from "../enums";
const mongoose = require('mongoose');

const User = mongoose.model('User', {
  username: String,
  password: String,
  type: Number,
  isAdmin: Boolean
});

class UserEntity {
  username: string
  type: ClientType
  isAdmin: boolean

  constructor(username: string, type: ClientType, isAdmin: boolean) {
    this.username = username
    this.type = type
    this.isAdmin = isAdmin
  }
}

export class DBHelper {
  public connected: boolean = false;

  constructor() {
    this.connect();
  }

  public connect(): void {
    mongoose.connect(
      'mongodb+srv://'+
      process.env.MONGODB_USER+':'+
      process.env.MONGODB_PASSWORD+'@'+
      process.env.MONGODB_URL+'/'+
      process.env.MONGODB_NAME+
      '?retryWrites=true&w=majority',
      {useNewUrlParser: true, useUnifiedTopology: true}
    ).then(() => {
      if (!this.connected) {
        console.log("Db connected");
        this.connected = true;
      }
    }).then(err => {
      if (err)
        console.warn(err)
    });
  }

  public async findUser(username:string): Promise<UserEntity> {
    return new Promise((resolve, reject) => {
      User.findOne({username: username}).exec((err, user) => {
        if (err) {
          reject(err);
          return;
        }
        if (user == null) {
          resolve(null);
          return;
        }

        let type: ClientType;
        switch (user.type) {
          case 0:
            type = ClientType.BOAT;
            break;
          case 1:
            type = ClientType.CONTROLLER;
            break;
        }
        resolve(new UserEntity(user.username, type, user.isAdmin || false));
      })
    })
  }

  public async registerUser(username:string, password:string, type:number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let entity = await this.findUser(username);

      if (entity) {
        reject("User already registered");
        return;
      }

      const user = new User({username: username, password: password, type: type});
      user.save().then(() => console.log(username + ' registered!'));
      resolve();
    })
  }
}
