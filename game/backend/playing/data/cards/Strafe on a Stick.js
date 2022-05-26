const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 735704,
    type: 0,
    name: "Strafe on a Stick",
    baseCost: 5,
    baseAttack: 2,
    baseHP: 2,
    textbox: "[[kw:Encounter:Encounter]]: Deal 2 DMG to all enemy monsters.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "StrafeOnAStickTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets()}, 0)
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        for (let i in this.game.players[+!this.ownerID].board) {
            if (this.game.players[+!this.ownerID].board[i] != null) this.game.players[+!this.ownerID].board[i].takeDamage(this, 2)
        }
    },
    calcTargets: function () {
        let returnDictionary = { allySlots: [], enemySlots: []}
        for (let i in this.game.players[+!this.ownerID].board) {
            if (this.game.players[+!this.ownerID].board[i] != null) returnDictionary.enemySlots.push(-(-i))
        }
        return returnDictionary
    }
}
module.exports={card}