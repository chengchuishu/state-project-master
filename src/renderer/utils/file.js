const request = require('request')
const fs = require('fs')
const path = require('path')

// 读取本地文件
const readLocalFile = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    let buffer = ''
    if (fileBuffer) {
      if (fileBuffer[0] === 0xef && fileBuffer[1] === 0xbb && fileBuffer[2] === 0xbf) {
        buffer = fileBuffer.slice(3, fileBuffer.length)
      } else {
        buffer = fileBuffer
      }
      console.log('fileBuffer----->', filePath + '--->' + buffer.toString('utf8'))
      return JSON.parse(buffer.toString('utf8'))
    }
  } catch (error) {
    return ''
  }
}

// 写入本地文件
const writeLocalFile = (filePath, txt) => {
  try {
    fs.writeFileSync(filePath, txt)
    return true
  } catch (error) {
    console.error('error:', error)
    return false
  }
}

// 下载
const download = (url, dirName, fileName) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }
    const wstream = fs.createWriteStream(path.join(dirName, fileName))
    wstream.on('finish', () => { resolve(true) })
    wstream.on('error', err => { reject(err) })
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      }
    }).pipe(wstream)
  })
}

export {
  readLocalFile,
  writeLocalFile,
  download
}
