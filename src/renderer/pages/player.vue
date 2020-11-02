<template>
    <section class="state-design">
        <el-button class="top-btn-back" @click="goBack" v-show="!editorShow" v-if="$route.path!='/'" size="mini">返回</el-button>
        <div class="state-design-tips" v-if="!editorShow">
            <el-button icon="el-icon-folder-opened" @click="buttonEvent('open')">选择测试状态机</el-button>
        </div>
        <div class="editor-wrap" v-else>
            <div style="float: left; padding-top: 5px; padding-left: 10px;"><el-button @click="editorShow=false" size="mini">返回</el-button></div>
            <div style="height:70%; width:100%; border:0.5px solid red;overflow-y: scroll;">
              <div id="statePlayer" style="float: left; padding-top: 5px; padding-bottom: 5px; padding-left: 10px;">
                <div style=" display:inline-block; margin-right: 28px;"><i class="el-icon-circle-check-outline"></i>&nbsp;{{connectStateTips}}</div>
                <el-button size="primary" @click="onSubmit">{{btnInfo}}</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <!--span class="text">平台服务地址：<i>{{serverInfo}}</i></span-->
                <span class="text">平台服务地址：<input v-model.trim="serverInfo" placeholder="127.0.0.1"></input></span>&nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="success" @click="onUpdateXmlConf">同步更新最新状态机配置信息</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="success" @click="onReStartYSOS">重启平台服务</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="success" @click="onStopYSOS">停止平台服务</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <el-dropdown split-button type="primary" @command="handleCommand">
                  请选择触发事件
                  <el-dropdown-menu slot="dropdown" >
                    <el-dropdown-item v-for="(item,index) in eventsList" :key="index" :command="item" >{{item}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <state-group ref="state-group" :mode="mode" :visible="editorShow" :stateListGroups="stateListGroups"></state-group>
            </div>
            <el-divider></el-divider>
            <div id="stateMess" style="float: left; padding-top: 5px; padding-left: 10px; height:23%; width:100%; border:0.5px solid;overflow-y: scroll;">
              <span>==============================================【 server  start 】============================================</span><br/>
              <!--p>{{logInfo}}</p-->
          </div>
          <socket-client ref="mySocketClient" @getYSOSStatus="showOntimeStatusInfo"/>
        </div>
    </section>
</template>
<script>
import Vue from 'vue'
import {api,HOST_HOLOWEB} from '@/network/api'
import { isEmpty, isArray } from "@/public/util"
import {remote} from 'electron'
import stateGroup from '@/components/stateMachinePlayer/stateGroup'
import fs from 'fs'

import socketClient from '@/components/state-socket/socket-client'


function openDialog(){
    return  remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['json'] }
          ]
    });
}

export default {
    components: {
      stateGroup,
      socketClient
    },
    props: [],
    data () {
      return {
        editorShow: false,
        mode: "add",
        savePath: "",
        stateListGroups: [],
        eventsList: [],
        stateNameList: [],
        serverInfo: '127.0.0.1',
        btnInfo: '连接平台服务',
        connectState: false,
        connectStateTips: '未连接',
        message: 'logcontent message ...',
        inputContent: '123123123',
        stateJsonData: '',
        currentEvent: ''
      }
    },
    created() {

    },
    beforeMount () {

    },
    methods: {
      goBack(){
        this.$router.go(-1)
      },
      handleCommand (command) {
        this.doEventAction(command)
      },
      onSubmit () {
        console.info('on Submit for dosomething')
        if (!this.connectState)
        {
          this.btnInfo = '断开平台服务'
          this.connectState = true
          this.connectStateTips = '连接建立中...'
          this.connect()
        } else {
          this.btnInfo = '连接平台服务'
          this.connectState = false
          this.connectStateTips = '连接已关闭'
          this.disconnect()
        }
      },
      connect () {
        this.showOntimeStatusInfo({status_code:'0', status_info: '建立平台通讯...'})
        console.info('**********************')
        this.message = 'connect success !!!'
        this.$refs.mySocketClient.connectSocket(this.serverInfo)
      },
      disconnect () {
        this.showOntimeStatusInfo({status_code:'0', status_info: '主动关闭平台通讯 !!!'})
        this.message = 'disconnect success !!!'
        this.$refs.mySocketClient.disConnectSocket()
        this.connectStateTips = '连接已关闭'
      },
      // 同步平台服务建立状态到进度提示
      showOntimeStatusInfo (status) {
        console.info('【debug】------当前平台更新状态 YSOSStatus：', status)
        if (status.status_code === '1F') {
          this.connectStateTips = '连接服务失败'
        } else if (status.status_code === '0' || status.status_code === '1S') {
          
        } else {
          this.connectStateTips = '连接成功'
        }
        this.message = '[debug] ' + status.status_info
        this.updateLogInfo(this.message)

        // 同步更新状态机样式
        if (status.status_code === '1RSS') {
          var tmpState = status.state_name  
          console.info(tmpState)
          if (tmpState.lastIndexOf('@') !== -1){
            tmpState = tmpState.substr(tmpState.lastIndexOf('@') + 1)
          }
          this.$refs["state-group"].updateStateGroup(tmpState)
        } else if (status.status_code === '1RSF') {
          this.$refs["state-group"].updateStateGroup(tmpState)
        } else if (status.status_code === '1RES') {
          if (this.currentEvent !== '') {
            this.$refs["state-group"].updateStateGroup4Event(this.currentEvent)
          }
        }
      },
      doEventAction (event) {
        if (!this.connectState) {
          this.message = '[debug] 平台通讯服务未建立，请先建立平台服务后再试！' 
          this.updateLogInfo(this.message)
          return
        }
        console.log('【debug】------向平台发送事件 event：', event)
        let tempArr = event.split(':')
        let tempStr = tempArr.length > 1 ? tempArr[1].trim() : tempArr[0].trim()
        this.message = '[debug] 触发事件：' + tempStr
        this.updateLogInfo(this.message)
        this.currentEvent = tempStr
        this.$refs.mySocketClient.generateEvent(tempStr)
        
      },
      updateLogInfo (content) {
        console.log(content)
        // 追加内容方法分享
        var fnode = document.getElementById('stateMess')
        var pnode = document.createElement('p')
        // var brn = document.createElement('br')
        var textnode = document.createTextNode(content)
        pnode.appendChild(textnode)
        fnode.appendChild(pnode)
        // fnode.appendChild(brn)
      },
      buttonEvent(type){
        if (type === "add") {
          // 编辑器打开
          this.mode = "add";
          this.editorShow = true;
        } else {
          // 打开文件选择并加载...
          var obj = openDialog() 
          if(obj){
            let path = obj[0];
            if(path){
              let stateJson;
              try {
                  stateJson = JSON.parse(fs.readFileSync(path));
                  this.stateJsonData = JSON.stringify(stateJson);
              }
              catch(err){
                  this.$message.error(err.message);
              }
              console.log(stateJson,"下一步")
              if(stateJson){
                  //读取解析
                  this.savePath = path;
                  let stateListGroups = this.readStateData(stateJson);
                  console.log(stateListGroups);
                  //编辑器打开
                  this.mode = "edit";
                  this.stateListGroups = stateListGroups;
                  this.editorShow = true;

              }
            }
          }
        }
      },
      readStateData (data) {
        let groups = [];
        // main
        groups.push({
          tapName: "主状态机",
          stateName: data.stateName,
          parentStateName: "",
          stateLevel: data.stateLevel,
          dataString: this.getDataString(data.stateInfo),
          stateNameArray: this.getStateDataArray(data.stateInfo), // add
          eventNameArray: this.getEventDataArray(data.stateInfo) // add
        })
        for (let i = 0; i < data.stateInfo.length; i++) {
          let stateInfo = data.stateInfo[i];
          if (!isEmpty(stateInfo.children)) {
            let childData = stateInfo.children[0];
            groups.push({
              tapName: childData.stateName,
              stateName: childData.stateName,
              parentStateName: childData.parentState,
              stateLevel: childData.stateLevel,
              dataString: this.getDataString(childData.stateInfo),
              stateNameArray: this.getStateDataArray(childData.stateInfo), // add 
              eventNameArray: this.getEventDataArray(childData.stateInfo) // add
            })
          }
        }
        return groups;
      },
      getDataString (stateInfo) {
        let stringArray = [];
        for (let item of stateInfo) {
          stringArray.push(JSON.parse(item.extras));
          if (!isEmpty(item.conditionList)) {
            item.conditionList.map( cl => {
              stringArray.push(JSON.parse(cl.extras))
              // add
              this.eventsList.push(((cl.type === '') ? 'event' : cl.type)  + ' : ' + cl.name)
            })
          }
        }
        return JSON.stringify(stringArray)
      },
      // add
      getStateDataArray (stateInfo) {
        let stringArray = [];
        for (let item of stateInfo) {
          stringArray.push(item.name)
        }
        return stringArray
      },
      // add
      getEventDataArray (stateInfo) {
        let stringArray = [];
        for (let item of stateInfo) {
          if (!isEmpty(item.conditionList)) {
            item.conditionList.map( cl => {
              // add
              stringArray.push(cl.name)
            })
          }
        }
        return stringArray
      },
      saveStateData () {
        let stateData = this.$refs["state-group"].getData();
        if (!stateData[0].dataString||stateData[0].dataString === "[]") {
          this.$message.error("请先至少绘制一条状态流程");
          return
        }
        console.log(stateData);
        if (this.savePath) {
          fs.writeFileSync(this.savePath, this.dataRecombination(stateData));
          this.$message.success("保存成功");
        } else {
          // 选择文件路径
          remote.dialog.showSaveDialog(remote.getCurrentWindow(),{
            title: "文件存储为",
            filters: [
              { name: 'ALL Files', extensions: ['json'] }
            ]
            }, filename => {
              if (filename) {
                this.savePath = filename;
                fs.writeFileSync(filename, this.dataRecombination(stateData));
                this.$message.success("保存成功");
              } else {
                resolve("取消");
              }
            })
        }
        // this.dataRecombination(stateData);
      },
      dataRecombination (stateData) {
        let stateArray = [];
        stateData.forEach((item, index) => {
          stateArray.push(this.buildStateData(item,index));
        })
        // console.log(stateArray,"stateArray")
        // 处理层级
        let SAVE_JSON = stateArray[0];
        for (let item of SAVE_JSON.stateInfo) {
          item.children = stateArray.filter( d => item.name == d.stateName)
        }
        return JSON.stringify(SAVE_JSON)
        // console.log(JSON.stringify(SAVE_JSON))
      },
      buildStateData (data, index) {
        let json = {
          "stateName": data.stateName,
          "stateLevel": data.stateLevel,
          "parentState": data.parentStateName,
          "stateInfo":[]
        }
        // dataString分组
        let dataArray = JSON.parse(data.dataString);
        let geometryGroups = [];
        let arrowGroups = [];
        for (let item of dataArray) {
          let obj = item;
          if (obj.type == "arrow") {
            arrowGroups.push(obj);
          } else {
            geometryGroups.push(obj);
          }
        }
        let stateInfo = [];
        for (let i = 0; i < geometryGroups.length; i++) {
          let geometryData = geometryGroups[i];
          let info = {
            id: geometryData.gid,
            name: geometryData.state.name,
            default: geometryData.state.default,
            extras: JSON.stringify(geometryData)
          }
          info.conditionList = this.getConditionList(geometryData,arrowGroups,geometryGroups);
          stateInfo.push(info);
        }
        json.stateInfo = stateInfo;
        return json
      },
      getConditionList (geometryData, arrowGroups, geometryGroups) {
        let list = [];
        for (let i = 0; i < arrowGroups.length; i++) {
          let arrowData = arrowGroups[i];
          if (arrowData.startGid === geometryData.gid) {
            let nextState = this.getGeometryDataByGid(arrowData.endGid,geometryGroups).state.name;
            list.push({
              id: arrowData.gid,
              name: arrowData.state.name,
              type: arrowData.state.type,
              extras: JSON.stringify(arrowData),
              nextState: nextState
            })
          }
        }
        return list
      },
      getGeometryDataByGid (gid, groups) {
        for (let i = 0; i < groups.length; i++) {
          if(groups[i].gid === gid) {
            return groups[i]
          }
        }
      },
      onUpdateXmlConf () {
        if (this.stateJsonData) {
          // 发起get请求
          this.$http.post('http://' + this.serverInfo + ':4567/transfer',  'jsondata=' + this.stateJsonData).then((response) => {
            // then 指成功之后的回调 (注意：使用箭头函数，可以不考虑this指向)
            console.log(response);
            console.log(response.data);
            alert(response.data.code + '    ' + response.data.msg);
            // this.resData = response.data;
          }).catch((error) => {
            // catch 指请求出错的处理
            console.log('通讯服务异常：' + error);
            alert('通讯服务异常：' + error);
          });
        }
      },
      onReStartYSOS () {
        // 发起get请求
        this.$http.get('http://' + this.serverInfo + ':4567/startup', {
          // get传递的query参数（传递的参数应与后台人员协商，本次模拟不做限制，不做判断）
          params: {
          }
        }).then((response) => {
          // then 指成功之后的回调 (注意：使用箭头函数，可以不考虑this指向)
          console.log(response);
          console.log(response.data);
          // this.resData = response.data;
          alert(response.data.msg);
        }).catch((error) => {
          // catch 指请求出错的处理
          console.log('通讯服务异常：' + error);
          alert('通讯服务异常：' + error);
        });
      },
      onStopYSOS () {
        // 发起get请求
        this.$http.get('http://' + this.serverInfo + ':4567/stop', {
          // get传递的query参数（传递的参数应与后台人员协商，本次模拟不做限制，不做判断）
          params: {
          }
        }).then((response) => {
          // then 指成功之后的回调 (注意：使用箭头函数，可以不考虑this指向)
          console.log(response);
          console.log(response.data);
          alert(response.data.msg);
          // this.resData = response.data;
        }).catch((error) => {
          // catch 指请求出错的处理
          console.log('通讯服务异常：' + error);
          alert('通讯服务异常：' + error);
        });
      }
    },
    watch: {

    }
}
</script>

<style lang="less">
    .state-design{
        width: 100%;
        height: 100%;
        .state-design-tips{
            width: 100%;
            height: 50px;
            text-align: center;
            position: absolute;
            left: 0;
            top: 50%;
            margin-top: -25px;
            .el-button{
                width: 180px;
                height: 50px;
                i{
                    font-size: 18px;
                }
                span{
                    font-size: 18px;
                }
            }
        }
        .editor-wrap{
            width: 100%;
            height: 100%;
        }
    }
    .top-btn-back{
        position: fixed;
        z-index: 999;
        top: 15px;
        right: 10px;
    }
</style>
