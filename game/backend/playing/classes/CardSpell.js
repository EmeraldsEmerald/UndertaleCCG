const cardList = require('../data/cardListLoader.js')
const Card = require('./Card.js').Card
const util = require('../../../util.js')

class CardSpell extends Card {
    constructor(id, owner, game, zone) {
        super(id, owner, game, zone)
    }

    modifyIsPlayable(playable) {
        if (this.requiresTarget && util.targetsEmpty(this.getValidTargets())) playable = false
        return playable 
    }

    onCast() {

    }
}

module.exports = { CardSpell }