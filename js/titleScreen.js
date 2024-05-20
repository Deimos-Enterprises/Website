class TitleScreen extends Phaser.Scene {
    constructor() {
        super('TitleScreen');
    }
    preload() {
        this.load.image('mars', 'images/mars.png');
    }
    
    create() {
        this.gameWidth = 640;
        this.gameHeight = 416;
        this.cameras.main.setBackgroundColor('#281c3c');

        this.mars = this.add.image(0.5 * this.gameWidth, 0.5* this.gameHeight, 'mars');
    }

    update() {

    }
}