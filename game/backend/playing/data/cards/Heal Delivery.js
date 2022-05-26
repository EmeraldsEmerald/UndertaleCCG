card = {
    id: 12,
    type: 1,
    name: "Heal Delivery",
    baseCost: 6,
    textbox: "Heal 25 HP to all allies.",
    imageSource: "",
    rarity: 0,
    soul: 0,
    onCast: function (played) {
        this.owner.addDualAnimation("showTargeted", {targets: this.calcTargets()}, 0)
        this.owner.addDualAnimation("triggerEffect", { card: this.getSendableData() }, 500)
        for (let i in this.owner.board) {
            if (this.owner.board[i] != null) this.owner.board[i].healHealth(this, 25)
        }
        this.owner.healHealth(this, 25)
    },
    calcTargets: function () {
        let alliesArray = []
        for (let i in this.owner.board) {
            if (this.owner.board[i] != null) alliesArray.push(-(-i));
        }
        return {
            allySlots: alliesArray,
            enemySlots: [],
            allyPlayer: true,
            enemyPlayer: false
        }
    }
}
module.exports={card}