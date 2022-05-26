function handleNextAnimation(animations) {
    console.log(animations)
    let animation = animations.splice(0, 1)[0]
    let data = animation.data
    let temp
    switch (animation.type) {
        //Setup-game related
        case "setID": 
            App.ID = data.id
            break
        case "allCardList":
            App.allCardList = data.allCardList
            console.log(data.keywords)
            App.keywords = data.keywords
            break

        //Updating cards and vars
        case "updateAllyCards":
            App.allyData.cardsInHand = data.value
            break
        case "updateEnemyCards":
            App.enemyData.cardsInHand = data.value
            break
        case "updateAllyDarkDollars":
            App.allyData.darkDollars = data.value
            break
        case "updateEnemyDarkDollars":
            App.enemyData.darkDollars = data.value
            break
        case "updateTensionPoints":
            if (data.ally) App.allyData.tensionPoints = data.value
            else App.enemyData.tensionPoints = data.value
        case "updateHandCardData":
//            console.log("Pinged with updater check")
            card = App.hand[data.pos];
//            console.log(App.hand, " this is your hand")
            for (const [key, value] of Object.entries(data.value)) {
                Vue.set(card, key, value)
            }
            break
        case "updateBoardCardData":
//            console.log("Pinged with board updater check")
            if (data.ally) card = App.allySlots[data.pos];
            else card = App.enemySlots[data.pos];
//            console.log(card, " this is the chosen board")
            for (const [key, value] of Object.entries(data.value)) {
                Vue.set(card, key, value)
            }
            break
        case "updatePlayerHealth":
            if (data.ally) App.allyData.HP = data.newHP
            else App.enemyData.HP = data.newHP
            break

        //Turn-related
        case "beginTurn":
            App.turn = true
            break
        case "endTurn":
            App.turn = false
            App.selectedToAttack = null
            break

        //Target-related
        case "clearTargetSelection":
            App.tempCard = null
            App.selectingTarget = false
            break
        case "getTargetCancellable":
            temp = data.card
            for (const [key, value] of Object.entries(App.allCardList[temp.id])) {
                if (temp[key] == undefined) temp[key] = value;
            }

            data.card.cardFrameState = "selected"
            Vue.set(App, 'tempCard', temp)
//            console.log(data.validTargets, "we are getting cancellable target")
            App.highlightTargets(data.validTargets)
            break
        case "getTargetNotCancellable":
            App.highlightTargets(data.validTargets)
            break
        case "showTargeted":
            App.highlightTargetsVisual(data.targets)
            break

        //Draw-related
        case "burnCard":
            temp = data.card
            for (const [key, value] of Object.entries(App.allCardList[temp.id])) {
                if (temp[key] == undefined) temp[key] = value;
            }

            data.card.cardFrameState = "dying"
//            console.log(data.card, " le burn carde")
            Vue.set(App, 'tempCard', data.card)
            animations = [{ type: "clearBurntCard", time: 0, data: {} }].concat(animations)
            break
        case "clearBurntCard": 
            App.tempCard = null
            App.deHighlightCards()
            break

        //Handy Stuff
        case "addedToHand":
            temp = data.card
            for (const [key, value] of Object.entries(App.allCardList[temp.id])) {
                if (temp[key] == undefined) temp[key] = value;
            }

            App.hand.push(temp)
            Vue.set(App.hand[App.hand.length - 1], 'cardFrameState', 'normal')
            break
        case "addCardHandPos":
            temp = data.card
            for (const [key, value] of Object.entries(App.allCardList[temp.id])) {
                if (temp[key] == undefined) temp[key] = value;
            }

            App.hand.splice(data.pos,0,temp)
            Vue.set(App.hand[data.pos], 'cardFrameState', 'normal')
//            console.log(App.hand[data.pos], "!")
            break
        case "removeCardHand":
            App.hand.splice(data.index, 1)
            break

        //Attacking code
        case "displayAttackOverlay":
            App.attackOverlay.ally = data.ally
            App.attackOverlay.slotNum = data.slot
            App.attackOverlay.display = true
            break
        case "hideAttackOverlay":
            App.attackOverlay.display = false
            break
        case "displayDefendOverlay":
            App.defendOverlay.ally = data.ally
            App.defendOverlay.slotNum = data.slot
            App.defendOverlay.display = true
            break
        case "hideDefendOverlay":
            App.defendOverlay.display = false
            break
        case "displayAvatarAttacked":
            if (data.ally) {
                App.allyAvatarFrameState = "attacked"
            } else {
                App.enemyAvatarFrameState = "attacked"
            }
            break
        case "hideAvatarAttacked":
            if (data.ally) {
                App.allyAvatarFrameState = "normal"
            } else {
                App.enemyAvatarFrameState = "normal"
            }
            break

        //Effect-related code
        case "triggerEffect":
            if (data.card._zone != "board") {
                data.card.cardFrameState = "selected"
                Vue.set(App, 'tempCard', data.card)
                animations = [{ type: "clearEffectTrigger", time: 0, data: {} }].concat(animations)
            } else {
                if (data.card.ownerID == App.ID) {
                    App.allySlots[data.card.slot].cardFrameState = "selected"
                    Vue.set(App.allySlots[data.card.slot], 'emittingAction', true)
                    animations = [{ type: "clearEffectTriggerBoard", time: 0, data: { ally: true, slot: data.card.slot } }].concat(animations)
                } else {
                    App.enemySlots[data.card.slot].cardFrameState = "selected"
                    Vue.set(App.enemySlots[data.card.slot], 'emittingAction', true)
                    animations = [{ type: "clearEffectTriggerBoard", time: 0, data: { ally: false, slot: data.card.slot } }].concat(animations)
                }
            }
            break
        case "clearEffectTriggerBoard":
            if (data.ally) {
                App.allySlots[data.slot].cardFrameState = "normal"
                Vue.set(App.allySlots[data.slot], 'emittingAction', false)
            } else {
                App.enemySlots[data.slot].cardFrameState = "normal"
                Vue.set(App.enemySlots[data.slot], 'emittingAction', false)
            }
            break

        //Board related code
        case "summonMonster":
            temp = data.card
            for (const [key, value] of Object.entries(App.allCardList[temp.id])) {
                if (temp[key] == undefined) temp[key] = value;
            }
            if (data.ally) {
                Vue.set(App.allySlots, data.slot, temp)
                Vue.set(App.allySlots[data.slot], 'cardFrameState', 'normal')
            }
            else {
                Vue.set(App.enemySlots, data.slot, temp)
                Vue.set(App.enemySlots[data.slot], 'cardFrameState', 'normal')
            }
            break
        case "awaitDeath":
            if (data.ally) {
                App.allySlots[data.slot].cardFrameState = 'dying'
                animations = [{ type: "disappear", time: 0, data }].concat(animations)
            } else {
                App.enemySlots[data.slot].cardFrameState = 'dying'
                animations = [{ type: "disappear", time: 0, data }].concat(animations)
            }
            break
        case "disappear":
            if (data.ally) {
                Vue.set(App.allySlots,data.slot, null)
            } else {
                Vue.set(App.enemySlots, data.slot, null)
            }
            break
    }
    if (animations.length > 0) {
        if (animation.time > 0) {
            setTimeout(handleNextAnimation, animation.time, animations)
        } else {
            handleNextAnimation(animations)
        }
    }
    if (animations.length == 0 && !App.selectingTarget) {
        App.highlightCards()
    }
}