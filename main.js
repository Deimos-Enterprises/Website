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
        this.load.image('mars-background', 'res/marsbackground.jpg');
        this.load.spritesheet('martian', 'res/martian.png', {frameWidth: 122, frameHeight: 158})
    }
    create() {
        console.log('Mars Scene')
        this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'mars-background');
        this.martian = this.createInteractable('martian', 122, 158, 1);
    }
    update() {}

    createInteractable(name, width, height, scale) {
        var temp = this.physics.add.sprite(width, height, name).setScale(scale, scale);
        temp.setActive(true);
        temp.velocityScaleX = 1;
        temp.velocityScaleYs = 1;

        // Mars physics
        temp.setBounce(0);
        temp.setFriction(0);
        temp.setGravityY(physicalConstants.marsGravity);
        temp.setCollideWorldBounds(true);

        temp.setInteractive();

        this.input.setDraggable(temp);

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.body.moves = false;
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', function (pointer, gameObject) {
            gameObject.body.moves = true;
        });

        return temp;
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