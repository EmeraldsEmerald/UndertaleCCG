const Listener = require('./Listener.js').Listener
class ListenerEmitter {
    constructor(game) {
        this.listeners = []
        this.pastEvents = []
        this.game = game
    }

    //An event happened. Anyone do something when it does?
    emitPassiveEvent(eventData, eventName) {
        if (!listenerData[eventName]) {
            console.log("No explanation found for event " + eventName + ". Did you create a new event and forget to add it?")
        }

        let data = {
            data: eventData,
            name: eventName
        }

        for (let i in this.listeners) {
            if (!this.listeners[i].isProperEvent(data)) {
                continue
            }
            if (!this.listeners[i].skipStack) {
                this.game.addToStack(() => { return this.listeners[i].func(data) },this.listeners[i].name)
            } else {
                this.listeners[i].func(data)
            }
        }
    }

    registerListener(listener) {
        this.listeners.push(listener)
    }

    removeListener(removableListener) {
        for (let i in this.listeners) {
            if (this.listeners[i] == removableListener) {
                this.listeners.splice(i, 1)
                return
            }
        }
    }
}

listenerData = {

}

module.exports = { ListenerEmitter }