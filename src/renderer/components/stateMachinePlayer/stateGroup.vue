<template>
    <div class="state-group">
        <div class="menu-header">
            <ul class="menu-label">
                <li v-for="(item,index) in stateList" @click="tapChange(item,index)" :class="{active: stateIndex==index}">{{item.tapName}}<i v-if="index!=0" @click="tapClose" class="el-icon-error"></i></li>
            </ul>
        </div>
        <div class="state-list">
                <state-machine-design
                    ref="state-machine-design"
                    :stateName="currentState.stateName"
                    :parentStateName="currentState.parentStateName"
                    :stateLevel="currentState.stateLevel"
                    @editChild="editChildState"
                ></state-machine-design>
        </div>
    </div>
</template>
<script>

import stateMachineDesign from './stateMachine'
import _ from 'lodash'
export default {
    name: "stateGroup",

    props: {
        mode: String,
        stateListGroups: Array,
        visible: Boolean
    },
    components: {
        stateMachineDesign
    },
    data() {
        return {
            stateList: [{
                tapName: "主状态机",
                stateName: "main",
                parentStateName: "",
                stateLevel: 1,
                dataString: null,
                stateNameArray: [],
                eventNameArray: []
            }],
            stateIndex: 0,
            currentState: {},
            currentStateName: '',
            currentEventName: ''
        }
    },
    mounted(){
        this.initStateGroup();
    },
    methods: {
        editChildState(data,mainInfo){
            let index = _.findIndex(this.stateList,{stateName: data.state.name});
            if(index == -1){
                //新窗口
                this.stateList.push({
                    tapName: data.state.name,
                    stateName: data.state.name,
                    parentStateName: "main",
                    stateLevel: 2,
                    dataString: null,
                    stateNameArray: [],
                    eventNameArray: []
                })
                this.stateIndex = this.stateList.length - 1;
            }else{
                this.stateIndex = index;
            }
            //let
            //this.stateList
        },
        tapChange(item,index){
            this.stateIndex = index;
        },
        tapClose(){
            this.stateIndex = 0;
        },
        getData(){
            //保存下当前
            this.stateList[this.stateIndex].dataString = this.$refs["state-machine-design"].buildJSON();
            return this.stateList
        },
        initStateGroup(){
            if(this.mode == "add"){
                this.stateList = [{
                    tapName: "主状态机",
                    stateName: "main",
                    parentStateName: "",
                    stateLevel: 1,
                    dataString: null,
                    stateNameArray: [],
                    eventNameArray: []
                }]
            }else if(this.mode == "edit"){
                //接收数据
                this.stateList = this.stateListGroups;
            }
            console.info('==================', this.stateList)
            this.stateIndex = 0;
            this.currentState = this.stateList[0];
            this.$refs["state-machine-design"].loadData(this.currentState.dataString);
        },
        updateStateGroup (state) {
          console.info('[1]---- state : ', state)
          this.currentStateName = state
          let selectStateIndex = this.stateIndex
          console.info('[1]---- selectStateIndex : ', selectStateIndex)
          for (let t = 0; t < this.stateListGroups.length; t++) 
          {
              if (this.stateListGroups[t].stateNameArray.indexOf(state) !== -1){
                  selectStateIndex = t
              }                          
          }
          console.info('[111]---- selectStateIndex : ', selectStateIndex)
          console.info('[111]---- this.stateIndex : ', this.stateIndex)
          if (selectStateIndex !== this.stateIndex){
              this.stateIndex = selectStateIndex
          }
          setTimeout(() => {
            this.$refs["state-machine-design"].updateStateDiv(state)    
            this.$refs["state-machine-design"].updateEventDiv4Arrow(this.currentEventName, 'blue')
          }, 300);
        },
        updateStateGroup4Event (eventName) {
          console.info('[1]---- eventName : ', eventName)
          this.currentEventName = eventName
          let selectStateIndex = this.stateIndex
          console.info('[1]---- selectStateIndex : ', selectStateIndex)
          //* add
          for (let t = 0; t < this.stateListGroups.length; t++) 
          {
              if (this.stateListGroups[t].eventNameArray.indexOf(eventName) !== -1){
                  selectStateIndex = t
              }                          
          }
          console.info('[111]---- selectStateIndex : ', selectStateIndex)
          console.info('[111]---- this.stateIndex : ', this.stateIndex)
          if (selectStateIndex !== this.stateIndex){
              this.stateIndex = selectStateIndex
          }
          setTimeout(() => {
            this.$refs["state-machine-design"].updateEventDiv4Arrow(eventName)    
          }, 300);
          //*/
        }
    },
    computed: {

    },
    watch: {
        stateIndex(newVal,oldVal){
            this.stateList[oldVal].dataString = this.$refs["state-machine-design"].buildJSON();
            this.currentState = this.stateList[newVal];
            // 加载
            // console.info('[1]---- this.currentState.dataString : ', this.currentState.dataString)
            this.$refs["state-machine-design"].loadData(this.currentState.dataString);
            if (this.currentStateName !== '') {
                setTimeout(() => {
                  this.$refs["state-machine-design"].updateStateDiv(this.currentStateName)    
                }, 200);
            }
            if (this.currentEventName !== '') {
                setTimeout(() => {
                  this.$refs["state-machine-design"].updateEventDiv4Arrow(this.currentEventName)    
                }, 200);
            }
        },
        mode(val){

        },
        visible(val){
            if(val)this.initStateGroup();
        }
    }
}

</script>

<style lang="less" scoped>
.state-group {
    width: 100%;
    .state-list{

    }
    .menu-header{
        margin: 5px 0;
        width: 100%;
        height: 32px;
        border: 1px solid #ddd;
        overflow: hidden;
        padding: 2px;
        .design-info{
            float: right;
            line-height: 30px;
            padding-right: 10px;
        }
        .menu-label{
            width: calc(100% - 120px);
            float: left;
            cursor: default;
            li{
                float: left;
                padding-left: 10px;
                padding-right: 30px;
                height: 26px;
                line-height: 26px;
                //background: #ddd;
                border: 1px solid #ddd;
                margin-right: 5px;
                position: relative;
                &:first-child{
                    padding-right: 10px;
                }
                i{
                    position: absolute;
                    top: 7px;
                    right: 5px;
                    font-size: 14px;
                    color: #ccc;
                    cursor: pointer;
                    &:hover{
                        color: #999;
                    }
                }
                &.active{
                    background: #409EFF;
                    color: #ffffff;
                    i{
                        color: #ffffff;
                        &:hover{
                            color: #f5f5f5;
                        }
                    }
                }

            }
        }
    }
}

</style>
