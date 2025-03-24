// Base resolution
const baseWidth = 360;
const baseHeight = 640;
const targetAspectRatio = baseWidth / baseHeight;

// Get screen dimensions
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

// Adjust board dimensions to maintain aspect ratio
let boardWidth, boardHeight;

if (screenWidth / screenHeight > targetAspectRatio) {
    boardHeight = screenHeight;
    boardWidth = boardHeight * targetAspectRatio;
} else {
    boardWidth = screenWidth;
    boardHeight = boardWidth / targetAspectRatio;
}

// Calculate a single scaling factor
const scale = boardWidth / baseWidth;

// Game state object to keep track of variables
const gameState = {
    board: null,
    context: null,
    bird: {
        x: boardWidth / 8,
        y: boardHeight / 2,
        width: 40 * scale,
        height: 57 * scale
    },
    pipeArray: [],
    pipeWidth: 80 * scale,
    pipeHeight: 512 * scale,
    pipeX: boardWidth,
    pipeY: 0,
    velocityX: -2 * scale,
    velocityY: 0,
    gravity: 0.4 * scale,
    jumpStrength: -6,
    scaledJumpStrength: -6 * scale,
    score: 0,
    gameOver: false,
    birdImg: null,
    topPipeImg: null,
    bottomPipeImg: null,
    hitSound: null,
    dieSound: null,
    pointSound: null,
    jumpSound: null,
    startSound: null
};

window.onload = function() {
    gameState.board = document.getElementById("flappy-board"); // Correct canvas ID
    gameState.board.height = boardHeight;
    gameState.board.width = boardWidth;
    gameState.context = gameState.board.getContext("2d");

    // Load images (on page load)
    loadImages();
};

function loadImages() {
    gameState.birdImg = new Image();
    gameState.birdImg.src = "https://raw.githubusercontent.com/GavinE00000/Goonking/main/flappybird.png";
    gameState.birdImg.onload = function() {
        console.log("Bird image loaded");
    };
    gameState.birdImg.onerror = () => console.log("Bird image failed to load!");

    gameState.topPipeImg = new Image();
    gameState.topPipeImg.src = ".https://raw.githubusercontent.com/GavinE00000/Goonking/main/toppipe.png";

    gameState.bottomPipeImg = new Image();
    gameState.bottomPipeImg.src = "https://raw.githubusercontent.com/GavinE00000/Goonking/main/bottompipe.png";
}

function startGame() {
    console.log("startGame() is being called");
    // Load sound effects only when game starts (after user interaction)
    gameState.hitSound = new Audio("https://raw.githubusercontent.com/GavinE00000/Goonking/main/hit.mp3");
    gameState.dieSound = new Audio("https://raw.githubusercontent.com/GavinE00000/Goonking/main/die.mp3");
    gameState.pointSound = new Audio("https://raw.githubusercontent.com/GavinE00000/Goonking/main/point.mp3");
    gameState.jumpSound = new Audio("https://raw.githubusercontent.com/GavinE00000/Goonking/main/jump.mp3");
    gameState.startSound = new Audio("https://raw.githubusercontent.com/GavinE00000/Goonking/main/start.mp3");

    gameState.startSound.play(); // Play start sound when game starts

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);

    window.addEventListener('resize', () => {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
        // Adjust board dimensions to maintain aspect ratio
        if (screenWidth / screenHeight > targetAspectRatio) {
            boardHeight = screenHeight;
            boardWidth = boardHeight * targetAspectRatio;
        } else {
            boardWidth = screenWidth;
            boardHeight = boardWidth / targetAspectRatio;
        }

        const scale = boardWidth / baseWidth;
        gameState.board.height = boardHeight;
        gameState.board.width = boardWidth;

        // Update bird dimensions as well based on the new scale
        gameState.bird.width = 40 * scale;
        gameState.bird.height = 57 * scale;
        gameState.bird.x = boardWidth / 8;
        gameState.bird.y = boardHeight / 2;
    });
}

function update() {
    if (gameState.gameOver) {
        return;
    }

    requestAnimationFrame(update);
    gameState.context.clearRect(0, 0, boardWidth, boardHeight);

    // Bird
    gameState.velocityY += gameState.gravity;
    gameState.bird.y = Math.max(gameState.bird.y + gameState.velocityY, 0);
    gameState.context.drawImage(gameState.birdImg, gameState.bird.x, gameState.bird.y, gameState.bird.width, gameState.bird.height);

    if (gameState.bird.y > gameState.board.height) {
        gameState.gameOver = true;
        gameState.dieSound.play(); // Play die sound once
    }

    // Pipes
    for (let i = 0; i < gameState.pipeArray.length; i++) {
        let pipe = gameState.pipeArray[i];
        pipe.x += gameState.velocityX;
        gameState.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && gameState.bird.x > pipe.x + pipe.width) {
            gameState.score += 1;
            pipe.passed = true;
            gameState.pointSound.play(); // Play point sound once
        }

        if (detectCollision(gameState.bird, pipe)) {
            if (!gameState.gameOver) {
                gameState.hitSound.play(); // Play hit sound once
            }
            gameState.gameOver = true;
        }
    }

    // Clear pipes
    while (gameState.pipeArray.length > 0 && gameState.pipeArray[0].x < -gameState.pipeWidth) {
        gameState.pipeArray.shift();
    }

    // Score
    gameState.context.fillStyle = "white";
    gameState.context.font = "45px sans-serif";
    gameState.context.fillText(gameState.score, 5, 45);

    if (gameState.gameOver) {
        gameState.context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameState.gameOver) {
        return;
    }

    let randomPipeY = gameState.pipeY - gameState.pipeHeight / 4 - Math.random() * (gameState.pipeHeight / 2);
    let openingSpace = gameState.board.height / 3.5; // Adjusted to make openings wider

    let topPipe = {
        img: gameState.topPipeImg,
        x: gameState.pipeX,
        y: randomPipeY,
        width: gameState.pipeWidth,
        height: gameState.pipeHeight,
        passed: false
    };
    gameState.pipeArray.push(topPipe);

    let bottomPipe = {
        img: gameState.bottomPipeImg,
        x: gameState.pipeX,
        y: randomPipeY + gameState.pipeHeight + openingSpace,
        width: gameState.pipeWidth,
        height: gameState.pipeHeight,
        passed: false
    };
    gameState.pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        gameState.velocityY = gameState.scaledJumpStrength;
        gameState.jumpSound.play(); // Play jump sound every time

        // Reset game
        if (gameState.gameOver) {
            gameState.bird.y = gameState.bird.y;
            gameState.pipeArray = [];
            gameState.score = 0;
            gameState.gameOver = false;
            gameState.startSound.play();
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
