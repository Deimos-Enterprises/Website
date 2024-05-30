// import './style.css'
// import Phaser from 'phaser'
//note to self: add easter egg -> mars anime girl?

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const physicalConstants = {
    earthGravity: 9.81,
    marsGravity: 3.71 * 15,
    marsFriction: 0.1,
}

const imageConstants = {
    tileWidth: 32,
    tileHeight: 32,
    surface: 'mars-surface',
    underground: 'mars-underground',
    uranium: 'mars-uranium',
    ice: 'mars-ice',
    player: 'astronaut',
    refill: 'refill-station',
    rover: 'rover',
    dust: 'dust',
    interact: 'interactbutton',
    restart: 'restartbutton'
}

const resourceConstants = {
    idle: 0.001,
    moving: 0.02,
    mining: 0.06
}

const disasterConstants = {
    disasterChance: 0.05,
    marsquake: 'Marsquake!',
    dustStorm: 'Dust Storm!'
}


class TitleScene extends Phaser.Scene {
    constructor() {
        super('title-scene')
    }
    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.image('logo', 'res/logo.png');
        this.load.image('playbutton', 'res/playbutton.png');
        this.load.image('controlsbutton', 'res/controlsbutton.png');
        this.load.image('background', 'res/marsbackground.jpg');

    }
    create() {
        console.log('Title Scene');
        this.background = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'background');
        this.background.setScale(sizes.width / 1744, sizes.height / 980);
        this.logo = this.add.image(0.5 * sizes.width, 0.3 * sizes.height, 'logo').setScale(0.8);
        this.logo.setInteractive();
        this.logo.on('pointerdown', () => {this.scene.start('mars-scene')});

        this.playButton = this.add.image(0.5 * sizes.width, 0.65 * sizes.height, 'playbutton');
        this.playButton.setInteractive();
        this.playButton.on('pointerdown', () => {this.scene.start('mars-scene')});
        this.controlsButton = this.add.image(0.5 * sizes.width, 0.82 * sizes.height, 'controlsbutton');
        this.controlsButton.setInteractive();
        this.controlsButton.on('pointerdown', () => {this.scene.start('controls-scene')});
    }

    update() {

    }
}

class ControlsScene extends Phaser.Scene {
    constructor() {
        super('controls-scene')
    }
    preload() {
        this.load.image('background', 'res/marsbackground.jpg');
        this.load.image('backbutton', 'res/backbutton.png');
        this.load.image('keyboard', 'res/keyboard.png');
    }
    create() {
        console.log('Controls Scene');

        this.background = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'background');
        this.background.setScale(sizes.width / 1744, sizes.height / 980);

        this.backButton = this.add.image(0.1 * sizes.width, 0.1 * sizes.height, 'backbutton').setOrigin(0.5);
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => {this.scene.start('title-scene')});

        this.controls = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'keyboard');
    }
    update() {}
}

class MarsScene extends Phaser.Scene {
    constructor() {
        super('mars-scene')
    }
    preload() {
        this.load.image(imageConstants.surface, 'res/marssurface.png');
        this.load.image(imageConstants.underground, 'res/marsunderground.png');
        this.load.image(imageConstants.uranium, 'res/marsuranium.png');
        this.load.image(imageConstants.ice, 'res/marsice.png');
        this.load.spritesheet(imageConstants.player, 'res/astronaut.png', {frameWidth: 24, frameHeight: 24})
        this.load.image(imageConstants.refill, 'res/refillstation.png');
        this.load.image(imageConstants.rover, 'res/rover.png');
        this.load.image(imageConstants.dust, 'res/dust.png');
        this.load.image(imageConstants.interact, 'res/interactbutton.png');
        this.load.image(imageConstants.restart, 'res/restartbutton.png');
    }
    create() {
        console.log('Mars Scene')

        this.cameras.main.setBackgroundColor('#e77d11');

        //create objects
        let rows = 15;
        let columns = 20;
        this.map = this.createDrillArea(rows, columns);
        this.player = this.createPlayer(24, 24, this.tileWidth, 0);
        this.playerSpeed = this.tileWidth * 3;
        this.playerSpeedScale = 1;
        this.playerResourceScale = 1;
        this.playerJumpPower = this.tileHeight * 1.8;
        this.refillStation = this.createRefillStation(32, 32, columns * this.tileWidth, 0);
        this.refill = false;
        this.rover = this.createRover(32, 32, 0, 0);
        this.leave = false;
        
        //add collisions
        this.colliders = this.addCollisions();

        //create input
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyR = this.input.keyboard.addKey('R');
        this.keyF = this.input.keyboard.addKey('F');
        this.keyUp = this.input.keyboard.addKey('Up');
        this.keyDown = this.input.keyboard.addKey('Down');
        this.keyLeft = this.input.keyboard.addKey('Left');
        this.keyRight = this.input.keyboard.addKey('Right');
        this.keySpace = this.input.keyboard.addKey('Space');

        //natural disasters
        this.lastTime = 0;
        this.disasterWarningDelay = 1000;
        this.disasterQueued = false;
        this.disasterText = this.add.text(0.5 * sizes.width, sizes.height * 0.5, 'Marsquake!', { font: 'Press Start 2P', fontSize: '24px', antialias: false}).setOrigin(0.5).setScale(5);
        this.disasterText.setVisible(false);
        this.disasterEndTime = 0;

        this.dustTime = 4000;
        this.dustBound = new Phaser.Geom.Rectangle(0, 0, sizes.width, this.tileHeight);
        this.dustEmitter = this.add.particles(0, 0, imageConstants.dust, {
            lifespan: 1500,
            speed: { min: 10, max: 50 },
            scale: { start: 0.1, end: 0.15 },
            // tint: { start: 0xB2996E, end: 0x776649 },
            tint: 0xB2996E,
            blendMode: 'ADD',
            duration: this.dustTime,
            emitting: false,
            x: { min: this.dustBound.left, max: this.dustBound.right }, 
            y: { min: this.dustBound.top, max: this.dustBound.bottom }
        });
        this.dustEmitter.setEmitZone({
            type: 'random',
            source: this.dustBound,
            quantity: 100
        });
        this.dustStormActive = false;
        this.dustOverlay = this.add.graphics();
        this.dustOverlay.fillStyle(0x776649, 0.9);
        this.dustOverlay.fillRect(0, 0, sizes.width, sizes.height);
        this.dustOverlay.visible = false;

        //create trackers
        this.gameOver = false;
        this.restartButton = this.returnButton = this.add.image(0.5 * sizes.width, 0.75 * sizes.height, imageConstants.restart)
            .setOrigin(0.5);
        this.restartButton.setInteractive();
        this.restartButton.on('pointerdown', () => {this.scene.start('title-scene')});
        this.restartButton.setVisible(false);
        this.colors = ['#8B0000', '#FFFFFF'];
        this.lastTimeDisplay = 0;
        this.energyIndex = 0;
        this.energy = 100;
        this.energyText = this.add.text(0.2 * sizes.width, sizes.height * 0.01, `Energy Level: ${this.energy}%`, { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5).setScale(1.5);
        this.oxygenIndex = 0;
        this.oxygen = 100;
        this.oxygenText = this.add.text(0.4 * sizes.width, sizes.height * 0.01, `Oxygen Level: ${this.energy}%`, { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5).setScale(1.5);
        this.uraniumText = this.add.text(0.6 * sizes.width, sizes.height * 0.01, 'Uranium Collected: 0', { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5).setScale(1.5);
        this.uranium = 0;
        this.iceText = this.add.text(0.8 * sizes.width, sizes.height * 0.01, 'Ice Collected: 0', { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5).setScale(1.5);
        this.ice = 0;

        //overlays and stuff
        this.returnButton = this.add.image(0.5 * this.tileWidth, 0.5 * this.tileHeight, imageConstants.interact)
            .setOrigin(0.5)
        this.returnButton.setVisible(false);
        this.refillButton = this.add.image(0.5 * this.tileWidth + this.tileWidth * (this.map[0].length - 1), 0.5 * this.tileHeight, imageConstants.interact)
            .setOrigin(0.5)
        this.refillButton.setVisible(false);
        // this.winOverlay = this.add.graphics();
        // this.winOverlay.fillStyle(0x90EE90, 1);
        // this.winOverlay.fillRect(0.1 * sizes.width, 0.1 * sizes.height, 0.8 * sizes.width, 0.8 *sizes.height);
        // this.winOverlay.visible = false;

        //delay before disasters
        this.disastersReady = false;
        this.time.delayedCall(5000, function() { //5 seconds
            this.disastersReady = true;
        }, [], this);
    }
    update(time, delta) {
        if(this.gameOver) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.disasterText.text = 'Game Over!';
            this.disasterText.setVisible(true);
            this.restartButton.setVisible(true);
            return;
        }

        if(this.queueDisasters(time, delta)) return;

        this.updateInput(time, delta);

        this.randomizeEvents(time, delta);

        if(this.energy <= 0 || this.oxygen <= 0) this.gameOver = true;
        this.updateDisplay(time, delta);
    }

    updateInput(time, delta) {
        this.physics.world.collide(this.player, this.refillStation, () => {
            this.refill = true;
        });
        this.physics.world.collide(this.player, this.rover, () => {
            this.leave = true;
        });

        if((Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.keySpace)) && this.player.body.velocity.y == 0) {
            this.player.setVelocityY(-this.playerJumpPower);
            this.energy -= resourceConstants.moving;
        }
        else if(this.keyA.isDown) {
            this.player.anims.play('moving', true);
            this.player.setVelocityX(-this.playerSpeed * this.playerSpeedScale);
            this.depleteResources(resourceConstants.moving * this.playerResourceScale);
        }
        else if(this.keyD.isDown) {
            this.player.anims.play('moving', true);
            this.player.setVelocityX(this.playerSpeed * this.playerSpeedScale);
            this.depleteResources(resourceConstants.moving * this.playerResourceScale);
        }
        else {
            this.player.anims.play('idle', true);
            this.player.setVelocityX(0);
            this.player.x = Math.floor((this.player.x) / this.tileWidth) * this.tileWidth + this.tileWidth / 2;

            this.depleteResources(resourceConstants.idle * this.playerResourceScale);
        }

        if(Phaser.Input.Keyboard.JustDown(this.keyUp)) {
            this.mineBlock(0, -this.tileHeight);
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyDown)) {
            this.mineBlock(0, this.tileHeight);
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
            this.mineBlock(-this.tileWidth, 0);
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyRight)) {
            this.mineBlock(this.tileWidth, 0);
        }
        else if(this.refill && Phaser.Input.Keyboard.JustDown(this.keyF)) {
            this.oxygen = 100;
        }
        else if(this.leave && Phaser.Input.Keyboard.JustDown(this.keyF)) {
            this.scene.start('win-scene', {uranium: this.uranium, ice: this.ice});
        }
        // else if(Phaser.Input.Keyboard.JustDown(this.keyS)) {
        //     this.energy = 11;
        //     this.oxygen = 15;
        // }

        if(this.refill) {
            this.refill = false;
            this.refillButton.setVisible(true);
        }
        else this.refillButton.setVisible(false);
        if(this.leave) {
            console.log('leave');
            this.leave = false;
            this.returnButton.setVisible(true);
        }
        else this.returnButton.setVisible(false); 

    }

    queueDisasters(time, delta) {
        if(this.disasterQueued) {
            if(this.disasterText.text == disasterConstants.marsquake) {
                if(this.player.body.velocity.y != 0) return true;
                this.player.anims.play('idle', true);
                this.player.setVelocityX(0);
                this.player.x = Math.floor((this.player.x) / this.tileWidth) * this.tileWidth + this.tileWidth / 2;
                if(time >= this.disasterEndTime) this.marsquake();
            }
            else if(this.disasterText.text == disasterConstants.dustStorm) this.dustStorm();            
        }
    }

    randomizeEvents(time, delta) {
        if(!this.disastersReady) return;
        if(time - this.lastTime >= 3000 && !this.disasterQueued) { //3000 ms
            this.lastTime = time;

            let chance = Math.random();
            if (chance < 1 * disasterConstants.disasterChance || Phaser.Input.Keyboard.JustDown(this.keyF)) {
                this.disasterQueued = true;
                this.disasterText.text = disasterConstants.marsquake;
                this.disasterText.setVisible(true);
                this.disasterEndTime = this.time.now + this.disasterWarningDelay;
            }
            else if (chance < 2 * disasterConstants.disasterChance || Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.disasterQueued = true;
                this.disasterText.text = disasterConstants.dustStorm;
                this.disasterText.setVisible(true);
                this.disasterEndTime = this.time.now + this.disasterWarningDelay;
            }
        }
    }

    updateDisplay(time, delta) {
        this.energyText.text = `Energy Level: ${Math.round((this.energy + Number.EPSILON) * 10) / 10}%`;
        this.oxygenText.text = `Oxygen Level: ${Math.round((this.oxygen + Number.EPSILON) * 10) / 10}%`;
        if(time - this.lastTimeDisplay >= 1000) {
            this.lastTimeDisplay = time;
            if(this.energy <= 10) {
                this.energyText.setStyle({ fill: this.colors[this.energyIndex] });
                this.energyIndex = (this.energyIndex + 1) % this.colors.length;
            }
            else this.energyText.setStyle({ fill: this.colors[1] });
            if(this.oxygen <= 10) {
                this.oxygenText.setStyle({ fill: this.colors[this.oxygenIndex] });
                this.oxygenIndex = (this.oxygenIndex + 1) % this.colors.length;
            }
            else this.oxygenText.setStyle({ fill: this.colors[1] });
        }
    }

    depleteResources(amount) {
        this.energy -= amount;
        this.oxygen -= amount * 1.5;
    }

    createDrillArea(rows, columns) {
        let map = new Array(rows);
        this.tileHeight = sizes.height / (rows + 1);
        this.tileWidth = sizes.width / columns;
        let currentTile = imageConstants.surface;
        let heightScale = this.tileHeight / imageConstants.tileHeight;
        let widthScale = this.tileWidth / imageConstants.tileWidth;
        for(let r = 0; r < rows; r++) {
            map[r] = new Array(columns);
            let rand;
            for(let c = 0; c < columns; c++) {
                if(r > 0) {
                    let rand = Math.floor(Math.random() * (101 - 2 * r));
                    currentTile = imageConstants.underground;
                    if(c > 0 && c < columns - 1) {
                        if(rand <= r / 2) currentTile = imageConstants.uranium;
                        else if(rand <= r) currentTile = imageConstants.ice;
                    }
                }

                map[r][c] = new Array(3);
                map[r][c][0] = this.physics.add.sprite(c * this.tileWidth + (0.5 * this.tileWidth), this.tileHeight + (r * this.tileHeight) + (0.5 * this.tileHeight), currentTile)
                    .setScale(widthScale, heightScale).setActive(true);
                map[r][c][0].body.immovable = true;
                map[r][c][0].body.moves = false;
                map[r][c][2] = currentTile;
            }
        }
        return map;
    }
        
    createPlayer(width, height, x, y) {
        var widthScale = (this.tileWidth - 2) / width;
        var heightScale = (this.tileHeight - 2) / height;
        var player = this.physics.add.sprite(x, y, imageConstants.player).setScale(widthScale, heightScale);
        player.setActive(true);
        player.setGravityY(this.tileHeight * 1.5);
        player.setCollideWorldBounds(true);
        this.playerRow = -1;
        this.playerColumn = 0;

        player.anims.create({
            key: 'moving',
            frames: this.anims.generateFrameNumbers(imageConstants.player, {frames: [0, 1, 2, 3]}),
            frameRate: 8,
            repeat: -1
        });
        player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers(imageConstants.player, {frames: [1]}),
            frameRate: 8,
            repeat: -1
        });

        return player;
    }

    createRefillStation(width, height, x, y) {
        var widthScale = (this.tileWidth - 2) / width;
        var heightScale = (this.tileHeight) / height;
        let station = this.physics.add.sprite(x, y, imageConstants.refill).setScale(widthScale, heightScale).setOrigin(1, 0);
        // station.setCollideWorldBounds(true);
        // station.setGravityY(this.tileHeight * 1.5);
        // this.physics.add.collider(station, this.player);
        station.body.immovable = true;
        station.body.moves = false;
        this.physics.add.collider(station, this.player, function() {
            this.refill = true;
        }, null, this);
        return station;
    }

    createRover(width, height, x, y) {
        var widthScale = (this.tileWidth - 2) / width;
        var heightScale = (this.tileHeight) / height;
        let rover = this.physics.add.sprite(x, y, imageConstants.rover).setScale(widthScale, heightScale).setOrigin(0);
        // rover.setCollideWorldBounds(true);
        // rover.setGravityY(this.tileHeight * 1.5);
        // this.physics.add.collider(rover, this.player);
        rover.body.immovable = true;
        rover.body.moves = false;
        this.physics.add.collider(rover, this.player, function() {
            this.leave = true;
        }, null, this);
        return rover;
    }

    addCollisions() {
        let colliders = [];
        for(let r = 0; r < this.map.length; r++) {
            for(let c = 0; c < this.map[r].length; c++) {
                this.map[r][c][1] = this.physics.add.collider(this.map[r][c][0], this.player);
            }
        }
        return colliders;
    }

    mineBlock(xOffset, yOffset) {
        let row = Math.floor((this.player.y + yOffset) / this.tileHeight - 1);
        let column = Math.floor((this.player.x + xOffset) / this.tileWidth);
        if(row < 0 || column < 0) return;
        if(column == 0 || column == this.map[row].length - 1) return;
        if(this.map[row][column][1].active == false) return;
        this.depleteResources(resourceConstants.mining * this.playerResourceScale);
        this.map[row][column][0].setVisible(false);
        this.map[row][column][1].active = false;
        if(this.map[row][column][2] == imageConstants.uranium) {
            this.uranium++;
            this.uraniumText.text = 'Uranium Collected: ' + `${this.uranium}`;
        }
        else if(this.map[row][column][2] == imageConstants.ice) {
            this.ice++;
            this.iceText.text = 'Ice Collected: ' + `${this.ice}`;
        }
    }

    marsquake() {
        this.cameras.main.shake(500, {x: 0.05, y: 0.02});
        let row = Math.floor((this.player.y) / this.tileHeight - 1);
        let column = Math.floor((this.player.x) / this.tileWidth);
        for(let r = 0; r < this.map.length; r++) {
            for(let c = 0; c < this.map[r].length; c++) {
                if(r == row && c == column) continue;
                if(this.map[r][c][1].active) continue;
                this.map[r][c][0].setVisible(true);
                this.map[r][c][1].active = true;
                if(this.map[r][c][2] == imageConstants.uranium || this.map[r][c][2] == imageConstants.ice) 
                    this.map[r][c][0].setTexture(imageConstants.underground);
            }
        }
        this.disasterQueued = false;
        this.disasterText.setVisible(false);
    }

    dustStorm() {
        if(!this.dustStormActive) {
            this.dustEmitter.start(this.dustTime)
            this.dustOverlay.visible = true;
            this.time.delayedCall(this.dustTime, function() {
                this.dustOverlay.visible = false;
                this.dustStormActive = false;
                this.disasterQueued = false;
                this.disasterText.setVisible(false);
                this.playerResourceScale = 1;
                this.playerSpeedScale = 1;
            }, [], this);
            this.dustStormActive = true;
        }
        let row = Math.floor((this.player.y) / this.tileHeight + 1);
        console.log(row);
        this.dustOverlay.alpha = 1 - row * 0.1;
        let toAdd = 1 - 0.8 * row;
        if(toAdd < 0) toAdd = 0;
        this.playerResourceScale = 1 + toAdd;
        this.playerSpeedScale = 0.15 * row;
        if(this.playerSpeedScale > 1) this.playerSpeedScale = 1;
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super('win-scene');
    }

    init(data) {
        this.uranium = data.uranium;
        this.ice = data.ice;
        console.log(this.uranium);
    }

    preload() {
        this.load.image('background', 'res/marsbackground.jpg');
        this.load.image(imageConstants.restart, 'res/restartbutton.png');
        this.load.image(imageConstants.uranium, 'res/marsuranium.png');
        this.load.image(imageConstants.ice, 'res/marsice.png');
    }

    create() {
        this.background = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'background');
        this.restartButton = this.returnButton = this.add.image(0.5 * sizes.width, 0.75 * sizes.height, imageConstants.restart)
            .setOrigin(0.5);
        this.restartButton.setInteractive();
        this.restartButton.on('pointerdown', () => {this.scene.start('title-scene')});

        this.uraniumImage = this.add.image(0.33 * sizes.width, 0.2 * sizes.height, imageConstants.uranium).setScale(0.18 * sizes.height / imageConstants.tileHeight);
        this.iceImage = this.add.image(0.33 * sizes.width, 0.4 * sizes.height, imageConstants.ice).setScale(0.18 * sizes.height / imageConstants.tileHeight);

        this.uraniumText = this.add.text(0.5 * sizes.width,  0.2 * sizes.height, `${this.uranium} x 100 = ${this.uranium * 100}`, { font: 'Press Start 2P', fontSize: '24px', antialias: false}).setScale(4).setOrigin(0.5);
        this.iceText = this.add.text(0.5 * sizes.width,  0.4 * sizes.height, `${this.ice} x 50 = ${this.ice * 50}`, { font: 'Press Start 2P', fontSize: '24px', antialias: false}).setScale(4).setOrigin(0.5);
        this.scoreText = this.add.text(0.5 * sizes.width, 0.6 * sizes.height, `Score: ${this.uranium * 100 + this.ice * 50}`, { font: 'Press Start 2P', fontSize: '24px', antialias: false}).setScale(4).setOrigin(0.5);
    }

    update() {}
}

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: {y:physicalConstants.earthGravity},
            debug:false
        }
    },
    scene: [TitleScene, ControlsScene, MarsScene, WinScene]
}

const game = new Phaser.Game(config)