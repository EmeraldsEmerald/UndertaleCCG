const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 6,
    type: 0,
    name: "Astigmatism",
    baseCost: 6,
    baseAttack: 4,
    baseHP: 5,
    textbox: "[[kw:Encounter:Encounter]]: Kill a monster.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    requiresTarget: true,
    getValidTargets: function () {
        allySlots = []
        enemySlots = []
        for (let i in this.owner.board) {
            if (this.owner.board[i] != null) allySlots.push(-(-i))
        }
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
            "AstigmatismTriggerPlayed",
            (event) => { this.play(event.data.target) },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function (target) {
        if (target != null) {
            this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
            target.die()     
        }
    },
    calcTargets: function (target) {
        return {
            allySlots: target.owner == this.owner ? [target.slot] : [],
            enemySlots: target.owner != this.owner ? [target.slot] : [],
        }
    }
}
module.exports={card}