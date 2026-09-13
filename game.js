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
        
        osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.12);
        gain.gain.setValueAtTime(this.masterVolume * 0.35, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.12);
    }

    playLand() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(180, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.08);
        gain.gain.setValueAtTime(this.masterVolume * 0.25, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.08);
    }

    playCollectible() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(900, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(this.masterVolume * 0.25, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playDeath() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(350, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.35);
        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.35);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.35);
    }

    playScore() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(700, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, this.audioContext.currentTime + 0.12);
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.12);
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
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.25; // gravity
        this.vx *= 0.99; // air resistance
        this.life--;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = Math.max(0, alpha * 0.8);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'dust') {
            ctx.fillStyle = '#888';
            ctx.fillRect(-1.5, -1.5, 3, 3);
        } else if (this.type === 'impact') {
            ctx.fillStyle = '#aaa';
            const size = 2.5 * (1 - alpha * 0.5);
            ctx.fillRect(-size, -size, size * 2, size * 2);
        } else if (this.type === 'collectible') {
            ctx.fillStyle = '#ccc';
            ctx.fillRect(-2, -2, 4, 4);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// ===== SCORE POPUP =====
class ScorePopup {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.life = 50;
        this.maxLife = 50;
        this.scale = 1;
    }

    update() {
        this.y -= 2.5;
        this.life--;
        this.scale = 1 + (1 - this.life / this.maxLife) * 0.3;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'center';
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillText('+' + this.value, 0, 0);
        ctx.restore();
        
        ctx.globalAlpha = 1;
    }
}

// ===== COLLECTIBLE =====
class Collectible {
    constructor(x, y, type = 'note') {
        this.x = x;
        this.y = y;
        this.type = type; // 'note', 'record', 'microphone'
        this.width = 18;
        this.height = 18;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.08;
        this.spinAngle = 0;
        this.glowPulse = 0;
    }

    update() {
        this.bobOffset += this.bobSpeed;
        this.spinAngle += 0.05;
        this.glowPulse = (this.glowPulse + 0.02) % (Math.PI * 2);
    }

    draw(ctx) {
        const baseY = this.y + Math.sin(this.bobOffset) * 4;
        const glowIntensity = Math.sin(this.glowPulse) * 0.3 + 0.4;
        
        ctx.save();
        ctx.translate(this.x, baseY);
        ctx.rotate(this.spinAngle);
        
        // Glow effect
        ctx.strokeStyle = ctx.fillStyle = `rgba(150, 150, 150, ${glowIntensity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.5;
        
        switch(this.type) {
            case 'note':
                // Musical note
                ctx.beginPath();
                ctx.arc(0, -2, 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(3, -2);
                ctx.lineTo(3, 6);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-3, -2);
                ctx.lineTo(-3, 4);
                ctx.stroke();
                break;
            case 'record':
                // Vinyl record
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'microphone':
                // Microphone
                ctx.beginPath();
                ctx.arc(0, -3, 3.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 8);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 9, 2.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
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
        this.jumpPower = 16.5;
        this.gravity = 0.62;
        this.maxFallSpeed = 21;
        this.animationFrame = 0;
        this.animationSpeed = 0.25;
        this.state = 'running'; // running, jumping, falling, landing, dead
        this.deathTimer = 0;
        this.landingTimer = 0;
        this.jumpStartVelocity = 0;
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
            
            if (this.state === 'falling' || this.state === 'jumping') {
                this.state = 'landing';
                this.landingTimer = 6;
                audioSystem.playSound('land');
            } else if (this.state !== 'dead') {
                this.state = 'running';
            }
        } else {
            this.isGrounded = false;
            if (this.velocityY > 2 && this.state !== 'dead') {
                this.state = 'falling';
            }
        }

        // Animation
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 6) {
            this.animationFrame = 0;
        }

        // Landing timer
        if (this.landingTimer > 0) {
            this.landingTimer--;
        }

        // Death timer
        if (this.state === 'dead') {
            this.deathTimer++;
        }
    }

    jump() {
        if (this.isGrounded && this.state !== 'dead') {
            this.velocityY = -this.jumpPower;
            this.jumpStartVelocity = -this.jumpPower;
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
            const opacity = Math.max(0, 1 - this.deathTimer / 25);
            ctx.globalAlpha = opacity;
        }

        const scale = this.state === 'landing' && this.landingTimer > 0 
            ? 1 - (this.landingTimer / 6) * 0.08 
            : 1;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-(this.width / 2), -(this.height / 2));

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Head
        ctx.beginPath();
        ctx.arc(this.width / 2, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes based on state
        ctx.fillStyle = '#000';
        if (this.state === 'dead') {
            ctx.fillRect(this.width / 2 - 4, 7, 2, 2);
            ctx.fillRect(this.width / 2 + 2, 7, 2, 2);
        } else {
            ctx.fillRect(this.width / 2 - 4, 8, 2.5, 2);
            ctx.fillRect(this.width / 2 + 1.5, 8, 2.5, 2);
        }

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Body
        ctx.fillRect(10, 18, 12, 16);
        ctx.strokeRect(10, 18, 12, 16);

        // Legs (animated running/jumping)
        let leftLegOffset = 0;
        let rightLegOffset = 0;
        
        if (this.state === 'running') {
            const legSin = Math.sin(this.animationFrame * Math.PI / 3);
            leftLegOffset = legSin * 4;
            rightLegOffset = -legSin * 4;
        } else if (this.state === 'jumping' || this.state === 'falling') {
            leftLegOffset = -2;
            rightLegOffset = 2;
        } else if (this.state === 'landing') {
            leftLegOffset = 1;
            rightLegOffset = 1;
        }

        ctx.fillRect(12, 34, 4, 8 + leftLegOffset);
        ctx.fillRect(16, 34, 4, 8 + rightLegOffset);

        // Arms
        if (this.state === 'jumping' || this.state === 'falling') {
            ctx.fillRect(8, 18, 4, 12);
            ctx.fillRect(20, 18, 4, 12);
        } else {
            const armSin = Math.sin(this.animationFrame * Math.PI / 3);
            ctx.fillRect(8, 20 + armSin * 2, 4, 10);
            ctx.fillRect(20, 20 - armSin * 2, 4, 10);
        }

        // Hoodie/headphones accent
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.width / 2 - 4, 9, 2, 0, Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.width / 2 + 4, 9, 2, 0, Math.PI, true);
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    getBounds() {
        return {
            x: this.x + 4,
            y: this.y + 6,
            width: this.width - 8,
            height: this.height - 6
        };
    }
}

// ===== OBSTACLE =====
class Obstacle {
    constructor(x, width, height, type = 'block') {
        this.x = x;
        this.y = GROUND_LEVEL - height;
        this.width = width;
        this.height = height;
        this.type = type; // 'block', 'spike', 'platform'
    }

    draw(ctx) {
        if (this.type === 'spike') {
            // Spike obstacles
            ctx.fillStyle = '#bbb';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            
            const spikeCount = Math.ceil(this.width / 16);
            const spikeWidth = this.width / spikeCount;
            
            for (let i = 0; i < spikeCount; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + i * spikeWidth, this.y + this.height);
                ctx.lineTo(this.x + i * spikeWidth + spikeWidth / 2, this.y);
                ctx.lineTo(this.x + (i + 1) * spikeWidth, this.y + this.height);
                ctx.fill();
                ctx.stroke();
            }
        } else if (this.type === 'platform') {
            // Platform
            ctx.fillStyle = '#ccc';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.5;
            
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Top highlight
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.stroke();
            
            // Pattern
            ctx.strokeStyle = '#777';
            ctx.lineWidth = 1;
            for (let i = this.width / 3; i < this.width; i += this.width / 3) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y);
                ctx.lineTo(this.x + i, this.y + this.height);
                ctx.stroke();
            }
        } else {
            // Standard block
            ctx.fillStyle = '#ddd';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Grid pattern
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            const gridSize = 12;
            for (let i = 0; i < this.width; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y);
                ctx.lineTo(this.x + i, this.y + this.height);
                ctx.stroke();
            }
            for (let i = 0; i < this.height; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + i);
                ctx.lineTo(this.x + this.width, this.y + i);
                ctx.stroke();
            }
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
            player.x + player.width > this.x + 8 &&
            player.x + 8 < this.x + this.width &&
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
        this.patternIndex = 0;
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

        const minGap = 90 + difficulty * 3;
        const maxGap = 180 + difficulty * 8;
        const gapSize = minGap + this.pseudoRandom() * (maxGap - minGap);

        const nextX = this.lastObstacleX + gapSize;
        const rand = this.pseudoRandom();

        // Smart difficulty progression
        if (difficulty < 0.2) {
            // Intro: easy single blocks
            const height = 45 + Math.floor(this.pseudoRandom() * 20);
            const width = 40 + Math.floor(this.pseudoRandom() * 15);
            obstacles.push(new Obstacle(nextX, width, height, 'block'));
            
            if (this.pseudoRandom() > 0.85 && height < 55) {
                collectibles.push(new Collectible(nextX + width / 2 - 8, this.y - 70, this.getRandomCollectible()));
            }
            
            this.lastObstacleX = nextX + width;
        } else if (difficulty < 0.35) {
            // Early-mid: small variations
            if (rand < 0.4) {
                obstacles.push(new Obstacle(nextX, 50, 55, 'block'));
                this.lastObstacleX = nextX + 50;
            } else if (rand < 0.7) {
                obstacles.push(new Obstacle(nextX, 35, 75, 'block'));
                this.lastObstacleX = nextX + 35;
            } else {
                gaps.push(new Gap(nextX, 80 + Math.floor(this.pseudoRandom() * 40)));
                this.lastObstacleX = nextX + 80;
            }
        } else if (difficulty < 0.55) {
            // Mid: combinations
            if (rand < 0.25) {
                // Double blocks
                obstacles.push(new Obstacle(nextX, 32, 50, 'platform'));
                obstacles.push(new Obstacle(nextX + 45, 32, 50, 'block'));
                this.lastObstacleX = nextX + 85;
            } else if (rand < 0.45) {
                // Wide gap
                gaps.push(new Gap(nextX, 110 + Math.floor(this.pseudoRandom() * 50)));
                this.lastObstacleX = nextX + 140;
            } else if (rand < 0.65) {
                // Tall block
                obstacles.push(new Obstacle(nextX, 40, 90, 'block'));
                this.lastObstacleX = nextX + 40;
            } else {
                // Low platform
                obstacles.push(new Obstacle(nextX, 70, 35, 'platform'));
                this.lastObstacleX = nextX + 70;
            }
        } else if (difficulty < 0.75) {
            // Late-mid: harder patterns
            if (rand < 0.2) {
                // Spikes
                obstacles.push(new Obstacle(nextX, 50, 40, 'spike'));
                this.lastObstacleX = nextX + 50;
            } else if (rand < 0.35) {
                // Multiple platforms
                obstacles.push(new Obstacle(nextX, 40, 50, 'block'));
                obstacles.push(new Obstacle(nextX + 55, 35, 70, 'platform'));
                this.lastObstacleX = nextX + 98;
            } else if (rand < 0.5) {
                // Large gap
                gaps.push(new Gap(nextX, 130 + Math.floor(this.pseudoRandom() * 60)));
                this.lastObstacleX = nextX + 150;
            } else if (rand < 0.7) {
                // Tall spike
                obstacles.push(new Obstacle(nextX, 35, 100, 'spike'));
                this.lastObstacleX = nextX + 35;
            } else {
                obstacles.push(new Obstacle(nextX, 60, 40, 'block'));
                this.lastObstacleX = nextX + 60;
            }
        } else {
            // Endgame: maximum challenge
            if (rand < 0.15) {
                // Triple threat
                for (let i = 0; i < 3; i++) {
                    obstacles.push(new Obstacle(nextX + i * 40, 30, 50 + i * 15, 'block'));
                }
                this.lastObstacleX = nextX + 130;
            } else if (rand < 0.3) {
                // Massive gap
                gaps.push(new Gap(nextX, 150 + Math.floor(this.pseudoRandom() * 80)));
                this.lastObstacleX = nextX + 170;
            } else if (rand < 0.45) {
                // Mixed obstacles
                obstacles.push(new Obstacle(nextX, 45, 70, 'spike'));
                obstacles.push(new Obstacle(nextX + 60, 50, 40, 'block'));
                this.lastObstacleX = nextX + 120;
            } else if (rand < 0.6) {
                // Platform series
                for (let i = 0; i < 2; i++) {
                    obstacles.push(new Obstacle(nextX + i * 50, 40, 60 - i * 10, 'platform'));
                }
                this.lastObstacleX = nextX + 100;
            } else {
                obstacles.push(new Obstacle(nextX, 35, 120, 'block'));
                this.lastObstacleX = nextX + 35;
            }
        }

        // Collectible placement - skill-based
        if (difficulty > 0.3 && this.pseudoRandom() > 0.75) {
            const collectibleY = obstacles.length > 0 
                ? obstacles[0].y - 70 
                : GROUND_LEVEL - 70;
            collectibles.push(new Collectible(
                nextX + (obstacles.length > 0 ? obstacles[0].width / 2 : 30) - 8,
                collectibleY,
                this.getRandomCollectible()
            ));
        }

        return { obstacles, gaps, collectibles };
    }

    getRandomCollectible() {
        const types = ['note', 'record', 'microphone'];
        return types[Math.floor(this.pseudoRandom() * types.length)];
    }
}

// ===== BACKGROUND =====
class Background {
    constructor() {
        this.scrollX = 0;
        this.layers = [
            { speed: 0.15, opacity: 0.25, type: 'far' },
            { speed: 0.4, opacity: 0.45, type: 'mid' },
            { speed: 0.75, opacity: 0.65, type: 'near' }
        ];
    }

    update(scrollX) {
        this.scrollX = scrollX;
    }

    draw(ctx) {
        // Sky gradient
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background layers
        for (let layer of this.layers) {
            this.drawLayer(ctx, layer);
        }

        // Ground
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL);

        // Ground base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, GROUND_LEVEL + 20, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL - 20);

        // Ground pattern - crosshatch
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        for (let i = -50; i < CANVAS_WIDTH + 50; i += 18) {
            ctx.beginPath();
            ctx.moveTo(i - (this.scrollX % 18), GROUND_LEVEL);
            ctx.lineTo(i + 8 - (this.scrollX % 18), GROUND_LEVEL + 12);
            ctx.stroke();
        }

        // Top edge highlight
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_LEVEL);
        ctx.lineTo(CANVAS_WIDTH, GROUND_LEVEL);
        ctx.stroke();
    }

    drawLayer(ctx, layer) {
        const offsetX = this.scrollX * layer.speed;
        ctx.globalAlpha = layer.opacity;
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 1;

        const buildingWidth = 120;
        const buildingHeight = 180;
        const spacing = 180;

        for (let i = -2; i < Math.ceil(CANVAS_WIDTH / spacing) + 2; i++) {
            const x = i * spacing - (offsetX % spacing);
            const y = 80 + (i % 2) * 20;

            // Building outline
            ctx.strokeRect(x, y, buildingWidth, buildingHeight);

            // Windows
            ctx.fillStyle = '#0a0a0a';
            for (let wx = 5; wx < buildingWidth - 5; wx += 22) {
                for (let wy = 10; wy < buildingHeight - 5; wy += 22) {
                    ctx.fillRect(x + wx, y + wy, 15, 15);
                }
            }

            // Window lights
            if (i % 3 === 0) {
                ctx.fillStyle = '#444';
                ctx.fillRect(x + wx - 15, y + wy - 15, 6, 6);
                ctx.fillRect(x + wx - 6, y + wy - 15, 6, 6);
            }

            // Antenna
            ctx.strokeStyle = '#3a3a3a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + buildingWidth / 2, y);
            ctx.lineTo(x + buildingWidth / 2, y - 15);
            ctx.stroke();
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
        this.gameSpeed = 7.5;
        this.baseGameSpeed = 7.5;

        this.frameCount = 0;
        this.screenShakeAmount = 0;
        this.screenShakeDecay = 0.85;

        this.victoryDistance = 10000;
        this.cameraX = 100;

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
        // Reserved for future input refinement
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
        this.cameraX = 100;
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
        for (let i = 0; i < 12; i++) {
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

        // Smooth camera follow
        const targetCameraX = this.player.x - 200;
        this.cameraX += (targetCameraX - this.cameraX) * 0.1;

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
        this.scrollX = this.cameraX;
        this.background.update(this.scrollX);

        // Update score and distance
        this.score += Math.floor(this.gameSpeed * 0.45);
        this.distance = Math.floor(this.scrollX / 10);

        // Increase difficulty smoothly
        const difficultyFactor = Math.min(1, this.distance / this.victoryDistance);
        this.gameSpeed = this.baseGameSpeed + difficultyFactor * 3.5;

        // Generate new obstacles
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (lastObstacle.x - this.scrollX < CANVAS_WIDTH + 300) {
                this.generateNextSection(difficultyFactor);
            }
        }

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(o => o.x - this.scrollX > -150);
        this.gaps = this.gaps.filter(g => g.x - this.scrollX > -150);
        this.collectibles = this.collectibles.filter(c => c.x - this.scrollX > -50);

        // Check victory
        if (this.distance >= this.victoryDistance) {
            this.victory();
        }

        // Create landing particles
        if (this.player.isGrounded && this.frameCount % 4 === 0 && this.player.state === 'running') {
            this.particles.push(new Particle(
                this.player.x + Math.random() * this.player.width - this.scrollX,
                this.player.y + this.player.height - this.scrollX,
                (Math.random() - 0.5) * 3,
                Math.random() * 1.5,
                20,
                'dust'
            ));
        }

        // Screen shake decay
        if (this.screenShakeAmount > 0) {
            this.screenShakeAmount *= this.screenShakeDecay;
        }
    }

    collectible(item) {
        const points = 150;
        this.score += points;
        audioSystem.playSound('collectible');
        this.scorePopups.push(new ScorePopup(
            item.x - this.scrollX,
            item.y - 40,
            points
        ));

        // Celebration particles
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(
                item.x - this.scrollX,
                item.y - this.scrollX,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                25,
                'collectible'
            ));
        }
    }

    gameOver() {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.state = GAME_STATES.GAME_OVER;
        this.player.die();
        this.screenShakeAmount = 12;

        // Impact particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                this.player.x - this.scrollX + this.player.width / 2,
                this.player.y - this.scrollX + this.player.height / 2,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                30,
                'impact'
            ));
        }

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
            const shake = (Math.random() - 0.5) * this.screenShakeAmount * 2;
            const shakeY = (Math.random() - 0.5) * this.screenShakeAmount * 1.2;
            this.ctx.translate(shake, shakeY);
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
        if (this.score > this.highScore * 0.9) {
            newRecord.textContent = '★ NEW PERSONAL BEST! ★';
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
