const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const crypto = require("crypto");

const {
    constantManager,
    mapManager,
    itemManager,
    monsterManager
} = require("./datas/Manager");
const { Player } = require("./models/Player");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

mongoose.connect(
    "mongodb+srv://goodgroup:goodgroup1111@cluster0.ltcql.mongodb.net/Project?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const authentication = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);
    const [bearer, key] = authorization.split(" ");
    if (bearer !== "Bearer") return res.sendStatus(401);
    const player = await Player.findOne({ key });
    if (!player) return res.sendStatus(401);

    req.player = player;
    next();
};

app.get("/", (req, res) => {
    res.render("index", { gameName: constantManager.gameName });
});

app.get("/game", (req, res) => {
    res.render("game");
});

app.post("/signup", async (req, res) => {
    const { name } = req.body;

    if (await Player.exists({ name })) {
        return res.status(400).send({ error: "Player already exists" });
    }

    const player = new Player({
        name,
        maxHP: 10,
        HP: 10,
        str: 5,
        def: 5,
        x: 0,
        y: 0
    });

    const key = crypto.randomBytes(24).toString("hex");
    player.key = key;

    await player.save();

    return res.send({ key });
});

app.post("/action", authentication, async (req, res) => {
    const { action } = req.body;
    const player = req.player;
    let event = null;
    if (action === "query") {
        const field = mapManager.getField(req.player.x, req.player.y);

        return res.send({ player, field });
    } else if (action === "move") {
        const direction = parseInt(req.body.direction, 0); // 0 북. 1 동 . 2 남. 3 서.
        let x = req.player.x;
        let y = req.player.y;
        if (direction === 0) {
            y -= 1;
        } else if (direction === 1) {
            x += 1;
        } else if (direction === 2) {
            y += 1;
        } else if (direction === 3) {
            x -= 1;
        } else {
            res.sendStatus(400);
        }
        const field = mapManager.getField(x, y);
        if (!field) res.sendStatus(400);
        player.x = x;
        player.y = y;

        const events = field.events;

        if (events.length > 0) {
            // TODO : 확률별로 이벤트 발생하도록 변경
            let _event = events[0];
            if (events.length !== 1) {
                const eventProb = Math.random() * 100;
                let stack = 0;
                for (let i = 0; i < events.length; i++) {
                    if (stack < eventProb && eventProb <= events[i].percent + stack) {
                        _event = events[i];
                        break;
                    } else {
                        stack += events[i].percent;
                    }
                }
            }

            if (_event.type === "battle") {
                // TODO: 이벤트 별로 events.json 에서 불러와 이벤트 처리
                const thisMonster = monsterManager.getMonster(_event.monster);
                event = { description: `${thisMonster.name}를 마주쳐 싸움을 벌였다.` };

                const playerStr = player.str - thisMonster.def;
                const monsterStr = thisMonster.str - player.def;
                console.log("player : " + playerStr + ", monster : " + monsterStr);

                while (true) {
                    console.log("player attack start");
                    const a = Math.round(playerStr * (Math.random() + 0.5));
                    console.log("player attack : " + a);
                    if (a > 0) {
                        if (thisMonster.hp - a <= 0) {
                            thisMonster.hp = 0;
                            console.log("Player WIN!");
                            console.log("player hp : " + player.HP);
                            console.log("monster hp : " + thisMonster.hp);

                            break;
                        } else {
                            thisMonster.hp -= a;
                        }
                    } else {
                        console.log("player attack failed.");
                    }
                    console.log("monster hp : " + thisMonster.hp);

                    console.log("monster attack start");
                    const b = Math.round(monsterStr * (Math.random() + 0.5));
                    if (b > 0) {
                        console.log("monster attack : " + b);
                        if (player.hp - b <= 0) {
                            player.hp = 0;
                            console.log("Monster WIN!");
                            console.log("player hp : " + player.HP);
                            console.log("monster hp : " + thisMonster.hp);
                            break;
                        } else player.hp -= b;
                    } else {
                        console.log("monster attack failed.");
                    }

                    console.log("player hp : " + player.HP);
                }

            } else if (_event.type === "item") {
                const thisItem = itemManager.getItem(_event.item);
                if (thisItem.type === "무기") {
                    event = {
                        description: ` ${thisItem.material} ${thisItem.name}을 획득하였다.`
                    };
                    player.str += thisItem.buf;
                } else if (thisItem.type === "갑옷" || thisItem.type === "장신구") {
                    event = {
                        description: `${thisItem.material} ${thisItem.name}을 획득하였다.`
                    };
                    player.def += thisItem.buf;
                } else if (thisItem.type === "포션") {
                    event = {
                        description: `${thisItem.material} ${thisItem.name}을 획득해 체력을 회복했다.`
                    };
                    player.incrementHP(thisItem.buf);
                }
            } else if (_event.type === "gambling") {
                event = {
                    description: "길을 가다가 수상한 할아버지가 도박을 하자고 말했다"
                };
            }
        }

        await player.save();
        return res.send({ player, field, event });
    }
});

app.listen(3000);
