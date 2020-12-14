const fs = require("fs");

class Manager {
    constructor() { }
}

class ConstantManager extends Manager {
    constructor(datas) {
        super();
        this.gameName = datas.gameName;
    }
}

class MapManager extends Manager {
    constructor(datas) {
        super();
        this.id = datas.id;
        this.fields = {};

        datas.fields.forEach((field) => {
            this.fields[`${field[0]}_${field[1]}`] = {
                x: field[0],
                y: field[1],
                description: field[2],
                canGo: field[3],
                events: field[4]
            };
        });
    }

    getField(x, y) {
        return this.fields[`${x}_${y}`];
    }
}

class ItemManager extends Manager {
    constructor(datas) {
        super();
        this.items = {};
        datas.forEach((item) => {
            this.items[`${item.id}`] = {
                id: item.id,
                name: item.name,
                type: item.type,
                material: item.material,
                buf: item.buf
            };
        });
    }
    getItem(id) {
        return this.items[`${id}`];
    }
}

class MonsterManager extends Manager {
    constructor(datas) {
        super();
        this.monsters = {};
        datas.forEach((monster) => {
            this.monsters[`${monster.id}`] = {
                id: monster.id,
                name: monster.name,
                str: monster.str,
                def: monster.def,
                hp: monster.hp,
                //exp 추가
                exp: monster.exp,
            };
        });
    }
    getMonster(id) {
        return this.monsters[`${id}`];
    }
}

const constantManager = new ConstantManager(
    JSON.parse(fs.readFileSync(__dirname + "/constant.json"))
);

const mapManager = new MapManager(
    JSON.parse(fs.readFileSync(__dirname + "/map.json"))
);

const itemManager = new ItemManager(
    JSON.parse(fs.readFileSync(__dirname + "/items.json"))
);

const monsterManager = new MonsterManager(
    JSON.parse(fs.readFileSync(__dirname + "/monsters.json"))
);

module.exports = {
    constantManager,
    mapManager,
    itemManager,
    monsterManager
};

//testing