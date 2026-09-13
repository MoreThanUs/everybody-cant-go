// ===== GAME CONSTANTS =====
const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory'
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_LEVEL = 550;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;

// ===== AUDIO SYSTEM =====
class AudioSystem {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API not available');
            this.enabled = false;
        }
    }

    playSound(type) {
        if (!this.enabled || !this.initialized) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        switch(type) {
            case 'jump':
                this.playJump();
                break;
            case 'land':
                this.playLand();
                break;
            case 'collectible':
                this.playCollectible();
                break;
            case 'death':
                this.playDeath();
                break;
            case 'score':
                this.playScore();
                break;
        }
    }

    playJump() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playLand() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playCollectible() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playDeath() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    playScore() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

// ===== PARTICLE SYSTEM =====
class Particle {
    constructor(x, y, vx, vy, life, type = 'dust') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.type = type;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        
        if (this.type === 'dust') {
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x, this.y, 2, 2);
        } else if (this.type === 'jump') {
            ctx.fillStyle = '#999';
            ctx.fillRect(this.x, this.y, 3, 3);
        }
        
        ctx.globalAlpha = 1;
    }
}

// ===== SCORE POPUP =====
class ScorePopup {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.life = 60;
        this.maxLife = 60;
    }

    update() {
        this.y -= 2;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('+' + this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// ===== COLLECTIBLE =====
class Collectible {
    constructor(x, y, type = 'note') {
        this.x = x;
        this.y = y;
        this.type = type; // 'note', 'record', 'microphone'
        this.width = 16;
        this.height = 16;
        this.collected = false;
        this.bobOffset = 0;
        this.bobSpeed = 0.05;
    }

    update() {
        this.bobOffset += this.bobSpeed;
    }

    draw(ctx) {
        const baseY = this.y + Math.sin(this.bobOffset) * 3;
        
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        
        switch(this.type) {
            case 'note':
                // Musical note
                ctx.beginPath();
                ctx.arc(this.x, baseY - 2, 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x + 3, baseY - 2);
                ctx.lineTo(this.x + 3, baseY + 6);
                ctx.stroke();
                break;
            case 'record':
                // Vinyl record
                ctx.beginPath();
                ctx.arc(this.x, baseY, 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.x, baseY, 3, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'microphone':
                // Microphone
                ctx.beginPath();
                ctx.arc(this.x, baseY - 2, 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x, baseY + 1);
                ctx.lineTo(this.x, baseY + 8);
                ctx.stroke();
                break;
        }
    }

    checkCollision(player) {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

// ===== PLAYER =====
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.velocityY = 0;
        this.isJumping = false;
        this.isGrounded = false;
        this.jumpPower = 18;
        this.gravity = 0.6;
        this.maxFallSpeed = 20;
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.state = 'running'; // running, jumping, falling, landing, dead
        this.deathTimer = 0;
    }

    update() {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            if (this.velocityY > this.maxFallSpeed) {
                this.velocityY = this.maxFallSpeed;
            }
        }

        this.y += this.velocityY;

        // Ground collision
        if (this.y + this.height >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
            
            if (this.state === 'falling') {
                this.state = 'landing';
                audioSystem.playSound('land');
            } else if (this.state !== 'dead') {
                this.state = 'running';
            }
        } else {
            this.isGrounded = false;
            if (this.velocityY > 0 && this.state !== 'dead') {
                this.state = 'falling';
            }
        }

        // Animation
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }

        // Death timer
        if (this.state === 'dead') {
            this.deathTimer++;
        }
    }

    jump() {
        if (this.isGrounded && this.state !== 'dead') {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.isGrounded = false;
            this.state = 'jumping';
            audioSystem.playSound('jump');
        }
    }

    die() {
        this.state = 'dead';
        this.deathTimer = 0;
        audioSystem.playSound('death');
    }

    draw(ctx) {
        if (this.state === 'dead') {
            // Dead sprite (fall over)
            const opacity = Math.max(0, 1 - this.deathTimer / 30);
            ctx.globalAlpha = opacity;
        }

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Head
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.fillRect(this.x + 10, this.y + 18, 12, 16);
        ctx.strokeRect(this.x + 10, this.y + 18, 12, 16);

        // Legs (animated running)
        const legOffset = Math.sin(this.animationFrame * Math.PI) * 3;
        ctx.fillRect(this.x + 12, this.y + 34, 4, 8 + legOffset);
        ctx.fillRect(this.x + 16, this.y + 34, 4, 8 - legOffset);

        // Arms
        ctx.fillRect(this.x + 8, this.y + 20, 4, 10);
        ctx.fillRect(this.x + 20, this.y + 20, 4, 10);

        // Hoodie/headphones accent
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 8);
        ctx.lineTo(this.x + 20, this.y + 8);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ===== OBSTACLE =====
class Obstacle {
    constructor(x, width, height) {
        this.x = x;
        this.y = GROUND_LEVEL - height;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = '#ddd';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Main block
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Pattern
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 12) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
        }
        for (let i = 0; i < this.height; i += 12) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i);
            ctx.lineTo(this.x + this.width, this.y + i);
            ctx.stroke();
        }
    }

    checkCollision(player) {
        const bounds = player.getBounds();
        return (
            bounds.x < this.x + this.width &&
            bounds.x + bounds.width > this.x &&
            bounds.y < this.y + this.height &&
            bounds.y + bounds.height > this.y
        );
    }
}

// ===== GAP =====
class Gap {
    constructor(x, width) {
        this.x = x;
        this.width = width;
        this.y = GROUND_LEVEL;
    }

    checkCollision(player) {
        return (
            player.x + player.width > this.x &&
            player.x < this.x + this.width &&
            player.y + player.height >= this.y &&
            player.velocityY >= 0
        );
    }
}

// ===== LEVEL GENERATOR =====
class LevelGenerator {
    constructor() {
        this.seed = 0;
        this.lastObstacleX = 300;
        this.difficulty = 0;
    }

    setSeed(s) {
        this.seed = s;
    }

    pseudoRandom() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    generateNextSection(difficulty) {
        const obstacles = [];
        const gaps = [];
        const collectibles = [];

        // Distance to next obstacle
        const minGap = 100 + difficulty * 2;
        const maxGap = 200 + difficulty * 5;
        const gapSize = minGap + this.pseudoRandom() * (maxGap - minGap);

        const nextX = this.lastObstacleX + gapSize;

        // Obstacle type based on difficulty
        const rand = this.pseudoRandom();
        let obstacleWidth = 40;
        let obstacleHeight = 40;

        if (difficulty < 0.3) {
            // Early game - simple small obstacles
            obstacleWidth = 40 + Math.floor(this.pseudoRandom() * 20);
            obstacleHeight = 40 + Math.floor(this.pseudoRandom() * 20);
        } else if (difficulty < 0.6) {
            // Mid game - varied obstacles
            if (rand < 0.3) {
                // Single tall block
                obstacleWidth = 40;
                obstacleHeight = 80 + Math.floor(this.pseudoRandom() * 30);
            } else if (rand < 0.6) {
                // Double blocks
                obstacles.push(new Obstacle(nextX, 30, 50));
                obstacles.push(new Obstacle(nextX + 40, 30, 50));
                this.lastObstacleX = nextX + 80;
                return { obstacles, gaps, collectibles };
            } else {
                // Wide low block
                obstacleWidth = 80 + Math.floor(this.pseudoRandom() * 40);
                obstacleHeight = 40;
            }
        } else {
            // Late game - challenging patterns
            if (rand < 0.2) {
                // Very tall block
                obstacleWidth = 30;
                obstacleHeight = 100 + Math.floor(this.pseudoRandom() * 50);
            } else if (rand < 0.4) {
                // Gap obstacle
                gaps.push(new Gap(nextX, 100 + Math.floor(this.pseudoRandom() * 80)));
                this.lastObstacleX = nextX + 100;
                return { obstacles, gaps, collectibles };
            } else if (rand < 0.7) {
                // Multiple blocks
                for (let i = 0; i < 3; i++) {
                    obstacles.push(new Obstacle(nextX + i * 35, 30, 40 + i * 15));
                }
                this.lastObstacleX = nextX + 110;
                return { obstacles, gaps, collectibles };
            } else {
                // Platform pattern
                obstacleWidth = 60;
                obstacleHeight = 50;
            }
        }

        obstacles.push(new Obstacle(nextX, obstacleWidth, obstacleHeight));

        // Occasional collectibles
        if (this.pseudoRandom() > 0.8) {
            const collectibleTypes = ['note', 'record', 'microphone'];
            const type = collectibleTypes[Math.floor(this.pseudoRandom() * 3)];
            collectibles.push(new Collectible(nextX + obstacleWidth / 2, this.y - 60, type));
        }

        this.lastObstacleX = nextX + obstacleWidth;

        return { obstacles, gaps, collectibles };
    }
}

// ===== BACKGROUND =====
class Background {
    constructor() {
        this.scrollX = 0;
        this.layers = [
            { speed: 0.2, opacity: 0.3 },
            { speed: 0.5, opacity: 0.5 },
            { speed: 0.8, opacity: 0.7 }
        ];
    }

    update(scrollX) {
        this.scrollX = scrollX;
    }

    draw(ctx) {
        // Sky
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background layers
        for (let layer of this.layers) {
            this.drawLayer(ctx, layer);
        }

        // Ground
        ctx.fillStyle = '#333';
        ctx.fillRect(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL);

        // Ground pattern
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        for (let i = -50; i < CANVAS_WIDTH + 50; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i - (this.scrollX % 20), GROUND_LEVEL);
            ctx.lineTo(i - (this.scrollX % 20) + 10, GROUND_LEVEL + 10);
            ctx.stroke();
        }
    }

    drawLayer(ctx, layer) {
        const offsetX = this.scrollX * layer.speed;
        ctx.globalAlpha = layer.opacity;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;

        // Buildings
        const buildingWidth = 150;
        const buildingHeight = 200;
        const spacing = 200;

        for (let i = -2; i < Math.ceil(CANVAS_WIDTH / spacing) + 2; i++) {
            const x = i * spacing - (offsetX % spacing);
            const y = 100;

            // Building outline
            ctx.strokeRect(x, y, buildingWidth, buildingHeight);

            // Windows
            ctx.fillStyle = '#111';
            for (let wx = 0; wx < buildingWidth; wx += 30) {
                for (let wy = 0; wy < buildingHeight; wy += 30) {
                    ctx.fillRect(x + wx + 5, y + wy + 5, 20, 20);
                }
            }
        }

        ctx.globalAlpha = 1;
    }
}

// ===== GAME =====
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GAME_STATES.TITLE;
        this.player = new Player(100, GROUND_LEVEL - PLAYER_HEIGHT);
        this.obstacles = [];
        this.gaps = [];
        this.collectibles = [];
        this.particles = [];
        this.scorePopups = [];
        this.background = new Background();
        this.levelGenerator = new LevelGenerator();
        this.levelGenerator.setSeed(Date.now());

        this.score = 0;
        this.distance = 0;
        this.highScore = this.loadHighScore();
        this.scrollX = 0;
        this.gameSpeed = 8;
        this.baseGameSpeed = 8;

        this.frameCount = 0;
        this.screenShakeAmount = 0;

        this.victoryDistance = 10000;

        this.setupEventListeners();
        this.generateInitialLevel();

        audioSystem.init();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', () => this.handleInput());
        document.addEventListener('touchstart', () => this.handleInput(), { passive: true });
    }

    handleKeyDown(e) {
        if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && e.target === document.body) {
            e.preventDefault();
            this.handleInput();
        }
        if (e.code === 'Escape') {
            this.togglePause();
        }
    }

    handleKeyUp(e) {
        // Could add key-up logic if needed
    }

    handleInput() {
        if (this.state === GAME_STATES.TITLE) {
            this.startGame();
        } else if (this.state === GAME_STATES.PLAYING) {
            this.player.jump();
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this.restart();
        } else if (this.state === GAME_STATES.VICTORY) {
            this.restart();
        }
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.showScreen('pauseScreen');
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.hideScreen('pauseScreen');
        }
    }

    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.distance = 0;
        this.scrollX = 0;
        this.gameSpeed = this.baseGameSpeed;
        this.player = new Player(100, GROUND_LEVEL - PLAYER_HEIGHT);
        this.obstacles = [];
        this.gaps = [];
        this.collectibles = [];
        this.particles = [];
        this.scorePopups = [];
        this.levelGenerator.setSeed(Date.now());
        this.generateInitialLevel();
        this.hideScreen('titleScreen');
        this.showHUD();
    }

    restart() {
        this.state = GAME_STATES.TITLE;
        this.hideScreen('gameOverScreen');
        this.hideScreen('victoryScreen');
        this.hideHUD();
        this.showScreen('titleScreen');
        this.updateHighScoreDisplay();
    }

    generateInitialLevel() {
        this.obstacles = [];
        this.gaps = [];
        this.collectibles = [];
        for (let i = 0; i < 10; i++) {
            this.generateNextSection(0);
        }
    }

    generateNextSection(difficulty) {
        const section = this.levelGenerator.generateNextSection(difficulty);
        this.obstacles.push(...section.obstacles);
        this.gaps.push(...section.gaps);
        this.collectibles.push(...section.collectibles);
    }

    update() {
        if (this.state !== GAME_STATES.PLAYING) return;

        this.frameCount++;

        // Update player
        this.player.update();

        // Check obstacles
        for (let obstacle of this.obstacles) {
            if (obstacle.checkCollision(this.player)) {
                this.gameOver();
                return;
            }
        }

        // Check gaps
        for (let gap of this.gaps) {
            if (gap.checkCollision(this.player)) {
                this.gameOver();
                return;
            }
        }

        // Check collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            if (this.collectibles[i].checkCollision(this.player)) {
                this.collectible(this.collectibles[i]);
                this.collectibles.splice(i, 1);
            } else {
                this.collectibles[i].update();
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            this.scorePopups[i].update();
            if (this.scorePopups[i].life <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }

        // Scroll camera
        this.scrollX += this.gameSpeed;
        this.background.update(this.scrollX);

        // Update score and distance
        this.score += Math.floor(this.gameSpeed * 0.5);
        this.distance = Math.floor(this.scrollX / 10);

        // Increase difficulty
        const difficultyFactor = Math.min(1, this.distance / this.victoryDistance);
        this.gameSpeed = this.baseGameSpeed + difficultyFactor * 3;

        // Generate new obstacles
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (lastObstacle.x - this.scrollX < CANVAS_WIDTH + 200) {
                this.generateNextSection(difficultyFactor);
            }
        }

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(o => o.x - this.scrollX > -100);
        this.gaps = this.gaps.filter(g => g.x - this.scrollX > -100);

        // Check victory
        if (this.distance >= this.victoryDistance) {
            this.victory();
        }

        // Create landing particles
        if (this.player.isGrounded && this.frameCount % 5 === 0) {
            this.particles.push(new Particle(
                this.player.x + Math.random() * this.player.width,
                this.player.y + this.player.height,
                (Math.random() - 0.5) * 4,
                Math.random() * 2,
                15,
                'dust'
            ));
        }

        // Screen shake
        if (this.screenShakeAmount > 0) {
            this.screenShakeAmount *= 0.9;
        }
    }

    collectible(item) {
        const points = 100;
        this.score += points;
        audioSystem.playSound('collectible');
        this.scorePopups.push(new ScorePopup(
            item.x - this.scrollX,
            item.y - 20,
            points
        ));

        // Particles
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                item.x,
                item.y,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                20,
                'jump'
            ));
        }
    }

    gameOver() {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.state = GAME_STATES.GAME_OVER;
        this.player.die();
        this.screenShakeAmount = 5;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        this.hideHUD();
        this.showGameOverScreen();
    }

    victory() {
        this.state = GAME_STATES.VICTORY;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        this.hideHUD();
        this.showVictoryScreen();
    }

    draw() {
        // Screen shake
        this.ctx.save();
        if (this.screenShakeAmount > 0) {
            const shake = Math.random() * this.screenShakeAmount * 2 - this.screenShakeAmount;
            this.ctx.translate(shake, 0);
        }

        // Draw background
        this.background.draw(this.ctx);

        // Draw game world
        this.ctx.save();
        this.ctx.translate(-this.scrollX, 0);

        // Collectibles
        for (let collectible of this.collectibles) {
            collectible.draw(this.ctx);
        }

        // Obstacles
        for (let obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }

        // Gaps (draw as visual indicator)
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        for (let gap of this.gaps) {
            this.ctx.beginPath();
            this.ctx.moveTo(gap.x, GROUND_LEVEL);
            this.ctx.lineTo(gap.x + gap.width, GROUND_LEVEL);
            this.ctx.stroke();
        }

        // Player
        this.player.draw(this.ctx);

        // Particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }

        // Score popups
        for (let popup of this.scorePopups) {
            popup.draw(this.ctx);
        }

        this.ctx.restore();

        this.ctx.restore();
    }

    updateHUD() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('highScoreValue').textContent = this.highScore;
        document.getElementById('distanceValue').textContent = this.distance;
    }

    showHUD() {
        document.getElementById('hud').classList.add('visible');
    }

    hideHUD() {
        document.getElementById('hud').classList.remove('visible');
    }

    showScreen(screenId) {
        document.getElementById(screenId).classList.add('active');
    }

    hideScreen(screenId) {
        document.getElementById(screenId).classList.remove('active');
    }

    showGameOverScreen() {
        document.getElementById('finalDistance').textContent = this.distance;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        this.showScreen('gameOverScreen');
    }

    showVictoryScreen() {
        document.getElementById('victoryDistance').textContent = this.distance;
        document.getElementById('victoryScore').textContent = this.score;
        document.getElementById('victoryHighScore').textContent = this.highScore;
        
        const newRecord = document.getElementById('newRecord');
        if (this.score > this.highScore * 0.95) {
            newRecord.textContent = 'NEW RECORD!';
            newRecord.classList.add('highlight');
        } else {
            newRecord.textContent = '';
            newRecord.classList.remove('highlight');
        }
        
        this.showScreen('victoryScreen');
    }

    updateHighScoreDisplay() {
        document.getElementById('titleHighScore').textContent = this.highScore;
    }

    saveHighScore() {
        localStorage.setItem('ecg-highscore', this.highScore);
    }

    loadHighScore() {
        const saved = localStorage.getItem('ecg-highscore');
        return saved ? parseInt(saved) : 0;
    }

    gameLoop() {
        this.update();
        this.draw();
        this.updateHUD();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ===== INITIALIZATION =====
const audioSystem = new AudioSystem();

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const game = new Game(canvas);
    game.gameLoop();
});
