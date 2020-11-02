<template>
  <div class="basicstate">
      <div class="contents-top">
        <div id="confContent" style="height:99%; width:100%; border:1px solid;">
            <div style="margin-top: 5px;">
                <el-input placeholder="请输入内容" v-model="defInput" class="input-with-select">
                    <el-select v-model="select" slot="prepend" placeholder="请选择" @change="showXmlContent(select)">
                        <el-option v-for="item in xmlFilesData" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
            <div id="xmlContentDiv" style="margin-top: 15px;">
              <xmp><div>{{xmlContent}}</div></xmp>
            </div>
        </div>
      </div>
  </div>
</template>
<script>

// import vkbeautify from 'vkbeautify'
// import vuedataeditor from '@/components/vue_data_editor'
import './vkbeautify'

export default {
  name: 'editconf',
  components: {
  },
  props: {
    logInfo: {
      type: String,
      default: 'log content init ...'
    }
  },
  data () {
    return {
      eventsList: ['e1', 'e2', 'e3'],
      xmlFilesData: [{id:1, name: 'mechanism.xml'},{id:2, name: 'robotterminalapp.xml'}],
      defInput: '',
      select: '',
      xmlContent: '',
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      
    },
    updateLogInfo (content) {
      console.info(content)
      this.appendContent2Div('stateMess', this.content)
    },
    appendContent2Div (divId, appText) {
      // 追加内容方法分享
      var fnode = document.getElementById(divId)
      var pnode = document.createElement("p")
      var brn = document.createElement("br")
      var textnode = document.createTextNode(appText)
      pnode.appendChild(textnode)
      fnode.appendChild(pnode)
      fnode.appendChild(brn)
    },
    showXmlContent (value) {
      console.info(' value:' + value)
      console.info(' select:' + this.select)
      if (this.select === 1) {
        this.xmlContent = '<?xml version=\"1.0\" encoding=\"utf-8\"?><coreframework><mechanism type=\"statemachine\"><name>main</name><state>S1</state><state>S2</state><state>S3</state><transition file=\"transition4main.xml\"/><event>RegDoServiceEvent|StateMachineCommonCallback</event><event>UnregDoServiceEvent|StateMachineCommonCallback</event><event>IOCtl|StateMachineCommonCallback</event><event>Switch|StateMachineCommonCallback</event><event>Ready|StateMachineCommonCallback</event></mechanism></coreframework>'
        this.xmlContent = vkbeautify.xml(this.xmlContent)
      } else if (this.select === 2) {
        this.xmlContent = '<?xml version=\"1.0\" encoding=\"utf-8\"?><coreframework><strategy><name>strategy_name</name><mechanism>mechanism.xml</mechanism><state>S1</state></strategy></coreframework>'
        // this.appendContent2Div('xmlContentDiv', this.xmlContent)
        this.xmlContent = vkbeautify.xml(this.xmlContent)
      } else {}
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
    height:100%;
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
  
  .el-select .el-input {
    width: 230px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>