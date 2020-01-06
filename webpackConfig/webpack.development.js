const path = require('path')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  entry: {
    'js/popupindex': './popup/index.js', // popup入口
    'js/contentindex': './content/index.js', // content入口
    'js/background': './background/index.js' // backgroundjs
  },
  devServer: {
    port: 8887,
    open: true,
    openPage: 'popup'
  },
  plugins: [
    new webpack.DefinePlugin({
      'SERVICE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
      filename: 'popup',
      template: path.resolve(__dirname, '../popup/index.html'),
      inject: true,
      chunks: ['js/popupindex']
    })
  ]
})
