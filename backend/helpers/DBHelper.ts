import mongoose = require('mongoose');
import jwt = require('jsonwebtoken');

const User = mongoose.model('User', {
    username: String,
    password: String,
    isAdmin: Boolean,
    boats: [{type: mongoose.Schema.Types.ObjectId, ref: 'Boat'}]
});

const Boat = mongoose.model('Boat', {
    id: String,
    token: String,
    name: String,
    model: String,
    online: Boolean,
    parts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Part'}]
})

const Part = mongoose.model('Part', {
    id: String,
    type: String,
    name: String,
    values: Object,
    pins: Object
})

export default class DBHelper {
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
            {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}
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

    public async findUser(username:string): Promise<typeof User> {
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

                resolve(user);
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

            const user = new User({username: username, password: password});
            user.save().then(() => console.log(username + ' registered!'));
            resolve();
        })
    }

    public async registerBoat(name: string, model: string, owner: string): Promise<typeof Boat> {
        const id = makeId(7);
        const token = jwt.sign({id: id, model: model}, process.env.SECRET, {issuer: "Funzel Environment", subject: "CosmicSail"});
        const boat = new Boat({id: id, token: token, name: name, model: model, parts: []});
        boat.save().then(async (res) => {
            // add boat to user
            let user = await this.findUser(owner);
            await User.findOneAndUpdate({_id: user._id}, { $set: { boats: [...user.boats, res._id] }}, {upsert: true}, () => {});
        });
    }
    public async getBoats(username: string): Promise<typeof Boat[]> {
        return new Promise(async (resolve, reject) => {
            const user = await this.findUser(username)
            if (user == null) {
                reject("User not found");
                return;
            }

            let boats = [];
            await asyncForEach(user.boats, async (id) => {
                let boat = await Boat.findById(id)
                boats.push({
                    ...boat._doc,
                    token: undefined,
                    parts: undefined,
                    __v: undefined
                })
            })
            resolve(boats);
        });
    }
    public async getBoat(boatId: string): Promise<typeof Boat> {
        return new Promise(async (resolve, reject) => {
            Boat.findOne({id: boatId}).exec((err, boat) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(boat)
            })
        })
    }
}

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}
