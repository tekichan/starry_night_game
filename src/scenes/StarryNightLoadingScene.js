import Phaser from 'phaser';

import image_night_bg from '../images/starry_night.png';
import image_starry_night_title from '../images/starry_night_title.png';
import image_start_button from '../images/start_button.png';
import image_camera_button from '../images/camera_button.png';
import image_cloud from '../images/cloud.png';
import image_moon from '../images/mr_moon.png';
import image_moon_lose from '../images/mr_moon_lose.png';
import image_gameover_button from '../images/game_over.png';
import image_sound_on_button from '../images/sound_on_button.png';
import image_sound_off_button from '../images/sound_off_button.png';
import image_detail_button from '../images/detail_button.png';
import audio_moonlight_p1 from '../audio/moonlight_part1.mp3';
import audio_moonlight_p2 from '../audio/moonlight_part2.mp3';
import audio_moonlight_p3 from '../audio/moonlight_part3.mp3';

/**
 * Settings of Loading Scene
 */
const SETTINGS = {
    outerRect_x: 65
    , outerRect_y: 100
    , outerRect_width: 200
    , outerRect_height: 25
    , innerRect_x: 69
    , innerRect_y: 104
    , innerRect_width: 192
    , innerRect_height: 18
    , text_x: 85
    , text_y: 130
    , text_fontSize: '16px'
}

/**
 * Starry Night Game JS: Loading Scene
 * <br>Starry Night Loading Scene
 * @author  Teki Chan
 * @since   13 May 2020
 * @extends Phaser.Scene
 */
export default class StarryNightLoadingScene extends Phaser.Scene{
    /**
     * @inheritdoc
     */
    preload() {
		this.graphics = this.add.graphics();
		this.newGraphics = this.add.graphics();
		var progressBar = new Phaser.Geom.Rectangle(
            SETTINGS.outerRect_x
            , SETTINGS.outerRect_y
            , SETTINGS.outerRect_width
            , SETTINGS.outerRect_height
        );
		var progressBarFill = new Phaser.Geom.Rectangle(
            SETTINGS.innerRect_x
            , SETTINGS.innerRect_y
            , SETTINGS.innerRect_width
            , SETTINGS.innerRect_height            
        );

		this.graphics.fillStyle(0xffffff, 1);
		this.graphics.fillRectShape(progressBar);

		this.newGraphics.fillStyle(0x3587e2, 1);
		this.newGraphics.fillRectShape(progressBarFill);

		var loadingText = this.add.text(
            SETTINGS.text_x
            , SETTINGS.text_y
            , "Loading: "
            , { fontSize: SETTINGS.text_fontSize, fill: '#FFF' }
        );

        this.load.image('night_bg', image_night_bg);
        this.load.image('starry_night_title', image_starry_night_title);
        this.load.image('start_button', image_start_button);
        this.load.image('camera_button', image_camera_button);
        this.load.image('sound_on_button', image_sound_on_button);
        this.load.image('sound_off_button', image_sound_off_button);        
        this.load.image('moon', image_moon);
        this.load.image('moon_lose', image_moon_lose);
        this.load.image('cloud', image_cloud);
        this.load.image('gameover_button', image_gameover_button);
        this.load.image('detail_button', image_detail_button);
        this.load.audio('moonlight_p1', audio_moonlight_p1);
        this.load.audio('moonlight_p2', audio_moonlight_p2);
        this.load.audio('moonlight_p3', audio_moonlight_p3);                        

		this.load.on('progress', this.updateBar, {newGraphics:this.newGraphics,loadingText:loadingText});
        this.load.on('complete', this.complete, {scene:this.scene});
    }
    
    /**
     * Update Progress Bar by percentage
     * @param {*} percentage 
     */
    updateBar(percentage) {
        this.newGraphics.clear();
        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(new Phaser.Geom.Rectangle(
            SETTINGS.innerRect_x
            , SETTINGS.innerRect_y
            , percentage * SETTINGS.innerRect_width
            , SETTINGS.innerRect_height
        ));
                
        percentage = percentage * 100;
        this.loadingText.setText("Loading: " + percentage.toFixed(2) + "%");
    }
    
    /**
     * When the progress bar completed
     */
    complete() {
		this.scene.start("StartGame");
	}    
}