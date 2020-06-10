const mongoose = require('mongoose');

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

  public saveSample(): void {
    const Cat = mongoose.model('Cat', { name: String });

    const kitty = new Cat({ name: 'Zildjian' });
    kitty.save().then(() => console.log('meow'));
  }
}
