const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  key: String,

  level: Number,
  exp: Number,

  maxHP: { type: Number, default: 10 },
  HP: { type: Number, default: 10 },
  str: { type: Number, default: 5 },
  def: { type: Number, default: 5 },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 }
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

const Player = mongoose.model("Player", schema);

module.exports = {
  Player
};
