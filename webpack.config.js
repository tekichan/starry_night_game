const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    index: './src/starry_night_game.js'
    , camera: './src/van_gogh_camera.js'
  }, 
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  plugins: [
    new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['dist']
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html'
        , chunks: ['index']
        , title: 'Starry Night Game'
        , minify: {
          removeComments: true,
          collapseWhitespace: true
        }
        , favicon: './src/icons/favicon.ico'
    }),
    new HtmlWebpackPlugin({
      filename: 'camera.html'
      , template: 'src/camera_template.html'   
      , chunks: ['camera']
      , title: "Van Gogh's Camera"
      , meta: {
          'viewport': 'width=device-width, initial-scale=0.5, shrink-to-fit=no, user-scalable=no'
      }
      , minify: {
        removeComments: true,
        collapseWhitespace: true
      }
      , favicon: './src/icons/favicon.ico'
    }),
    new FaviconsWebpackPlugin({
      logo: './src/icons/favicon.png'
      , outputPath: './assets/'
      , prefix: '/starry_night_game/assets/'
      , favicons: {
        appName: 'Starry Night Game',
        appShortName: 'Starry Night Game',
        appDescription: 'A fun game with face recognition to commemorate Vincent van Gogh',
        developerName: 'Teki Chan',
        developerURL: 'https://github.com/tekichan',          
        start_url: '/starry_night_game/'
      }
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
    })
  ],
  module: {
    rules: [{
        test: /\.(png|svg|jpe?g|gif)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'images',
        },
    }, 
    {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
    }, {
      test: /\.mp3$/,
      loader: 'file-loader',
      options: {
        outputPath: 'audio',
      },
    }, {
      test: /\.ico$/,
      loader: 'file-loader'
    }       
    ]
  },  
  devServer: {
    contentBase: path.join(__dirname, 'dist')
    , https: true
  }  
}
