// Game state
let snake = [{ x: 10, y: 10 }];
let cube = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let lives = 5;
let gameLoop;
let timer;
let timeLeft = 10;
let currentQuestion, correctAnswer;
let useMultipleChoice = true;
let difficultyLevel = 0;
let autoMoving = false;
let isPaused = false;
let isMuted = false;
let scoreDisplay = document.getElementById('score-display');
let currentHeadColor = 'green';

// Define speeds
const DEFAULT_SPEED = 100; // Default speed for manual movement
const FAST_SPEED = 30; // Faster speed for auto-moving to eat food

// Audio elements
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const eatSound = new Audio('eat.mp3');

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cubeSize = 10;

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const pauseButton = document.getElementById('pause-button');
const audioToggle = document.getElementById('audio-toggle');
const restartButton = document.getElementById('restart-button');
const livesDisplay = document.getElementById('lives-display');
const levelDisplay = document.getElementById('level-display');
const questionElement = document.getElementById('question');
const multipleChoice = document.getElementById('multiple-choice');
const choices = document.getElementsByClassName('choice');
const timerBar = document.getElementById('timer-bar');
const finalScore = document.getElementById('final-score');
const highscoreElement = document.getElementById('highscore');
const shareButton = document.getElementById('share-button');

startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
shareButton.addEventListener('click', shareScore);
audioToggle.addEventListener('click', toggleAudio);
restartButton.addEventListener('click', startGame);

// SVGs for audio toggle and pause/play
const soundOnSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.75V20.25C12 20.6642 11.6642 21 11.25 21C11.1065 21 10.9686 20.9464 10.8566 20.8535L5.57161 16.5H2.75C2.33579 16.5 2 16.1642 2 15.75V8.25C2 7.83579 2.33579 7.5 2.75 7.5H5.57161L10.8566 3.14645C10.9686 3.05355 11.1065 3 11.25 3C11.6642 3 12 3.33579 12 3.75ZM6.75 9H3.5V15H6.75C6.94891 15 7.13968 15.079 7.28033 15.2197L10.5 18.4393V5.56066L7.28033 8.78033C7.13968 8.921 6.94891 9 6.75 9Z" fill="black"/>
    </svg>
`;
const soundOffSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.75V20.25C12 20.6642 11.6642 21 11.25 21C11.1065 21 10.9686 20.9464 10.8566 20.8535L5.57161 16.5H2.75C2.33579 16.5 2 16.1642 2 15.75V8.25C2 7.83579 2.33579 7.5 2.75 7.5H5.57161L10.8566 3.14645C10.9686 3.05355 11.1065 3 11.25 3C11.6642 3 12 3.33579 12 3.75ZM6.75 9H3.5V15H6.75C6.94891 15 7.13968 15.079 7.28033 15.2197L10.5 18.4393V5.56066L7.28033 8.78033C7.13968 8.921 6.94891 9 6.75 9ZM16.5 8.25C16.5 8.25 15.75 9 15.75 12C15.75 15 16.5 15.75 16.5 15.75M18.75 6C18.75 6 17.25 7.5 17.25 12C17.25 16.5 18.75 18 18.75 18" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
`;
const pauseSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4H10V20H6V4Z" fill="black"/>
        <path d="M14 4H18V20H14V4Z" fill="black"/>
    </svg>
`;
const playSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L5 21V3Z" fill="black"/>
    </svg>
`;

// Head color Easter egg (cycles every 10 points)
const headColors = ['green', 'blue', 'purple', 'orange', 'black'];
const foodColors = ['red', 'blue', 'purple', 'orange', 'black', 'brown'];
function getHeadColor(score) {
    return headColors[Math.floor(score / 10) % headColors.length];
}
function getFoodColor(score) {
    return foodColors[(Math.floor(score / 10) % foodColors.length) + 1];
}

function startGame() {
    highscore = localStorage.getItem('highscore') || 0; // Load highscore without prompting
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    snake = [{ x: 10, y: 10 }];
    score = 0;
    direction = { x: 1, y: 0 };
    difficultyLevel = 0;
    autoMoving = false;
    isPaused = false;
    isMuted = false;
    lives = 5;
    currentHeadColor = 'green';
    livesDisplay.textContent = `LIVE: ${lives}`;
    scoreDisplay.textContent = `SCORE: ${score}`;
    updateLevelDisplay();
    pauseButton.innerHTML = pauseSVG;
    audioToggle.innerHTML = soundOnSVG;
    spawnCube();
    generateQuestion();
    gameLoop = setInterval(update, DEFAULT_SPEED); // Start with default speed
    startTimer();
    updateSnake(); // Initial draw
}

function toggleAudio() {
    isMuted = !isMuted;
    correctSound.muted = isMuted;
    wrongSound.muted = isMuted;
    eatSound.muted = isMuted;
    audioToggle.innerHTML = isMuted ? soundOffSVG : soundOnSVG;
}

function updateLevelDisplay() {
    if (score < 5) {
        difficultyLevel = 0;
        levelDisplay.textContent = 'LEVEL: Easy';
    } else if (score < 10) {
        difficultyLevel = 1;
        levelDisplay.textContent = 'LEVEL: Intermediate';
    } else {
        difficultyLevel = 2;
        levelDisplay.textContent = 'LEVEL: Hard';
    }
}

function generateQuestion() {
    let num1, num2, operator;
    let maxNum;
    if (score < 5) {
        difficultyLevel = 0;
        maxNum = 100;
        num1 = Math.floor(Math.random() * maxNum);
        num2 = Math.floor(Math.random() * (100 - num1));
        operator = '+';
    } else if (score < 10) {
        difficultyLevel = 1;
        maxNum = 500;
        num1 = Math.floor(Math.random() * maxNum);
        operator = ['+', '-'][Math.floor(Math.random() * 2)];
        if (operator === '+') {
            num2 = Math.floor(Math.random() * (500 - num1));
        } else {
            num2 = Math.floor(Math.random() * num1);
        }
    } else {
        difficultyLevel = 2;
        maxNum = 999;
        num1 = Math.floor(Math.random() * maxNum);
        operator = ['+', '-'][Math.floor(Math.random() * 2)];
        if (operator === '+') {
            num2 = Math.floor(Math.random() * (999 - num1));
        } else {
            num2 = Math.floor(Math.random() * num1);
        }
    }

    currentQuestion = `${num1} ${operator} ${num2}`;
    correctAnswer = eval(currentQuestion);

    questionElement.textContent = `${currentQuestion} = ?`;
    multipleChoice.style.display = 'flex'; // Ensure multiple choice is visible

    const answers = [correctAnswer];
    while (answers.length < 3) {
        let wrongAnswer = Math.floor(Math.random() * 1000);
        if (!answers.includes(wrongAnswer)) answers.push(wrongAnswer);
    }
    answers.sort(() => Math.random() - 0.5);
    for (let i = 0; i < choices.length; i++) {
        choices[i].textContent = answers[i];
        choices[i].disabled = false;
        choices[i].style.display = 'inline-block'; // Ensure each button is visible
        choices[i].onclick = () => checkAnswer(answers[i]);
    }
    timeLeft = 10;
}

function checkAnswer(userAnswer) {
    if (isPaused) return;

    const isCorrect = (userAnswer == correctAnswer); // Use == for loose equality
    if (isCorrect) {
        clearInterval(timer);
        if (!isMuted) correctSound.play();
        let flashCount = 0;
        const flash = () => {
            if (flashCount < 3) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    flashCount++;
                    setTimeout(flash, 50);
                }, 100);
            } else {
                clearInterval(gameLoop); // Clear the existing game loop
                autoMoving = true;
                gameLoop = setInterval(autoMoveToFood, FAST_SPEED); // Use fixed fast speed
                autoMoveToFood(); // Call once immediately to start movement
            }
        };
        flash();
    } else {
        lives--;
        if (!isMuted) wrongSound.play();
        livesDisplay.textContent = `LIVE: ${lives}`;
        for (let i = 0; i < choices.length; i++) {
            if (parseInt(choices[i].textContent) === userAnswer) {
                choices[i].disabled = true;
                break;
            }
        }
        if (lives <= 0) {
            endGame();
        } else {
            setTimeout(() => {
                generateQuestion();
                startTimer();
            }, 1000);
        }
    }
}

function autoMoveToFood() {
    if (!autoMoving || isPaused) return;

    const head = { x: snake[0].x, y: snake[0].y };
    let dx = cube.x - head.x;
    let dy = cube.y - head.y;

    let directions = [];
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) directions.push({ x: 1, y: 0 });
        else directions.push({ x: -1, y: 0 });
        if (dy > 0) directions.push({ x: 0, y: 1 });
        else directions.push({ x: 0, y: -1 });
    } else {
        if (dy > 0) directions.push({ x: 0, y: 1 });
        else directions.push({ x: 0, y: -1 });
        if (dx > 0) directions.push({ x: 1, y: 0 });
        else directions.push({ x: -1, y: 0 });
    }

    let chosenDirection = null;
    for (let dir of directions) {
        const nextHead = { x: head.x + dir.x, y: head.y + dir.y };
        let willCollide = false;
        for (let i = 0; i < snake.length; i++) {
            if (nextHead.x === snake[i].x && nextHead.y === snake[i].y) {
                willCollide = true;
                break;
            }
        }
        if (!willCollide && (dir.x !== -direction.x || dir.y !== -direction.y)) {
            chosenDirection = dir;
            break;
        }
    }

    if (!chosenDirection) {
        chosenDirection = { x: direction.x, y: direction.y }; // Continue in current direction if no valid move
    }

    direction = chosenDirection;

    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collision with self before moving
    for (let i = 0; i < snake.length; i++) {
        if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(newHead);

    if (newHead.x === cube.x && newHead.y === cube.y) {
        autoMoving = false;
        if (!isMuted) eatSound.play();
        clearInterval(gameLoop);
        snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
        score++;
        scoreDisplay.textContent = `SCORE: ${score}`;
        updateLevelDisplay();
        if (score % 10 === 0 && cube.color && cube.color !== 'red') {
            currentHeadColor = cube.color;
        }
        spawnCube();
        generateQuestion();
        gameLoop = setInterval(update, DEFAULT_SPEED); // Reset to default speed
        startTimer();
    } else {
        snake.pop();
    }

    updateSnake();
}

function updateSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    const head = snake[0];
    ctx.fillStyle = currentHeadColor; // Head color changes every 10 points
    ctx.fillRect(head.x * gridSize, head.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.fillStyle = '#757575'; // Snake body color set to grey
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        // Removed stroke for snake body
    }
    ctx.fillStyle = cube.color || 'red'; // Food remains red
    const grd = ctx.createRadialGradient(
        cube.x * gridSize + gridSize / 2, cube.y * gridSize + gridSize / 2, 1,
        cube.x * gridSize + gridSize / 2, cube.y * gridSize + gridSize / 2, gridSize / 2
    );
    grd.addColorStop(0, cube.color || 'red');
    grd.addColorStop(1, '#fff');
    ctx.fillStyle = grd;
    ctx.fillRect(cube.x * gridSize, cube.y * gridSize, cubeSize - 2, cubeSize - 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(cube.x * gridSize, cube.y * gridSize, cubeSize - 2, cubeSize - 2);
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!isPaused) {
            timeLeft -= 0.1;
            timerBar.style.setProperty('--width', (timeLeft / 10) * 100); // Remove % unit
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 100);
}

function spawnCube() {
    cube = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize)),
        color: score % 10 === 9 ? getFoodColor(score + 1) : 'red'
    };
}

function update() {
    if (isPaused) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    if (head.x < 0 || head.x >= canvas.width / gridSize) {
        head.x = (head.x + canvas.width / gridSize) % (canvas.width / gridSize);
    }
    if (head.y < 0 || head.y >= canvas.height / gridSize) {
        head.y = (head.y + canvas.height / gridSize) % (canvas.height / gridSize);
    }

    snake.unshift(head);

    if (head.x === cube.x && head.y === cube.y && !autoMoving) {
        score++;
        scoreDisplay.textContent = `SCORE: ${score}`;
        updateLevelDisplay();
        spawnCube();
        generateQuestion();
        startTimer();
    } else {
        snake.pop();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    updateSnake();
}

function togglePause() {
    if (isPaused) {
        isPaused = false;
        pauseButton.innerHTML = pauseSVG;
        startTimer();
    } else {
        isPaused = true;
        pauseButton.innerHTML = playSVG;
        clearInterval(timer);
    }
}

function endGame() {
    clearInterval(gameLoop);
    clearInterval(timer);
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        highscoreElement.textContent = highscore;
    }
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'block';
    finalScore.textContent = score;
}

function shareScore() {
    const shareCanvas = document.createElement('canvas');
    shareCanvas.width = 400;
    shareCanvas.height = 200;
    const shareCtx = shareCanvas.getContext('2d');

    shareCtx.fillStyle = '#F4E074';
    shareCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
    shareCtx.fillStyle = '#000';
    shareCtx.font = 'bold 30px Bangers';
    shareCtx.textAlign = 'center';
    shareCtx.fillText('Math Snake Highscore!', shareCanvas.width / 2, 60);
    shareCtx.font = 'bold 40px Bangers';
    shareCtx.fillText(highscore, shareCanvas.width / 2, 120);
    shareCtx.font = '20px Bangers';
    shareCtx.fillText('Play now at MathSnake.com', shareCanvas.width / 2, 160);

    shareCanvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
            alert('Score image copied to clipboard! Paste it to share.');
        }).catch(err => {
            console.error('Failed to copy image: ', err);
            alert('Failed to copy image. Try sharing manually.');
        });
    });
}

// Add keyboard controls for snake movement
document.addEventListener('keydown', (event) => {
    if (isPaused) return;
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});