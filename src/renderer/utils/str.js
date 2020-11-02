// 对象转`JSON`字符串
const objToJson = obj => {
    return JSON.stringify(obj)
  }
  
  // `JSON`字符串转对象
  const jsonToObj = str => {
    return JSON.parse(str)
  }
  
  // 去除首尾空格
  const trim = str => {
    return str.replace(/(^\s*)|(\s*$)/g, '')
  }
  
  // 获取`JSON`字符串的长度
  const geStringLength = str => {
    return str.replace(/[\u0391-\uFFE5]/g, 'aa').length
  }
  
  // 格式化消息格式
  const fomatMessage = (...args) => {
    let bytes = []
    bytes = bytes.concat(...args)
    return bytes
  }
  
  // 前置补 0
  const addPreZero = num => {
    return ('000000000' + num).slice(-10)
  }
  
  // GBK 转 UTF-8
  const iconv = require('iconv-lite')
  const GBK2UTF8 = msg => {
    let str = iconv.decode(msg, 'gbk')
    str = str.substring(0, str.length - 1)
    return str
  }
  
  // UTF-8 转 GBK
  const UTF8ToGBK = text => {
    const bufUtf = Buffer.from(text)
    const bufGbk = iconv.encode(text, 'gbk')
    console.info('utf-8:', bufUtf)
    console.info('gbk:', bufGbk)
    console.info('utf-8:', iconv.decode(bufUtf, 'gbk'))
    console.info('gbk:', iconv.decode(bufGbk, 'gbk'))
    // console.info('buf:', Buffer.from(buf2))
    // console.info('utf-8:', buf1.toString())
    // console.info('gbk:', buf2.toString())
    // console.info('buf:', Buffer.from(buf2).toString())
    // const str = iconv.decode(buf, 'gbk')
    // console.info('str:', str)
    return text
  }
  
  export {
    objToJson,
    jsonToObj,
    trim,
    geStringLength,
    fomatMessage,
    addPreZero,
    GBK2UTF8,
    UTF8ToGBK
  }
  