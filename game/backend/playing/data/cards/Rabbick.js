const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 21,
    type: 0,
    name: "Rabbick",
    baseCost: 3,
    baseAttack: 2,
    baseHP: 3,
    textbox: "[[kw:Perish:Perish]]: Summon a {Clean Rabbick}.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "RabbickTriggerDead",
            (event) => { this.perish() },
            ListenerReceiver.genEventFunction("allyMonsterDead"),
            this.listenerEmitter
        )
    },
    perish: function () {
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 400)
        this.owner.summonMonster(this.owner.createNewCard(22))
    }
}
module.exports={card}