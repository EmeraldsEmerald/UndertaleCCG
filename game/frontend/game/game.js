const App = new Vue({
    el: '#app',
    data: {
        allCardList: {},
		keywords: {},
        tempCard: null,
		overlayText: '',
        allySlots: [null, null, null, null, null, null],
        enemySlots: [null, null, null, null, null, null],
        hand: [],
        JSON,
        sendThroughWebSocket,
        allyData: {
            darkDollars: 1,
			tensionPoints: 0,
            cardsInHand: 0,
            HP: 30,
            maxHP: 30, 
            soul: 0,
            name: ''
        },
        enemyData: {
            darkDollars: 1,
			tensionPoints: 0,
            cardsInHand: 0,
            HP: 30,
            maxHP: 30, 
            soul: 0,
            name: ''
        },
		playerCanRespond: false,
        ID: -1,
        turn: true,
        heldCard: null,
		selectedToAttack: null,
		allyAvatarFrameState: 'normal',
		selectingTarget: false,
		enemyAvatarFrameState: 'normal',
        heldCardOrigX: 0,
		heldCardOrigY: 0,
		mouseX: 0,
		mouseY: 0,
		heldCardOrigMouseX: 0,
		heldCardOrigMouseY: 0,
        gameEnded: false,
        won: false,
		defendOverlay: {
			display: false,
			ally: false,
			slotNum: -1
		},
		attackOverlay: {
			display: false,
			ally: false,
			slotNum: -1
		}
    },
    methods: {
		getAvatarFrameSprite: function (state) {
			switch(state) {
				case 'normal':
					return normalAvatarFrame
				case 'targetable':
					return targetableAvatarFrame
				case 'attacked':
					return attackedAvatarFrame
				case 'targeted':
					return targetedAvatarFrame
			}
		},
		shouldDisplayOverlay: function (overlay, ally, slot) {
			if (overlay == "defendOverlay") {
				return this.defendOverlay.ally == ally && this.defendOverlay.slotNum == slot && this.defendOverlay.display
			} else if (overlay == "attackOverlay") {
				return this.attackOverlay.ally == ally && this.attackOverlay.slotNum == slot && this.attackOverlay.display
            }
        },
		setOverlayText: function (text) {
			this.overlayText = text
		},
        calcHandX: function (i) {
			if (i == this.heldCard) {
				return (this.heldCardOrigX + this.mouseX - this.heldCardOrigMouseX) + "px"
			}
			return (50 + (i * 128)) + "px"
		},
        calcHandY: function (i) {
			if (i == this.heldCard) {
				return (this.heldCardOrigY + this.mouseY - this.heldCardOrigMouseY) + "px"
			}
			return "0px"
		},
        calcBoardX: function (i) {
			return (i * 189 + 189 / 2 - 128 / 2) + "px"
		},
        calcHandOpacity: function (i) {
			if (i == this.heldCard) {
				return "0.5"
			}
			return "1"
		},
        calcStyle: function (i) {
			style = { 'left': this.calcHandX(i), 'top': this.calcHandY(i), position: 'absolute' }
			if (this.hand[i].cardFrameState == 'highlighted') {
				style["cursor"] = "pointer"
			}
			if (i == this.heldCard) {
				style["z-index"]=9999
            }
			return style
		},
        getCardData: function (cardID) {
			return JSON.parse(JSON.stringify(this.allCardList[cardID]))
		},
		getKeywordData: function (keywordName) {
			return this.keywords[keywordName]
		},
        updateheldCard: function (eventData) {
			this.mouseX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX
			this.mouseY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
		},
		setHeldCard: function (eventData, i) {
//			console.log(eventData, i)
			if (this.hand[i].cardFrameState != "highlighted") {
				return
			}
			this.heldCardOrigY = -(-(this.calcHandY(i).slice(0, this.calcHandY(i).length - 2)))
			this.heldCardOrigX = -(-(this.calcHandX(i).slice(0, this.calcHandX(i).length - 2)))
			this.heldCardOrigMouseY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
			this.heldCardOrigMouseX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX

			this.heldCard = i
		},
        handleCardPlayed: function (eventData) {
            if (null === this.heldCard) { return }

            let releasedX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX
			let releasedY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
            if (this.hand[this.heldCard].type == 0) {
				if (releasedY > 261 + 67.83 & releasedY < 461 + 67.83) {
					let slotNumber = Math.floor((releasedX - 50) / (1324.53 / 7))
					if (slotNumber >= 0 && slotNumber < 7) {
						if (this.allySlots[slotNumber] == null) {
							sendThroughWebSocket(JSON.stringify({ type: 'playMonster', slotNumber, position: this.heldCard }))
						} 
					}
				}
			} else if (this.hand[this.heldCard].type == 1) {
				if (releasedX > 50 && releasedX < 50 + 1324.53 && releasedY > 61 + 67.83 & releasedY < 461 + 67.83) {
//					console.log("PlayingCard")
					sendThroughWebSocket(JSON.stringify({ type: 'playSpellCard', position: this.heldCard }))
				}
			}
			this.heldCard = null 
        },
        highlightCards: function () {
			this.deHighlightCards();
			this.playerCanRespond = true
			if (this.turn) {
				for (let i = 0; i < this.allySlots.length; i++) {
					if (this.allySlots[i] != null && this.allySlots[i].canAttack) {
						this.allySlots[i].cardFrameState = 'highlighted'
					}
				}
				for (let i = 0; i < this.hand.length; i++) {
					if (this.hand[i].isPlayable) {
						this.hand[i].cardFrameState = 'highlighted'
					}
				}
			} else {
				for (let i = 0; i < this.enemySlots.length; i++) {
					if (this.enemySlots[i] != null && this.enemySlots[i].canAttack) {
						this.enemySlots[i].cardFrameState = 'highlighted'
					}
				}
			}
		},
		deHighlightCards: function () {
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (this.enemySlots[i] != null) {
					this.enemySlots[i].cardFrameState = 'normal'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (this.allySlots[i] != null) {
					this.allySlots[i].cardFrameState = 'normal'
				}
			}
			for (let i = 0; i < this.hand.length; i++) {
				this.hand[i].cardFrameState = 'normal'
			}
			this.enemyAvatarFrameState = 'normal'
			this.allyAvatarFrameState = 'normal'
			this.playerCanRespond = false
		},
		toggleAttacking: function (pos) {
			if (this.selectedToAttack == null) {
				this.selectedToAttack = pos;
				this.highlightAttackable(this.allySlots[pos])
				this.allySlots[pos].cardFrameState = 'selected';
			} else {
				this.selectedToAttack = null;
				this.highlightCards();
			}
		},
		highlightAttackable: function (card) {
			this.deHighlightCards()
			console.log(card.ableToAttack, "i feel hatred towards these")
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (card.ableToAttack.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targetable'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (card.ableToAttack.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targetable'
				}
			}
			if (card.ableToAttack.enemyPlayer) {
				this.enemyAvatarFrameState = "targetable"
			}
			if (card.ableToAttack.allyPlayer) {
				this.allyAvatarFrameState = "targetable"
			}
		},
		highlightTargets: function (validTargets) {
			this.deHighlightCards()
			this.selectingTarget = true
			console.log(validTargets, "valid targets")
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (validTargets.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targetable'
					console.log(this.enemySlots[i].cardFrameState, "this.enemySlots[i].cardFrameState")
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (validTargets.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targetable'
				}
			}
			if (validTargets.allyPlayer) {
				this.allyAvatarFrameState = "targetable"
			}
			if (validTargets.enemyPlayer) {
				this.enemyAvatarFrameState = "targetable"
			}
		},
		highlightTargetsVisual: function (targets) {
			this.deHighlightCards()
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (targets.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targeted'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (targets.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targeted'
				}
			}
			if (targets.allyPlayer) {
				this.allyAvatarFrameState = "targeted"
			}
			if (targets.enemyPlayer) {
				this.enemyAvatarFrameState = "targeted"
			}
		},
		cardSelected: function (pos,enemy) {
			if (this.selectedToAttack != null) {
				if (enemy) {
					sendThroughWebSocket(JSON.stringify({ type: 'monsterAttack', initiator: this.allySlots[this.selectedToAttack], target: this.enemySlots[pos] }))
				} else {
					sendThroughWebSocket(JSON.stringify({ type: 'monsterAttack', initiator: this.allySlots[this.selectedToAttack], target: this.allySlots[pos] }))
				}
				this.selectedToAttack = null
				this.deHighlightCards()
			} else if (this.selectingTarget == true) {
				sendThroughWebSocket(JSON.stringify({ type: 'targetChosen', target: { location: enemy?"enemySlots":"allySlots", pos } }))
			}
		},
		playerSelected: function (enemy) {
			if (this.selectedToAttack != null) {
				if ((enemy == this.ID && this.allyAvatarFrameState == "normal") || (enemy == +!this.ID && this.enemyAvatarFrameState == "normal")) {
					return
				}

				sendThroughWebSocket(JSON.stringify({ type: 'playerAttack', initiator: this.allySlots[this.selectedToAttack], target: enemy }))
				this.selectedToAttack = null
				this.deHighlightCards()
			} else if (this.selectingTarget == true) {
				sendThroughWebSocket(JSON.stringify({ type: 'targetChosen', target: {location:"player",enemy} }))
            }
		},
		cancelCardPlayed: function () {
			console.log("Cancelling")
			sendThroughWebSocket(JSON.stringify({type: 'cancelChoose'}))
        }
    }
})
/*if (localStorage.allCardList) {
	App.allCardList = JSON.parse(localStorage.allCardList)
}*/
addEventListener("scroll", App.updateheldCard);
addEventListener("mousemove", App.updateheldCard);
addEventListener("mouseup", App.handleCardPlayed)