import axios from 'axios'
import Qs from 'qs'
import encrypt from './encrypt'
import {readLocalFile} from '@/utils/file'

// 项目环境
// let host = ''
// let port = ''

console.log('NODE_ENV:', process.env.NODE_ENV)
// if (process.env.NODE_ENV === 'development') {
//   // 测试环境
//   // host = '139.219.185.33'
//   // port = '8090'
//   host = '139.219.184.144'
//   // host = '192.168.1.41'
//   port = '8080'
// } else {
//   // 生产环境
//   host = '139.219.184.144'
//   port = '8080'
// }
const constant = require('@/constant')
console.log(readLocalFile)
const config = readLocalFile(constant.path.config)
const baseURL = config.baseUrl

// 服务器地址
const server = `http://${baseURL.host}:${baseURL.port}/TBIMPSWEB`
// const server = `http://${baseURL.host}/TBIMPSWEB`
console.log('server address:', server)

const http = axios.create({
  baseURL: server,
  transformRequest: [
    data => {
      data = encrypt(data)
      data = {
        REQ_MESSAGE: data
      }
      data = Qs.stringify(data)
      return data
    }
  ],
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  timeout: 60000
})

export default http
