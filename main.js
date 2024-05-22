// import './style.css'
// import Phaser from 'phaser'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const physicalConstants = {
    earthGravity: 9.81,
    marsGravity: 3.71,
    marsFriction: 0.1
}

const imageConstants = {
    tileWidth: 32,
    tileHeight: 32
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
        this.load.image('mars-surface', 'res/marssurface.png');
        this.load.image('mars-underground', 'res/marsunderground.png');
        this.load.spritesheet('astronaut', 'res/astronaut.png', {frameWidth: 24, frameHeight: 24})
    }
    create() {
        console.log('Mars Scene')

        this.cameras.main.setBackgroundColor('#e77d11');

        //create objects
        this.map = this.createDrillArea(15, 20);
        this.player = this.createPlayer(24, 24);

        //create input
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');

        //create trackers
        this.monthText = this.add.text(0.01 * sizes.width, sizes.height * 0.01, 'Months Elapsed: 0', { font: '"Press Start 2P"' });
        this.months = 0;
    }
    update(time, delta) {
        if(Phaser.Input.Keyboard.JustDown(this.keyW)) {
            
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyA) && this.player.x - this.tileWidth >= 0) {
            this.player.x -= this.tileWidth
            this.playerColumn--;
            this.updateTime();
            this.mineBlock();
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyS) && this.player.y + this.tileHeight < sizes.height) {
            this.player.y += this.tileHeight;
            this.playerRow++;
            this.updateTime();
            this.mineBlock();
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyD) && this.player.x + this.tileWidth < sizes.width) {
            this.player.x += this.tileWidth;
            this.playerColumn++;
            this.updateTime();
            this.mineBlock();
        }
    }

    createDrillArea(rows, columns) {
        let map = new Array(rows);
        this.tileHeight = sizes.height / (rows + 1);
        this.tileWidth = sizes.width / columns;
        let currentTile = 'mars-surface';
        let heightScale = this.tileHeight / imageConstants.tileHeight;
        let widthScale = this.tileWidth / imageConstants.tileWidth;
        for(let r = 0; r < rows; r++) {
            map[r] = new Array(columns);
            if(r > 0) currentTile = 'mars-underground' 
            for(let c = 0; c < columns; c++) {
                map[r][c] = new Array(2);
                map[r][c][0] = this.add.image(c * this.tileWidth + (0.5 * this.tileWidth), this.tileHeight + (r * this.tileHeight) + (0.5 * this.tileHeight), currentTile)
                    .setScale(widthScale, heightScale);
                map[r][c][1] = true;
            }
        }
        return map;
    }
        
    createPlayer(width, height) {
        var widthScale = this.tileWidth / width;
        var heightScale = this.tileHeight / height;
        var player = this.physics.add.sprite(0.5 * width * widthScale, 0.5 * height * heightScale, 'astronaut').setScale(widthScale, heightScale);
        this.playerRow = -1;
        this.playerColumn = 0;
        return player;
    }

    updateTime() {
        if(this.playerRow > 0) this.months += 3;
        this.monthText.text = 'Months Elapsed: ' + `${this.months}`;
    }

    mineBlock() {
        this.map[this.playerRow][this.playerColumn][0].setVisible(false);
        this.map[this.playerRow][this.playerColumn][1] = false;

        let blocksAbove = 0;
        for(let r = 0; r < this.playerRow; r++) {
            if(this.map[r][this.playerColumn][1] === true) blocksAbove++;
        }
        if(blocksAbove >= 2) console.log('game over');
        console.log(blocksAbove);
    }
}

class EarthScene extends Phaser.Scene {
    constructor() {
        super('earth-scene');
    }
    preload() {}
    create() {}
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
            debug:true
        }
    },
    scene: [TitleScene, TeamScene, InfoScene, MarsScene]
}

const game = new Phaser.Game(config)