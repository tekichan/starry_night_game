/**
 * Starry Night Game JS
 * @author  Teki Chan
 * @since   13 May 2020
 */
import Phaser from 'phaser';
import StarryNightLoadingScene from './scenes/StarryNightLoadingScene';
import StarryNightStartScene from './scenes/StarryNightStartScene';
import StarryNightGameScene from './scenes/StarryNightGameScene';
import StarryNightGameOverScene from './scenes/StarryNightGameOverScene';

import './css/starry_night_game.css';

/**
 * Phaser Game Config
 */
const gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: 320,
        height: (window.innerHeight > window.innerWidth)?480 * (window.innerWidth/320):480
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: [StarryNightLoadingScene, StarryNightStartScene, StarryNightGameScene, StarryNightGameOverScene]
}

/**
 * Start the game
 */
const game = new Phaser.Game(gameConfig);