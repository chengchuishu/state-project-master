<template>
  <div class="basicstate">
      <div class="contents-top">
        <div id="statePlayer" style="height:70%; width:100%; border:0.5px solid;">
          <el-dropdown split-button type="primary" @command="handleCommand">
                <!--span class="el-dropdown-link">请选择触发事件<i class="el-icon-arrow-down el-icon--right"></i></span-->
                请选择触发事件
                <el-dropdown-menu slot="dropdown" >
                    <el-dropdown-item v-for="(item,index) in eventsList" :key="index" :command="item" >{{item}}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <!--el-button icon="el-icon-folder-opened" @click="buttonEvent('open')">打开</el-button-->
            <!--div class="editor-wrap">
              <state-group ref="state-group" :mode="mode" :visible="editorShow" :stateListGroups="stateListGroups"></state-group>
            </div-->
        </div>
        <el-divider></el-divider>
          <div id="stateMess" style="height:23%; width:100%; border:0.5px solid;overflow-y: scroll;">
            <span>==============================================【 server  start 】============================================</span><br/>
            <!--p>{{logInfo}}</p-->
          </div>
      </div>
  </div>
</template>
<script>
import { isEmpty, isArray } from '@/public/util'
import {remote} from 'electron'
import stateGroup from '@/components/stateMachinePlayer/stateGroup'
import fs from 'fs'

function openDialog(){
    return  remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['json'] }
          ]
    });
}

export default {
  name: 'basicstate',
  props: {
    logInfo: {
      type: String,
      default: 'log content init ...'
    }
  },
  data () {
    return {
      editorShow: true,
      mode: 'add',
      eventsList:['e1', 'e2', 'e3'],
      stateListGroups: []
    }
  },
  components: {
    stateGroup
  },
  methods: {
    updateLogInfo (content) {
      console.info(content)
      // 追加内容方法分享
      var fnode = document.getElementById('stateMess')
      var pnode = document.createElement('p')
      // var brn = document.createElement('br')
      var textnode = document.createTextNode(content)
      pnode.appendChild(textnode)
      fnode.appendChild(pnode)
      // fnode.appendChild(brn)
    },
    handleCommand (command) {
      this.$emit('getTemplateEvent', command)
    },
    buttonEvent (type) {
      if (type=='add') {
        // 编辑器打开
        this.mode = 'add';
        this.editorShow = true;
      } else {
        //打开文件选择并加载...
        let path = openDialog()[0];
        if (path) {
          let stateJson;
          try {
            stateJson = JSON.parse(fs.readFileSync(path));
          }
          catch (err) {
            this.$message.error(err.message);
          }
          console.log(stateJson,'下一步')
          if (stateJson) {
            // 读取解析
            this.savePath = path;
            let stateListGroups = this.readStateData(stateJson);
            console.log(stateListGroups);
            // 编辑器打开
            this.mode = 'edit';
            this.stateListGroups = stateListGroups;
            this.editorShow = true;
          }
        }
      }
    },
    readStateData (data) {
      let groups = [];
      // main
      groups.push({
        tapName: '主状态机',
        stateName: data.stateName,
        parentStateName: '',
        stateLevel: data.stateLevel,
        dataString: this.getDataString(data.stateInfo)
      })
      for (let i = 0; i < data.stateInfo.length; i++) {
        let stateInfo = data.stateInfo[i]
        if (!isEmpty(stateInfo.children)) {
          let childData = stateInfo.children[0];
          groups.push({
            tapName: childData.stateName,
            stateName: childData.stateName,
            parentStateName: childData.parentState,
            stateLevel: childData.stateLevel,
            dataString: this.getDataString(childData.stateInfo)
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
          })
        }
      }
      return JSON.stringify(stringArray)
    }
  }
}
</script>
<style>
  .basicstate{
    height:1100px;
    box-shadow: 0 4px 20px #e7e7e8;
    margin: 12px 176px 10px;
    background:#fff;
    border-radius: 10px;
  }
  .basicstate .contents-top{
    width:100%;
    height:95%;
    background:#fff no-repeat center top;
    position: relative;
  }
  .item{
    position: absolute;
    width:327px;
    background:url(~@/assets/img/itembg.png) no-repeat;
    overflow: hidden;
  }
  .item .fl{
    float: left;
  }
  .item .fr{
    float: right;
  }
  .start{
    color:#666666;
    font-size: 24px;
    text-align: left;
  }
  .value{
    color:#439ff5;
    font-size: 24px;
    text-align: left;
  }
  .walking_mode{
    background-position: right 15px;
    left:256px;
    top:292px;
  }
  .electric{
    background-position: right 15px;
    left:256px;
    top:426px;
  }
  .switch{
    background-position: left 15px;
    right:239px;
    top:347px;
    width:385px;
  }
  .charging_state{
    background-position: left 15px;
    right:289px;
    top:522px;
    width:339px;
  }
  .content-bottom{
    width:100%;
    height:199px;
    margin: 0;
    background:#f8f9fa;
    border-top:1px solid #e7e8ea;
    box-sizing: border-box;
    padding: 21px 0 0 82px;
    line-height: 69px;
    font-size:24px;
    color:#666666;
  }
  .content-bottom li{
    float: left;
    width:33.33333333%;
    list-style: none;
  }
  .content-bottom li span{
    width: 130px;
    display: inline-block;
    text-align: right;
  }

  .el-dropdown {
    vertical-align: top;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #e7e8ea;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .editor-wrap {
    width: 100%;
  }
</style>