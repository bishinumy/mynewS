// 主要DOM要素のインポート
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
context.scale(30, 30);
const previewCanvas = document.getElementById('previewCanvas');
const previewContext = previewCanvas.getContext('2d');
previewContext.scale(20, 20);  

let nextPiece = null; 

let level = 1;
const maxLevel = 20; 
let scoreForNextLevel = 200; 

// ゲームステータス変数
const arena = createMatrix(10, 20);
let isRunning = true;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

const colors = [
    null, '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c',
];

// 게임 루프 토글
function toggleGame(isPlay) {
    isRunning = isPlay;
    if (isRunning) update();
}

// 게임 루프
function update(time = 0) {
    if (!isRunning) return;

    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();

    lastTime = time;
    draw();
    requestAnimationFrame(update);
}

// 블록 생성
function createMatrix(width, height) {
    return Array.from({ length: height }, () => new Array(width).fill(0));
}

function createPiece(type) {
    const pieces = {
        'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        'O': [[5, 5], [5, 5]],
        'L': [[0, 0, 6], [6, 6, 6], [0, 0, 0]],
        'J': [[7, 0, 0], [7, 7, 7], [0, 0, 0]],
        'I': [[2, 2, 2, 2], [0, 0, 0, 0 ], [0, 0, 0, 0], [0, 0, 0, 0]],
        'S': [[0, 3, 3], [3, 3, 0], [0, 0, 0]],
        'Z': [[4, 4, 0], [0, 4, 4], [0, 0, 0]],
    };
    return pieces[type];
}

// 그리기 함수
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// 충돌 검사
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    return m.some((row, y) => row.some((value, x) => value !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0));
}

// 아레나 병합 및 정리
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        if (arena[y].every(value => value !== 0)) {
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            player.score += rowCount * 10;
            rowCount *= 2;
            ++y;
        }
    }
}

// 플레이어 관련 동작
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore(); // 레벨업 체크 추가
    }
    dropCounter = 0;
}


function playerHardDrop() {
    while (!collide(arena, player)) player.pos.y++;
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) player.pos.x -= offset;
}

function drawPreview() {
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    if (!nextPiece) return;
    
    const offsetX = (5 - nextPiece[0].length) / 2; 
    const offsetY = (6 - nextPiece.length) / 2; 

    nextPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                previewContext.fillStyle = colors[value];
                previewContext.fillRect(x + offsetX, y + offsetY, 1, 1);
                previewContext.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                previewContext.lineWidth = 0.05;
                previewContext.strokeRect(x + offsetX, y + offsetY, 1, 1);
            }
        });
    });
}



function playerReset() {
    player.matrix = nextPiece || createPiece('ILJOTSZ'[(Math.random() * 7) | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    nextPiece = createPiece('ILJOTSZ'[(Math.random() * 7) | 0]);
    drawPreview();

    if (collide(arena, player)) {
        gameOver();
    }
}

// 게임 시작 시 초기 미리보기 설정
nextPiece = createPiece('ILJOTSZ'[(Math.random() * 7) | 0]);
drawPreview();

function gameOver() {
    isRunning = false; // 게임 루프 중단
    document.getElementById('gameOver').style.display = 'block'; // Game Over 화면 표시
    document.getElementById('finalScore').innerText = player.score; // 최종 점수 표시
}

document.getElementById('restartButton').addEventListener('click', () => {
    arena.forEach(row => row.fill(0)); // 아레나 초기화
    player.score = 0; // 점수 초기화
    updateScore(); // 점수 업데이트
    playerReset(); // 플레이어 초기화
    document.getElementById('gameOver').style.display = 'none'; // Game Over 화면 숨기기
    toggleGame(true); // 게임 다시 시작
});


function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}


// 행렬 회전
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

// 점수 갱신 및 레벨업 처리
function updateScore() {
    scoreElement.innerText = `Score: ${player.score} | Level: ${level}`; // 레벨 표시 추가

    if (player.score >= scoreForNextLevel && level < maxLevel) {
        levelUp();
    }
}

function levelUp() {
    level++;
    scoreForNextLevel += 200; // 다음 레벨까지 필요한 점수 증가
    dropInterval = Math.max(10, dropInterval - 10); // 드롭 속도 감소 (최저 10ms)
    updateScore();

    console.log(`Level Up! Level: ${level}, Drop Interval: ${dropInterval}`);
    if (level === maxLevel) {
        console.log("Max Level Reached!");
        // 필요한 추가 동작 (예: 게임 오버 메시지 변경 등)
    }
}

// 이벤트 리스너 추가
document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowLeft': playerMove(-1); break;
        case 'ArrowRight': playerMove(1); break;
        case 'ArrowDown': playerDrop(); break;
        case 'ArrowUp': playerRotate(1); break;
        case ' ': playerHardDrop(); break;
    }
});

document.getElementById('playButton').addEventListener('click', () => toggleGame(true));
document.getElementById('stopButton').addEventListener('click', () => toggleGame(false));

// 초기화
playerReset();
updateScore();
update();
