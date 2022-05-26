const cardList = require('../data/cardListLoader.js')
const util = require('../../../util.js')
const ListenerReceiver = require('./ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('./ListenerEmitter.js').ListenerEmitter

class StatusEffect {
    constructor(modifyCard, name, desc, imgsrc = null, reverseFunc) {
        this.modifyCard = modifyCard
        this.name = name
        this.desc = desc
        this.imgsrc = imgsrc
        this.reverseFunc = reverseFunc
    }

    static genStatBuff(name, desc, attackAmount = 0, hpAmount = 0, costAmount = 0, imgsrc = null) {
        return new StatusEffect((card) => {
            card.modifiedAttack += attackAmount
            card.modifiedHP += hpAmount
            card.modifiedCost += costAmount
        }, name, desc, imgsrc, (card) => {
            card.modifiedAttack -= attackAmount
            card.modifiedHP -= hpAmount
            card.modifiedCost -= costAmount
        })
    }


}

module.exports = { StatusEffect }