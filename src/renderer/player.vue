<template>
<div>
  <el-container class="home">
    <el-main class="main">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="状态调试" name="1"><basicstate ref="runState" v-bind:logInfo="message" @getTemplateEvent="doEventAction"></basicstate></el-tab-pane>
        <el-tab-pane label="配置编辑" name="2"><editconf ref="editConf" ></editconf></el-tab-pane>
        <!--el-tab-pane label="更多..." name="3"></el-tab-pane-->
      </el-tabs>
    </el-main>
    <el-footer class="footer">
      <div style=" display:inline-block; margin-right: 28px;"><i class="el-icon-circle-check-outline"></i>&nbsp;{{connectStateTips}}</div>
      <el-button size="small" @click="onSubmit">{{btnInfo}}</el-button>
      <!--span class="text">平台服务地址：<i>{{serverInfo}}</i></span-->
      <span class="text">平台服务地址：<input v-model.trim="serverInfo" placeholder="127.0.0.1"></input></span>
      <span class="text">版本号：<i>{{version}}</i></span>
    </el-footer>
  </el-container>
  <socket-client ref="mySocketClient" @getYSOSStatus="showOntimeStatusInfo"/>
</div>
</template>
<script>
import Vue from 'vue'
import socketClient from '@/components/state-socket/socket-client'
import basicstate from '@/pages/basicstate'
import editconf from '@/pages/editconf'

export default {
    components: {
      socketClient,
      basicstate,
      editconf
    },
    props: [],
    data () {
      return {
          activeName: '1',
          serverInfo: '127.0.0.1',
          version: '1.1.2020.1',
          btnInfo: '连接平台服务',
          connectState: false,
          connectStateTips: '未连接',
          message: 'logcontent message ...',
          inputContent: '123123123'
      }
    },
    created() {
    },
    beforeMount () {
    },
    methods: {
        handleClick (tab, event) {
          console.log(tab, event)
        },
        onSubmit () {
          console.info('on Submit for dosomething')
          if(!this.connectState)
          {
            this.btnInfo = '断开平台服务'
            this.connectState = true
            this.connectStateTips = '连接成功'
            this.connect()
          } else {
            this.btnInfo = '连接平台服务'
            this.connectState = false
            this.connectStateTips = '连接已关闭'
            this.disconnect()
          }
        },
        connect () 
        {
          this.showOntimeStatusInfo('建立平台通讯...')
          console.info('**********************')
          this.message = 'connect success !!!'
          this.$refs.mySocketClient.connectSocket(this.serverInfo)
        },
        disconnect () 
        {
          this.showOntimeStatusInfo('主动关闭平台通讯 !!!')
          this.message = 'disconnect success !!!'
          this.$refs.mySocketClient.disConnectSocket()
        },
        // 同步平台服务建立状态到进度提示
        showOntimeStatusInfo (status) {
          console.info('【debug】------当前平台更新状态 YSOSStatus：', status)
          this.message = '[debug] ' + status
          this.$refs.runState.updateLogInfo(this.message)
        },
        doEventAction (event) {
          console.info('【debug】------向平台发送事件 event：', event)
          this.message = '[debug] 触发事件：' + event
          this.$refs.runState.updateLogInfo(this.message)
          this.$refs.mySocketClient.generateEvent(event)
        }
    },
    watch: {
    }
}
</script>

<style lang="stylus">
.home
  height 100%
  width 100%
  .main
    padding 0
    height 93.5%!important
    margin-top: 63px;
    overflow hidden
    .el-tabs__header
     margin-bottom 18px
    .el-tabs__nav-wrap
      background-color #ffffff
      box-shadow 0 6px 10px #e7e7e8
      .el-tabs__nav-scroll
        margin-left: 197px;
        .el-tabs__nav
          .el-tabs__item
            padding 0 69px!important
            line-height 66px!important
            height 66px!important
            font-size 28px
            color #666
          .is-active
            color #42a0f5!important
          .el-tabs__active-bar
            box-sizing border-box
            padding 0.01 69px!important
            background-color #42a0f5
            border-left 29px solid #ffffff
            border-right 29px solid #ffffff
            height 3px
    .el-tabs__nav-wrap::after
      content ""
      position absolute
      left 0
      bottom 0
      width 100%;
      height 1px;
      background-color #ffffff
      z-index 2
  .footer
    background url("~@/assets/img/footerBG.png") no-repeat
    background-size 100% 100%
    height 6.5%!important
    line-height 74px
    text-align left
    padding-left  17px
    box-sizing border-box
    color #fff
    font-size 22px
    .el-icon-circle-check-outline
      font-size: 36px;
    .el-button
      height 40px
      padding 0
      color #439ff5
      font-size 22px
      margin-right  68px
      font-weight normal
      width: 80px;
    .text
      margin-right:72px
      i
        font-style:normal

.input:focus
    border-color: #66afe9
    outline: 0
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)
</style>
