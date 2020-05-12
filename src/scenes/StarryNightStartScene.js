import Phaser from 'phaser';

import image_night_bg from '../images/starry_night.png';
import image_starry_night_title from '../images/starry_night_title.png';
import image_start_button from '../images/start_button.png';
import image_camera_button from '../images/camera_button.png';
import audio_moonlight_p1 from '../audio/moonlight_part1.mp3';

const gameOptions = {
    // horizontal Moon speed
    moonSpeed: 125,
}

/**
 * The starting class of this game's scene
 */
export default class StarryNightStartScene extends Phaser.Scene{
    // Phaser.Scene object onstructor
    constructor(){
        super('StartGame');
    }
    // Default: Before the game is loaded
    preload(){
        this.load.image('night_bg', image_night_bg);
        this.load.image('starry_night_title', image_starry_night_title);
        this.load.image('start_button', image_start_button);
        this.load.image('camera_button', image_camera_button);
        this.load.audio('moonlight_p1', audio_moonlight_p1);
    }
    // Default: When the game is created
    create(){
        this.nightBg = this.add.tileSprite(this.game.config.width / 2,this.game.config.height / 2,0,0, 'night_bg');
        this.nightBg.setScale(this.cameras.main.height/this.nightBg.height).setScrollFactor(0);

        this.gameTitle = this.add.tileSprite(this.game.config.width / 2, 150, 0, 0, 'starry_night_title');
        this.gameTitle.setScale(this.cameras.main.width/this.gameTitle.width).setScrollFactor(0); 
        
        let startButtonX = this.game.config.width * 0.3;

        this.startButton = this.add.tileSprite(startButtonX, 250, 0, 0, 'start_button').setInteractive();
        this.startButton.setScale(this.cameras.main.width/this.startButton.width * 0.25).setScrollFactor(0);         
        this.startButton.on('pointerdown', this.startGame, this);

        this.startLabel = this.add.text(startButtonX, 300, 'Start Game', {color: '#FDFD96'});
        this.startLabel.setPosition(this.startLabel.x - this.startLabel.width / 2, this.startLabel.y);

        let cameraButtonX = this.game.config.width * 0.7;

        this.cameraButton = this.add.tileSprite(cameraButtonX, 250, 0, 0, 'camera_button').setInteractive();
        this.cameraButton.setScale(this.cameras.main.width/this.cameraButton.width * 0.25).setScrollFactor(0);         
        this.cameraButton.on('pointerdown', this.cameraGame, this);

        this.cameraLabel = this.add.text(cameraButtonX, 300, 'Camera', {color: '#FDFD96'});
        this.cameraLabel.setPosition(this.cameraLabel.x - this.cameraLabel.width / 2, this.cameraLabel.y);

        let audioContext = new ((window).AudioContext || (window).webkitAudioContext)();
        this.sound.setAudioContext(audioContext);
        this.moonlight_p1 = this.sound.add('moonlight_p1', { volume: 0.5, loop: true });
        this.moonlight_p1.play();
    }
    // Default: Update the game
    update(){
        this.nightBg.tilePositionX -= -gameOptions.moonSpeed/200;        
    }
    // Start the game
    startGame() {
        this.scene.start('PlayGame');
        this.moonlight_p1.stop();
    }
    // Turn to Camera page
    cameraGame() {
        this.moonlight_p1.stop();
        window.location = './camera.html';
    }    
}