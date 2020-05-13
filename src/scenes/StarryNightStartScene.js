import Phaser from 'phaser';

import { STARRY_NIGHT_SETTINGS } from './StarryNightSettings';

import image_night_bg from '../images/starry_night.png';
import image_starry_night_title from '../images/starry_night_title.png';
import image_start_button from '../images/start_button.png';
import image_camera_button from '../images/camera_button.png';
import image_sound_on_button from '../images/sound_on_button.png';
import image_sound_off_button from '../images/sound_off_button.png';
import image_detail_button from '../images/detail_button.png';

import audio_moonlight_p1 from '../audio/moonlight_part1.mp3';

/**
 * Starry Night Game JS: Start Scene
 * <br>The starting class of this game's scene
 * @extends Phaser.Scene
 * @author  Teki Chan
 * @since   13 May 2020
 */
export default class StarryNightStartScene extends Phaser.Scene{
    /**
     * @inheritdoc
     */
    constructor(){
        super('StartGame');
        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
    preload(){
        this.load.image('night_bg', image_night_bg);
        this.load.image('starry_night_title', image_starry_night_title);
        this.load.image('start_button', image_start_button);
        this.load.image('camera_button', image_camera_button);
        this.load.image('sound_on_button', image_sound_on_button);
        this.load.image('sound_off_button', image_sound_off_button);
        this.load.image('detail_button', image_detail_button);

        this.load.audio('moonlight_p1', audio_moonlight_p1);

        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
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

        this.soundButton = this.add.tileSprite(
                                this.game.config.width * 0.9
                                , this.game.config.height * 0.9, 0, 0
                                , 'sound_off_button'
                            ).setInteractive();
        this.soundButton.setScale(this.cameras.main.width/this.soundButton.width * 0.125).setScrollFactor(0);         
        this.soundButton.on('pointerdown', this.toggleSound, this);

        this.detailButton = this.add.tileSprite(
                                this.game.config.width * 0.75
                                , this.game.config.height * 0.9, 0, 0
                                , 'detail_button'
                            ).setInteractive();
        this.detailButton.setScale(this.cameras.main.width/this.detailButton.width * 0.125).setScrollFactor(0);         
        this.detailButton.on('pointerdown', this.showDetail, this);

        let audioContext = new ((window).AudioContext || (window).webkitAudioContext)();
        this.sound.setAudioContext(audioContext);
        this.moonlight_p1 = this.sound.add('moonlight_p1', { volume: 0.5, loop: true });
    }
    /**
     * @inheritdoc
     */
    update(){
        this.nightBg.tilePositionX -= -STARRY_NIGHT_SETTINGS.moonSpeed/200;        
    }
    /**
     * Start to enter the game and play
     */
    startGame() {
        this.scene.start('PlayGame');
        this.moonlight_p1.stop();
    }
    /**
     * Turn to Camera Screen
     */
    cameraGame() {
        this.moonlight_p1.stop();
        window.location = './camera.html';
    }

    /**
     * Toggle Sound on or off
     */
    toggleSound() {
        if (this.is_sound_on) {
            this.moonlight_p1.stop();
            this.soundButton.setTexture('sound_off_button');
        } else {
            this.moonlight_p1.play();
            this.soundButton.setTexture('sound_on_button');
        }
        this.is_sound_on = !this.is_sound_on;
    }

    /**
     * Show Detail
     */
    showDetail() {
        this.moonlight_p1.stop();
        window.location = 'https://github.com/tekichan/starry_night_game';
    }
}