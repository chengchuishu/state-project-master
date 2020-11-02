import {format} from '@/utils/date'

const iconv = require('iconv-lite')
class Message {
  // 构造函数
  constructor () {
    this.header = {
      'tag': 'ysos',
      'version': '1.0.0.1',
      'type': '31018',
      'time_stamp': format(new Date(), 'yyyy-MM-dd hh:mm:ss S'),
      'session_id': '0',
      'serial_number': '0'
    }
    this.content = {
      'from': '127.0.0.1:6001',
      'to': '127.0.0.1:6002',
      'verb': 'DoService',
      'param': {
        'service_name': 'Init',
        'service_param': {
          'app_name': 'robotterminalapp',
          'strategy_name': 'robotterminalapp'
        }
      }
    }
  }
  // 对象转`JSON`字符串
  toJsonString () {
    return JSON.stringify(this)
  }
  // 获取`JSON`字符串的长度
  getJsonStringLength () {
    return this.toJsonString().replace(/[\u0391-\uFFE5]/g, 'aa').length
  }
  // 字符串转`byte`数组
  stringToByte () {
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
  // `number`转`byte`数组
  toLH (n) {
    const bytes = [4]
    bytes[0] = n & 0xff
    bytes[1] = n >> 8 & 0xff
    bytes[2] = n >> 16 & 0xff
    bytes[3] = n >> 24 & 0xff
    return bytes
  }
  // 格式化消息格式
  msgToBuffer () {
    let bytes = []
    bytes = bytes.concat(this.toLH(0), this.toLH(0), this.toLH(this.getJsonStringLength()), this.toLH(0), this.stringToByte())
    console.log('bytes:', bytes)
    return Buffer.from(bytes, 'binary')
  }
  // 格式化消息格式
  msgToBuffer2 () {
    const buf = iconv.encode(this.toJsonString(), 'gbk')
    console.log('buf:', buf)
    // const str = iconv.decode(buf, 'gbk')
    // console.info('str:', str)
    const len = buf.length
    let bytes = []
    bytes = bytes.concat(this.toLH(0), this.toLH(0), this.toLH(len), this.toLH(0))
    const buf0 = Buffer.from(bytes)
    const tbuf = Buffer.concat([buf0, buf], buf0.length + len)
    console.log('gbk buf:', tbuf)
    return tbuf
  }
}

export default Message
