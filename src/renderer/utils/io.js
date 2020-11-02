// 字符串转`byte`数组
const stringToByte = () => {
    const str = this.toJsonString()
    const bytes = []
    let len, c
    len = str.length
    for (let i = 0; i < len; i++) {
      c = str.charCodeAt(i)
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0)
        bytes.push(((c >> 12) & 0x3F) | 0x80)
        bytes.push(((c >> 6) & 0x3F) | 0x80)
        bytes.push((c & 0x3F) | 0x80)
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0)
        bytes.push(((c >> 6) & 0x3F) | 0x80)
        bytes.push((c & 0x3F) | 0x80)
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0)
        bytes.push((c & 0x3F) | 0x80)
      } else {
        bytes.push(c & 0xFF)
      }
    }
    return bytes
  }
  
  // `byte`数组转字符串
  const byteToString = arr => {
    if (typeof arr === 'string') {
      return arr
    }
    let str = ''
    let _arr = arr
    for (let i = 0; i < _arr.length; i++) {
      let one = _arr[i].toString(2)
      let v = one.match(/^1+?(?=0)/)
      if (v && one.length === 8) {
        let bytesLength = v[0].length
        let store = _arr[i].toString(2).slice(7 - bytesLength)
        for (let st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2)
        }
        str += String.fromCharCode(parseInt(store, 2))
        i += bytesLength - 1
      } else {
        str += String.fromCharCode(_arr[i])
      }
    }
    str = str.substring(0, str.length - 1)
    return str
  }
  
  // `number`转`byte`数组
  const numberToBytes = n => {
    const bytes = [4]
    bytes[0] = n & 0xff
    bytes[1] = n >> 8 & 0xff
    bytes[2] = n >> 16 & 0xff
    bytes[3] = n >> 24 & 0xff
    return bytes
  }
  
  // `byte`数组转`number`
  const bytesToNumber = bytes => {
    let n = 0
    n = (bytes[0] & 0xFF) | ((bytes[1] & 0xFF) << 8) | ((bytes[2] & 0xFF) << 16) | ((bytes[3] & 0xFF) << 24)
    return n
  }
  
  // 格式化消息格式
  const msgToBuffer = (...args) => {
    let bytes = []
    bytes = bytes.concat(...args)
    return Buffer.from(bytes)
  }
  
  // 解析消息
  const bufferToMsg = (bytes, msgs) => {
    const bytesLen = bytes.length
    const header = bytes.slice(0, 16)
    const header3 = header.slice(8, 12)
    const bodyLen = bytesToNumber(header3)
    const msgLen = bodyLen + header.length
    const msg = bytes.slice(16, msgLen)
    msgs.push(msg)
    if (msgLen < bytesLen) {
      bufferToMsg(bytes.slice(msgLen), msgs)
    }
  }
  
  // 获取消息
  const getMsges = bytes => {
    const msges = []
    bufferToMsg(bytes, msges)
    return msges
  }
  
  export {
    stringToByte,
    byteToString,
    numberToBytes,
    bytesToNumber,
    msgToBuffer,
    getMsges
  }
  