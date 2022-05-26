const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 434,
    type: 0,
    name: "Buffed Wobbly Thing",
    baseCost: 3,
    baseAttack: 4,
    baseHP: 4,
    textbox: "[[kw:Encounter:Encounter]]: Die.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "DeadThingTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets()}, 0)
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        this.die()
    },
    calcTargets: function () {
        return {
            allySlots: [ -(-this.slot) ],
            enemySlots: [],
            allyPlayer: false,
            enemyPlayer: false
        }
    }
}
module.exports={card}