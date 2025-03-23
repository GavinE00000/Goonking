// Base resolution
const baseWidth = 360;
const baseHeight = 640;
const targetAspectRatio = baseWidth / baseHeight;

// Get screen dimensions
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

// Adjust board dimensions to maintain aspect ratio
if (screenWidth / screenHeight > targetAspectRatio) {
    boardHeight = screenHeight;
    boardWidth = boardHeight * targetAspectRatio;
} else {
    boardWidth = screenWidth;
    boardHeight = boardWidth / targetAspectRatio;
}

// Calculate a single scaling factor
const scale = boardWidth / baseWidth;

// Board
let board;
let context;

// Bird
let birdWidth = 40 * scale;
let birdHeight = 57 * scale;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Pipes
let pipeArray = [];
let pipeWidth = 80 * scale;
let pipeHeight = 512 * scale;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics
let pipeSpeed = -2;
let velocityX = pipeSpeed * scale;
let velocityY = 0;
let gravity = 0.4 * scale;

let jumpStrength = -6;
let scaledJumpStrength = jumpStrength * scale;

let gameOver = false;
let score = 0;

// Sound effects (MOVED TO TOP)
let hitSound;
let dieSound;
let pointSound;
let jumpSound;
let startSound;

window.onload = function() {
    board = document.getElementById("flappy-board"); // Correct canvas ID
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

function startFlappyGame(canvas) {
    board = canvas;
    context = canvas.getContext("2d");
    // ... the rest of your game initialization code ...
}

    // Load sound effects
    hitSound = new Audio("./hit.mp3");
    dieSound = new Audio("./die.mp3");
    pointSound = new Audio("./point.mp3");
    jumpSound = new Audio("./jump.mp3");
    startSound = new Audio("./start.mp3");

    // Play start sound when game loads
    startSound.play();

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);

    window.addEventListener('resize', () => {
        // ... (resize logic) ...
    });
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, boardWidth, boardHeight);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        dieSound.play(); // Play die sound once
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            pointSound.play(); // Play point sound once
        }

        if (detectCollision(bird, pipe)) {
            if (!gameOver) {
                hitSound.play(); // Play hit sound once
            }
            gameOver = true;
        }
    }

    // Clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    // ... (placePipes function) ...
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = scaledJumpStrength;
        jumpSound.play();

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            startSound.play(); // Play start sound on reset
        }
    }
}


function detectCollision(a, b) {

    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner

           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner

           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner

           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner

} 

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/3.5; // Adjusted to make openings wider

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = scaledJumpStrength;
        jumpSound.play(); // Play jump sound every time

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            startSound.play();
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
