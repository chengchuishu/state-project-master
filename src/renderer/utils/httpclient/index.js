
import http from './http'

const httpclient = {
  async post (url, params) {
    try {
      console.log('┏---------------------------------------------┓')
      console.log('|  请求地址:', url)
      console.log('|  请求参数:', params)
      // 响应信息
      const res = await http.post(url, params)
      const data = res.data
      // 响应码
      const trancode = data.REP_HEAD.TRAN_CODE
      // 响应描述信息
      const tranmsg = data.REP_HEAD.TRAN_RSPMSG
      // 响应体
      const repbody = data.REP_BODY
      console.log('|  请求响应结果:', data)
      if (trancode === '000000') {
        console.info('|  交易成功:', repbody)
        console.log('┗---------------------------------------------┛')
        if (url.indexOf('/data/queryDataUpd.tran') !== -1) {
          return {
            code: '1',
            cache: JSON.stringify(data)
          }
        } else {
          return {
            code: '1',
            result: repbody
          }
        }
      } else if (trancode === '999999') {
        console.error('交易异常:', tranmsg)
        console.log('----------------↑↑↑↑------------------')
        return {
          code: '0',
          result: tranmsg
        }
      } else {
        console.error('交易失败:', tranmsg)
        return {
          code: '2',
          result: tranmsg
        }
      }
    } catch (error) {
      console.error('请求异常:', error)
      return {
        code: '-1'
      }
    }
  },
  async get (url, params) {
    try {
      console.log('请求地址:', url)
      console.log('请求参数:', params)
      // 响应信息
      const res = await http.post(url, params)
      const data = res.data
      // 响应码
      const trancode = data.REP_HEAD.TRAN_CODE
      // 响应描述信息
      const tranmsg = data.REP_HEAD.TRAN_RSPMSG
      // 响应体
      const repbody = data.REP_BODY
      console.log('请求响应结果:', data)
      if (trancode === '000000') {
        console.info('交易成功:', repbody)
        return {
          code: '1',
          result: repbody
        }
      } else if (trancode === '999999') {
        console.error('交易异常:', tranmsg)
        return {
          code: '0',
          result: tranmsg
        }
      } else {
        console.error('交易失败:', tranmsg)
        return {
          code: '2',
          result: tranmsg
        }
      }
    } catch (error) {
      console.error('请求异常:', error)
      return {
        code: '-1'
      }
    }
  }
}

httpclient.interceptors = http.interceptors

export default httpclient
