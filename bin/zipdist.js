const compressing = require('compressing');
const path = require('path')
const manifest = require('../manifest.json')
const packageJson = require('../package.json')
let distFileName = ''

if (process.argv.slice(2).some(e => e === '--production')) {
  distFileName = `${packageJson.pluginName}-v` + manifest.version + '-正式版'
} else {
  let time = process.argv.slice(2).find(e => {
    let reg = /--time=([^\s]+)/gi
    return reg.test(e)
  })
  distFileName = `${packageJson.pluginName}-v` + manifest.version + '-' + time.slice(7) + '-测试版'
}

compressing.zip.compressDir(path.resolve(__dirname, '../dist'), path.resolve(__dirname, '../lastBuild/' + distFileName + '.zip'))
  .then(() => {
    console.log('success');
  })
  .catch(err => {
    console.error(err);
  });
