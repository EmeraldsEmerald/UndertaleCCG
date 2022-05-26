const ListenerReceiver = require('../../classes/ListenerReceiver.js').ListenerReceiver

card = {
    id: 13,
    type: 0,
    name: "Drawing Board",
    baseCost: 5,
    baseAttack: 8,
    baseHP: 1,
    textbox: "[[kw:Alert:Alert]]. [[kw:Encounter:Encounter]]: If you've played 2+ other monsters this game, draw your deck.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    keywords: ["Alert"],
    performSetup: function () {
        this.listenerReceiver.addEventHandler(
            "DrawingBoardTriggerPlayed",
            (event) => { this.play() },
            ListenerReceiver.genEventFunction("triggerPlayEvents"),
            this.listenerEmitter
        )
    },
    play: function () {
        console.log(this.game.history, "history")
        let relevance = this.game.getHistoryEvents( (event) => { return (event.type == 'summons' && event.played == true && event.card.uuid != this.uuid && event.card.ownerID == this.ownerID) } )
        console.log(relevance, "relevance")
        if (relevance.length >= 2) {
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
            this.owner.draw(this.owner.deck.length)
        }
    }
}
module.exports={card}