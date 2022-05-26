const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 10,
    type: 0,
    name: "Swipe on a Stick",
    baseCost: 4,
    baseAttack: 1,
    baseHP: 2,
    textbox: "[[kw:Encounter:Encounter]]: Deal 4 DMG to an enemy monster and 1 DMG to the rest.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    requiresTarget: true,
    getValidTargets: function () {
        allySlots = []
        enemySlots = []
        for (let i in this.game.players[+!this.ownerID].board) {
            if (this.game.players[+!this.ownerID].board[i] != null) enemySlots.push(-(-i))
        }
        validTargets = {
            allySlots,
            enemySlots
        }
        return validTargets
    },
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "SwipeTriggerPlayed",
            (event) => { this.play(event.data.target) },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function (target) {
        if (target != null) {
            this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 400)
            target.takeDamage(this, 4)  

            this.owner.addDualAnimation("showTargeted", {targets: this.calcOtherTargets(target)}, 0)
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 400)
            for (let i in this.game.players[+!this.ownerID].board) {
                if (this.calcOtherTargets(target).enemySlots.includes(-(-i))) this.game.players[+!this.ownerID].board[i].takeDamage(this, 1)
            }
        }
    },
    calcTargets: function (target) {
        return {
            allySlots: [],
            enemySlots: target.owner != this.owner ? [target.slot] : [],
        }
    },
    calcOtherTargets: function (target) {
        let returnDictionary = { allySlots: [], enemySlots: [] }
        for (let i in this.game.players[+!this.ownerID].board) {
            if (this.game.players[+!this.ownerID].board[i] != null && this.game.players[+!this.ownerID].board[i] != target) returnDictionary.enemySlots.push(-(-i))
        }
        console.log(returnDictionary.enemySlots, "enemy slots")
        return returnDictionary
    }
}
module.exports={card}
