const cardList = require('../data/cardListLoader.js')
const Card = require('./Card.js').Card

class CardMonster extends Card {
    constructor(id, owner, game, zone) {
        super(id, owner, game, zone)
        this.summoningSick = true
        this._damage = 0
        this.hasAttacked = false
        this.slot = null
        this.modifiedAttack = this.baseAttack
        this.modifiedHP = this.baseHP
        this.sendable = this.sendable.concat(["baseAttack", "baseHP", "modifiedAttack", "modifiedHP", "realHP", "canAttack", "ableToAttack", "slot"])
    }

    set damage(value) {
        this._damage = Math.max(0, value)
    }

    get damage() {
        return this._damage;
    }

    get realHP() {
        return this.modifiedHP - this.damage
    }

    get canAttack() {
        if (this.hasAttacked) return false
        else if (this.summoningSick && !this.keywords.includes("Charge")) return false
        else return true
    }

    get opponentHasGuard() {
        let returner = false
        for (let i = 0; i < this.enemyPlayer.board.length; ++i) {
            if (this.enemyPlayer.board[i] != null) {
                if (this.enemyPlayer.board[i].keywords.includes("Guard")) {
                    console.log("guard")
                    returner = true
                }
            }
        }
        return returner
    }

    get ableToAttack() {
        let attackables = {allySlots : [], enemySlots : [], enemyPlayer: false, allyPlayer: false}
        if (!this.canAttack) return attackables
        else if (this.opponentHasGuard) {
            console.log("guard is trye")
            for (let i = 0; i < this.enemyPlayer.board.length; ++i) {
                if (this.enemyPlayer.board[i] != null) {
                    if (this.enemyPlayer.board[i].keywords.includes("Guard")) attackables.enemySlots.push(i)
                }
            }
        }
        else {
            console.log("Hi i am here")
            attackables.enemyPlayer = true
            for (let i = 0; i < this.enemyPlayer.board.length; ++i) {
                if (this.enemyPlayer.board[i] != null) attackables.enemySlots.push(i)
            }
        }
        return attackables
    }

    turnStart() {
        this.hasAttacked = false
        this.summoningSick = false
    }

    checkTypeSpecificUpdates(layer) {
        switch(layer) {
            case 'monsterDeath':
                if (this.realHP <= 0) {
                    this.die()
                }
                break
            default:
                break
        }
    }

    attackMonster(target, override) {
        if (!override && !this.canAttack) return
        if (!(target.ownerID == this.ownerID && this.ableToAttack.allySlots.includes(target.slot)) && !(target.ownerID !== this.ownerID && this.ableToAttack.enemySlots.includes(target.slot))) return
        this.attacking = "monster"
        this.owner.addDualAnimation("displayAttackOverlay", { ally: true, slot: this.slot }, 0)
        this.owner.addDualAnimation("displayDefendOverlay", { ally: false, slot: target.slot }, 400)

        this.owner.addDualAnimation("hideAttackOverlay", {}, 0)
        this.owner.addDualAnimation("hideDefendOverlay", {}, 0)

        this.game.addToStack(() => {
        let enemyDamage = target.modifiedAttack
        target.takeDamage(this, this.modifiedAttack)
        this.takeDamage(target, enemyDamage)
        }, "An entire Attack")

        this.attacking = false
        this.hasAttacked = true
    }

    attackPlayer(target, override) {
        if (!override && !this.canAttack) return
        if (!(target.id == this.ownerID && this.ableToAttack.allyPlayer) && !(target.id !== this.ownerID && this.ableToAttack.enemyPlayer)) return
        
        this.attacking = "player"
        this.owner.addDualAnimation("displayAttackOverlay", { ally: true, slot: this.slot }, 0)
        this.owner.addDualAnimation("displayAvatarAttacked", { ally: false }, 400)

        this.owner.addDualAnimation("hideAttackOverlay", {}, 0)
        this.owner.addDualAnimation("hideAvatarAttacked", { ally: false }, 0)

        this.game.addToStack(() => {
            target.takeDamage(this, this.modifiedAttack)
        }, "An entire Player Attack")

        this.attacking = false
        this.hasAttacked = true
    }

    healHealth(source, amount) {
        this.damage -= amount
    }

    takeDamage(source, amount) {
//        console.log(amount, "Taking dmg.")
        if (amount < 0) amount = 0
        this.damage += amount
    }

    die() {
        this.owner.board[this.slot] = null
        this.zone = "graveyard"
        this.owner.addDualAnimation("awaitDeath", { ally: true, slot: this.slot }, 300)
        this.listenerEmitter.emitPassiveEvent({ card: this }, "allyMonsterDead");
    }

    performSetup() {

    }

    onSummon(played, target) {
        if (played) {
            this.listenerEmitter.emitPassiveEvent({ target }, "triggerPlayEvents");
        }
        this.owner.listenerEmitter.emitPassiveEvent({ card : this, played }, "allyMonsterSummoned");
    }

    setupSummon(slot) {
        this.slot = slot
        this.zone = "board"
        if (this.keywords.includes("Charge")) this.summoningSick = false
        this.owner.addDualAnimation("summonMonster", { card: this.getSendableData(), slot, ally: true }, 0)
        this.performSetup()
    }
}

module.exports = { CardMonster }