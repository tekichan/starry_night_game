import Phaser from 'phaser';

import image_night_bg from '../images/starry_night.png';
import image_gameover_button from '../images/game_over.png';
import audio_moonlight_p3 from '../audio/moonlight_part3.mp3';

const gameOptions = {
    // horizontal Moon speed
    moonSpeed: 125,
}

/**
 * The game over class of this game's scene
 */
export default class StarryNightGameOverScene extends Phaser.Scene{
    // Phaser.Scene object onstructor
    constructor(){
        super('GameOver');
    }
    // Default: Before the game is loaded
    preload(){
        this.load.image('night_bg', image_night_bg);
        this.load.image('gameover_button', image_gameover_button);
        this.load.audio('moonlight_p3', audio_moonlight_p3);
    }
    // Default: When the game is created
    create(){
        this.nightBg = this.add.tileSprite(this.game.config.width / 2,this.game.config.height / 2,0,0, 'night_bg');
        this.nightBg.setScale(this.cameras.main.height/this.nightBg.height).setScrollFactor(0);
        
        this.gameOverButton = this.add.tileSprite(this.game.config.width / 2, 250, 0, 0, 'gameover_button').setInteractive();
        this.gameOverButton.setScale(this.cameras.main.width/this.gameOverButton.width * 0.5).setScrollFactor(0);         
        this.input.on('pointerdown', this.resetGame, this);

        this.moonlight_p3 = this.sound.add('moonlight_p3', { volume: 0.5, loop: true });
        this.moonlight_p3.play();
    }
    // Default: Update the game
    update(){
        this.nightBg.tilePositionX -= -gameOptions.moonSpeed/200;        
    }
    // Start the game
    resetGame() {
        this.scene.start('StartGame');
        this.moonlight_p3.stop();
    }
}