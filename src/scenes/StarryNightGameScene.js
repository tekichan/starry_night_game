import Phaser from 'phaser';

import image_night_bg from '../images/starry_night.png';
import image_cloud from '../images/cloud.png';
import image_moon from '../images/mr_moon.png';
import audio_moonlight_p2 from '../audio/moonlight_part2.mp3';

const gameOptions = {
    // Moon gravity, will make Moon fall if you don't flap
    moonGravity: 400,
    // horizontal Moon speed
    moonSpeed: 125,
    // flap thrust
    birdFlapPower: 200,
    // minimum cloud height, in pixels. Affects head position
    minCloudHeight: 50,
    // distance range from next cloud, in pixels
    cloudDistance: [220, 280],
    // head range between clouds, in pixels
    cloudHead: [100, 130],
    // local storage object name
    localStorageName: 'bestFlappyScore'
}

/**
 * The main class of this game's scene
 */
export default class StarryNightGameScene extends Phaser.Scene{
    // Phaser.Scene object onstructor
    constructor(){
        super('PlayGame');
    }
    // Default: Before the game is loaded
    preload(){
        this.load.image('moon', image_moon);
        this.load.image('cloud', image_cloud);
        this.load.image('night_bg', image_night_bg);
        this.load.audio('moonlight_p2', audio_moonlight_p2);
    }
    // Default: When the game is created
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
        this.cloudGroup.setVelocityX(-gameOptions.moonSpeed);
        
        this.moon = this.physics.add.sprite(80, this.game.config.height / 2, 'moon');
        this.moon.setScale(this.cameras.main.height/this.moon.height * 0.2).setScrollFactor(0);
        this.moon.body.gravity.y = gameOptions.moonGravity;

        this.input.on('pointerdown', this.flap, this);
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);

        let audioContext = new ((window).AudioContext || (window).webkitAudioContext)();
        this.sound.setAudioContext(audioContext);
        this.moonlight_p2 = this.sound.add('moonlight_p2', { volume: 0.5, loop: true });
        this.moonlight_p2.play();
    }
    // Update the score
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }
    // Place clouds
    placeClouds(addScore){
        let rightmost = this.getRightmostCloud();

        let pipeHoleHeight = Phaser.Math.Between(gameOptions.cloudHead[0], gameOptions.cloudHead[1]);
        let pipeHolePosition = Phaser.Math.Between(gameOptions.minCloudHeight + pipeHoleHeight / 2, this.game.config.height - gameOptions.minCloudHeight - pipeHoleHeight / 2);

        this.cloudPool[0].x = rightmost + this.cloudPool[0].getBounds().width + Phaser.Math.Between(gameOptions.cloudDistance[0], gameOptions.cloudDistance[1]);
        this.cloudPool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.cloudPool[0].setOrigin(0, 1);

        /*
        this.cloudPool[1].x = this.cloudPool[0].x;
        this.cloudPool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.cloudPool[1].setOrigin(0, 0);
        */
        this.cloudPool = [];
        if(addScore){
            this.updateScore(1);
        }
    }
    // Flap the character
    flap(){
        this.moon.body.velocity.y = -gameOptions.birdFlapPower;
    }
    // Get the right most pipes
    getRightmostCloud(){
        let rightmostPipe = 0;
        this.cloudGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }
    // Default: Update the game
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

        this.nightBg.tilePositionX -= -gameOptions.moonSpeed/200;
    }
    // When the character dies
    die(){
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
        this.scene.start('GameOver');
        this.moonlight_p2.stop();
    }
}
