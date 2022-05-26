const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 735707,
    type: 0,
    name: "Fox Head",
    baseCost: 3,
    baseAttack: 3,
    baseHP: 3,
    textbox: "[[kw:Encounter:Encounter]]: Deal 1 DMG to the leftmost and rightmost enemy monster.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "FoxHeadTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets()}, 0)
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        for (let i in this.calcTargets().enemySlots) {
            let j = this.calcTargets().enemySlots[i]
            this.game.players[+!this.ownerID].board[j].takeDamage(this, 1) 
        }
    },
    calcTargets: function () {
        let returnDictionary = { allySlots: [], enemySlots: [] }
        let left = null
        let right = null
        for (let i in this.game.players[+!this.ownerID].board) {
            if (this.game.players[+!this.ownerID].board[i] != null) {
                if (left == null) left = i
                right = i
            }
        }
        console.log(left, right, "left", "right")
        if (left != null) returnDictionary.enemySlots.push(-(-left))
        if (right != null) returnDictionary.enemySlots.push(-(-right))
        return returnDictionary
    }
}
module.exports={card}