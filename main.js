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
    uranium: 'mars-uranium'
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
        this.load.spritesheet('astronaut', 'res/astronaut.png', {frameWidth: 24, frameHeight: 24})
    }
    create() {
        console.log('Mars Scene')

        this.cameras.main.setBackgroundColor('#e77d11');

        //create objects
        this.map = this.createDrillArea(15, 20);
        this.player = this.createPlayer(24, 24);
        this.playerSpeed = this.tileWidth * 3;
        
        //add collisions
        this.colliders = this.addCollisions();

        //create input
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyUp = this.input.keyboard.addKey('Up');
        this.keyDown = this.input.keyboard.addKey('Down');
        this.keyLeft = this.input.keyboard.addKey('Left');
        this.keyRight = this.input.keyboard.addKey('Right');

        //create trackers
        this.gameOver = false;
        this.energy = 100;
        this.energyText = this.add.text(0.125 * sizes.width, sizes.height * 0.01, `Energy Level: ${this.energy}%`, { font: '"Press Start 2P"' }).setOrigin(0.5);
        this.monthText = this.add.text(0.25 * sizes.width, sizes.height * 0.01, 'Days Elapsed: 0', { font: '"Press Start 2P"' }).setOrigin(0.5);
        this.months = 0;
        this.uraniumText = this.add.text(0.75 * sizes.width, sizes.height * 0.01, 'Uranium Collected: 0', { font: '"Press Start 2P"' }).setOrigin(0.5);
        this.uranium = 0;
    }
    update(time, delta) {
        if(this.gameOver) return;

        if(Phaser.Input.Keyboard.JustDown(this.keyW) && this.player.body.velocity.y == 0) {
            this.player.setVelocityY(-65);
            this.energy -= resourceConstants.moving;
        }
        else if(this.keyA.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
            this.energy -= resourceConstants.moving;
            this.updateTime();
        }
        else if(this.keyD.isDown) {
            this.player.setVelocityX(this.playerSpeed);
            this.energy -= resourceConstants.moving;
            this.updateTime();
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
            this.player.setVelocityX(0);
            this.player.x = Math.floor((this.player.x) / this.tileWidth) * this.tileWidth + this.tileWidth / 2;

            this.energy -= resourceConstants.idle;
        }

        //display
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
                    if(rand == 0) currentTile = imageConstants.uranium;
                }

                map[r][c] = new Array(3);
                map[r][c][0] = this.physics.add.sprite(c * this.tileWidth + (0.5 * this.tileWidth), this.tileHeight + (r * this.tileHeight) + (0.5 * this.tileHeight), currentTile)
                    .setScale(widthScale, heightScale).setActive(true);
                map[r][c][0].body.immovable = true;
                map[r][c][0].body.moves = false;
                // map[r][c][1] = true;
                map[r][c][2] = currentTile;
            }
        }
        return map;
    }
        
    createPlayer(width, height) {
        var widthScale = this.tileWidth / width;
        var heightScale = this.tileHeight / height;
        var player = this.physics.add.sprite(0, 0, 'astronaut').setScale(widthScale, heightScale);
        player.setActive(true);
        player.setGravityY(physicalConstants.marsGravity);
        player.setCollideWorldBounds(true);
        this.playerRow = -1;
        this.playerColumn = 0;
        return player;
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

    updateTime() {
        // if(this.playerRow >= 0 && this.map[this.playerRow][this.playerColumn][1] === true) this.months += 3;
        // this.monthText.text = 'Days Elapsed: ' + `${this.months}`;
    }

    mineBlock(xOffset, yOffset) {
        let row = Math.floor((this.player.y + yOffset) / this.tileHeight - 1);
        let column = Math.floor((this.player.x + xOffset) / this.tileWidth);
        if(row < 0 || column < 0) return;
        this.energy -= resourceConstants.mining;
        this.map[row][column][0].setVisible(false);
        this.map[row][column][1].active = false;
        if(this.map[row][column][2] == imageConstants.uranium) {
            this.uranium++;
            this.uraniumText.text = 'Uranium Collected: ' + `${this.uranium}`;
        }

        // let blocksAbove = 0;
        // for(let r = 0; r < this.playerRow; r++) {
        //     if(this.map[r][this.playerColumn][1] === true) blocksAbove++;
        // }
        // if(blocksAbove >= 3) {
        //     this.gameOver = true;
        //     this.add.text(0.5 * sizes.width, sizes.height * 0.5, 'Game Over: The Ground Above You Collapsed!', { font: '"Press Start 2P"' }).setOrigin(0.5).setScale(3, 3);
        // }
        // console.log(blocksAbove);
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