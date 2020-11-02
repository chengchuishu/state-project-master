<template>
    <section class="home-wrap">

        <div class="fun-select-wrap" onselectstart="return false">
            <h2>云绅智能科技</h2>
            <div class="fun-select"><router-link to="/design"><el-button type="primary" icon="el-icon-s-tools">状态机设计器</el-button></router-link></div>
            <div class="fun-select"><router-link to="/player"><el-button type="success" icon="el-icon-warning">状态机运行器</el-button></router-link></div>
        </div>
        <!-- <stateMachineDesign></stateMachineDesign> -->
    </section>
</template>
<script>
import Vue from 'vue'
import {api,HOST_HOLOWEB} from '@/network/api'
import {remote} from 'electron'
import stateMachineDesign from '@/components/stateMachineDesign/stateMachine'
import fs from 'fs'


// function openDialog(){
//     return  remote.dialog.showOpenDialog({
//         properties: ['openFile'],
//     });
// }

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
        stateMachineDesign
    },
    props: [],
    data () {
      return {

      }
    },
    created() {

    },
    beforeMount () {
        console.log(this.$store.getters.robotNavcationStatus,"robotNavcationStatus")
    },
    methods: {

    },
    watch: {

    }
}
</script>

<style lang="less">
    .home-wrap{
        width: 100%;
        height: 100%;
        .fun-select-wrap{
            position: absolute;
            width: 100%;
            left: 0;
            top: 50%;
            margin-top: -150px;
            h2{
                width: 100%;
                text-align: center;
                font-size: 30px;
                line-height: 100px;
                letter-spacing: 6px;
                color: #409EFF;
                font-family: "Microsoft YaHei";
            }
        }
        .fun-select{
            width: 100%;
            height: 100px;
            text-align: center;

            .el-button{
                width: 400px;
                height: 50px;
                span{
                    font-size: 20px;
                }
                i{
                    font-size: 20px;
                }
            }
        }
    }
</style>
