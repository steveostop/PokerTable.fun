const cardBack = "url(/assets/card-back.png)";
let path = window.location.pathname
let gameId = path.substr(path.lastIndexOf('/'));
const socket = io(gameId);
let chatUserScrolled = false;
let userName = "Player X";
let userChips = 0;
let truePlayerNum = 0;

let deck = new CardDeck();
deck.shuffle(3);

let cardsDealt = 0;

dealTest = () => {
    let cards = [];
    let i;

    console.log(`cardsDealt:${cardsDealt}`);
    if (cardsDealt == 0) {
        for (i = 1; i <= 10; i++) {
            console.log(document.getElementById(`player-${i}-card1`));
            displayCard(document.getElementById(`player-${i}-card1`), deck.dealCard());
            cardsDealt++;
        }
        for (i = 1; i <= 10; i++) {
            displayCard(document.getElementById(`player-${i}-card2`), deck.dealCard());
            cardsDealt++;
        }
    } else if (cardsDealt == 20) {
        cards = [deck.dealCard(), deck.dealCard(), deck.dealCard()];
        displayFlop(cards);
        cardsDealt += 3;
    } else if (cardsDealt == 23) {
        displayTurn(deck.dealCard());
        cardsDealt++;
    } else if (cardsDealt == 24) {
        displayRiver(deck.dealCard());
        cardsDealt++;
    } else {
        clearBoard();
        cardsDealt = 0;
    }
}

clearBoard = () => {
    let communityCards = document.getElementById("community-cards").children;
    for (let i = 0; i < communityCards.length; i++) {
        communityCards[i].firstElementChild.innerHTML = "";
        communityCards[i].lastElementChild.innerHTML = "";
        communityCards[i].classList.toggle("hidden");
    }

    let holeCards = document.getElementsByClassName("hole-cards");
    for (let i = 0; i < holeCards.length; i++) {
        holeCards[i].firstElementChild.firstElementChild.innerHTML = "";
        holeCards[i].firstElementChild.lastElementChild.innerHTML = "";
        holeCards[i].lastElementChild.firstElementChild.innerHTML = "";
        holeCards[i].lastElementChild.lastElementChild.innerHTML = "";
        holeCards[i].firstElementChild.classList.toggle("hidden");
        holeCards[i].lastElementChild.classList.toggle("hidden");
    }
}

displayFlop = (cards) => {
    displayCard(document.getElementById("flop-card1"), cards[0]);
    displayCard(document.getElementById("flop-card2"), cards[1]);
    displayCard(document.getElementById("flop-card3"), cards[2]);
}

displayTurn = (card) => {
    displayCard(document.getElementById("turn-card"), card);
}

displayRiver = (card) => {
    displayCard(document.getElementById("river-card"), card);
}

displayCard = (ele, card) => {
    ele.classList.toggle('hidden');
    let cardTop = ele.firstElementChild;
    let cardBottom = ele.lastElementChild;
    cardTop.innerHTML = card.value;
    cardTop.style.color = card.color;
    cardBottom.innerHTML = card.suite;
    console.log(card.toString());
}

displayPlayer = (num, settings) => {
    try {
        document.getElementById(`player-${num}-name`).innerText = settings.name;
        document.getElementById(`player-${num}-chips`).innerText = settings.chips;
        
        let holeCard1 = document.getElementById(`player-${num}-card1`);
        let holeCard2 = document.getElementById(`player-${num}-card2`);
        if (typeof settings.cards === 'boolean' && settings.cards == true) {
            holeCard1.firstElementChild.innerHTML = "";
            holeCard1.lastElementChild.innerHTML = "";
            holeCard2.firstElementChild.innerHTML = "";
            holeCard2.lastElementChild.innerHTML = "";
            holeCard1.classList.toggle("hidden");
            holeCard2.classList.toggle("hidden");
        } else if (settings.cards.length > 0) { //must be local player
            holeCard1.firstElementChild.innerHTML = settings.cards[0].value;
            holeCard1.lastElementChild.innerHTML = settings.cards[0].suite;
            holeCard1.firstElementChild.style.color = settings.cards[0].color;
            holeCard1.lastElementChild.style.color = sdttings.cards[0].color;
            holeCard2.firstElementChild.innerHTML = settings.cards[1].value;
            holeCard2.lastElementChild.innerHTML = settings.cards[1].suite;
            holeCard2.firstElementChild.style.color = settings.cards[1].color;
            holeCard2.lastElementChild.style.color = sdttings.cards[1].color;
            holeCard1.classList.toggle("hidden");
            holeCard2.classList.toggle("hidden");
        }
    } catch {}
}

showSettings = () => {
    document.getElementById("div-settings").style.display = "block";
}

closeSettings = () => {
    document.getElementById("div-settings").style.display = "none";
}

saveSettings = () => {
    userName = document.getElementById("settings-name").value;
    document.getElementById("player-1-name").innerText = userName;
    sendSettings();
    closeSettings();
}

function sendChat() {
    let input = document.forms["chat"]["input"]
    socket.emit('chat', input.value);
    input.value = "";
}

function sendSettings() {
    //TODO: Validate / set limits on name input
    //only setting is name so far
    socket.emit('setName', userName);
}

//rhandles chat messages from other players
socket.on('chat', function(msg) {
    document.getElementById("chat-messages").innerHTML += `<li>${msg}</li>`;
    if (!chatUserScrolled) {
        let window = document.getElementById("chat-window");
        window.scrollTop = window.scrollHeight;
    }
})

//sets name, chips, and card backs on (re)connect
socket.on('settings', function(settings) {
    displayPlayer(1, settings);
    truePlayerNum = settings.seat;
})

//sets name, chips, and card backs for other players at the table on (re)connect
socket.on('player', function(player) {
    if (player.seat != truePlayerNum) {
        let newSeat = player.seat - truePlayerNum + 1;
        if (player.seat < truePlayerNum) {
            newSeat += 10;
        }
        console.log(`new seat: ${newSeat}`);
        displayPlayer(newSeat, {
            name: player.name,
            seat: player.seat,
            chips: player.chips,
            cards: player.cards
        });
    }
})

document.getElementById('btn-start-game').addEventListener('click', dealTest);
document.getElementById('menu-item-settings').addEventListener('click', showSettings)
document.getElementById('chat-window').addEventListener('scroll', function() {
    if (this.scrollHeight > (this.scrollTop + this.clientHeight)) {
        chatUserScrolled = true;
    } else {
        chatUserScrolled = false;
    }
})