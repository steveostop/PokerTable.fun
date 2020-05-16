// Define the poker card suites
const CardSuit = {
    "hearts": "♥️",
    "diamonds": "♦️",
    "spades": "♠️",
    "clubs": "♣️"
}

// Define a poker card
class Card {
    constructor(value, suit) {
        this.value = value;
        this.suite = suit;

        switch (suit) {
            case CardSuit["clubs"]:
                this.color = "#000000";
                this.suitRank = 1;
                break;
            case CardSuit["diamonds"]:
                this.color = "#BF0000";
                this.suitRank = 2;
                break;
            case CardSuit["hearts"]:
                this.color = "#BF0000";
                this.suitRank = 3;
                break;
            case CardSuit["spades"]:
                this.color = "#000000";
                this.suitRank = 4;
                break;
        }

        //Not a face card (unicode 48 -> 57 is 0 -> 9)
        if (this.value.charCodeAt(0) < 58 && this.value.charCodeAt(0) > 47) {
            this.rank = this.value
        } else {
            switch (this.value) {
                case 'J':
                    this.rank = 11;
                    break;
                case 'Q':
                    this.rank = 12;
                    break;
                case 'K':
                    this.rank = 13;
                    break;
                case 'A':
                    this.rank = 14;
                    break;
                default:
                    this.rank = 0;
            }
        }
    }

    toString() {
        return `[${this.value}${this.suite}]`;
    }
}

// Define a deck of cards. 
// Deal funtion: returns top card
// Shuffle funtion: mimic human riffle shuffling
class CardDeck {
    constructor() {
        this.cards = [
            new Card("A", CardSuit["hearts"]),
            new Card("K", CardSuit["hearts"]),
            new Card("Q", CardSuit["hearts"]),
            new Card("J", CardSuit["hearts"]),
            new Card("10", CardSuit["hearts"]),
            new Card("9", CardSuit["hearts"]),
            new Card("8", CardSuit["hearts"]),
            new Card("7", CardSuit["hearts"]),
            new Card("6", CardSuit["hearts"]),
            new Card("5", CardSuit["hearts"]),
            new Card("4", CardSuit["hearts"]),
            new Card("3", CardSuit["hearts"]),
            new Card("2", CardSuit["hearts"]),
            new Card("A", CardSuit["diamonds"]),
            new Card("K", CardSuit["diamonds"]),
            new Card("Q", CardSuit["diamonds"]),
            new Card("J", CardSuit["diamonds"]),
            new Card("10", CardSuit["diamonds"]),
            new Card("9", CardSuit["diamonds"]),
            new Card("8", CardSuit["diamonds"]),
            new Card("7", CardSuit["diamonds"]),
            new Card("6", CardSuit["diamonds"]),
            new Card("5", CardSuit["diamonds"]),
            new Card("4", CardSuit["diamonds"]),
            new Card("3", CardSuit["diamonds"]),
            new Card("2", CardSuit["diamonds"]),
            new Card("A", CardSuit["spades"]),
            new Card("K", CardSuit["spades"]),
            new Card("Q", CardSuit["spades"]),
            new Card("J", CardSuit["spades"]),
            new Card("10", CardSuit["spades"]),
            new Card("9", CardSuit["spades"]),
            new Card("8", CardSuit["spades"]),
            new Card("7", CardSuit["spades"]),
            new Card("6", CardSuit["spades"]),
            new Card("5", CardSuit["spades"]),
            new Card("4", CardSuit["spades"]),
            new Card("3", CardSuit["spades"]),
            new Card("2", CardSuit["spades"]),
            new Card("A", CardSuit["clubs"]),
            new Card("K", CardSuit["clubs"]),
            new Card("Q", CardSuit["clubs"]),
            new Card("J", CardSuit["clubs"]),
            new Card("10", CardSuit["clubs"]),
            new Card("9", CardSuit["clubs"]),
            new Card("8", CardSuit["clubs"]),
            new Card("7", CardSuit["clubs"]),
            new Card("6", CardSuit["clubs"]),
            new Card("5", CardSuit["clubs"]),
            new Card("4", CardSuit["clubs"]),
            new Card("3", CardSuit["clubs"]),
            new Card("2", CardSuit["clubs"])
        ]
    }

    // Return the card on the top of the deck
    dealCard() {
        if (this.cards.length > 0) {
            return this.cards.shift();
        }
        return new Card("", "");
    }

    // Shuflle deck, mimiking riffle shuffle
    shuffle(times = 1) {
        for (let i = 0; i < times; i++) {
            // "Cut the cards"
            // Randomly split the deck in half, within 8 cards (22 - 30)
            let randomNumber = Math.ceil(Math.random() * 9);
            randomNumber += 21;

            let leftHand = this.cards.slice(0, randomNumber);
            let rightHand = this.cards.slice(randomNumber, this.cards.length);

            // Riffle shuffle 1 to 3 cards from each hand 
            let shuffledDeck = [];
            while (shuffledDeck.length < this.cards.length) {
                let leftCount = Math.ceil(Math.random() * 3);
                let rightCount = Math.ceil(Math.random() * 3);

                let j;
                for (j = 0; j < leftCount; j++) {
                    if (leftHand.length > 0) {
                        shuffledDeck.push(leftHand.pop());
                    }
                }
                for (j = 0; j < rightCount; j++) {
                    if (rightHand.length > 0) {
                        shuffledDeck.push(rightHand.pop());
                    }
                }
            }
            this.cards = shuffledDeck;
        }
    }

    toString() {
        let deckString = "";
        let card;
        for (card of this.cards) {
            deckString += `${card.toString()} `;
        }
        return deckString;
    }

}

class PokerHand {
    constructor(cards) {
        this.cards = cards;
        this.sortByValue();
    }

    // returns true if all cards (5) are the same suit
    isFlush() {
        if (this.cards.length != 5) {
            return false
        }

        this.sortBySuit();

        let answer = (this.cards[0].suit == this.cards[4].suit)

        this.sortByValue();

        return answer;
    }

    // returns true if all cards increase continuosly in value
    isStraight() {
        if (this.cards.length != 5) {
            return false
        }

        //edge case of A,2,3,4,5; handle straights with A in them
        if (this.cards[4].rank == 14) {
            let caseA = ( 
                this.cards[1].rank == 2 && 
                this.cards[2].rank == 3 && 
                this.cards[3].rank == 4 && 
                this.cards[4].rank == 5
            );

            let caseB = (
                this.cards[0].rank == 10 && 
                this.cards[1].rank == 11 && 
                this.cards[2].rank == 12 && 
                this.cards[3].rank == 13
            );

            return (caseA || caseB);
        }

        for (let i = 1; i < this.cards.length; i++) {
            if (this.cards[i-1].rank + 1 != this.cards[i].rank) {
                //not a straight
                return false;
            }
        }

        //must be a straight
        return true;
    }

    // returns true if hand is both a straight and a flush
    isStraightFlush() {
        return (this.isStraight && this.isFlush());
    }

    // returns true if hand is a straight, a flush, and the highcard is A
    isRoyalFlush() {
        return (this.isStraightFlush && this.cards[4].rank == 14);
    }

    // returns ture if there are 4 cards of the same value
    isFourOfKind() {
        if (this.cards.length != 5) {
            return false
        }

        
    }

    // sorts this hand by face values 
    sortByValue() {
        this.cards.sort(function (a, b) { return a.rank - b.rank });
    }

    // sorts this hand by suit (alphabetical)
    sortBySuit() {
        this.cards.sort(function (a, b) { return a.suitRank - b.suitRank });
    }

    // returns string of cards in the hand using Card toString()
    toString() {
        let hand = "";
        for (let card of this.cards) {
            hand += card.toString();
        }
        return hand;
    }
}