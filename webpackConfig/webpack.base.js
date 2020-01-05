const path = require('path')
const packageJson = require('../package.json')

const fs = require('fs')

let commandParams = process.argv.slice(2)
let envIndex = commandParams.findIndex(e => e === '--serviceENV')
let pluginName = ''
if (envIndex > 0 && commandParams[envIndex + 1] === 'production') {
  pluginName = `${packageJson.pluginName}-正式版`
} else {
  pluginName = `${packageJson.pluginName}-测试版`
}

fs.readFile(path.join(__dirname, '../manifest.json'), 'utf8', function (err, data) {
  if (err) throw err;
  let manifest = JSON.parse(data)
  manifest.name = pluginName
  let newContent = JSON.stringify(manifest, null, 4);
  fs.writeFile(path.join(__dirname, '../manifest.json'), newContent, 'utf8', (err) => {
      if (err) throw err;
      console.log('manifest中插件名称修改成功!');
  });
});

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    alias: {
      'content': resolve('content'),
      'popup': resolve('popup')
    }
  },
  module: {
    rules: [
    {
      test: /\.tsx?$/,     // typescript的加载器
      loader: 'tslint-loader',
      enforce: 'pre',
      exclude: /node_modules/,
      include: [resolve('content'), resolve('popup')]
    },
    {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }, {
      test: /\.js$/,
      loader: 'eslint-loader',
      enforce: "pre",
      include: [resolve('content'), resolve('popup')],
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'images/[name].[hash:7].[ext]'
      }
    }, {
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
      include: [resolve('content'), resolve('popup')]
    }, {
      test: /\.css$/,
      // loader: 'happypack/loader?id=happy-css'
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.less$/,
      include: [resolve('content'), resolve('popup')],
      // loader: 'happypack/loader?id=happy-less'
      use: ['style-loader', 'css-loader', 'less-loader']
    }]
  }
}
