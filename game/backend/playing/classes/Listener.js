class Listener {
    constructor(func, isProperEvent, skipStack, name) {
        //Name handlers.
        this.func = func
        this.isProperEvent = isProperEvent
        this.skipStack = skipStack
        this.name = name
    }
}
module.exports = { Listener }