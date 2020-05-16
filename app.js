const express = require('express');
const session = require('express-session');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const holdemGame = require('./holdem');
const games = {};
const gameIds = [];
const port = process.env.PORT || 3000;

const sessionMiddleware = session({ 
    secret: 'how much wood could a wookchuck chuck',
    resave: false,
    saveUninitialized: true, 
    cookie: { 
        maxAge: 3600000 
    }
});

function createTestGame() {
    if (gameIds.indexOf("test") < 0) {
        gameIds.push("test");
        games['test'] = new holdemGame('test');
        io.of('/test').on('connect', socketConnection);
    }
}

server.listen(port, () => console.log('server listening on port ' + port));

//serve public folder
app.use(express.static('public'));

// register middleware in Express
app.use(sessionMiddleware);
// register middleware in Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
  // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
  // connections, as 'socket.request.res' will be undefined in that case
});

app.get('/newgame', (req, res) => {
    // this should create the new game with a unique ID
    let newGameId;
    do {
        newGameId = generateGameId();
    }
    while (gameIds.indexOf(newGameId) >= 0)

    gameIds.pop(newGameId);
    games[newGameId] = new holdemGame(newGameId);

    //TODO: create socket namespace

    res.status(200).send(`http://localhost:3001/games/${newGameId}`);
});

app.get('/games/:gameId', (req, res) => {
   if (!res.headersSent) {
       let gameId = req.params.gameId;

    createTestGame();

        if (gameIds.indexOf(gameId) < 0) {
            res.status(404).send("Sorry, Game Not Found");
        }
        
        if (games[gameId].playerCount < games[gameId].numSeats) {
            addPlayer(gameId, req.sessionID, games[gameId].playerCount + 1);
        }

        res.sendFile('game.html', { root: "." });
    }
    
});

app.get('/games', (req, res) => {
    res.status(200).send(games);
});


// Generate 5 charater game ID: 0-9, a-z, A-Z
function generateGameId() {
    let gameId = "";
    for (let i = 0; i < 5; i++) {
        let blockId = Math.ceil(Math.random() * 3);
        let char;
        let charCode;
        switch (blockId) {
            case 1: // 0-1
                char = Math.floor(Math.random() * 10);
                break;
            case 2: // a-z
                charCode = Math.floor(Math.random() * 26) + 97
                char = String.fromCharCode(charCode);
                break;
            default: // A-Z
                charCode = Math.floor(Math.random() * 26) + 65
                char = String.fromCharCode(charCode);
        }
        gameId += char;
    }
    return gameId;
}

function socketConnection(socket) {
    const session = socket.request.session;
    session.save();

    let gameId = socket.nsp.name.substr(1);
    let playerSeat = games[gameId].playerIds[session.id];
    let player = games[gameId].players[playerSeat] || {
        name: "",
        seat: "",
        chips: 0,
        cards: [] };
    //send settings on (re)connect
    io.of(gameId).to(socket.id).emit('settings', {
        name: player.name,
        seat: playerSeat,
        chips: player.chips,
        cards: player.holeCards
    });

    //send players info on (re)connect
    for (i in games[gameId].players)
    {
        sendPlayerUpdate(gameId, i)
    }

    socket.on('chat', (msg) => {
        io.of(gameId).emit('chat', `${player.name}: ${msg}`);
    });

    socket.on('setName', (name) => {
        games[gameId].players[playerSeat].name = name;
        sendPlayerUpdate(gameId, playerSeat);
    });
}

function sendPlayerUpdate(gameId, seat) {
    let hasCards = false;
    if (games[gameId].players[seat].holeCards.length > 0) {
        hasCards = true;
    }
    io.of(gameId).emit('player', {
        name: games[gameId].players[seat].name,
        seat: seat,
        chips: games[gameId].players[seat].chips,
        cards: hasCards
    });
}

function addPlayer(gameId, playerId, seat) {
    games[gameId].addPlayer(playerId, `Player ${seat}`, 1500, seat);
}
