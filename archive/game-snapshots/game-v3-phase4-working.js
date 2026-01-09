// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Grid constants
const GRID_SIZE = 20;  // Size of each cell in pixels
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;   // 20 cells wide
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE; // 20 cells tall

// Game constants
const MOVE_INTERVAL = 150; // Milliseconds between moves
const INITIAL_LENGTH = 3;

// Direction constants
const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game state
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;
let lastMoveTime = 0;

// ============================================
// SNAKE CLASS
// ============================================

class Snake {
    constructor() {
        // Start in center of grid
        const startX = Math.floor(GRID_WIDTH / 2);
        const startY = Math.floor(GRID_HEIGHT / 2);
        
        // Snake is array of segments, each with {x, y}
        // Head is segments[0]
        this.segments = [];
        for (let i = 0; i < INITIAL_LENGTH; i++) {
            this.segments.push({
                x: startX - i, // Start with body extending left
                y: startY
            });
        }
        
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT; // Buffer for input
    }
    
    update() {
        // Apply buffered direction (prevents double-input in same frame)
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = this.segments[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Wrap at edges
        if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
        if (newHead.x >= GRID_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
        if (newHead.y >= GRID_HEIGHT) newHead.y = 0;
        
        // Add new head to front
        this.segments.unshift(newHead);
        
        // Remove tail (keeps length constant for now)
        this.segments.pop();
    }
    
    checkSelfCollision() {
        // Check if head collides with any body segment
        const head = this.segments[0];
        
        // Start at index 1 (skip head itself)
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    setDirection(newDirection) {
        // Prevent 180-degree turns (can't go back on yourself)
        const oppositeX = this.direction.x + newDirection.x === 0;
        const oppositeY = this.direction.y + newDirection.y === 0;
        
        if (oppositeX && oppositeY) {
            return; // Ignore opposite direction
        }
        
        this.nextDirection = newDirection;
    }
    
    grow() {
        // Add segment at tail position (will be done by not popping in update)
        const tail = this.segments[this.segments.length - 1];
        this.segments.push({ x: tail.x, y: tail.y });
    }
    
    render(ctx) {
        // Draw all segments
        this.segments.forEach((segment, index) => {
            // Head is brighter, body fades
            const isHead = index === 0;
            
            if (isHead) {
                ctx.fillStyle = '#00ff88'; // Bright green head
            } else {
                ctx.fillStyle = '#00aa66'; // Darker green body
            }
            
            ctx.fillRect(
                segment.x * GRID_SIZE + 1, // +1 for small gap
                segment.y * GRID_SIZE + 1,
                GRID_SIZE - 2, // -2 for gap between cells
                GRID_SIZE - 2
            );
        });
    }
}

// ============================================
// FOOD CLASS
// ============================================

class Food {
    constructor(snake) {
        this.respawn(snake);
    }
    
    respawn(snake) {
        // Find empty position not occupied by snake
        let position;
        let isValidPosition;
        
        do {
            position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            // Check if this position overlaps with snake
            isValidPosition = !snake.segments.some(segment => 
                segment.x === position.x && segment.y === position.y
            );
        } while (!isValidPosition);
        
        this.x = position.x;
        this.y = position.y;
    }
    
    render(ctx) {
        // Draw food as bright red circle
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(
            this.x * GRID_SIZE + GRID_SIZE / 2,
            this.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// ============================================
// GAME OBJECT
// ============================================

class Game {
    constructor() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.score = 0;
    }
    
    update() {
        if (currentState !== GameState.PLAYING) return;
        
        // Check if enough time has passed for next move
        const currentTime = Date.now();
        if (currentTime - lastMoveTime < MOVE_INTERVAL) {
            return; // Not time to move yet
        }
        lastMoveTime = currentTime;
        
        // Update snake
        this.snake.update();
        
        // Check for self-collision (game over)
        if (this.snake.checkSelfCollision()) {
            currentState = GameState.GAME_OVER;
            return;
        }
        
        // Check if snake ate food
        const head = this.snake.segments[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            this.food.respawn(this.snake);
            this.score += 10;
            updateScoreDisplay();
        }
    }
    
    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw food
        this.food.render(ctx);
        
        // Draw snake
        this.snake.render(ctx);
        
        // Draw UI text based on state
        if (currentState === GameState.MENU) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.GAME_OVER) {
            ctx.fillStyle = '#ff4444';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        }
        
        ctx.textAlign = 'left'; // Reset
    }
    
    reset() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.score = 0;
        updateScoreDisplay();
    }
}

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Handle arrow keys
    if (currentState === GameState.PLAYING) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            game.snake.setDirection(Direction.UP);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            game.snake.setDirection(Direction.DOWN);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            game.snake.setDirection(Direction.LEFT);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            game.snake.setDirection(Direction.RIGHT);
        }
    }
    
    // Handle spacebar for state changes
    if (e.key === ' ') {
        e.preventDefault();
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ============================================
// UI UPDATES
// ============================================

function updateScoreDisplay() {
    document.getElementById('score').textContent = game.score;
}

// ============================================
// GAME LOOP
// ============================================

const game = new Game();
updateScoreDisplay();

function gameLoop() {
    game.update();
    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();

console.log('Snake game initialized');
console.log(`Grid: ${GRID_WIDTH}x${GRID_HEIGHT} cells`);
console.log(`Cell size: ${GRID_SIZE}px`);
