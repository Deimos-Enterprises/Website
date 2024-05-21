// import './style.css'
// import Phaser from 'phaser'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const physicalConstants = {
    earthGravity: 300
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
    }
    create() {
        console.log('Mars Scene')
        this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'mars-background');
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
            gravity: {y:physicalConstants.earthGravity},
            debug:true
        }
    },
    scene: [TitleScene, TeamScene, InfoScene, MarsScene]
}

const game = new Phaser.Game(config)