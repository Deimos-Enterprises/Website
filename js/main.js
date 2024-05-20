window.onload = function(){
    var config = {
        type: Phaser.AUTO,
        scale: {
            parent: 'phaser-game',
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 640,//window.innerWidth * window.devicePixelRatio,
            height: 416,//window.innerHeight * window.devicePixelRatio,
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 10}
            }
        },
        scene: [TitleScreen]
    };
    var game = new Phaser.Game(config);
}