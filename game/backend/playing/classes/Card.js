const cardList = require('../data/cardListLoader.js')
const util = require('../../../util.js')
const ListenerReceiver = require('./ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('./ListenerEmitter.js').ListenerEmitter

class Card {
    constructor(id, owner, game, zone) {
        this.id = id
        this.owner = owner
        this._zone = zone

        this.keywords = []
        this.statusEffects = []
        this.auraEffects = []

        for (const [key, value] of Object.entries(cardList[id])) {
            this[key] = value;
        }

        this.modifiedCost = this.baseCost
        this.game = game
        this.uuid = this.game.nextUUID;
        this.sendable = ["id", "ownerID", "uuid", "zone", "baseCost", "modifiedCost", "isPlayable", "compiledTextbox", "statusEffects", "auraEffects"]

        this.listenerEmitter = new ListenerEmitter(this.game)
        this.listenerReceiver = new ListenerReceiver()

        this.game.cardsInGame.push(this)

        this.prevData = {}
    }

    set zone(value) {
        this._zone = value;
        switch (value) {
            case "void": //This card is permanently gone. If it shouldn't be, use 'limbo' instead!
//                this.game.cardsInGame.splice(this.game.cardsInGame.indexOf(this), 1)
                break
            default:
                break
        }
    }

    get zone() {
        return this._zone;
    }

    get isPlayable() {
        if (this.zone != "hand") return false
        let playable = true
        if (this.type == 1 || this.keywords.includes("Alert")) {
            let totalMana = this.owner.darkDollars + this.owner.tensionPoints
            if (totalMana < this.baseCost) playable = false 
        }
        else {
            if (this.owner.darkDollars < this.baseCost) playable = false
        }
        playable = this.modifyIsPlayable(playable)
        return playable
    }

    get ownerID() {
        return this.owner.id
    }

    get enemyPlayer() {
        return this.game.players[+!this.ownerID]
    }

    get compiledTextbox() {
        let dictionaryArray = []
        let openBrace
        let closeBrace
        let originalText = this.textbox

        while (originalText != "") {
            openBrace = originalText.indexOf('{{')
            closeBrace = originalText.indexOf('}}')

            if (openBrace == -1 || closeBrace == -1) {
                dictionaryArray.push({type: 'plain', value: originalText})
                originalText = ""
            } 
            else {
                if (openBrace != 0) dictionaryArray.push({type: 'plain', value: originalText.substring(0, openBrace)})
                dictionaryArray.push({type: 'evaluate', value: originalText.substring(openBrace + 2, closeBrace)})
                originalText = originalText.slice(closeBrace + 2)
            }
        }

        for (let i in dictionaryArray) {
            switch (dictionaryArray[i].type) {
                case 'plain':
                    originalText += dictionaryArray[i].value
                    break
                case 'evaluate':
                    let splitText = dictionaryArray[i].value.split(':')
                    switch (splitText[0]) {

                    }
                    break
            }
        }

        return originalText;
    }

    modifyIsPlayable(playable) {
        return playable
    }

    getSendableData() {
        let dataToSend = {}
        for (let i in this.sendable) {
//            console.log(this.sendable[i])
            dataToSend[this.sendable[i]] = this[this.sendable[i]]
        }
        return dataToSend
    }

    checkTypeSpecificUpdates(layer) {

    }

    checkUpdates(layer) {
        switch(layer) {
            case 'sendData':
                let dataToSend = {}
                let somethingChangedOrJustMmhSomethingLikeThat = false
                for (let i in this.sendable) {
                    if (this.prevData[this.sendable[i]] != this[this.sendable[i]]) {
                        somethingChangedOrJustMmhSomethingLikeThat = true
                        dataToSend[this.sendable[i]] = this[this.sendable[i]]
                    }
                    this.prevData[this.sendable[i]] = this[this.sendable[i]];
                }
                if (somethingChangedOrJustMmhSomethingLikeThat) {
                    switch(this.zone) {
                        case "hand":
                            this.owner.addAnimation("updateHandCardData", { value: dataToSend, pos: this.owner.hand.indexOf(this) }, 0)
                            break
                        case "board":
                            this.owner.addDualAnimation("updateBoardCardData", { value: dataToSend, pos: this.slot, ally: true}, 0)
                            break
                        default:
                            console.log("Fuck.")
                            break
                    }
                }
                break
            default:
                break
        }
        this.checkTypeSpecificUpdates(layer)
    }

    addStatusEffect(statusEffect) {
        this.statusEffects.push(statusEffect)
        statusEffect.modifyCard(this)
    }

    removeStatusEffect(statusEffect) {
        //Removing all auras
        let auraSize = this.auraEffects.length - 1
        for(let i in this.auraEffects) {
            this.auraEffects[auraSize - i].reverseFunc(this)
        }

        //Removing status until we hit the one we want
        let statusSize = this.statusEffects.length - 1
        let removedIndex = this.statusEffects.indexOf(statusEffect)
        for (let i in this.statusEffects) {
            this.statusEffects[statusSize - i].reverseFunc(this)
            if (this.statusEffects[statusSize-i] == statusEffect) { break }
        }

        //Reapply status and auras
        for (let j = removedIndex + 1; j < this.statusEffects.length; ++j) {
            this.statusEffects[j].modifyCard(this)
        }
        for (let i in this.auraEffects) {
            this.auraEffects[i].modifyCard(this)
        }
    }
}

module.exports = { Card }

/*
Most basic thing i will obtain eventually tm

- Board, Hand wit 2 card
- play mons card
- play spol card

*/