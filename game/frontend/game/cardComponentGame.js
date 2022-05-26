Vue.component('card', {
    data: function () {
        return {
            tempCard: null,
        }
    },
    computed: {
        createTextbox: function () {
            let dictionaryArray = []
            let openBrace
            let closeBrace
            let originalText = this.card.compiledTextbox
    
            while (originalText != "") {
                openBrace = originalText.indexOf('[[')
                closeBrace = originalText.indexOf(']]')
    
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
    
            console.log(dictionaryArray, "array")
            let returnedArray = []
            for (let i in dictionaryArray) {
                switch (dictionaryArray[i].type) {
                    case 'plain':
                        returnedArray.push(dictionaryArray[i])
                        break
                    case 'evaluate':
                        let splitText = dictionaryArray[i].value.split(':')
                        switch (splitText[0]) {
                            case 'kw':
                                returnedArray.push({ type: 'kw', value: splitText[1], keyword: splitText[2] })
                                break
                            default:
                                returnedArray.push({ type: 'plain', value: dictionaryArray[i].value })
                                break
                        }
                        break
                }
            }
            console.log(returnedArray, "returned array")
            return returnedArray;
        },
    },
    methods: {
        setTempCard: function (cardName) {
            this.tempCard = this.getCardData(cardName)
            this.tempCard.cardFrameState = 'normal'
            this.tempCard.name = cardName
        },
        calcKeywordX: function (i) {
            let x = 100
            if (this.card.dreamVariant || this.card.awakenedDreamVariant) {
                x -= 20
            }
            x -= i * 20
            return x + 'px'
        },
        calcStyle: function () {
            style = {}
            if ((this.card.cardFrameState == 'highlighted' || this.card.cardFrameState == 'targetable' || (this.card.cardFrameState == 'selected' && this.zone != 'stack') )&&!this.card.emittingAction) {
                style["cursor"] = "pointer"
            }
            return style
        },
        getCardFrame: function (state, type) {
            if (type == 0) {
                switch (state) {
                    case 'normal':
                        return normalCardFrame
                    case 'highlighted':
                        return highlightedCardFrame
                    case 'selected':
                        return selectedCardFrame
                    case 'targetable':
                        return targetableCardFrame
                    case 'targeted':
                        return targetedCardFrame
                    case 'dying':
                        return dyingCardFrame
                    default:
                        return null
                }
            } else if (type == 1) {
                switch (state) {
                    case 'normal':
                        return normalSpellCardFrame
                    case 'highlighted':
                        return highlightedSpellCardFrame
                    case 'selected':
                        return selectedSpellCardFrame
                    case 'dying':
                        return dyingSpellCardFrame
                    default:
                        return null
                }
            }
        },
        handleClick: function (event) {
            if (!this.active || this.card.cardFrameState == "normal") return;
            console.log(this.card.zone, "handling click")
            switch(this.card.zone) {
                case "hand":
                    if (this.card.cardFrameState == "selected") {
                        this.$emit("cancel-card-played")
                    } else {
                        this.$emit('set-held-card', event, this.pos)
                    }
                    break
                case "board":
//                    console.log(this.card.ownerID, App.ID, "identity")
                    if (this.card.ownerID == App.ID) {
                        switch(this.card.cardFrameState) {
                            case "highlighted":
                                this.$emit('toggle-attacking', this.pos)
                                break
                            case "targetable":
                                this.$emit('card-selected', this.pos, false)
                                break
                            case "selected":
                                this.$emit('toggle-attacking', this.pos)
                                break
                            default:
                                break
                        }
                    }
                    else {
                        switch(this.card.cardFrameState) {
                            case "targetable":
                                this.$emit('card-selected', this.pos, true)
                                break
                            default:
                                break
                        }
                    }
                    break
                case "beingPlayed":
                    if (this.card.cardFrameState == "selected") {
                        console.log("the card is selected")
                        this.$emit("cancel-card-played")
                    }
                default:
                    console.log("Fuck. (client-side)")
                    break
            }
        }
    },
    props: ['card', 'opacity', 'getCardData', 'getKeywordData', 'pos', 'zone','active'],
    template:
        `
        <span v-on:mousedown.left="handleClick" :style="{'opacity':opacity}">
        <div :style="calcStyle()">
            <div class = "card" v-if="card.type==0">
              <img draggable = "false" :src = "getCardFrame(card.cardFrameState,card.type)"/>
              <div class = "cardName">{{card.name}}</div>
              <div class = "cardCost">{{card.modifiedCost!=null?card.modifiedCost:card.baseCost}}</div>
              <div class = "cardHP" style = "color:green">{{card.realHP!=null?card.realHP:card.baseHP}}</div>
              <div class = "cardAttack" style="color:red">{{card.modifiedAttack!=null?card.modifiedAttack:card.baseAttack}}</div>
              <div class = "cardAbility">
                <span v-for="part in createTextbox">
                  <span v-if="part.type=='plain'">{{part.value}}</span>
                  <span v-if="part.type=='kw'" style = "text-decoration: underline;" v-on:contextmenu.prevent="$emit('set-overlay-text',part.keyword+': '+getKeywordData(part.keyword).description)">{{part.value}}</span>
                </span>
              </div>
              <div v-if="card.finalKeywords&&card.finalKeywords.length>0">
                <div v-for="(keyword,i) in card.finalKeywords" v-on:click.right.prevent="$emit('set-overlay-text',keyword+': '+getKeywordData(keyword).description)" class = "cardKeyword" :style = "{left:calcKeywordX(i)}">
                  <img style="height: 16px; width: 16px" src = "images/Placeholder.png"/>
                </div>
              </div>
            </div>
            <div class = "card" v-if="card.type==1">
              <img draggable="false" :src = "getCardFrame(card.cardFrameState,card.type)"/>
              <div class = "cardName">{{card.name}}</div>
              <div class = "cardCost">{{card.modifiedCost!=null?card.modifiedCost:card.baseCost}}</div>
              <div class = "cardAbility">
                <span v-for="part in createTextbox">
                  <span v-if="part.type=='plain'">{{part.value}}</span>
                  <span v-if="part.type=='kw'" style = "text-decoration: underline;" v-on:contextmenu.prevent="$emit('set-overlay-text',part.keyword+': '+getKeywordData(part.keyword).description)">{{part.value}}</span>
                </span>
              </div>
            </div>
            <div v-if='tempCard!=null'>
              <card
              style = "position:absolute;"
              :style = '{left: "120px",top:"-20px","z-index":1235}'
              :card = 'tempCard'
              :opacity = '0.8'
              :get-card-data = 'getCardData'
              :active = 'false'
              />
            </div>
          </div>
      </span>`
})
