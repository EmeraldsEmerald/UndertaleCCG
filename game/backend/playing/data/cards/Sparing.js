const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 77,
    type: 0,
    name: "Sparing",
    baseCost: 6,
    baseAttack: 2,
    baseHP: 8,
    textbox: "[[kw:Encounter:Encounter]]: Summon 2 [[card:678:Children]].",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "SparingTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        let summonedMonster = this.owner.createNewCard(678)
        this.owner.summonMonster(summonedMonster)
        this.owner.summonMonster(summonedMonster)
    }
}
module.exports={card}