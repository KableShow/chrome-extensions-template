const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.js')
const webpack = require('webpack')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const createHappyPlugin = (id, loaders) => new HappyPack({
  id: id,
  loaders: loaders,
  threadPool: happyThreadPool,
  verbose: false
})

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// 区分是测试环境还是正式环境
var serviceENV = require('yargs').argv.serviceENV || 'development'

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  cache: true,
  entry: {
    'js/popupindex': './popup/index.js', // popup入口
    'js/contentindex': './content/index.js', // content入口
    'js/background': './background/index.js' // backgroundjs
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    // 生成的js需要在manifest中引入，所以要固定名字，不要加hash后缀，不然每次打包需要手动去改manifest文件
    filename: '[name].bundle.js',
    // 防止和原页面的jsonp同名
    jsonpFunction: 'extJSONP'
  },
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..'),
      dry: false // 启用删除文件
    }),
    // createHappyPlugin('happy-css', ['style-loader', 'css-loader']),
    // createHappyPlugin('happy-less', ['style-loader', 'css-loader', 'less-loader']),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../manifest.json') },
      {
        // 将公共js复制到dist/js下
        context: path.resolve(__dirname, '../static'),
        from: '**/*'
      }
    ]),
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'SERVICE_ENV': JSON.stringify(serviceENV)
    }),
    new HtmlWebpackPlugin({ // popup页面
      filename: 'popup.html',
      template: path.resolve(__dirname, '../popup/index.html'),
      inject: true,
      chunks: ['js/popupindex.bundle.js']
    })
  ],
  performance: {
    hints: false
  },
  watchOptions: {
    ignored: /node_modules/
  },
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({ // 多进程压缩
        cacheDir: '.cache/',
        uglifyES: { // 这个项目不需要用babel转成es5
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            warnings: false,
            drop_console: false,
            collapse_vars: true,
            reduce_vars: true
          }
        }
      })
    ]
  }
})
