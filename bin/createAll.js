var shell = require('shelljs')
const manifest = require('../manifest.json')
const packageJson = require('../package.json')
const path = require('path')
const fs = require('fs')
const util = require('util')
const moment = require('moment')
const readAsync = util.promisify(fs.readFile)
const isProduction = process.argv.slice(2).some(e => e === '--production')
let csvName = ''
let command = ''
let currentTime = new Date()

// 打包后的zip和crx放在lastBuild文件夹下，所以要确保存在lastBuild文件夹
function createLastBuild () {
  let zipPath = path.join(__dirname, '../lastBuild')
  if (!fs.existsSync(zipPath)) { // 如果不存在lastBuild文件夹，则创建
    fs.mkdirSync(zipPath)
  } else { // 清空lastBuild文件夹内的文件
    fs.readdirSync(zipPath).map((file) => {
      fs.unlinkSync(zipPath + `/${file}`,(err) => {
        if (err) { throw new Error(err) }
      })
    })
  }
}
/*
  功能：在描述里面添加打包的时间戳，可用来区分到底有没装错包，默认打开
  要求：需要在manifest.js中的description字段中添加占位符："[buildTime]"
*/
async function addDateDesc () {
  let desc = manifest.description
  let currentTimeStr = moment(currentTime).format('YYYY-MM-DD HH:mm')
  desc = desc.replace(/\[buildTime\]/gi, currentTimeStr)
  let manifestPath = path.join(__dirname, '../manifest.json')
  let code = await readAsync(manifestPath, { encoding: 'utf8' })
  code = code.replace(/"description":\s*"[^"]+"/gi, '"description": "' + desc + '"')
  let coverFilePath = path.join(__dirname, '../dist/manifest.json')
  await util.promisify(fs.writeFile)(coverFilePath, code)
}

async function main () {
  createLastBuild()
  // 如果不需要在description描述中插入构建时间，请注释下面的方法
  await addDateDesc()
  if (isProduction) {
    csvName = `${packageJson.pluginName}-v` + manifest.version + '-正式版.crx'
    command = 'crx pack dist -p key/rsa_private_key.pem -o ' + './lastBuild/' + csvName + ' && node ./bin/zipdist.js --production'
  } else {
    let time = moment(currentTime).format('YYYYMMDDHHmm')
    csvName = `${packageJson.pluginName}-v` + manifest.version + '-' + time + '-测试版.crx'
    command = 'crx pack dist -p key/rsa_private_key.pem -o ' + './lastBuild/' + csvName + ' && node ./bin/zipdist.js --time=' + time
  }
  
  if (shell.exec(command).code !== 0) {
    shell.echo('Error: Build failed');
    shell.exit(1);
  }
}

main()
