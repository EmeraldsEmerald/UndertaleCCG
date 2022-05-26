card = {
    id: 14,
    type: 1,
    name: "First Charge",
    baseCost: 1,
    textbox: "If you've targeted three allies this game, give an ally monster [[kw:Charge:Charge]].",
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
        validTargets = {
            allySlots,
            enemySlots
        }
        return validTargets
    },
    onCast: function (played, target) {
        console.log(target, "target!")
        let relevance = this.game.getHistoryEvents( (event) => { 
            return ( (event.type == 'playMonster' || event.type == 'playSpell') 
            && event.player == this.ownerID
            && event.target != null
            && (event.target.ownerID == this.ownerID || event.target.id == this.ownerID)
            && event.card.uuid != this.uuid) 
        } )
        console.log(relevance, "relevance")
        if (relevance.length >= 3) {
            if (target != null) {
                this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
                this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
                target.keywords.push("Charge")      
            }
        }
    },
    calcTargets: function (target) {
        return {
            allySlots: target.owner == this.owner ? [target.slot] : [],
            enemySlots: []
        }
    }
}
module.exports={card}