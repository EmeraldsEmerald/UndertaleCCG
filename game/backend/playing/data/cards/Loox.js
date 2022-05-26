const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 5,
    type: 0,
    name: "Loox",
    baseCost: 2,
    baseAttack: 1,
    baseHP: 3,
    textbox: "[[kw:Encounter:Encounter]]: Deal 1 damage.",
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
            enemySlots,
            allyPlayer: true,
            enemyPlayer: true
        }
        return validTargets
    },
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "LooxTriggerPlayed",
            (event) => { this.play(event.data.target) },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function (target) {
        if (target != null) {
            this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
            target.takeDamage(this, 1)       
        }
    },
    calcTargets: function (target) {
        console.log(target.id, this.ownerID, "gartet")
        return {
            allySlots: target.owner == this.owner ? [target.slot] : [],
            enemySlots: target.owner != this.owner ? [target.slot] : [],
            allyPlayer: target.id == this.ownerID ? true : false,
            enemyPlayer: target.id != this.ownerID ? true : false,
        }
    }
}
module.exports={card}