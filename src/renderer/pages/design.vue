<template>
    <section class="state-design">
        <el-button class="top-btn-back" @click="goBack" v-show="!editorShow" v-if="$route.path!='/'" size="mini">返回</el-button>
        <div class="state-design-tips" v-if="!editorShow">
            <el-button icon="el-icon-folder-add" type="primary" @click="buttonEvent('add')">新建</el-button>
            <el-button icon="el-icon-folder-opened" @click="buttonEvent('open')">打开</el-button>
        </div>
        <div class="editor-wrap" v-else>
            <div style="float: left; padding-top: 5px; padding-left: 10px;"><el-button @click="editorShow=false" size="mini">返回</el-button></div>
            <div class="top-header">
                <span style="margin-right: 10px;">{{savePath}}</span><el-button @click="saveStateData" size="mini">{{savePath?'保存到当前路径':'保存为文件'}}</el-button>
            </div>
            <state-group ref="state-group" :mode="mode" :visible="editorShow" :stateListGroups="stateListGroups"></state-group>
        </div>

    </section>
</template>
<script>
import Vue from 'vue'
import {api,HOST_HOLOWEB} from '@/network/api'
import { isEmpty, isArray } from "@/public/util"
import {remote} from 'electron'
import stateGroup from '@/components/stateMachineDesign/stateGroup'
import fs from 'fs'


function openDialog(){
    return  remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['json'] }
          ]
    });
}


// remote.dialog.showSaveDialog(remote.getCurrentWindow(),{
//     title: "文件另存为",
//     filters: [
//         { name: 'ALL Files', extensions: ['json'] }
//       ]
//     },
//     filename => {
//         if(filename){
//             fs.writeFileSync(filename, JSON.stringify({name: "张雨博"}));
//         }else{
//             resolve("取消");
//         }
//     }
// )

//



export default {
    components: {
        stateGroup
    },
    props: [],
    data () {
      return {
        editorShow: false,
        mode: "add",
        savePath: "",
        stateListGroups: []
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
      buttonEvent(type){
            if(type=="add"){
                //编辑器打开
                this.mode = "add";
                this.editorShow = true;
            }else{
                //打开文件选择并加载...
                var obj = openDialog() 
                if(obj){
                  let path = obj[0];
                  if(path){
                    let stateJson;
                    try {
                        stateJson = JSON.parse(fs.readFileSync(path));
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
        readStateData(data){
            let groups = [];
            //main
            groups.push({
                tapName: "主状态机",
                stateName: data.stateName,
                parentStateName: "",
                stateLevel: data.stateLevel,
                dataString: this.getDataString(data.stateInfo)
            })
            for(let i=0;i<data.stateInfo.length;i++){
                let stateInfo = data.stateInfo[i];
                if(!isEmpty(stateInfo.children)){
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
        getDataString(stateInfo){
            let stringArray = [];
            for(let item of stateInfo){
                stringArray.push(JSON.parse(item.extras));
                if(!isEmpty(item.conditionList)){
                    item.conditionList.map(cl=>{
                        stringArray.push(JSON.parse(cl.extras))
                    })
                }
            }
            return JSON.stringify(stringArray)
        },
        saveStateData(){
            let stateData = this.$refs["state-group"].getData();
            if(!stateData[0].dataString||stateData[0].dataString=="[]"){
                this.$message.error("请先至少绘制一条状态流程");
                return
            }
            console.log(stateData);
            if(this.savePath){
                fs.writeFileSync(this.savePath, this.dataRecombination(stateData));
                this.$message.success("保存成功");
            }else{
                //选择文件路径
                remote.dialog.showSaveDialog(remote.getCurrentWindow(),{
                    title: "文件存储为",
                    filters: [
                        { name: 'ALL Files', extensions: ['json'] }
                      ]
                    },
                    filename => {
                        if(filename){
                            this.savePath = filename;
                            fs.writeFileSync(filename, this.dataRecombination(stateData));
                            this.$message.success("保存成功");
                        }else{
                            resolve("取消");
                        }
                    }
                )
            }

            //this.dataRecombination(stateData);

        },
        dataRecombination(stateData){
            let stateArray = [];
            stateData.forEach((item,index)=>{
                stateArray.push(this.buildStateData(item,index));
            })
            //console.log(stateArray,"stateArray")
            //处理层级
            let SAVE_JSON = stateArray[0];
            for(let item of SAVE_JSON.stateInfo){
                item.children = stateArray.filter(d=>item.name==d.stateName)
            }
            return JSON.stringify(SAVE_JSON)
            //console.log(JSON.stringify(SAVE_JSON))
        },
        buildStateData(data,index){
            let json = {
                "stateName": data.stateName,
                "stateLevel": data.stateLevel,
                "parentState": data.parentStateName,
                "stateInfo":[]
            }
            //dataString分组
            let dataArray = JSON.parse(data.dataString);
            let geometryGroups = [];
            let arrowGroups = [];
            for(let item of dataArray){
                let obj = item;
                if(obj.type == "arrow"){
                    arrowGroups.push(obj);
                }else{
                    geometryGroups.push(obj);
                }
            }
            let stateInfo = [];
            for(let i=0;i<geometryGroups.length;i++){
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
        getConditionList(geometryData,arrowGroups,geometryGroups){
            let list = [];
            for(let i=0;i<arrowGroups.length;i++){
                let arrowData = arrowGroups[i];

                if(arrowData.startGid == geometryData.gid){
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
        getGeometryDataByGid(gid,groups){
            for(let i=0;i<groups.length;i++){
                if(groups[i].gid == gid){
                    return groups[i]
                }
            }
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
            .top-header{
                text-align: right;
                padding: 5px;
                padding-left: 10px;
                border-box: box-sizing;
            }
        }
    }
    .top-btn-back{
        position: fixed;
        z-index: 999;
        top: 15px;
        right: 10px;
    }
</style>
