card = {
    id: 9,
    type: 1,
    name: "Gunshot",
    baseCost: 3,
    textbox: "Deal 1000 DMG to a monster.",
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
            target.takeDamage(this, 1000)       
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