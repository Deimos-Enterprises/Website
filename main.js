// import './style.css'
// import Phaser from 'phaser'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const physicalConstants = {
    earthGravity: 9.81,
    marsGravity: 3.71 * 15,
    marsFriction: 0.1
}

const imageConstants = {
    tileWidth: 32,
    tileHeight: 32,
    surface: 'mars-surface',
    underground: 'mars-underground',
    uranium: 'mars-uranium',
    ice: 'mars-ice',
    player: 'astronaut',
    refill: 'refill-station'
}

const resourceConstants = {
    idle: 0.001,
    moving: 0.02,
    mining: 0.06
}


class TitleScene extends Phaser.Scene {
    constructor() {
        super('title-scene')
    }
    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.image('logo', 'res/logo.png');
        this.load.image('teambutton', 'res/teambutton.png');
        this.load.image('infobutton', 'res/infobutton.png');


    }
    create() {
        console.log('Title Scene');
        this.logo = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'logo');
        this.logo.setInteractive();
        this.logo.on('pointerdown', () => {this.scene.start('mars-scene')});

        this.teamButton = this.add.image(0.2 * sizes.width, 0.25 * sizes.height, 'teambutton');
        this.teamButton.setInteractive();
        this.teamButton.on('pointerdown', () => {this.scene.start('team-scene')});
        this.infoButton = this.add.image(0.8 * sizes.width, 0.75 * sizes.height, 'infobutton');
        this.infoButton.setInteractive();
        this.infoButton.on('pointerdown', () => {this.scene.start('info-scene')});
    }

    update() {

    }
}

class TeamScene extends Phaser.Scene {
    constructor() {
        super('team-scene')
    }
    preload() {
        this.load.image('team-background', 'res/teambutton.png');
    }
    create() {
        console.log('Team Scene');
        this.background = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'team-background');
    }
    update() {}
}

class InfoScene extends Phaser.Scene {
    constructor() {
        super('info-scene')
    }
    preload() {
        this.load.image('info-background', 'res/infobutton.png');
    }
    create() {
        console.log('Info Scene');
        this.background = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'info-background');
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
        this.playerJumpPower = this.tileHeight * 1.8;
        this.refillStation = this.createRefillStation(32, 32, columns * this.tileWidth, 0);
        this.refill = false;
        
        //add collisions
        // this.objects = this.physics.add.group();
        // this.objects.add(this.player);
        // this.objects.add(this.refillStation);
        this.colliders = this.addCollisions();

        //create input
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyR = this.input.keyboard.addKey('R');
        this.keyUp = this.input.keyboard.addKey('Up');
        this.keyDown = this.input.keyboard.addKey('Down');
        this.keyLeft = this.input.keyboard.addKey('Left');
        this.keyRight = this.input.keyboard.addKey('Right');

        //create trackers
        this.gameOver = false;
        this.energy = 100;
        this.energyText = this.add.text(0.125 * sizes.width, sizes.height * 0.01, `Energy Level: ${this.energy}%`, { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5);
        this.monthText = this.add.text(0.25 * sizes.width, sizes.height * 0.01, 'Days Elapsed: 0', { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5);
        this.months = 0;
        this.uraniumText = this.add.text(0.75 * sizes.width, sizes.height * 0.01, 'Uranium Collected: 0', { font: 'Press Start 2P', fontSize: '24px'}).setOrigin(0.5);
        this.uranium = 0;

        this.lastTime = 0;
        this.marsquakeQueued = false;
        this.marsquakeText = this.add.text(0.5 * sizes.width, sizes.height * 0.5, 'Marsquake!', { font: 'Press Start 2P', fontSize: '24px', antialias: false}).setOrigin(0.5).setScale(5);
        this.marsquakeText.setVisible(false);
        this.marsquakeEndTime = 0;
    }
    update(time, delta) {
        if(this.gameOver) return;

        if(this.marsquakeQueued) {
            this.player.anims.play('idle', true);
            this.player.setVelocityX(0);
            this.player.x = Math.floor((this.player.x) / this.tileWidth) * this.tileWidth + this.tileWidth / 2;
            if(this.player.body.velocity.y != 0) return;
            if(time >= this.marsquakeEndTime) this.marsquake();
        }

        if(Phaser.Input.Keyboard.JustDown(this.keyW) && this.player.body.velocity.y == 0) {
            this.player.setVelocityY(-this.playerJumpPower);
            this.energy -= resourceConstants.moving;
        }
        //for testing purposes
        else if(Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.marsquake();
        }
        else if(this.keyA.isDown) {
            this.player.anims.play('moving', true);
            this.player.setVelocityX(-this.playerSpeed);
            this.energy -= resourceConstants.moving;
        }
        else if(this.keyD.isDown) {
            this.player.anims.play('moving', true);
            this.player.setVelocityX(this.playerSpeed);
            this.energy -= resourceConstants.moving;
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyUp)) {
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
        else {
            this.player.anims.play('idle', true);
            this.player.setVelocityX(0);
            this.player.x = Math.floor((this.player.x) / this.tileWidth) * this.tileWidth + this.tileWidth / 2;

            this.energy -= resourceConstants.idle;
        }

        if(time - this.lastTime >= 1000 && !this.marsquakeQueued) { //1000 ms
            this.lastTime = time;

            let chance = Math.random();
            if (chance < 0.1) {//1% chance
                this.marsquakeQueued = true;
                this.marsquakeText.setVisible(true);
                this.marsquakeEndTime = this.time.now + 1000;
            }
        }

        //display
        if(this.energy <= 0) this.gameOver = true;
        this.energyText.text = `Energy Level: ${Math.round((this.energy + Number.EPSILON) * 10) / 10}%`;
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
                    let rand = Math.floor(Math.random() * (101 - r));
                    currentTile = imageConstants.underground;
                    if(rand <= r / 2) currentTile = imageConstants.uranium;
                    else if(rand <= r) currentTile = imageConstants.ice;
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
        var widthScale = this.tileWidth / width;
        var heightScale = this.tileHeight / height;
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
        var widthScale = this.tileWidth / width;
        var heightScale = this.tileHeight / height;
        let station = this.physics.add.sprite(x, y, imageConstants.refill).setScale(widthScale, heightScale).setOrigin(1, 0);
        // station.setCollideWorldBounds(true);
        // station.setGravityY(this.tileHeight * 1.5);
        // this.physics.add.collider(station, this.player);
        station.body.immovable = true;
        station.body.moves = false;
        this.physics.add.collider(station, this.player, function() {
            this.refill = true
            console.log('col');
        });
        return station;
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
        this.energy -= resourceConstants.mining;
        this.map[row][column][0].setVisible(false);
        this.map[row][column][1].active = false;
        if(this.map[row][column][2] == imageConstants.uranium) {
            this.uranium++;
            this.uraniumText.text = 'Uranium Collected: ' + `${this.uranium}`;
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
                if(this.map[r][c][2] == imageConstants.uranium) this.map[r][c][0].setTexture(imageConstants.underground);
            }
        }
        this.marsquakeQueued = false;
        this.marsquakeText.setVisible(false);
    }
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
            debug:true
        }
    },
    scene: [TitleScene, TeamScene, InfoScene, MarsScene]
}

const game = new Phaser.Game(config)