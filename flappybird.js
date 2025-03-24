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
    gameStart: false, // Add this line
    startSound: null,
    jumpSound: null,
    hitSound: null,
    flapSound: null
};

// Function to initialize and scale the canvas
function initializeCanvas() {
    if (!gameState.board) {
        gameState.board = document.getElementById("flappy-board");
         if (!gameState.board) {
            console.error("Canvas element not found!");
            return false; // Return false if canvas is not found
        }
    }

    gameState.board.height = boardHeight;
    gameState.board.width = boardWidth;
    gameState.context = gameState.board.getContext("2d");
    return true; // Return true if canvas is initialized successfully
}


function loadAssets(callback) {
    let assetsLoaded = 0;
    const totalAssets = 5; // Total number of assets to load

    const onAssetLoad = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            callback(); // Call the callback function when all assets are loaded
        }
    };

    gameState.birdImg = new Image();
    gameState.birdImg.onload = onAssetLoad;
    gameState.birdImg.src = "https://raw.githubusercontent.com/GavinE00000/Goonking/main/flappybird.png";

    gameState.topPipeImg = new Image();
    gameState.topPipeImg.onload = onAssetLoad;
    gameState.topPipeImg.src = "https://raw.githubusercontent.com/GavinE00000/Goonking/main/toppipe.png";

    gameState.bottomPipeImg = new Image();
    gameState.bottomPipeImg.onload = onAssetLoad;
    gameState.bottomPipeImg.src = "https://raw.githubusercontent.com/GavinE00000/Goonking/main/bottompipe.png";

      // Load sounds
    gameState.startSound = new Audio("https://www.soundjay.com/buttons/sounds/beep-01a.mp3");
    gameState.startSound.onload = onAssetLoad;

    gameState.jumpSound = new Audio("https://www.soundjay.com/buttons/sounds/jump-01.mp3");
    gameState.jumpSound.onload = onAssetLoad;


}

function startGame() {
    if (!gameState.gameStart) {
        return;
    }
    if (!gameState.context) {
        console.error("Context is null.  Make sure initializeCanvas() is called.");
        return;
    }
    // Clear the canvas
    gameState.context.clearRect(0, 0, gameState.board.width, gameState.board.height);

    // Draw the bird
    gameState.context.drawImage(gameState.birdImg, gameState.bird.x, gameState.bird.y, gameState.bird.width, gameState.bird.height);

    // Generate and draw pipes
    if (gameState.pipeArray.length === 0 || gameState.pipeArray[gameState.pipeArray.length - 2].x < gameState.board.width - 300 * scale) {
        generatePipes();
    }

    for (let i = 0; i < gameState.pipeArray.length; i++) {
        let pipe = gameState.pipeArray[i];
        pipe.x += gameState.velocityX;
        gameState.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (pipe.x + gameState.pipeWidth < 0) {
            gameState.pipeArray.splice(i, 2);
            i--;
        }
    }

    // Bird movement
    gameState.velocityY += gameState.gravity;
    gameState.bird.y += gameState.velocityY;

    // Game over conditions
    if (gameState.bird.y + gameState.bird.height > gameState.board.height || gameState.bird.y < 0) {
        endGame();
        return;
    }

      // Pipe collision detection
    for (let i = 0; i < gameState.pipeArray.length; i++) {
        let pipe = gameState.pipeArray[i];
        if (
            gameState.bird.x < pipe.x + pipe.width &&
            gameState.bird.x + gameState.bird.width > pipe.x &&
            gameState.bird.y < pipe.y + pipe.height &&
            gameState.bird.y + gameState.bird.height > pipe.y
        ) {
            endGame();
            return;
        }
    }

    // Score calculation
    for (let i = 0; i < gameState.pipeArray.length; i += 2) {
        let topPipe = gameState.pipeArray[i];
        if (gameState.bird.x > topPipe.x + gameState.pipeWidth && !topPipe.passed) {
            gameState.score++;
            topPipe.passed = true; // Ensure score is only added once per pipe pair
        }
    }

    // Draw score
    gameState.context.fillStyle = "white";
    gameState.context.font = "40px Impact";
    gameState.context.shadowColor = "black";
    gameState.context.shadowOffsetX = 2;
    gameState.context.shadowOffsetY = 2;
    gameState.context.fillText("Score: " + gameState.score, gameState.board.width / 2 - 100, 50);
    gameState.context.shadowOffsetX = 0;
    gameState.context.shadowOffsetY = 0;

    requestAnimationFrame(startGame);
}

function generatePipes() {
    let openingSpace = gameState.board.height / 4;
    let minPipeHeight = 100 * scale;
    let maxPipeHeight = gameState.board.height - openingSpace - minPipeHeight;
    let randomPipeY = Math.max(minPipeHeight, Math.random() * maxPipeHeight);

    let topPipe = {
        img: gameState.topPipeImg,
        x: gameState.pipeX,
        y: randomPipeY - gameState.pipeHeight,
        width: gameState.pipeWidth,
        height: gameState.pipeHeight,
        passed: false
    };
    gameState.pipeArray.push(topPipe);

    let bottomPipe = {
        img: gameState.bottomPipeImg,
        x: gameState.pipeX,
        y: randomPipeY + openingSpace,
        width: gameState.pipeWidth,
        height: gameState.pipeHeight,
        passed: false
    };
    gameState.pipeArray.push(bottomPipe);
}

function handleKeyDown(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        e.preventDefault(); // prevent scrolling
        if (!gameState.gameStart) {
            gameState.gameStart = true;
            gameState.score = 0;
            gameState.pipeArray = [];
            gameState.bird.y = boardHeight / 2;
            startGame();
        }
        gameState.velocityY = gameState.scaledJumpStrength;
        gameState.jumpSound.play();
    }
}


function endGame() {
    gameState.gameOver = true;
    gameState.gameStart = false;
    if(gameState.context){ //check if context exists
        gameState.context.fillStyle = "red";
        gameState.context.font = "60px Impact";
        gameState.context.textAlign = "center";
        gameState.context.fillText("Game Over", gameState.board.width / 2, gameState.board.height / 2);

        gameState.context.fillStyle = "white";
        gameState.context.font = "20px Impact";
        gameState.context.fillText("Press Space to Restart", gameState.board.width / 2, gameState.board.height / 2 + 40);
    }


}



// --- Initialization ---
window.onload = () => {
    if (initializeCanvas()) { // Only proceed if canvas initialization was successful
        loadAssets(() => {
            // All assets loaded, but don't start game until spacebar
            if(gameState.context){
                gameState.context.fillStyle = "white";
                gameState.context.font = "40px Impact";
                gameState.context.textAlign = "center";
                gameState.context.fillText("Press Space to Start", gameState.board.width / 2, gameState.board.height / 2);
            }
        });

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', () => {
            screenWidth = window.innerWidth;
            screenHeight = window.innerHeight;
            if (screenWidth / screenHeight > targetAspectRatio) {
                boardHeight = screenHeight;
                boardWidth = boardHeight * targetAspectRatio;
            } else {
                boardWidth = screenWidth;
                boardHeight = boardWidth / targetAspectRatio;
            }
            initializeCanvas();
           //  startGame(); // Restart the game to adjust to new dimensions - removed to start on spacebar
        });
    }
};
