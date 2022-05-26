const cardList = require('../data/cardListLoader.js')
const keywordList = require('../data/keywords.js')
const Card = require('./Card.js').Card
const CardMonster = require('./CardMonster.js').CardMonster
const CardSpell = require('./CardSpell.js').CardSpell
const ListenerReceiver = require('./ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('./ListenerEmitter.js').ListenerEmitter
const util = require('../../../util.js')

class Player {
    constructor(id, name, deck, game) {
        this.id = id
        this.game = game
        this.name = name
        this.deck = []
        for (let d = 0; d < 30; ++d) {
            this.directAddToDeck(3 * (d%2), "bottomOfDeck")
        }

        this.listenerEmitter = new ListenerEmitter(this.game)
        this.listenerReceiver = new ListenerReceiver()

        this.currentHp = 30
        this.maxHp = 30
        this.fatigue = 1

        this._darkDollars = 1
        this.darkDollarsNext = 2
        this._tensionPoints = 0

        this.hand = []
        this.board = [null, null, null, null, null, null]
        this.maxHandSize = 10

        this.webSocket = 0
        this.animationsToSend = []

//        this.addAnimation("allCardList", { allCardList: cardList, keywords: keywordList })
    }

    set darkDollars(value) {
        this._darkDollars = Math.max(Math.min(value, 10), 0)
        this.addAnimation("updateAllyDarkDollars", { value: this._darkDollars }, 0)
        this.addEnemyAnimation("updateEnemyDarkDollars", { value: this._darkDollars }, 0)
    }
    set tensionPoints(value) {
        this._tensionPoints = Math.max(Math.min(value, 3), 0)
        this.addDualAnimation("updateTensionPoints", { value: this._tensionPoints, ally: true }, 0)
    }
    get darkDollars() {
        return this._darkDollars
    }
    get tensionPoints() {
        return this._tensionPoints
    }
    get enemyPlayer() {
        return this.game.players[+!this.id]
    }

    createNewCard(cardID) {
        let cardType = cardList[cardID].type
        switch(cardType) {
            case 0:
                return new CardMonster(cardID, this, this.game, "limbo")
                break
            case 1:
                return new CardSpell(cardID, this, this.game, "limbo")
                break
            default:
                return "fuck"
        }
    }
    
    addAnimation(type, data, time = 0) {
        if (this.animationsLocked) {
            return
        }
        let animation = { type, data, time }
/*        if (type == "awaitDeath") {
            let foundPrevAnim = true
            for (let i = this.animationsToSend.length - 1; i >= 0; i--) {
                let curAnim = this.animationsToSend[i]
                if (curAnim.type == "awaitDeath") {
                    curAnim.type = "multiAwaitDeath"
                    curAnim.data.allyList = [curAnim.data.ally, data.ally]
                    curAnim.data.slotList = [curAnim.data.slot, data.slot]
                    delete curAnim.data.ally
                    delete curAnim.data.slot
                    //move this to the end
                    this.animationsToSend = (this.animationsToSend.slice(0, i).concat(this.animationsToSend.slice(i + 1, this.animationsToSend.length))).concat(curAnim)
                    break
                } else if (curAnim.type == "multiAwaitDeath") {
                    curAnim.data.allyList.push(data.ally)
                    curAnim.data.slotList.push(data.slot)
                    //move this to the end
                    this.animationsToSend = (this.animationsToSend.slice(0, i).concat(this.animationsToSend.slice(i + 1, this.animationsToSend.length))).concat(curAnim)
                    break
                } else if ((curAnim.type != "updateBoardCardData" && curAnim.type != "updateHandCardData") || i == 0) {
                    foundPrevAnim = false
                    break
                }
            } 
            if (!foundPrevAnim) {
                this.animationsToSend.push(animation)
            }
        } */ if (false) {}
         else {
            this.animationsToSend.push(animation)
        }
    }

    addEnemyAnimation(type, data, time) {
        if (!this.game.players) {
            return
        }
        this.enemyPlayer.addAnimation(type, data, time)
    }

    addDualAnimation(type, data, time = 0) {
        this.addAnimation(type, data, time, true)
        data = JSON.parse(JSON.stringify(data))
        if (data.ally != undefined) {
            data.ally = !data.ally
        }
        if (data.targets != undefined) {
            data.targets = util.flipTargets(data.targets)
        }
        this.enemyPlayer.addAnimation(type, data, time, true)
    }

    startTurn() {
        this.addAnimation("beginTurn", {}, 0)
        this.darkDollars = this.darkDollarsNext
        if (this.darkDollarsNext < 10) {
            this.darkDollarsNext++
        }
        let num = ((this.darkDollarsNext) % 2) * 9 + 2
        if(!this.webSocket) {
            this.summonMonster(this.createNewCard(num));
            this.game.nextTurn()
        }
        for (let i = 0; i < this.board.length; ++i) {
            if (this.board[i] != null) this.board[i].turnStart()
        }
        this.draw()
    }

    endTurn() {
        this.addAnimation("endTurn", {}, 0)
        this.tensionPoints -= 1
        let prevPoints = this.tensionPoints
        this.tensionPoints += this.darkDollars
        this.darkDollars -= (this.tensionPoints - prevPoints)
    }

    draw(amount = 1) {
        if (amount > 1) {
            for (let i = 0; i < amount; ++i) this.draw()
        }
        else {
            if (this.deck.length > 0) {
                if (this.hand.length < this.maxHandSize) {
                    let drawnCard = this.deck.splice(0, 1)[0]
                    this.hand.push(drawnCard)
                    this.addAnimation("addedToHand", { card: drawnCard.getSendableData() }, 0)
                    this.addAnimation("updateAllyCards", { value: this.hand.length }, 0)
                    this.addEnemyAnimation("updateEnemyCards", { value: this.hand.length }, 0)
                    drawnCard.zone = "hand"
                }
                else {
                    let burntCard = this.deck.splice(0, 1)[0]
                    this.addDualAnimation("burnCard", { card: burntCard.getSendableData() }, 400)
                }
            }
            else {
                this.takeDamage(this, this.fatigue, true)
                ++this.fatigue
            }
        }
    }

    sendAnimations() {
        if (this.animationsToSend.length == 0 || !this.webSocket) {
            return
        }
        console.log(this.animationsToSend, " zoink")
        this.webSocket.send(
            JSON.stringify(
                {
                    animationList: this.animationsToSend
                }
            )
        )
        this.animationsToSend = []
    }

    handleSocketMessage(message) {
        try {
            message = JSON.parse(message)
//            console.log(message, "Player class handler")
            switch (this.state) {
                case "waitingForTarget":
                    switch (message.type) {
                        case "targetChosen":
                            if (util.isValidTarget(this.validTargets, message.target)) {
                                let save = this.onTargetChosen
                                this.state = "default"
                                this.onCancelChoose = null
                                this.onTargetChosen = null
                                this.validTargets = null
                                this.addAnimation("clearTargetSelection", {})
                                save(this.parseTarget(message.target))
                                this.game.sendAnimations()
                            }
                            break
                        case "cancelChoose":
                            console.log("cancelling choice")
                            this.onCancelChoose()
                            this.state = "default"
                            this.onCancelChoose = null
                            this.onTargetChosen = null
                            this.validTargets = null
                            this.addAnimation("clearTargetSelection", {})
                            this.game.sendAnimations()
                            break
                        default:
                            break
                    }
                    break
                default:
                    switch (message.type) {
                        case "playMonster":
                            this.playMonster(message.position, message.slotNumber)
                            this.game.sendAnimations()
                            break;
                        case "playSpellCard":
                            this.playSpell(message.position)
                            this.game.sendAnimations()
                            break;
                        case "endTurn":
                            if (this.game.currentTurnPlayer == this.id) {
                                this.game.nextTurn()
                                this.game.sendAnimations()
                            }
                            break;
                        case "monsterAttack":
//                            console.log("I got this monster attacking")
                            if (message.initiator.ownerID == this.id) {
                                let attackingMonster = this.board[message.initiator.slot]
                                let defendingMonster = this.game.players[message.target.ownerID].board[message.target.slot]
                                this.game.addToStack(() => { attackingMonster.attackMonster(defendingMonster, false) })
                                this.game.sendAnimations()
                            }
                            break
                        case "playerAttack":
//                            console.log("I got the player being attacked")
                            if (message.initiator.ownerID == this.id) {
                                let attackingMonster = this.board[message.initiator.slot]
                                this.game.addToStack(() => { attackingMonster.attackPlayer(this.game.players[message.target], false) })
                                this.game.sendAnimations()
                            }
                            break
                            //				sendThroughWebSocket(JSON.stringify({ type: 'playerAttack', initiator: this.allySlots[this.selectedToAttack], target: enemy }))
                    }
                    break
            }
        } catch(e) {
            console.log(message)
            console.log(e)
        }
    }

    engageWebsocket(socket) {
        this.webSocket = socket
        this.webSocket.on('message', (message) => { this.handleSocketMessage(message) })
    }

    parseTarget(target) {
        switch (target.location) {
            case 'allySlots':
                return this.board[target.pos]
                break
            case 'enemySlots':
                return this.enemyPlayer.board[target.pos]
                break
            case 'player':
                return this.game.players[target.enemy]
                break
        }
    }

    healHealth(source, amount) {
        this.currentHp += amount
        this.currentHp = Math.min(this.currentHp, this.maxHp)
        this.addDualAnimation("updatePlayerHealth", {ally: true, newHP: this.currentHp}, 0)
    }

    takeDamage(source, amount, realFatigue = false) {
//        console.log(amount, "Taking dmg.")
        if (amount < 0) amount = 0
        this.currentHp -= amount
        this.addDualAnimation("updatePlayerHealth", {ally: true, newHP: this.currentHp}, 0)
        if (realFatigue) ++this.fatigue
    }

    handleCardPayment(card) {
        if (card.type == 1 || card.keywords.includes("Alert")) {
            let costToPay = card.baseCost
            costToPay -= this.tensionPoints
            this.tensionPoints = -costToPay //evil code bullshit - it works!
            this.darkDollars -= Math.max(0, costToPay) //not as evil code bullshit
        }
        else {
            this.darkDollars -= card.baseCost
        }
    }

    playMonster(handSlot, boardSlot) {
        if (this.board[boardSlot] != null || boardSlot >= this.board.length || handSlot >= this.hand.length || boardSlot < 0) {
            return
        }
        let card = this.hand[handSlot]
        if (!card.isPlayable) {
            return
        }
        if (card.requiresTarget && !util.targetsEmpty(card.getValidTargets())) {
            this.removeCardHand(handSlot, false)
            this.waitForTargetCancellable(
                card,
                (target) => {
                    this.handleCardPayment(card)
                    this.addEnemyAnimation("updateEnemyCards", { value: this.hand.length })
                    this.summonMonster(card, boardSlot, true, target)
                    this.listenerEmitter.emitPassiveEvent({ card : card, target: target }, "allyMonsterPlayed");
                },
                () => {
                    this.hand.splice(handSlot, 0, card)
                    this.addAnimation("updateAllyCards", { value: this.hand.length })
                    this.addAnimation("addCardHandPos", { pos: handSlot, card: card.getSendableData() })
                }
            )
            return
        }
        else {
            this.game.addToStack( () => {
            this.handleCardPayment(card)
            this.removeCardHand(handSlot)
            this.summonMonster(card, boardSlot, true)
            this.listenerEmitter.emitPassiveEvent({ card : card, target: null }, "allyMonsterPlayed");
            }, "Playing a monster from hand")
        }
    }

    playSpell(handSlot) {
        if (handSlot >= this.hand.length) return
        let card = this.hand[handSlot]
//        console.log(card ,"We're playing a spell")
        if (!card.isPlayable) return
        if (card.requiresTarget && !util.targetsEmpty(card.getValidTargets())) {
//            console.log("We're playing a targeted spell")
            this.removeCardHand(handSlot, false)
            this.waitForTargetCancellable(
                card,
                (target) => {
                    this.game.addToStack( () => {
                        this.handleCardPayment(card)
                        this.addEnemyAnimation("updateEnemyCards", { value: this.hand.length })
                        this.castSpell(card, true, target)
                        this.listenerEmitter.emitPassiveEvent({ card : card, target: target }, "allySpellPlayed");
                        }, "Casting a spell from hand")
                },
                () => {
                    this.hand.splice(handSlot, 0, card)
                    this.addAnimation("updateAllyCards", { value: this.hand.length })
                    this.addAnimation("addCardHandPos", { pos: handSlot, card: card })
                }
            )
            return
        }
        else {
            this.game.addToStack( () => {
            this.handleCardPayment(card)
            this.removeCardHand(handSlot)
            this.castSpell(card, true)
            this.listenerEmitter.emitPassiveEvent({ card : card, target: null }, "allySpellPlayed");
            }, "Casting a spell from hand")
        }
    }

    summonMonster(card, slot = null, played = false, target = null) {
        if (slot == null) {
            for (let i = 0; i < this.board.length; ++i) {
                if (this.board[i] == null) {
                    slot = i
                    break
                }
            }
        }
        if (slot == null || this.board[slot] != null || slot >= this.board.length || slot < 0) {
            return false
        }

        this.board[slot] = card
        card.setupSummon(slot)
        card.onSummon(played, target)
        return true
    }

    castSpell(card, played = false, target = null) {
        card.zone = "void"
        card.onCast(played, target)
        this.addDualAnimation("triggerEffect", {card: card.getSendableData()}, 500)
    }

    removeCardHand(index, enemySee = true) {
        this.hand.splice(index, 1)
        this.addAnimation("removeCardHand", { index })
        this.addAnimation("updateAllyCards", { value: this.hand.length })
        if (enemySee) this.addEnemyAnimation("updateEnemyCards", { value: this.hand.length })
    }

    shuffleDeck() {
        util.shuffle(this.deck)
    }

    directAddToHand(cardID) {
        if (this.maxHandSize == this.hand.length) {
            return
        }
        let card = this.createNewCard(cardID)
        card.zone = "hand"
        this.hand.push(card)
        this.addAnimation("addedToHand", { card: card.getSendableData() }, 100)
        this.addAnimation("updateAllyCards", { value: this.hand.length }, 0)
        this.addEnemyAnimation("updateEnemyCards", { value: this.hand.length }, 0)
        return card
    }

    directAddToDeck(cardID, position_condition = "shuffle") {
        let card = this.createNewCard(cardID)
        card.zone = "deck"
        switch(position_condition) {
            case "shuffle":
                this.deck.push(card)
                shuffleDeck()
                break
            case "topOfDeck":
                this.deck = [ card ].concat(deck)
                break
            case "bottomOfDeck":
                this.deck.push(card)
                break
        }
        return card
    }

    waitForTargetCancellable(card, onTargetChosen, onCancelChoose) {
        this.validTargets = card.getValidTargets()
        this.addAnimation("getTargetCancellable", { validTargets: this.validTargets, card: card.getSendableData() }, 0)
        this.state = "waitingForTarget",
        this.onCancelChoose = onCancelChoose
        this.onTargetChosen = onTargetChosen
        this.targetDemandingCard = card
    }
}

module.exports = { Player }