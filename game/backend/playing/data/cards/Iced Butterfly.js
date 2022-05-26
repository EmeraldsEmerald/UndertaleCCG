const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 735708,
    type: 0,
    name: "Iced Butterfly",
    baseCost: 1,
    baseAttack: 1,
    baseHP: 1,
    textbox: "{{kw:Encounter}}: Summon a {{cardReference:8}}",
    imageSource: "",
    rarity: 0,
    soul: 0,
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "IcedButterflyTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        let summonedMonster = this.owner.createNewCard(8)
        this.owner.summonMonster(summonedMonster)
    }
}
module.exports={card}