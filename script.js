// Game state
let snake = [{ x: 10, y: 10 }];
let cube = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let lives = 5;
let gameLoop;
let timer;
let timeLeft = 15; // Timer set to 15 seconds
let currentQuestion, correctAnswer;
let useMultipleChoice = true;
let difficultyLevel = 0;
let selectedDifficulty = 'easy';
let autoMoving = false;
let isPaused = false;
let isMuted = false;
let isMovementPaused = false;
let scoreDisplay = document.getElementById('score-display');
let currentHeadColor = 'green';
let questionStartTime = 0;

// Define speeds
const DEFAULT_SPEED = 100;
let FAST_SPEED = 50;

// Audio elements
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const eatSound = new Audio('eat.mp3');

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cubeSize = 10;

// Grid dimensions
const gridWidth = canvas.width / gridSize; // 520 / 10 = 52
const gridHeight = canvas.height / gridSize; // 341 / 10 = 34.1, rounded down to 34

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
const difficultySelect = document.getElementById('difficulty');

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
    highscore = localStorage.getItem('highscore') || 0;
    selectedDifficulty = difficultySelect.value;
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    difficultySelect.style.display = 'none'; // Hide dropdown on game start
    snake = [{ x: 10, y: 10 }];
    score = 0;
    direction = { x: 1, y: 0 };
    difficultyLevel = 0;
    autoMoving = false;
    isPaused = false;
    isMuted = false;
    isMovementPaused = false;
    lives = 5;
    currentHeadColor = 'green';
    livesDisplay.textContent = `LIVE: ${lives}`;
    scoreDisplay.textContent = `SCORE: ${score}`;
    updateLevelDisplay();
    pauseButton.innerHTML = pauseSVG;
    audioToggle.innerHTML = soundOnSVG;
    spawnCube();
    generateQuestion();
    gameLoop = setInterval(update, DEFAULT_SPEED);
    startTimer();
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
        levelDisplay.textContent = `LEVEL: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} 1`;
    } else if (score < 10) {
        difficultyLevel = 1;
        levelDisplay.textContent = `LEVEL: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} 2`;
    } else {
        difficultyLevel = 2;
        levelDisplay.textContent = `LEVEL: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} 3`;
    }
}

function generateQuestion() {
    let num1, num2, operator;
    let maxNum;
    const operations = {
        easy: ['+', '-'],
        hard: ['*', '/']
    };
    const difficulty = selectedDifficulty;
    const operationPool = operations[difficulty];

    if (score < 5) {
        difficultyLevel = 0;
        maxNum = difficulty === 'easy' ? 100 : 50;
    } else if (score < 10) {
        difficultyLevel = 1;
        maxNum = difficulty === 'easy' ? 500 : 100;
    } else {
        difficultyLevel = 2;
        maxNum = difficulty === 'easy' ? 999 : 200;
    }

    num1 = Math.floor(Math.random() * maxNum);
    operator = operationPool[Math.floor(Math.random() * operationPool.length)];

    if (operator === '/') {
        // Ensure division results in a whole number
        const quotient = Math.floor(Math.random() * (maxNum / 2)) + 1;
        num2 = Math.floor(Math.random() * (maxNum / quotient)) + 1;
        if (num2 === 0) num2 = 1;
        num1 = quotient * num2; // Adjust num1 to ensure exact division
        correctAnswer = quotient;
    } else if (operator === '*') {
        num2 = Math.floor(Math.random() * 32) + 1; // Limit multiplier for Hard mode
        correctAnswer = num1 * num2;
        if (correctAnswer > 1000) {
            num2 = Math.floor(Math.random() * (1000 / num1)) + 1;
            correctAnswer = num1 * num2;
        }
    } else if (operator === '+') {
        num2 = Math.floor(Math.random() * (maxNum - num1));
        correctAnswer = num1 + num2;
    } else if (operator === '-') {
        num2 = Math.floor(Math.random() * num1);
        correctAnswer = num1 - num2;
    }

    currentQuestion = `${num1} ${operator} ${num2}`;
    questionElement.textContent = `${currentQuestion} = ?`;
    multipleChoice.style.display = 'flex';

    const answers = [correctAnswer]; // Ensure correctAnswer is always included
    while (answers.length < 3) {
        let wrongAnswer;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 20; // Increased to allow more tries

        do {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 41) - 20; // ±20 range for closer options
            if (wrongAnswer < 0) wrongAnswer = 0; // Prevent negative answers
            if (wrongAnswer > 999) wrongAnswer = 999; // Cap at 999
            isUnique = !answers.includes(wrongAnswer);
            attempts++;
        } while (!isUnique && attempts < maxAttempts);

        if (isUnique) {
            answers.push(wrongAnswer);
        } else {
            // Fallback: Try a wider range and ensure uniqueness
            let offset = 30; // Start with ±30
            while (answers.length < 3) {
                wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                if (wrongAnswer < 0) wrongAnswer = 0;
                if (wrongAnswer > 999) wrongAnswer = 999;
                if (!answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                    break;
                }
                offset += 10; // Increment offset to widen the range
                if (offset > 100) {
                    // Last resort: Ensure uniqueness by adding incremental values
                    wrongAnswer = answers[answers.length - 1] + 1;
                    if (wrongAnswer > 999) wrongAnswer = answers[answers.length - 1] - 1;
                    if (!answers.includes(wrongAnswer)) answers.push(wrongAnswer);
                }
            }
        }
    }

    // Final check for duplicates
    const uniqueAnswers = [...new Set(answers)];
    while (uniqueAnswers.length < 3) {
        let newOption = correctAnswer + Math.floor(Math.random() * 41) - 20;
        if (newOption < 0) newOption = 0;
        if (newOption > 999) newOption = 999;
        if (!uniqueAnswers.includes(newOption)) uniqueAnswers.push(newOption);
    }

    uniqueAnswers.sort(() => Math.random() - 0.5); // Shuffle answers

    // Assign to choices
    for (let i = 0; i < choices.length; i++) {
        choices[i].textContent = uniqueAnswers[i];
        choices[i].disabled = false;
        choices[i].style.display = 'inline-block';
        choices[i].onclick = () => checkAnswer(uniqueAnswers[i]);
    }

    timeLeft = 15;
    isMovementPaused = false;
    questionStartTime = Date.now();
    console.log(`Question: ${currentQuestion} = ${correctAnswer}, Choices: ${uniqueAnswers}`);
}

function checkAnswer(userAnswer) {
    if (isPaused) return;

    const isCorrect = (Number(userAnswer) === correctAnswer);
    if (isCorrect) {
        clearInterval(timer);
        if (!isMuted) correctSound.play();
        const answerTime = (Date.now() - questionStartTime) / 1000;
        FAST_SPEED = 50 + Math.min(answerTime * 10, 50);
        console.log(`Answer time: ${answerTime.toFixed(2)}s, FAST_SPEED: ${FAST_SPEED}ms`);
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
                clearInterval(gameLoop);
                autoMoving = true;
                gameLoop = setInterval(autoMoveToFood, FAST_SPEED);
                autoMoveToFood();
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
            isMovementPaused = true;
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
    let maxSteps = 20;

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
        for (let i = 1; i < snake.length; i++) {
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
        for (let dir of [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }]) {
            const nextHead = { x: head.x + dir.x, y: head.y + dir.y };
            let willCollide = false;
            for (let i = 1; i < snake.length; i++) {
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
            if (--maxSteps <= 0) {
                console.log('Max steps reached, stopping auto-move');
                autoMoving = false;
                clearInterval(gameLoop);
                gameLoop = setInterval(update, DEFAULT_SPEED);
                return;
            }
            chosenDirection = { x: direction.x, y: direction.y };
        }
    }

    direction = chosenDirection;

    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    for (let i = 1; i < snake.length; i++) {
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
        gameLoop = setInterval(update, DEFAULT_SPEED);
        startTimer();
    } else {
        snake.pop();
    }

    updateSnake();
}

function updateSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const head = snake[0];
    ctx.fillStyle = currentHeadColor;
    ctx.fillRect(head.x * gridSize, head.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.fillStyle = '#757575';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
    ctx.fillStyle = cube.color || 'red';
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
            timerBar.style.setProperty('--width', (timeLeft / 15) * 100); // Adjusted for 15 seconds
            if (timeLeft <= 0) {
                console.log(`Timer ran out! Lives before: ${lives}`);
                clearInterval(timer);
                timeLeft = Infinity;
                lives--;
                console.log(`Lives after: ${lives}`);
                if (!isMuted) wrongSound.play();
                livesDisplay.textContent = `LIVE: ${lives}`;
                if (lives <= 0) {
                    console.log('Lives <= 0, ending game');
                    endGame();
                } else {
                    console.log('Lives remaining, generating new question');
                    isMovementPaused = true;
                    setTimeout(() => {
                        generateQuestion();
                        startTimer();
                    }, 1000);
                }
            }
        }
    }, 100);
}

function spawnCube() {
    // Add padding to prevent spawning on the edges
    const minEdge = 1; // Minimum distance from edge
    const maxX = Math.floor(gridWidth) - minEdge - 1; // 52 - 1 - 1 = 50
    const maxY = Math.floor(gridHeight) - minEdge - 1; // 34 - 1 - 1 = 32
    cube = {
        x: Math.floor(Math.random() * (maxX - minEdge + 1)) + minEdge, // Between 1 and 50
        y: Math.floor(Math.random() * (maxY - minEdge + 1)) + minEdge, // Between 1 and 32
        color: score % 10 === 9 ? getFoodColor(score + 1) : 'red'
    };
    console.log(`Spawned cube at: (${cube.x}, ${cube.y})`);
}

function update() {
    if (isPaused || isMovementPaused) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wrap around the canvas boundaries
    if (head.x < 0) head.x = Math.floor(gridWidth) - 1;
    if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = Math.floor(gridHeight) - 1;
    if (head.y >= gridHeight) head.y = 0;

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

function endGame() {
    console.log('endGame called! Lives:', lives);
    clearInterval(gameLoop);
    clearInterval(timer);
    timeLeft = Infinity;
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        highscoreElement.textContent = highscore;
    }
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'block';
    difficultySelect.style.display = 'none'; // Hide dropdown on game over
    finalScore.textContent = score;
}

function shareScore() {
    const shareCanvas = document.createElement('canvas');
    shareCanvas.width = 400;
    shareCanvas.height = 200;
    const shareCtx = shareCanvas.getContext('2d');

    const gradient = shareCtx.createLinearGradient(0, 0, 0, shareCanvas.height);
    gradient.addColorStop(0, '#E8CB4A');
    gradient.addColorStop(1, '#F4E074');
    shareCtx.fillStyle = gradient;
    shareCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);

    shareCtx.strokeStyle = '#000';
    shareCtx.lineWidth = 4;
    shareCtx.strokeRect(0, 0, shareCanvas.width, shareCanvas.height);

    shareCtx.fillStyle = 'green';
    for (let i = 0; i < 3; i++) {
        shareCtx.fillRect(20 + i * 15, 20, 10, 10);
    }
    shareCtx.fillStyle = 'red';
    shareCtx.beginPath();
    shareCtx.arc(65, 25, 5, 0, Math.PI * 2);
    shareCtx.fill();

    shareCtx.fillStyle = '#000';
    shareCtx.font = 'bold 30px Bangers';
    shareCtx.textAlign = 'center';
    shareCtx.letterSpacing = '3px';
    shareCtx.fillText('MATH SNAKE', shareCanvas.width / 2, 80);

    shareCtx.font = 'bold 40px Bangers';
    shareCtx.fillStyle = '#D32F2F';
    shareCtx.fillText(highscore, shareCanvas.width / 2, 120);

    shareCtx.font = '20px Bangers';
    shareCtx.fillStyle = '#000';
    shareCtx.fillText('Play at MathSnake.com!', shareCanvas.width / 2, 160);

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
