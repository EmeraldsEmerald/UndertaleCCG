const fs = require('fs');

let cardList = {}
cardNameList = fs.readdirSync('game/backend/playing/data/cards', 'utf-8')
for (let i = 0; i < cardNameList.length; ++i) {
    card = require('./cards/'+cardNameList[i]).card
    cardList[card.id] = card;
}

module.exports = cardList