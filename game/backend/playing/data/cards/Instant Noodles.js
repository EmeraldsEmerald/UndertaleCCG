const StatusEffect = require('../../classes/StatusEffect.js').StatusEffect

card = {
    id: 1,
    type: 1,
    name: "Instant Noodles",
    baseCost: 4,
    textbox: "Give a monster +4/+4.",
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
        for (let i in this.enemyPlayer.board) {
            if (this.enemyPlayer.board[i] != null) enemySlots.push(-(-i))
        }
        validTargets = {
            allySlots,
            enemySlots
        }
        return validTargets
    },
    onCast: function (played, target) {
        console.log(target, "target!")
        if (target != null) {
            this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
            this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
            target.addStatusEffect(
                StatusEffect.genStatBuff("Well-Fed", "+4/+4 from Instant Noodles.", attackAmount = 4, hpAmount = 4)
            )      
        }
    },
    calcTargets: function (target) {
        return {
            allySlots: target.owner == this.owner ? [target.slot] : [],
            enemySlots: target.owner != this.owner ? [target.slot] : [],
        }
    }
}
module.exports={card}