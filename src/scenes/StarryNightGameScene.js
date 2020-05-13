import Phaser from 'phaser';

import { STARRY_NIGHT_SETTINGS } from './StarryNightSettings';

import image_night_bg from '../images/starry_night.png';
import image_cloud from '../images/cloud.png';
import image_moon from '../images/mr_moon.png';
import image_moon_lose from '../images/mr_moon_lose.png';
import image_sound_on_button from '../images/sound_on_button.png';
import image_sound_off_button from '../images/sound_off_button.png';
import audio_moonlight_p2 from '../audio/moonlight_part2.mp3';

/**
 * Starry Night Game JS: Game Content Scene
 * <br>The main class of this game's scene
 * @extends Phaser.Scene
 * @author  Teki Chan
 * @since   13 May 2020
 */
export default class StarryNightGameScene extends Phaser.Scene{
    /**
     * @inheritdoc
     */
    constructor(){
        super('PlayGame');
        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
    preload(){
        this.load.image('moon', image_moon);
        this.load.image('moon_lose', image_moon_lose);
        this.load.image('cloud', image_cloud);
        this.load.image('night_bg', image_night_bg);
        this.load.image('sound_on_button', image_sound_on_button);
        this.load.image('sound_off_button', image_sound_off_button);        
        this.load.audio('moonlight_p2', audio_moonlight_p2);
        this.is_sound_on = false;
    }
    /**
     * @inheritdoc
     */
    create(){
        this.nightBg = this.add.tileSprite(this.game.config.width / 2,this.game.config.height / 2,0,0, 'night_bg');
        this.nightBg.setScale(this.cameras.main.height/this.nightBg.height).setScrollFactor(0);

        this.cloudGroup = this.physics.add.group();
        this.cloudPool = [];
        for(let i = 0; i < 4; i++){
            let cloud = this.cloudGroup.create(0, 0, 'cloud');
            cloud.body.setSize(cloud.width * 0.8, cloud.height * 0.5);
            this.cloudPool.push(cloud);
            this.placeClouds(false);
        }
        this.cloudGroup.setVelocityX(-STARRY_NIGHT_SETTINGS.moonSpeed);
        
        this.moon = this.physics.add.sprite(80, this.game.config.height / 2, 'moon');
        this.moon.setScale(this.cameras.main.height/this.moon.height * 0.2).setScrollFactor(0);
        this.moon.body.gravity.y = STARRY_NIGHT_SETTINGS.moonGravity;

        this.input.on('pointerdown', this.flap, this);
        
        this.score = 0;
        this.topScore = localStorage.getItem(STARRY_NIGHT_SETTINGS.localStorageName) == null ? 0 : localStorage.getItem(STARRY_NIGHT_SETTINGS.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);

        this.soundButton = this.add.tileSprite(
                                this.game.config.width * 0.9
                                , this.game.config.height * 0.9, 0, 0
                                , 'sound_off_button'
                            );
        this.soundButton.setScale(this.cameras.main.width/this.soundButton.width * 0.125).setScrollFactor(0);         

        let audioContext = new ((window).AudioContext || (window).webkitAudioContext)();
        this.sound.setAudioContext(audioContext);
        this.moonlight_p2 = this.sound.add('moonlight_p2', { volume: 0.5, loop: true });
    }
    /**
     * When Update a Score
     * @param {*} inc   increased score
     */
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }
    /**
     * Place Clouds into the scene
     * @param {*} addScore  flag of adding a score as well or not
     */
    placeClouds(addScore){
        let rightmost = this.getRightmostCloud();

        let pipeHoleHeight = Phaser.Math.Between(STARRY_NIGHT_SETTINGS.cloudHead[0], STARRY_NIGHT_SETTINGS.cloudHead[1]);
        let pipeHolePosition = Phaser.Math.Between(STARRY_NIGHT_SETTINGS.minCloudHeight + pipeHoleHeight / 2, this.game.config.height - STARRY_NIGHT_SETTINGS.minCloudHeight - pipeHoleHeight / 2);

        this.cloudPool[0].x = rightmost + this.cloudPool[0].getBounds().width + Phaser.Math.Between(STARRY_NIGHT_SETTINGS.cloudDistance[0], STARRY_NIGHT_SETTINGS.cloudDistance[1]);
        this.cloudPool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.cloudPool[0].setOrigin(0, 1);

        this.cloudPool = [];
        if(addScore){
            this.updateScore(1);
        }
    }
    /**
     * Flap Mr. Moon to fly up
     */
    flap(){
        let pointer = this.input.activePointer;
        if (pointer.isDown) {
            if (pointer.x > this.soundButton.x * 0.9 && pointer.x < this.soundButton.x * 1.1
                && pointer.y > this.soundButton.y * 0.9 && pointer.y < this.soundButton.y * 1.1) {
                    this.toggleSound();
                    return;
                }
        }
        this.moon.body.velocity.y = -STARRY_NIGHT_SETTINGS.birdFlapPower;      
    }
    /**
     * Get right most cloud object
     */
    getRightmostCloud(){
        let rightmostPipe = 0;
        this.cloudGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }
    /**
     * @inheritdoc
     */
    update(){
        this.physics.world.collide(this.moon, this.cloudGroup, function(){
            this.die();
        }, null, this);
        if(this.moon.y > this.game.config.height || this.moon.y < 0){
            this.die();
        }
        this.cloudGroup.getChildren().forEach(function(cloud){
            if(cloud.getBounds().right < 0){
                this.cloudPool.push(cloud);
                if(this.cloudPool.length == 2){
                    this.placeClouds(true);
                }
            }
        }, this)

        this.nightBg.tilePositionX -= -STARRY_NIGHT_SETTINGS.moonSpeed/200;
    }
    /**
     * When Mr. Moon hits a cloud or flys over the borders, then dies
     */
    die(){
        localStorage.setItem(STARRY_NIGHT_SETTINGS.localStorageName, Math.max(this.score, this.topScore));

        this.moon.setTexture('moon_lose');
        this.moon.body.gravity.y = 0;

        let self = this;
        this.time.addEvent({
            delay: 500
            , callback: () => {
                self.scene.start('GameOver');
                self.moonlight_p2.stop();
            }
            , loop: false
        });
    }
    /**
     * Toggle Sound on or off
     */
    toggleSound() {
        if (this.is_sound_on) {
            this.moonlight_p2.stop();
            this.soundButton.setTexture('sound_off_button');
        } else {
            this.moonlight_p2.play();
            this.soundButton.setTexture('sound_on_button');
        }
        this.is_sound_on = !this.is_sound_on;
    }    
}
