const cardDeck = require('./cards');

/* 
  Define a Texas Hold'em game
*/
class HoldemGame {
    constructor(id) {
        this.gameId = id;
        this.players = {};
        this.playerCount = 0;
        this.playerIds = {};
        this.running = false;
        this.deck = new cardDeck();
        this.numSeats = 10;
        this.communityCards = [];
    }

    addPlayer(id, name, chips, seat) {
        if (this.running != true && !(id in this.playerIds)) {
            this.players[seat] = new HoldemPlayer(id, name, chips);
            this.playerIds[id] = seat;
            this.playerCount++;
        }
    }

    startGame() {
        this.running = true;
    }

    shuffleAndDeal(buttonSeat) {
        this.deck.shuffle(Math.ceil(Math.random() * 3) + 2); //suffle 3 to 5 times

        //deal cards starting after the button
        for (let i = 0; i < 10; i ++) {
            if (typeof this.players[(i + buttonSeat) % this.numSeats] !== 'undefined') {
                this.players[(i + buttonSeat) % this.numSeats].addHoleCard(this.deck.dealCard());
            }
        }
        for (let i = 0; i < 10; i ++) {
            if (typeof this.players[(i + buttonSeat) % this.numSeats] !== 'undefined') {
                this.players[(i + buttonSeat) % this.numSeats].addHoleCard(this.deck.dealCard());
            }
        }

        //test output
        let temp = "";
        for (let i in this.players) {
            if (this.players.hasOwnProperty(i)) {
                temp += `${this.players[i].name}: ${this.players[i].holeCards[0].toString()} ${this.players[i].holeCards[1].toString()} \n`;
            }
        }
        return temp;
    }
}

/*
  Define a Texas Hold'em player
*/
class HoldemPlayer {
    constructor(id, name, chips) {
        this.id = id;
        this.name = name;
        this.chips = chips;
        this.holeCards = [];
    }

    addHoleCard(cards) {
        this.holeCards.push(cards);
    }

    clearHoleCards() {
        this.holeCards = [];
    }
}

module.exports =  HoldemGame;