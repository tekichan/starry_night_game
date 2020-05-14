# starry_night_game
[![License](https://img.shields.io/badge/license-MIT-green.svg)](/LICENSE) 

Starry Night Game: Play this game at [https://tekichan.github.io/starry_night_game](https://tekichan.github.io/starry_night_game).

To commemorate Vincent van Gogh (1853 - 1890), one of greatest and influential painters, nearly 130 years after his death, I created this game with face recognition. 

The game makes use of the following masterpieces:
- The Starry Night
- Self-Portrait
- Self-Portrait with Grey Felt Hat
- Self-portrait with Bandaged Ear and Pipe
- The Moonlight Sonata (by Ludwig van Beethoven)

## How to play

![Game Section](/docs/game_section_demo.gif) ![Camera Section](/docs/camera_section_demo.gif)

After loading screen, you will find two buttons in the centre of the start screen. Press **Start Game** to enter the game section, **Camera** to the camera section.

In the game section, a player just touches the screen to flap Mr. Moon. The goal is to prevent Mr. Moon from hitting any Cloud. When Mr. Moon passes a cloud, the player will earn 1 mark. If Mr. Moon hits a Cloud or flaps out of the screen, then the game will be over.

The players can enjoy the Moonlight Sonata if he turns on by pressing **Sound** at the bottom right corner.

In the camera section, a player will be asked to allow the game to use its camera. Then the player will find his face on a Van Gogh Portrait. He can press **Change** to select another Van Gogh Portrait. If he is satisfied with the result, he can press **Camera** to download the resulted image.

The player can return the start screen by pressing **Home**.

Both iPhone Safari and Android Chrome have a function **Add To Home Screen**. After adding the game to Home Screen, you can easily play the game in full screen.

## System Design
![Screen Flow](/docs/StarryNightGame_ScreenFlow.png)

This game is built by JavaScript. There are two main sections: **Game Section** and **Camera Section**. The whole game package is wrapped up by Webpack and its plugins. Workbox is used for PWA feature.

### Game Section

Game section is built in `starry_night_game.js` with Phaser 3 library.
```Javascript
const game = new Phaser.Game(gameConfig);
```

Game scenes and logics are coded in scene classes which extends `Phaser.Scene`. The scene classes are:
- `StarryNightLoadingScene.js`: Loading Screen
- `StarryNightStartScene.js`: Start Screen
- `StarryNightGameScene.js`: Game Scene
- `StarryNightGameOverScene.js`: Game Over Screen

The concept of Phaser Scene class is very simple. The main flow consists of:
- `constructor`: Define the scene name for other scene to refer.
- `preload`: Load image or sound into memory.
- `create`: Create image, sound, button and other sprites into the scene. Associate each event action of interactive sprites to a corresponding function.
- `update`: Define logic which keeps running when the scene is alive.

### Camera Section

Camera section is built in `van_gogh_camera.js` with Jeeliz Face Filter, which provides Face Recognition functions.
```Javascript
$( document ).ready(function() {
    console.log('jQuery is ready');
    setupButtons();
    buildPaintingOption()
    vanGoghFaceFilter.main();
});
```

The object instance of `VanGoghFaceFilter` loads one of Van Gogh portraits, detects a face on the picture and burns it out. Meanwhile, it loads a face photo via a camera. After the face is detected, the face photo is posted to the picture's burnt out area. Then the human is sticked to the portrait picture.

After pressing the Camera button, the images inside separate `canvas` are merged into one image. After the image is finished, it will be prompted for download.

The detail of codes are documented inside the codes. [JSDoc](/docs/jsdocs.md) is also available.

### NPM Scripts
- `npm run dev`: compile codes into webpack-dev-server and provide the endpoint `https://localhost:8080`
- `npm run build`: compile and bundle codes into the folder `dist`
- `npm run doc`: generate JSDoc documentation
- `npm run deploy`: deploy codes from the folder `dist` to `https://tekichan.github.io/starry_night_game`

## References
- [Phaser](https://phaser.io/): open source framework for Canvas and WebGL powered browser games.
- [Jeeliz](https://jeeliz.com/): deep learning for real-time video analysis in the web browser.
- [Webpack](https://webpack.js.org/): a module bundler to bundle JavaScript files for usage in a browser.
- [Workbox](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin): a set of libraries and Node modules that make it easy to cache assets and take full advantage of features used to build Progressive Web Apps.

## Known Issues
- The size of this game is a bit large. It may take longer time to load.
- Mobile browser toolbars may cover some game area. Players should hide toolbars before start.
- Mobile browsers have more restriction in sound. Music is not played if ring button is switched off.
- Browsers using hardware like camera may be affected by various settings like privacy. Camera may not be able to turn on.
- The face recognition is processed real-time. The size and correctness depends various environmental factors like brightness.

## Change History
- 13 May 2020 : First Release

## Authors
- Teki Chan *tekichan@gmail.com*