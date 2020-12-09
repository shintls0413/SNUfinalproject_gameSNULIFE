const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Player = mongoose.model("Player", {
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

Player.methods.incrementHP = function (val) {
    const hp = this.hp + val;
    this.HP = Math.min(Math.max(0, hp), this.maxHP);
};

Player.methods.death = function () {
    this.HP = this.maxHP;
    this.x = 0;
    this.y = 0;
}

module.exports = {
    Player
};
