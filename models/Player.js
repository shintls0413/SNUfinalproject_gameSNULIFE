const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  key: String,
  Inventory: Array,
  level: Number,
  exp: Number,

  maxHP: { type: Number, default: 10 },
  HP: { type: Number, default: 10 },
  str: { type: Number, default: 5 },
  def: { type: Number, default: 5 },
  x: { type: Number, default: 0 },
  y: { type: Number, default: -1 },
});

schema.methods.incrementSTR = function (val) {
  this.str += val;
};

schema.methods.incrementDEF = function (val) {
  this.def += val;
};

schema.methods.incrementHP = function (val) {
  const hp = this.HP + val;
  this.HP = Math.min(Math.max(0, hp), this.maxHP);
};

schema.methods.decrementHP = function (val) {
  const hp = this.HP - val;
  this.HP = Math.max(hp, 0);
};

schema.methods.incrementmaxHP = function (val) {
  this.maxHP += val;
};

schema.methods.getItem = function (obj) {
  if (!this.Inventory.some((elem) => {
    return elem.id === obj.id;
  })) {
    this.Inventory.push(obj);
  }
}

schema.methods.lostItem = function (){
  if(this.Inventory.length!=0){
    const lostId = Math.floor(Math.random()*(this.Inventory.lenght));
    this.Inventory = this.Inventory.splice(lostId,1);
  }
}

schema.methods.showInventory = function () {
  return this.Inventory;
}

const Player = mongoose.model("Player", schema);

module.exports = {
  Player
};