const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const crypto = require('crypto');

const {
    constantManager,
    mapManager,
    itemManager,
    monsterManager,
} = require('./datas/Manager');
const { Player } = require('./models/Player');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);

mongoose.connect(
    'mongodb+srv://goodgroup:goodgroup1111@cluster0.ltcql.mongodb.net/Project?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true },
);

const authentication = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);
    const [bearer, key] = authorization.split(' ');
    if (bearer !== 'Bearer') return res.sendStatus(401);
    const player = await Player.findOne({ key });
    if (!player) return res.sendStatus(401);

    req.player = player;
    next();
};

app.get('/', (req, res) => {
    res.render('index', { gameName: constantManager.gameName });
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.post('/signup', async (req, res) => {
    const { name } = req.body;

    if (await Player.exists({ name })) {
        return res.status(400).send({ error: 'Player already exists' });
    }


    const player = new Player({
        name,
        maxHP: Math.round(10 * (Math.random()) + 5),
        HP: Math.round(10 * (Math.random()) + 5),
        str: Math.round(4 * (Math.random()) + 3),
        def: Math.round(4 * (Math.random()) + 3),
        resetCount:0,
        x: 0,
        y: -1,
        exp: 0,
        level: 1,
    });

    player.HP = player.maxHP;
    const key = crypto.randomBytes(24).toString('hex');
    player.key = key;

    await player.save();

    return res.send({ key });
});

app.post('/action', authentication, async (req, res) => {
    const { action } = req.body;
    const { player } = req;
    let field = null;
    let event = null;
    let invenItem = null;
    let itemList = null;
    const actions = [];
    let battleResult = null;
    const battleContent = [];
    let dead = false;
    invenItem = [];
    itemList = [];
    player.showInventory().forEach((elem) => {
        invenItem.push(' '+ elem.material + ' ' + elem.name);
    });
    const itemString = invenItem.join(', ');
    itemList = {
        description: itemString,
    };


    if (action === 'query') {
        field = mapManager.getField(req.player.x, req.player.y);

        return res.send({ player, field});
    }

    // revive : 부활시 (0,0)으로 보냄과 동시에 랜덤아이템 하나 삭제
    // restat : 캐릭터 생성시 랜덤 스탯분배(최대 5번가능)

    if (action === 'revive') {
        field = mapManager.getField(0, 0);
        player.HP = player.maxHP;
        player.x = 0;
        player.y = 0;
        // player 경험치 초기화
        player.exp = 0;
        player.level = 1;
        const lostItemId = player.lostItem();
        if (lostItemId.type === "방어") {
            player.incrementDEF((-1) * lostItemId[0].buf);
        } else {
            player.incrementSTR((-1) * lostItemId[0].buf);
        }

        invenItem = [];
        itemList = [];
        player.showInventory().forEach((elem) => {
            invenItem.push(elem.material + ' ' + elem.name);
        });
        const itemString = invenItem.join(', ');
        itemList = {
            description: itemString,
        };
        
        await player.save();

    } else if (action === 'restat') {
        field = mapManager.getField(0, -1);
        player.maxHP = Math.round(10 * (Math.random()) + 5);
        player.str = Math.round(4 * (Math.random()) + 3);
        player.def = Math.round(4 * (Math.random()) + 3);
        player.HP = player.maxHP;
        const resetCount = player.incrementCOUNT();
        event = {
            title: '',
            description: `스탯이 재분배되었습니다.( 재분배 가능횟수 : ${resetCount}/5 ) `,
        }

        await player.save();
    }




    if (action === 'move') {
        const direction = parseInt(req.body.direction, 0); // 0 북. 1 동 . 2 남. 3 서.
        let { x } = req.player;
        let { y } = req.player;
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
        field = mapManager.getField(x, y);
        if (!field) res.sendStatus(400);
        player.x = x;
        player.y = y;

        const { events } = field;

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

            if (_event.type === 'battle') {

                const thisMonster = monsterManager.getMonster(_event.monster);
                event = {
                    title: '! ! ! BATTLE ! ! !',
                    description: `"${thisMonster.name}"을(를) 마주쳐 싸움을 벌였다.`,
                };
                battleContent.push(`${thisMonster.name} : ${thisMonster.talk}`);
                battleContent.push(`${player.name} : ${thisMonster.response}`);

                const playerStr = player.str - thisMonster.def;
                const monsterStr = thisMonster.str - player.def;

                if (playerStr > 0 || monsterStr > 0) {
                    while (true) {
                        const playerAttack = Math.round(playerStr * (Math.random() + 0.5));
                        const monsterAttack = Math.round(
                            monsterStr * (Math.random() + 0.5),
                        );
                        const battleExp = player.exp + thisMonster.exp;
                        if (playerAttack > 0) {
                            battleContent.push(`${player.name}는 "${thisMonster.name}"에게 "${playerAttack}"의 데미지를 입혔다.`);
                            if (thisMonster.hp - playerAttack <= 0) {
                                thisMonster.hp = 0;
                                if (battleExp < 20) {
                                    battleResult = {
                                        win: true,
                                        description: `"${thisMonster.name}"와(과)의 싸움에서 승리했다. 경험치 "${thisMonster.exp}"을 획득했다.`,
                                    };
                                    // 경험치 획득
                                    player.exp = battleExp;
                                } else {
                                    battleResult = {
                                        win: true,
                                        description: `"${thisMonster.name}"와(과)의 싸움에서 승리했다. Level-UP! 스텟이 상승했다!`,
                                    };
                                    // 레벨업 스텟획득
                                    player.exp = 0;
                                    player.level += 1;
                                    player.str += 3;
                                    player.def += 3;
                                    player.maxHP += 5;
                                    player.HP = player.maxHP;
                                }
                                break;
                            } else thisMonster.hp -= playerAttack;
                        } else battleContent.push(`"${player.name}"은(는) 공격에 실패했다.`);

                        if (monsterAttack > 0) {
                            battleContent.push(`"${thisMonster.name}"는 ${player.name}에게 "${monsterAttack}"의 데미지를 입혔다.`);
                            if (player.HP - monsterAttack <= 0) {
                                player.HP = 0;
                                battleResult = {
                                    win: false,
                                    description: `"${thisMonster.name}"와(과)의 싸움에서 패배했다. 다시 1학년으로 돌아간다.`,
                                };
                                break;
                            } else {
                                player.HP -= monsterAttack;
                            }
                        } else battleContent.push(`"${thisMonster.name}"은(는) 공격에 실패했다.`);
                    }
                } else {
                    battleResult = {
                        win: true,
                        description: `"${thisMonster.name}"이(가) 도망쳤다`,
                    };
                }
            } else if (_event.type === 'item') {
                const thisItem = itemManager.getItem(_event.item);
                event = {
                    title: '--- 아이템 획득 ---',
                };
                if (thisItem.type === '공격') {
                    event.description = `"${thisItem.material} ${thisItem.name}"을(를) 획득하였다.`;
                    player.incrementSTR(thisItem.buf);
                    player.getItem(thisItem);
                } else if (thisItem.type === '방어') {
                    event.description = `"${thisItem.material} ${thisItem.name}"을(를) 획득하였다.`;
                    player.incrementDEF(thisItem.buf);
                    player.getItem(thisItem);
                } else if (thisItem.type === '회복') {
                    event.description = `"${thisItem.material} ${thisItem.name}"을(를) 획득해 체력을 회복했다.`;
                    player.incrementHP(thisItem.buf);
                } else if (thisItem.type === '악화') {
                    event.description = `"${thisItem.material} ${thisItem.name}" 때문에 체력이 떨어졌다.`;
                    player.decrementHP(thisItem.buf);
                    if (player.HP === 0) dead = true;
                } else if (thisItem.type === '최대체력증가') {
                    event.description = `"${thisItem.material} ${thisItem.name}"을(를) 획득해 최대체력이 증가했다.`;
                    player.incrementmaxHP(thisItem.buf);
                    player.incrementHP(thisItem.buf);
                } else if (thisItem.type === '교육') {
                    event.description = `"${thisItem.material} ${thisItem.name}"을(를) 통해 다양한 능력치가 상승하였다.`;
                    player.incrementSTR(thisItem.buf);
                    player.incrementDEF(thisItem.buf);
                    player.incrementmaxHP(thisItem.buf);
                    player.incrementHP(thisItem.buf);
                }
            } else if (_event.type === 'ending') {
                event = {
                    title: 'The End....',
                    description: '-후속작 양진환 선생님의 반란-을 기대해주세요',
                };
            } else if (_event.type === 'nothing') {
                event = {
                    title: '',
                    description: '아무일도 일어나지 않았다.',
                };
            }
        }

        await player.save();
    }

    return res.send({
        player, field, event, actions, battleResult, battleContent, invenItem, itemList, dead,
    });
});

app.listen(3000);
