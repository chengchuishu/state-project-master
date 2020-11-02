<template>
  <div class="socket-client"></div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import Message from './message'
import unMatch from './unMatch'
import YSOS from '@/constant/ysos'
import {getMsges} from '@/utils/io'
import {GBK2UTF8, addPreZero, jsonToObj} from '@/utils/str'
// node net  module
const net = require('net')

// socket client object
var client = null

var sessionId = ''
var serialNumber = 0

// YSOS 状态切换计数
let switchCount = 0
// TDOS重连次数，尝试5次
let tryTimes = 0

let sum = 0
let snum = 0
let fnum = 0

export default {
  name: 'chat',
  data () {
    return {
      socketServerIP: '127.0.0.1'
    }
  },
  computed: {
    ...mapState({
    })
  },
  created () {
    this.init()
  },
  beforeDestroy () {
    this.offBusEvent()
    if (client) {
      client.end()
      client = null
    }
  },
  methods: {
    ...mapMutations({
    }),
    init () {
      this.onBusEvent()
    },
    // 连接通信
    connectSocket (serverIP) {
      console.log('connectSocket ...', serverIP)
      this.socketServerIP = serverIP
      client = new net.Socket()
      // 监听连接成功
      client.on('connect', () => {
        this.$emit('getYSOSStatus', {status_code:'1S', status_info: '平台服务建立成功  socket server connect success '})
        console.log('socket connect success')
        const message = new Message()
        client.write(message.msgToBuffer())
      })
      // 监听服务端发送的消息
      client.on('data', data => {
        const msges = getMsges(data)
        for (let msg of msges) {
          const message = GBK2UTF8(msg)
          this.$logger.info('receive message:', message)
          this.handleServerMsg(jsonToObj(message))
        }
      })
      // 监听连接超时
      client.on('timeout', () => {
        this.$emit('getYSOSStatus', {status_code:'1F', status_info: '平台服务建立超时  socket server connect timeout...'})
        this.$logger.warn('socket connect timeout...')
        console.log('socket connect timeout...')
        tryTimes = 0
        switchCount = 0
        sessionId = ''
        this.retry()
      })
      // 监听连接失败
      client.on('error', error => {
        //this.$bus.$emit('connect-status', 'error')
        this.$emit('getYSOSStatus', {status_code:'1F', status_info: '平台服务建立异常 socket server error...'})
        console.log('socket error:', error.message)
        this.$logger.error('socket error:', error.message)
        tryTimes = 0
        switchCount = 0
        sessionId = ''
        this.retry()
      })
      this.connect()
      // TODO: 与平台服务建立连接成功 1-通讯建立 2-初始化完成 3-签到完成
    },
    disConnectSocket () {
      console.log('disConnectSocket ...')
      sessionId = ''
      this.$emit('getYSOSStatus', {status_code:'1C', status_info: '关闭平台服务 socket server disConnectSocket success '})
      if (client) {
        client.end()
        client = null
      }
    },
    retry () {
      tryTimes++
      if (tryTimes > 9) {
        return
      }
      this.reconnect()
    },
    // 连接
    connect () {
      console.log('client--->', client)
      client.connect('6002', this.socketServerIP)
    },
    // 重新连接
    reconnect () {
      if (client) {
        this.connect()
      }
    },
    // 处理服务端返回的消息
    handleServerMsg (msg) {
      const serviceName = msg.content.param.service_name
      if (sessionId === '') {
        sessionId = msg.header.session_id
      }
      serialNumber = addPreZero(parseInt(msg.header.serial_number) + 1)
      this.$logger.info('receive service name:', serviceName)
      this.$emit('getYSOSStatus', {status_code:'1R', status_info: '接收平台服务消息 receive service name: ' + serviceName + ' success '})
      let description = ''
      switch (serviceName) {
        // 初始化服务
        case YSOS.PREPARE.INIT:
          description = msg.content.param.result.description
          this.handleInit(description)
          break
        // 切换通知服务
        case YSOS.PREPARE.SWITCH_NOTIFY:
          const stateName = msg.content.param.service_param.state_name
          // 切换服务状态
          this.handleSwitchNotify(sessionId, serialNumber, stateName)
          break
        // 状态切换服务(切换完成)
        case YSOS.PREPARE.SWITCH:
          description = msg.content.param.result.description
          const statusCode = msg.content.param.result.status_code
          const detail = msg.content.param.result.detail
          this.handleSwitch(description, sessionId, serialNumber)
          if (statusCode === '0') {
            // 切换屏保
            // this.handleScreenSaver(detail.cur_state)
            this.$emit('getYSOSStatus', {status_code:'1RSS', state_name: detail.cur_state, status_info: '平台切换状态执行  Switch to state[' + detail.cur_state + '] success '})
          } else {
            this.$emit('getYSOSStatus', {status_code:'1RSF', state_name: detail.cur_state, status_info: '平台切换状态执行  Switch to state[' + detail.cur_state + '] failed !!! '})
          }
          break
        // 状态准备完毕服务
        case YSOS.PREPARE.READY:
          description = msg.content.param.result.description
          this.handleReady(description, sessionId, serialNumber)
          this.$emit('getYSOSStatus', {status_code:'1R', status_info: '平台切换状态完成  do ready success '})
          break
        // 事件通知服务
        case YSOS.PREPARE.EVENT_NOTIFY:
          const serviceParam = msg.content.param.service_param
          this.$logger.info('receive service param:', serviceParam)
          console.log('receive service param---->', msg)
          this.handleEventNotify(serviceParam)
          break
        // 心跳包
        case YSOS.PREPARE.HEART_BEAT:
          description = msg.content.param.result.description
          this.handleHeartbeat(description, sessionId, serialNumber)
          break
        // 获取数据
        case YSOS.PREPARE.GET_DATA:
          description = msg.content.param.result.description
          const statusCodeV = msg.content.param.result.status_code
          const detailV = msg.content.param.result.detail
          console.log('msg.content.param.result----->', msg.content.param.result)
          if (statusCodeV === '0') {
            // 获取查询结果成功，--签到成功
            this.handleGetData(detailV.data)
            this.$bus.$emit('kill-explorer')
          } else {
            // TODO: 与平台服务建立连接成功 1-通讯建立 2-初始化完成 3-签到完成
            this.$bus.$emit('kill-explorer')
          }
          break
      }
    },
    // 获取平台查询数据
    handleGetData (data) {
      console.log(data)
    },
    handleSinginResultEvent (data) {
      console.log(data)
    },
    // 处理初始化服务
    handleInit (description) {
      console.log('description:', description)
    },
    // 处理切换通知服务
    handleSwitchNotify (sessionId, serialNumber, stateName) {
      this.$emit('getYSOSStatus', {status_code:'1R', status_info: '平台切换状态准备  SwitchNotify stateName:[' + stateName + ']'})
      const message = new Message()
      message.header.type = YSOS.EMIT.TYPE_SWITCH
      message.header.session_id = sessionId
      message.header.serial_number = serialNumber
      message.content.param.service_name = YSOS.EMIT.SERVICE_NAME_SWITCH
      message.content.param.service_param = {
        'state_name': stateName
      }
      client.write(message.msgToBuffer())
      this.$logger.info('emit switch message:', message.toJsonString())
    },
    // 切换屏保
    handleScreenSaver (stateName) {
      this.$logger.info('新平台要切换的服务状态:', stateName)
    },
    // 处理状态切换服务(切换完成事件)
    handleSwitch (description, sessionId, serialNumber) {
      console.log('description:', description)
      if (description === 'succeeded') {
        const message = new Message()
        message.header.type = YSOS.EMIT.TYPE_READY
        message.header.session_id = sessionId
        message.header.serial_number = serialNumber
        message.content.param.service_name = YSOS.EMIT.SERVICE_NAME_READY
        message.content.param.service_param = {}
        client.write(message.msgToBuffer())
        this.$logger.info('emit ready message:', message.toJsonString())
      }
    },
    // 处理状态准备完毕服务
    handleReady (description) {
      console.log('description:', description)
      // this.$bus.$emit('connect-status', 'success')
    },
    // 处理事件通知服务
    handleEventNotify (serviceParam) {
      console.log('EventNotify')
      if (serviceParam.event_name === 'ioctl_result_event') {
        this.$emit('getYSOSStatus', {status_code:'1RES', state_name: '', status_info: '平台响应事件消息 do ioctl event [ioctl_result_event] success '})
      }
    },
    // 处理心跳包
    handleHeartbeat (description) {
      console.log('handleHeartbeat--->', description)
    },
    // 注册事件监听
    onBusEvent () {
      // 连接平台
      /*
      this.$bus.$on('start-connect-ysos', () => {
        this.connectSocket()
      })
      this.$bus.$on('stop-connect-ysos', () => {
        this.disConnectSocket()
      })
      // 切换模式
      this.$bus.$on('change-status-pattern', stateName => {
        // 切换服务状态
        this.handleSwitchNotify(sessionId, addPreZero(parseInt(serialNumber) + 1), stateName)
      })*/
    },
    // 移除事件监听
    offBusEvent () {
      // 切换模式
      // this.$bus.$off('change-status-pattern')
    },
    // 发送消息
    emitMessage (service, params) {
      console.log('service:', service)
      console.log('params:', params)
      serialNumber = addPreZero(parseInt(serialNumber) + 1)
      const message = new Message()
      message.header.type = '31020'
      message.header.session_id = sessionId
      message.header.serial_number = serialNumber
      message.content.param.service_name = service
      message.content.param.service_param = params
      this.$logger.info('message:', message.toJsonString())
      client.write(message.msgToBuffer2())
    },
    // 自定义语音播报内容
    generateEvent (text) {
      this.emitMessage(YSOS.EMIT.CUSTOM, {
        service_name: YSOS.EMIT.TEMPLATE_GENERATE_EVENT,
        service_param: {
          type: text
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
