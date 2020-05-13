/**
 * Starry Night Game JS: Game Over Scene
 * @author  Teki Chan
 * @since   13 May 2020
 */
import Phaser from 'phaser';

import { STARRY_NIGHT_SETTINGS } from './StarryNightSettings';

import image_night_bg from '../images/starry_night.png';
import image_gameover_button from '../images/game_over.png';
import image_sound_on_button from '../images/sound_on_button.png';
import image_sound_off_button from '../images/sound_off_button.png';
import audio_moonlight_p3 from '../audio/moonlight_part3.mp3';

/**
 * The game over class of this game's scene
 * @extends Phaser.Scene
 * @author  Teki Chan
 */
export default class StarryNightGameOverScene extends Phaser.Scene{
    /**
     * @inheritdoc
     */
    constructor(){
        super('GameOver');
        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
    preload(){
        this.load.image('night_bg', image_night_bg);
        this.load.image('gameover_button', image_gameover_button);
        this.load.image('sound_on_button', image_sound_on_button);
        this.load.image('sound_off_button', image_sound_off_button);          
        this.load.audio('moonlight_p3', audio_moonlight_p3);
        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
    create(){
        this.nightBg = this.add.tileSprite(this.game.config.width / 2,this.game.config.height / 2,0,0, 'night_bg');
        this.nightBg.setScale(this.cameras.main.height/this.nightBg.height).setScrollFactor(0);
        
        this.gameOverButton = this.add.tileSprite(this.game.config.width / 2, 250, 0, 0, 'gameover_button').setInteractive();
        this.gameOverButton.setScale(this.cameras.main.width/this.gameOverButton.width * 0.5).setScrollFactor(0);         
        this.input.on('pointerdown', this.resetGame, this);

        this.gameOverLabel = this.add.text(this.gameOverButton.x, this.gameOverButton.y * 1.2, 'Press here to restart', {color: '#FDFD96'});
        this.gameOverLabel.setPosition(this.gameOverLabel.x - this.gameOverLabel.width / 2, this.gameOverLabel.y);

        this.soundButton = this.add.tileSprite(
                                this.game.config.width * 0.9
                                , this.game.config.height * 0.9, 0, 0
                                , 'sound_off_button'
                            );
        this.soundButton.setScale(this.cameras.main.width/this.soundButton.width * 0.125).setScrollFactor(0);   

        let audioContext = new ((window).AudioContext || (window).webkitAudioContext)();
        this.sound.setAudioContext(audioContext);
        this.moonlight_p3 = this.sound.add('moonlight_p3', { volume: 0.5, loop: true }); 
    }
    /**
     * @inheritdoc
     */
    update(){
        this.nightBg.tilePositionX -= -STARRY_NIGHT_SETTINGS.moonSpeed/200;        
    }
    /**
     * Reset the game to the entry screen
     */
    resetGame() {
        let pointer = this.input.activePointer;
        if (pointer.isDown) {
            if (pointer.x > this.soundButton.x * 0.9 && pointer.x < this.soundButton.x * 1.1
                && pointer.y > this.soundButton.y * 0.9 && pointer.y < this.soundButton.y * 1.1) {
                    this.toggleSound();
                    return;
                }
        }

        let self = this;
        this.time.addEvent({
            delay: 500
            , callback: () => {
                self.scene.start('StartGame');
                self.moonlight_p3.stop();
            }
            , loop: false
        });        
    }
    /**
     * Toggle Sound on or off
     */
    toggleSound() {
        if (this.is_sound_on) {
            this.moonlight_p3.stop();
            this.soundButton.setTexture('sound_off_button');
        } else {
            this.moonlight_p3.play();
            this.soundButton.setTexture('sound_on_button');
        }
        this.is_sound_on = !this.is_sound_on;
    }     
}