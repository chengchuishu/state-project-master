// import CryptoJS from 'crypto-js'
import MD5 from 'md5'

// md5加密
function encrypt (data) {
  let pwd = '1111111111111111' // 密钥
  let array = []
  for (let key in data) {
    array.push(key)
  }
  array.sort()
  let sortJson = {}
  for (let a in array) {
    sortJson[array[a]] = data[array[a]]
  }
  // console.log('-------排序后的数据')
  // console.log(sortJson)
  let bodyStr = JSON.stringify(sortJson) + pwd
  let dataJson = {}
  // var ua = window.navigator.userAgent.toLowerCase()
  // console.log('ua--->', ua)
  // let chnId = ''
  // if (ua.match(/MicroMessenger/i) === 'micromessenger') {
  //   chnId = '00'
  // } else if (ua.indexOf('alipay') !== -1) {
  //   chnId = '02'
  // }
  // const chnId = sessionStorage.getItem('CHNID')
  dataJson.REQ_HEAD = {
    // chnId: '00',
    chnId: '03',
    verId: '1.0'
  }
  dataJson.REQ_HEAD.SIGN = MD5(bodyStr) // Md5加密
  dataJson.REQ_BODY = sortJson
  let request = JSON.stringify(dataJson)
  // console.log('-----未加密数据----')
  // console.log(request)

  // let key = CryptoJS.enc.Utf8.parse(pwd)
  // let encryptedData = CryptoJS.AES.encrypt(request, key, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7
  // })
  // let cryptRequest = encryptedData.toString()

  // console.log('-----AES----------')
  // console.log(cryptRequest)
  return request
  // return cryptRequest
}

export default encrypt
