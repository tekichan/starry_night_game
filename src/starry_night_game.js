import Phaser from 'phaser';
import StarryNightStartScene from './scenes/StarryNightStartScene';
import StarryNightGameScene from './scenes/StarryNightGameScene';
import StarryNightGameOverScene from './scenes/StarryNightGameOverScene';

import './css/starry_night_game.css';

const gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 480
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
    scene: [StarryNightStartScene, StarryNightGameScene, StarryNightGameOverScene]
}

const game = new Phaser.Game(gameConfig);
