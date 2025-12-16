// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes
const SHAPES = {
    I: [
        [[1, 1, 1, 1]],
        [[1],
         [1],
         [1],
         [1]]
    ],
    O: [
        [[1, 1],
         [1, 1]]
    ],
    T: [
        [[0, 1, 0],
         [1, 1, 1]],
        [[1, 0],
         [1, 1],
         [1, 0]],
        [[1, 1, 1],
         [0, 1, 0]],
        [[0, 1],
         [1, 1],
         [0, 1]]
    ],
    S: [
        [[0, 1, 1],
         [1, 1, 0]],
        [[1, 0],
         [1, 1],
         [0, 1]]
    ],
    Z: [
        [[1, 1, 0],
         [0, 1, 1]],
        [[0, 1],
         [1, 1],
         [1, 0]]
    ],
    J: [
        [[1, 0, 0],
         [1, 1, 1]],
        [[1, 1],
         [1, 0],
         [1, 0]],
        [[1, 1, 1],
         [0, 0, 1]],
        [[0, 1],
         [0, 1],
         [1, 1]]
    ],
    L: [
        [[0, 0, 1],
         [1, 1, 1]],
        [[1, 0],
         [1, 0],
         [1, 1]],
        [[1, 1, 1],
         [1, 0, 0]],
        [[1, 1],
         [0, 1],
         [0, 1]]
    ]
};

// Tetromino colors
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.init();
    }
    
    init() {
        this.spawnPiece();
        this.spawnPiece();
        this.bindEvents();
        this.updateScore();
        this.gameLoop(0);
    }
    
    spawnPiece() {
        const types = Object.keys(SHAPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const shape = SHAPES[type];
        
        const piece = {
            type: type,
            shape: shape,
            rotation: 0,
            x: Math.floor(COLS / 2) - Math.floor(shape[0][0].length / 2),
            y: 0,
            color: COLORS[type]
        };
        
        if (this.currentPiece === null) {
            this.currentPiece = piece;
        } else {
            this.nextPiece = piece;
        }
    }
    
    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        
        // Add highlight effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE / 3, BLOCK_SIZE / 3);
    }
    
    drawBoard() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            const shape = this.currentPiece.shape[this.currentPiece.rotation];
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(
                            this.ctx,
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape[0];
            const offsetX = (4 - shape[0].length) / 2;
            const offsetY = (4 - shape.length) / 2;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(
                            this.nextCtx,
                            offsetX + x,
                            offsetY + y,
                            this.nextPiece.color
                        );
                    }
                }
            }
        }
    }
    
    isValidMove(piece, dx, dy, rotation) {
        const shape = piece.shape[rotation !== undefined ? rotation : piece.rotation];
        const newX = piece.x + (dx || 0);
        const newY = piece.y + (dy || 0);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return false;
                    }
                    
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    placePiece() {
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.spawnPiece();
        
        if (!this.isValidMove(this.currentPiece, 0, 0)) {
            this.endGame();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            // Score calculation: 100 * lines^2 * level
            this.score += 100 * linesCleared * linesCleared * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
        }
    }
    
    movePiece(dx, dy) {
        if (!this.paused && !this.gameOver && this.isValidMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        if (this.paused || this.gameOver || !this.currentPiece) return;
        
        const nextRotation = (this.currentPiece.rotation + 1) % this.currentPiece.shape.length;
        if (this.isValidMove(this.currentPiece, 0, 0, nextRotation)) {
            this.currentPiece.rotation = nextRotation;
        }
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
        }
    }
    
    hardDrop() {
        if (this.paused || this.gameOver) return;
        
        while (this.movePiece(0, 1)) {
            // Keep dropping
        }
        this.placePiece();
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    togglePause() {
        if (!this.gameOver) {
            this.paused = !this.paused;
            const pauseElement = document.getElementById('pause');
            if (this.paused) {
                pauseElement.classList.remove('hidden');
            } else {
                pauseElement.classList.add('hidden');
            }
        }
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    restart() {
        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;
        
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('pause').classList.add('hidden');
        
        this.init();
    }
    
    bindEvents() {
        this.keyHandler = (e) => {
            if (this.gameOver && e.key !== 'Enter' && e.code !== 'Enter') return;
            
            const code = e.code;
            const key = e.key.toLowerCase();
            let handled = false;
            
            // Use code first (more reliable)
            switch(code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    handled = true;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    handled = true;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.dropPiece();
                    handled = true;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    handled = true;
                    break;
                case 'Space':
                    e.preventDefault();
                    this.rotatePiece();
                    handled = true;
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.togglePause();
                    handled = true;
                    break;
            }
            
            // Fallback for key property if code didn't match
            if (!handled) {
                if (key === 'p') {
                    e.preventDefault();
                    this.togglePause();
                } else if (key === ' ') {
                    e.preventDefault();
                    this.rotatePiece();
                }
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    gameLoop(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        if (!this.paused && !this.gameOver) {
            this.dropCounter += deltaTime;
            
            if (this.dropCounter > this.dropInterval) {
                this.dropPiece();
                this.dropCounter = 0;
            }
        }
        
        this.drawBoard();
        this.drawNextPiece();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Tetris();
});
