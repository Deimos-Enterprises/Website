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

const scalingConstants = {
    gravityScale: 50
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
        this.load.image('earth-background', 'res/earthbackground.jpg');
        this.load.spritesheet('martian', 'res/martian.png', {frameWidth: 122, frameHeight: 158})
    }
    create() {
        console.log('Mars Scene')
        this.earthBackground = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'earth-background');
        this.earthBackground.setScale(sizes.width / 313, sizes.height / 200);
        this.marsBackground = this.add.image(0.5 * sizes.width, 0.5 * sizes.height, 'mars-background');
        this.martian = this.createInteractable('martian', 122, 158, 1, [0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

        this.isEarth = false;
        this.keyE = this.input.keyboard.addKey('E');

        this.timerText = this.add.text(sizes.width * 0.5, sizes.height * 0.5, 'Time Falling: 0:0', { font: '"Press Start 2P"' });
        this.lastTime = 0;
    }
    update(time, delta) {
        if(Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.isEarth = !this.isEarth;
        }

        if(this.isEarth) {
            this.earthBackground.setVisible(false);
            this.marsBackground.setVisible(true);
            this.martian.setGravityY(physicalConstants.marsGravity * scalingConstants.gravityScale);

        } else {
            this.marsBackground.setVisible(false);
            this.earthBackground.setVisible(true);
            this.martian.setGravityY(physicalConstants.earthGravity * scalingConstants.gravityScale);
        }

        if(this.martian.body.velocity.y == 0) {
            this.timerText.text = 'Time Falling: 0:0';
            this.lastTime = time * 0.001;
        }else {
            this.timerText.text = 'Time Falling: ' + this.formatTime(time * 0.001 - this.lastTime);
        }
    }

    formatTime(seconds){
        // Minutes
        // seconds = this.time.totalElapsedSeconds();
        var minutes = Math.floor(seconds/60);
        // Seconds
        var partInSeconds = seconds%60;
        // Adds left zeros to seconds
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        // partInSeconds = Math.round((partInSeconds + Number.EPSILON) * 100) / 100
        // Returns formated time
        return `${minutes}:${partInSeconds}`;
    }
    

    switchPlanets() {
        if(this.isEarth) {
            console.log('switch to earth');
            this.background.setTexture('earth-background');
        } else {
            console.log('switch to mars');
            this.background.setTexture('mars-background');
        }
    }

    createInteractable(name, width, height, scale, moving, idle) {
        var temp = this.physics.add.sprite(width, height, name).setScale(scale, scale);
        temp.setActive(true);
        temp.velocityScaleX = 1;
        temp.velocityScaleYs = 1;

        //animations
        this.anims.create({
            key: name + '-moving',
            frames: this.anims.generateFrameNumbers(name, {frames: moving}),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: name + '-idle',
            frames: this.anims.generateFrameNumbers(name, {frames: idle}),
            frameRate: 8,
            repeat: -1
        });

        // Mars physics
        temp.setBounce(0);
        temp.setFriction(0);
        temp.setGravityY(physicalConstants.earthGravity * scalingConstants.gravityScale);
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