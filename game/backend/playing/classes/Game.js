const Player = require('./Player.js').Player
const ListenerReceiver = require('./ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('./ListenerEmitter.js').ListenerEmitter
const util = require('../../../util.js')

class Game {
    constructor(id, decks, names) {
        this.id = id
        this._nextUUID = 0
        this.cardsInGame = []
        this.players = [new Player(0, names[0], decks[0], this), new Player(1, names[0], decks[0], this)]

        this.listenerEmitter = new ListenerEmitter(this)
        this.listenerReceiver = new ListenerReceiver(this)

        this.turnCount = 0
        this.currentTurnPlayer = 0
        this.nextTurnPlayer = 1

        this.effectStack = []
        this._stackClosed = true
        this.stackClosed = false

        this.gameStarted = false
        this.gameEnded = false

        this.history = []
        this.stateLayers = ["monsterDeath", "postMonsterDeath", "sendData"]

        this.addHistoryListeners()

        for (let j = 0; j < 6; ++j) this.players[0].directAddToHand(j)
        this.players[0].directAddToHand(13)
    }

    get stackClosed() {
        return this._stackClosed
    }

    get nextUUID() {
        this._nextUUID++
         return this._nextUUID;
    }

    set stackClosed(value) {
        this._stackClosed = value;
        if (!value) {
            this.checkStateBasedActions()
            this.evalNextStackEntry()  
        }
    }

    checkStateBasedActions() {
        for (let h in this.stateLayers) {
            for (let i in this.players) {
                for (let j in this.players[i].board) {
                    if (this.players[i].board[j] != null) this.players[i].board[j].checkUpdates(this.stateLayers[h]);
                }
                for (let j in this.players[i].hand) {
                    this.players[i].hand[j].checkUpdates(this.stateLayers[h]);
                }
            }
        }
    }

    addSocket(socket, pos) {
        socket.added = true;
        if (this.players[pos].webSocket) {
            this.players[pos].webSocket.close()
            this.players[pos].engageWebsocket(socket)
        } else {
            this.players[pos].engageWebsocket(socket)
        }
        this.players[pos].addAnimation("setID", { id: this.players[pos].id })
        this.players[pos].sendAnimations();
    }
    sendAnimations() {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].sendAnimations()
        }
    }
    nextTurn() {
        this.players[this.currentTurnPlayer].endTurn(this)
        let save = this.nextTurnPlayer
        this.nextTurnPlayer = this.currentTurnPlayer
        this.currentTurnPlayer = save
        this.turnCount+=1
        this.players[this.currentTurnPlayer].startTurn(this)
        this.checkStateBasedActions()
    }

    addToStack(func, debugDesc) {
        if (!this.stackClosed) {
            console.log("Executing: "+ debugDesc)
            this.stackClosed = true
            this.effectStack.push(func)
            this.evalNextStackEntry()
        } else {
            console.log("Stack is lock. Add to stack. "+debugDesc)
            this.effectStack.push(func)
        }
    }

    evalNextStackEntry() {
        if (this.effectStack.length == 0) return
        this.stackClosed = true;
        let spliceStack = this.effectStack.splice(this.effectStack.length - 1, 1)[0]
        if (!spliceStack()) {
            this.stackClosed = false
        }
    }

    addHistoryListeners() {
        this.listenerReceiver.addEventHandler(
            "gameStoreEvent",
            (event) => {
                switch (event.name) {
                    case "allyMonsterSummoned":
                        this.history.push({ turn: this.turnCount, player: 0, card: event.data.card.getSendableData(), type: "summons", played: event.data.played })
                        break
                    case "allyMonsterPlayed":
                        console.log(event.data.card, "event data card")
                        this.history.push({ turn: this.turnCount, player: 0, card: event.data.card.getSendableData(), type: "playMonster", target: event.data.target })
                        break
                    case "allySpellPlayed":
                        this.history.push({ turn: this.turnCount, player: 0, card: event.data.card.getSendableData(), type: "playSpell", target: event.data.target })
                        break
 /*                   case "allyDied":
                        this.history.push({ turn: this.turnCount, player: 0, card: event.data.card.getSendableCopy(), type: "cardDied" })
                        break */
                    default:
                        this.history.push({ turn: this.turnCount, player: 0, event })
                        break;
                }
            },
            (data) => {
                return [
                    "allyMonsterSummoned",
                    "allyMonsterPlayed",
                    "allySpellPlayed"
                ].includes(data.name)
            },
            this.players[0].listenerEmitter,
            true
        )

        this.listenerReceiver.addEventHandler(
            "gameStoreEvent",
            (event) => {
                switch (event.name) {
                    case "allyMonsterSummoned":
                        this.history.push({ turn: this.turnCount, player: 1, card: event.data.card.getSendableData(), type: "summons", played: event.data.played })
                        break
                    case "allyMonsterPlayed":
                        this.history.push({ turn: this.turnCount, player: 1, card: event.data.card.getSendableData(), type: "playMonster", target: event.data.target })
                        break
                    case "allySpellPlayed":
                        this.history.push({ turn: this.turnCount, player: 1, card: event.data.card.getSendableData(), type: "playSpell", target: event.data.target })
                        break
/*                    case "allyDied":
                        this.history.push({ turn: this.turnCount, player: 1, card: event.data.card.getSendableCopy(), type: "cardDied" })
                        break*/
                    default:
                        this.history.push({ turn: this.turnCount, player: 1, event })
                        break;
                }
            },
            (data) => {
                return [
                    "allyMonsterSummoned",
                    "allyMonsterPlayed",
                    "allySpellPlayed"
                ].includes(data.name)
            },
            this.players[1].listenerEmitter,
            true
        )

        this.listenerReceiver.addEventHandler(
            "gameStoreEvent",
            (data) => { this.history.push({ turn: this.turnCount, event: data }) },
            (data) => { return [].includes(data.name) },
            this.listenerEmitter,
            true
        )
    }

    getHistoryEvents(func) {
        let relevantEvents = []
        for (let i in this.history) {
            if (func(this.history[i])) relevantEvents.push(this.history[i])
        }
        return relevantEvents
    }
}

module.exports = { Game }