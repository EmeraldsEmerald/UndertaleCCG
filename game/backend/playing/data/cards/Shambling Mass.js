const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 666,
    type: 0,
    name: "Shambling Mass",
    baseCost: 6,
    baseAttack: 6,
    baseHP: 5,
    textbox: "[[kw:Encounter:Encounter]]: Deal Fatigue DMG to your opponent.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "ShamblingMassTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets()}, 0)
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        this.enemyPlayer.takeDamage(this, this.enemyPlayer.fatigue, true)
    },
    calcTargets: function () {
        let returnDictionary = { allySlots: [], enemySlots: [], allyPlayer: false, enemyPlayer: true}
        return returnDictionary
    }
}
module.exports={card}