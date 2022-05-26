const express = require("express")
const Game = require('./game/backend/playing/classes/Game.js').Game
const cardList = require('./game/backend/playing/data/cardListLoader.js')
const keywords = require('./game/backend/playing/data/keywords.js').keywords
console.log("Hello! Card List! ", cardList)
module.exports = { cardList }
const helmet = require('helmet');
const { Server } = require('ws');
const path = require('path')
const PORT = process.env.PORT || 8081

let app = express()
    .use(helmet({
        contentSecurityPolicy: false,
    }))
    .use(express.static(path.join(__dirname, 'game', 'frontend'), { index: 'game.html' }))
//    .get('/', (req, res) => res.render('game'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`, __dirname))

const newGame = new Game(0, [], ["Strezah", "Sktima"])

//websocket

const wsServer = new Server({ server: app });
wsServer.on('connection', socket => {
    socket.on('message', message => {
        if (socket.added) {
            return
        }
        try {
            let data = JSON.parse(message)
            if (data.socketType == "gameWS") {
                socket.send(JSON.stringify({ animationList: [{ type: "allCardList", data: { allCardList: cardList, keywords: keywords } }] }))
//                console.log(socket, "wow it the new game scket its like a")
                newGame.addSocket(socket, 0)
                /*if (data.type == "verifyIdentity") {
                    if (Database.data.players[data.username] && Database.data.players[data.username].loginID == data.loginID) {
                        let oldSocket = Database.getWebsocket(data.username)
                        if (oldSocket) {
                            oldSocket.close()
                            Database.updateSockets()
                        }
                        if (Database.data.players[data.username].activeGame != null) {
                            gameStates[Database.data.players[data.username].activeGame].addSocket(socket, data.username)
                        } else {
                            socket.send(JSON.stringify({ animationList: [{ 'type': 'gameFound', data: { successful: false } }] }))
                        }
                    } else {
                        socket.send(JSON.stringify({ animationList: [{ 'type': 'verificationResult', data: { successful: false } }] }))
                    }
                } else*/// if (data.type == "loadAllCards") {
                //}
            } /*else if (data.socketType == "dbWS") {
                Database.newWebSocket(socket)
                socket.added = true;
                Database.handleMessage(message, socket)
            }*/
        } catch (e) {
            console.log(e)
        }
    });
});
