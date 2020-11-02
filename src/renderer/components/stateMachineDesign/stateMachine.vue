<template>
    <div class="state-machine box" ref="state-machine">
        <div class="menu-header">
            <div class="design-info">
                <span>比例：{{parseInt(scale*100)}}%</span>
            </div>
        </div>
        <div class="designer-layout" ref="designer-layout" :style="{height: viewHeight+'px'}">
            <div class="mouse-follow-box" style="top: 0;left: 0;width: 200px;height: 200px;background: red; position: absolute;"></div>
            <div class="work-bench" ref="work-bench">

                <div class="designer-canvas" ref="designer-canvas">
                    <move-box v-show="controlboxShow" v-model="controlBoxStyle" ref="move-box"></move-box>
                    <div class="mouse-follow" ref="mouse-follow" v-show="mouseFollowConfig.show" :style="{top: mouseFollowConfig.y+'px', left: mouseFollowConfig.x+'px'}"></div>
                    <div class="mouse-tool-wrap" elementtype="mouse-tool-wrap" v-if="mouseToolShow" :style="{top: mouseToolConfig.top+'px', left: mouseToolConfig.left+'px'}">
                        <ul>
                            <li v-if="item.show" @click="mouseToolClick(item)" v-for="item in mouseTools"><img :src="item.image" /><span>{{item.name}}</span></li>
                        </ul>
                    </div>
                </div>


            </div>
        </div>
        <div class="tool-box">
            <h3>组件</h3>
            <div class="tool-content">
                <ul class="tool-geometry" ref="tool-geometry">
                    <li class="geometry" v-for="item in toolGeometryGroup" :geometrytype="item"></li>
                </ul>
            </div>
        </div>
        <div class="tool-box data-map">
            <h3>数据集</h3>
            <div class="tool-content">
                <el-tag
                  :key="tag"
                  type="info"
                  v-for="tag in eventList"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  placeholder="输入内容+enter"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm"
                >
                </el-input>
                <el-button type="info" v-else class="button-new-tag" size="small" @click="showInput">+ 添加</el-button>
            </div>
        </div>
        <attr-set v-if="activeElement" :attributes="stateAttributes" @save="saveStateAttributes" :serviceList="eventList" :mode="stateMode" />
    </div>
</template>
<script>
import { isEmpty, isArray } from "@/public/util"
import { creatGeometry,creatCanvasGrid,updateCanvasGrid,shortcutKeys,updateGeometry,getMinPoint,creatArrowLine,updateArrowLine,getDistanceFromLinePoint,isInsidePolygon } from "./canvas_geometry.js"
import moveBox from "./moveBox"
import attrSet from "./attrSet"
import { dataMapWriteEvent } from "@/localSync/resource"
import _ from 'lodash'

export default {
    name: 'stateMachineDesign',
    props: {
        stateName: String,
        parentStateName: String,
        stateLevel: Number,
        stateNameList: Array,
        eventNameList: Array,
        selectSateIndex: Number
    },
    components: {
        moveBox,
        attrSet
    },
    data() {
        return {
            uploadFile: '',
            toolGeometryGroup: ['fillet_rectangle','diamond','circle'],
            creatGeometryMode: false,
            scene: null,
            layout: null,
            viewHeight: window.innerHeight - 60,
            sceneOrginWidth: 1600,
            sceneOrginHeight: 1000,
            designerCanvasWidth: 1600,
            designerCanvasHeight: 1000,
            layoutScroll: {x: 780, y: 980},
            keyValue: null,
            globalMousedown: false,
            globalMousedownX: 0,
            globalMousedownY: 0,
            globalSelectElementType: null,

            mouseFollow: {},
            mouseFollowConfig: {x: 0, y: 0, show: false, isMouseDown: false},
            controlBoxStyle: {
                width: 200,
                height: 200,
                top: 0,
                left: 0
            },
            controlboxShow: false,
            activeElement: null,
            scale: 1,

            mouseToolShow: false,
            mouseToolConfig: {
                top: 0,
                left: 0
            },
            mouseTools: [
                {name: "连线", type: "connect", image: require("./image/line.png"), show: true},
                {name: "删除", type: "delete", image: require("./image/delete.png"),show: true},
                {name: "编辑子状态机", type: "edit", image: require("./image/editor.png"),show: true},
            ],
            connectLineMode: false,
            sidCount: 0,
            eidCount: 0,

            eventList: this.$store.getters.dataMap,
            inputVisible: false,
            stateAttributes: {},
            stateMode: 'state',
            inputValue: '',
            
            // add
            curStateArr: [],
            curEventArr: [],
            curNameStr: ''
        }
    },
    mounted(){
        this.sizeInit();
        this.scene = this.$refs["designer-canvas"];
        this.mouseFollow = this.$refs["mouse-follow"];
        this.creatGeometryGroup();
        this.creatCanvasBg();
        this.initDesignerLayout();
        this.initDocumentEvent();
        window.addEventListener("resize",()=>{
            this.viewHeight = this.$refs["state-machine"].offsetHeight - 10;
        })
    },
    methods: {
        sizeInit(){
            let width = this.$refs["state-machine"].offsetWidth;
            let height = this.$refs["state-machine"].offsetHeight;
            let viewSizeWidth = width - 100;
            let viewSizeHeight = height - 200;
            this.sceneOrginWidth = viewSizeWidth;
            this.sceneOrginHeight = viewSizeHeight;
            this.designerCanvasWidth = viewSizeWidth;
            this.designerCanvasHeight = viewSizeHeight;
            this.viewHeight = this.$refs["state-machine"].offsetHeight - 10;
            this.$refs["work-bench"].style.width = viewSizeWidth+ 'px';
            this.$refs["work-bench"].style.height  = viewSizeHeight + 'px';
            this.layoutScroll.x = 800;
            this.layoutScroll.y = 950;
        },
        creatCanvasBg(){
            let grid = creatCanvasGrid(this.designerCanvasWidth - 20,this.designerCanvasHeight - 20, 15, 4);
            grid.setAttribute('id','grid');
            grid.style.position = "absolute";
            grid.style.top = "10px";
            grid.style.left = "10px";
            grid.style.zIndex = 0;
            this.scene.appendChild(grid);
        },
        creatGeometryGroup(){
            let els = this.$refs["tool-geometry"].querySelectorAll('.geometry');
            for(let i=0;i<els.length;i++){
                let type = els[i].getAttribute('geometrytype');
                let canvas = creatGeometry(type,88,88);
                canvas.setAttribute("elementtype", "geometry");
                canvas.setAttribute("geometry_type", type)
                els[i].appendChild(canvas)
            }
        },
        initDesignerLayout(){
            let layout = this.layout = this.$refs['designer-layout'];
            layout.scrollTo(this.layoutScroll.x,this.layoutScroll.y);
            layout.preX = this.layoutScroll.x;
            layout.preY = this.layoutScroll.y;
            //实时更新
            layout.addEventListener("scroll",(e)=>{
                this.layoutScroll.x = layout.scrollLeft;
                this.layoutScroll.y = layout.scrollTop;
                if(!layout.isMouseDown){
                    layout.preX = layout.scrollLeft;
                    layout.preY = layout.scrollTop;
                }
            })

            //点击
            this.$refs["state-machine"].addEventListener("click",(e)=>{
                this.mouseToolShow = false;
            })

            //定义拖动
            this.$refs["state-machine"].addEventListener("mousedown",(e)=>{
                //e.preventDefault();
                this.globalMousedown = true;
                if(this.keyValue == "space"){
                    layout.isMouseDown = true;
                    layout.mouseDownX = e.clientX;
                    layout.mouseDownY = e.clientY;
                }else{
                    this.handleOtherMousedown(e);
                }
            })

            this.$refs["state-machine"].addEventListener("mousemove",(e)=>{
                e.preventDefault();
                //拖拽事件
                if (layout.isMouseDown) {
                    let diffx = e.clientX - layout.mouseDownX,
                        diffy = e.clientY - layout.mouseDownY;
                    //判断是否到边界

                    let maxScrollX = layout.scrollWidth - layout.offsetWidth;
                    let maxScrollY = layout.scrollHeight - layout.offsetHeight;
                    this.layoutScroll.x = layout.preX - diffx;
                    this.layoutScroll.y = layout.preY  -  diffy;

                    if( this.layoutScroll.x >= maxScrollX){
                        this.layoutScroll.x = maxScrollX
                    }else if(this.layoutScroll.x <= 0){
                        this.layoutScroll.x = 0;
                    }
                    if( this.layoutScroll.y >= maxScrollY){
                        this.layoutScroll.y = maxScrollY
                    }else if(this.layoutScroll.y <= 0){
                        this.layoutScroll.y = 0;
                    }
                    //console.log(this.layoutScroll.x ,"this.layoutScroll.x ")
                    layout.scrollTo(this.layoutScroll.x,this.layoutScroll.y);
                }else{
                    if(this.globalMousedown){
                       this.handleOtherMousemove(e);
                   }else{
                        //鼠标跟随
                        this.mouseFollowEvent(e);
                   }
                }
            })

            this.$refs["state-machine"].addEventListener('contextmenu', (e) => {
                e.preventDefault();
                let position = this.positionToScene(e.clientX,e.clientY);
                this.mouseToolShow = false;
                let arrow = this.checkedArrowClick(e);
                console.log(this.activeElement,arrow,"arrow-----")
                if(this.activeElement){
                    if(this.stateLevel == 1){
                        this.showTools([0,1,2])
                    }else{
                        this.showTools([0,1])
                    }
                    this.mouseToolConfig.top = position.y;
                    this.mouseToolConfig.left = position.x;
                }

                if(arrow){
                    //this.activeElement = arrow;
                    this.updateArrow(arrow,"#298df8");
                    this.showTools([1])
                    //this.mouseToolConfig.top = position.y;
                    //this.mouseToolConfig.left = position.x;
                }
            })
        },
        showTools(showIndexs){
            this.mouseTools.map((item,index)=>{
                item.show = false;
                if(showIndexs.includes(index)){
                    item.show = true;
                }
            })
            this.mouseToolShow = true;

        },
        updateHoverStyle(e,type){
            if(e.target.tagName != "CANVAS"){
                return
            }
            let geometry = e.target.parentNode;
            let width = geometry.geometryData.width*this.scale;
            let height = geometry.geometryData.height*this.scale;
            let color = type=='hover'?'#298df8':'';
            updateGeometry(geometry.querySelector("canvas"),geometry.geometryData.type,width,height,color);
        },
        handleOtherMousedown(e){
            if(e.target.getAttribute("id") == "grid"){
                this.clearActiveGeometryInCanvas();
            }
            //连线
            if(this.connectLineMode){
                this.connectLineMousedown(e);
            }else{
                let elementtype = e.target.getAttribute("elementtype");
                let parentNode = e.target.parentNode;
                let position = this.positionToScene(e.clientX,e.clientY);
                this.globalMousedownX = position.x;
                this.globalMousedownY = position.y;
                this.globalSelectElementType = elementtype;

                if(elementtype == "controlbox"){
                    this.$refs["move-box"].mouseDownEvent(e);
                }else if(elementtype=="geometry"){ //拖拽创建几何
                    let geometrType = e.target.getAttribute("geometry_type");
                    this.mouseFollowConfig.isMouseDown = true;
                    this.creatGeometryInMouseFollow(geometrType,e);
                }else if(elementtype == "geometry_scene"){
                    //计算点击到的轮廓
                    this.activeElement = parentNode;
                    parentNode.geometryData.prex = parentNode.geometryData.x;
                    parentNode.geometryData.prey = parentNode.geometryData.y;
                }else{
                    let arrow = this.checkedArrowClick(e);
                    if(arrow){
                        this.activeElement = arrow;
                        this.updateArrow(arrow,"#298df8");
                    }
                }
            }

        },
        handleOtherMousemove(e){
            if(this.$refs["move-box"])this.$refs["move-box"].mouseMoveEvent(e);
            if(this.mouseFollowConfig.isMouseDown){
                this.mouseFollowboxMove(e);
            }
            if(this.globalSelectElementType == "geometry_scene"){
                this.geometrySceneMove(e);
            }
        },
        handleOtherMouseup(e){
            this.$refs["move-box"].mouseUpEvent();
            if(this.mouseFollowConfig.isMouseDown&&this.mouseFollowConfig.show){
                this.creatGeometryOnScene();
            }
            if(this.globalSelectElementType == "geometry_scene"){
                this.setGeometryInActive(this.activeElement); //this.activeElement;
            }

        },
        initDocumentEvent(){
            document.addEventListener("keydown",this.documentKeyDown);
            document.addEventListener("keyup",this.documentKeyUp);
            document.addEventListener("mouseup",this.documentMouseUp);
        },
        documentMouseUp(e){
            this.layout.isMouseDown  = false;
            this.globalMousedown = false;
            this.layout.preX = this.layoutScroll.x;
            this.layout.preY = this.layoutScroll.y;
            this.handleOtherMouseup(e);
        },
        documentKeyDown(e){
            this.keyValue = shortcutKeys[e.keyCode];
            if(this.keyValue == 'space'){
                this.$refs['designer-layout'].style.cursor = "url(/static/hand.ico) 8 8, auto";
                e.preventDefault();
            }else if(e.ctrlKey&&this.keyValue == '+'){
                e.preventDefault();
                //放大
                if(this.scale >= 3){
                    return
                }
                this.scale = parseFloat((this.scale + 0.1).toFixed(1));

            }else if(e.ctrlKey&&this.keyValue == '-'){
                e.preventDefault();
                //缩小
                if(this.scale <= 0.2){
                    return
                }
                this.scale = parseFloat((this.scale - 0.1).toFixed(1));
            }
        },
        documentKeyUp(e){
            this.keyValue = null;
            this.$refs['designer-layout'].style.cursor = "default";
        },
        geometrySceneMove(e){
            let position = this.positionToScene(e.clientX,e.clientY);
            //移动
            let diffx = position.x - this.globalMousedownX,
                diffy = position.y - this.globalMousedownY;
            let data = {
                x: this.activeElement.geometryData.prex*this.scale + diffx,
                y: this.activeElement.geometryData.prey*this.scale + diffy
            }
            let target = this.activeElement;
            this.updateGeometryData(target,data,'move');
        },
        creatGeometryInMouseFollow(type,e){
            let position = this.positionToScene(e.clientX,e.clientY);
            let canvas = creatGeometry(type,120*this.scale,120*this.scale);
            if(this.mouseFollow.children[0])this.mouseFollow.removeChild(this.mouseFollow.children[0]);
            this.mouseFollow.appendChild(canvas);
            this.mouseFollowConfig.type = type;
            this.mouseFollowConfig.mouseDownX = position.x;
            this.mouseFollowConfig.mouseDownY = position.y;

            this.mouseFollowConfig.x = this.mouseFollowConfig.prex = position.x - 60*this.scale;
            this.mouseFollowConfig.y = this.mouseFollowConfig.prey = position.y - 60*this.scale;
        },
        mouseFollowboxMove(e){

            let position = this.positionToScene(e.clientX,e.clientY);
            //移动
            let diffx = position.x - this.mouseFollowConfig.mouseDownX,
                diffy = position.y - this.mouseFollowConfig.mouseDownY;
            if(diffx>10||diffy>10){
                this.mouseFollowConfig.show = true;
                this.mouseFollowConfig.x = this.mouseFollowConfig.prex + diffx,
                this.mouseFollowConfig.y = this.mouseFollowConfig.prey + diffy;
            }
        },
        creatGeometryOnScene(){
            console.log("创建几何")
            this.mouseFollowConfig.isMouseDown = false;
            this.mouseFollowConfig.show = false;
            let gid = this.sidCount++;
            // add
            let sname = 'S' + this.stateLevel;
            if (this.stateLevel !== 1){
                sname = sname + this.stateName.substr(this.stateName.indexOf('_')) + gid
            } else {
                sname = sname + '_' + gid;
            }
            let data = {
                gid: gid,
                width: 120,
                height: 120,
                x: this.mouseFollowConfig.x/this.scale,
                y: this.mouseFollowConfig.y/this.scale,
                type: this.mouseFollowConfig.type,
                state: {
                    name: sname,  //name: 'S'+gid,
                    default: false
                }
            }
            this.setGeometryInActive(this.creatGeometryOnSceneByData(data));


            // let div = document.createElement("div");
            // let canvas = creatGeometry(this.mouseFollowConfig.type,120*this.scale,120*this.scale);
            // div.style.transform = `translate(${this.mouseFollowConfig.x}px,${this.mouseFollowConfig.y}px)`;
            // div.setAttribute("class","geometry_in");
            // div.setAttribute("geometry_type", this.mouseFollowConfig.type);
            // div.setAttribute("elementtype", "geometry_scene");
            // let gid = this.idCount++;
            // div.setAttribute("gid", gid);
            // canvas.setAttribute("elementtype", "geometry_scene");
            // div.geometryData = {
            //     width: 120,
            //     height: 120,
            //     x:  this.mouseFollowConfig.x/this.scale,
            //     y: this.mouseFollowConfig.y/this.scale,
            //     type: this.mouseFollowConfig.type,
            //     state: {
            //         name: 'S'+gid,
            //         default: false
            //     }

            // }
            // let p = document.createElement("p");
            // p.setAttribute("class","g_text");
            // p.innerHTML = `<span>S${gid}</span>`;

            // div.appendChild(p);
            // div.appendChild(canvas);
            // this.scene.appendChild(div);
            // div.addEventListener("mouseover",(e)=>{this.updateHoverStyle(e,'hover')});
            // div.addEventListener("mouseout",(e)=>{this.updateHoverStyle(e,'out')});
            console.log("执行creat")
            //this.setControlBoxStyle(120,120,this.mouseFollowConfig.x,this.mouseFollowConfig.y)
            //this.setGeometryInActive(div);
        },
        creatGeometryOnSceneByData(data){
            let div = document.createElement("div");
            let canvas = creatGeometry(data.type,data.width*this.scale,data.height*this.scale);
            div.style.transform = `translate(${data.x*this.scale}px,${data.y*this.scale}px)`;
            div.setAttribute("class","geometry_in");
            div.setAttribute("geometry_type", data.type);
            div.setAttribute("elementtype", "geometry_scene");
            let gid = data.gid;
            div.setAttribute("gid", gid);
            canvas.setAttribute("elementtype", "geometry_scene");
            div.geometryData = data;
            let p = document.createElement("p");
            p.setAttribute("class","g_text");
            p.innerHTML = `<span>${data.state.name}</span>`;
            
            // add
            div.setAttribute("contenteditable", "true");
            p.setAttribute("contenteditable", "true");
            this.curStateArr.push(this.selectSateIndex + '#' + data.state.name);
            console.log('*************' + this.curStateArr);
             
            div.appendChild(p);
            div.appendChild(canvas);
            this.scene.appendChild(div);
            div.addEventListener("mouseover",(e)=>{this.updateHoverStyle(e,'hover')});
            div.addEventListener("mouseout",(e)=>{this.updateHoverStyle(e,'out')});
            return div
        },
        setControlBoxStyle(width,height,x,y){
            this.controlBoxStyle = {};
            this.controlBoxStyle.width = width*this.scale;
            this.controlBoxStyle.height = height*this.scale;
            this.controlBoxStyle.left = x*this.scale;
            this.controlBoxStyle.top = y*this.scale;
        },
        getGeometryByGid(gid){
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                if(geometryGroupsInCanvas[i].getAttribute("gid") == gid){
                    return geometryGroupsInCanvas[i]
                }
            }
        },
        getGeometryIn(){
            let geometryGroupsInCanvas = this.scene.querySelectorAll(".geometry_in");
            if(geometryGroupsInCanvas.length>0){
                return geometryGroupsInCanvas
            }else{
                return []
            }
        },
        getArrowOnScene(){
            let arrows= this.scene.querySelectorAll(".arrow");
            if(arrows.length>0){
                return arrows
            }else{
                return []
            }
        },
        setGeometryInActive(target){
            if(!target){
                return
            }
            this.clearActiveGeometryInCanvas();
            target.setAttribute("active",true);
            this.activeElement = target;
            this.controlboxShow = true;
            this.setControlBoxStyle(target.geometryData.width,target.geometryData.height,target.geometryData.x,target.geometryData.y);
        },
        clearActiveGeometryInCanvas(){
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                geometryGroupsInCanvas[i].setAttribute("active","false");
            }
            let arrowElements = this.getArrowOnScene();
            for(let i=0;i<arrowElements.length;i++){
                this.updateArrow(arrowElements[i]);
            }
            this.activeElement = null;
            this.controlboxShow = false;
        },
        updateGeometryInCanvas(data){
            //查询active
            this.updateGeometryData(this.activeElement,data,'control')
        },
        updateGeometryData(geometry,data,type){ //有data为controlbox传输
            if(type == 'control'){
                geometry.style.transform = `translate(${data.left}px,${data.top}px)`;
                geometry.style.width = data.width + 'px';
                geometry.style.height = data.height + 'px';
                updateGeometry(geometry.querySelector("canvas"),geometry.geometryData.type,data.width,data.height);
                geometry.geometryData.x = data.left/this.scale;
                geometry.geometryData.y = data.top/this.scale;
                geometry.geometryData.width = data.width/this.scale;
                geometry.geometryData.height = data.height/this.scale;
                this.checkedArrowUpdate(geometry);
            }else if(type == 'scale'){
                let width = geometry.geometryData.width*this.scale;
                let height = geometry.geometryData.height*this.scale;
                geometry.style.transform = `translate(${geometry.geometryData.x*this.scale}px,${geometry.geometryData.y*this.scale}px)`;
                geometry.style.width = width + 'px';
                geometry.style.height = height + 'px';
                updateGeometry(geometry.querySelector("canvas"),geometry.geometryData.type,width,height);
            }else if(type == 'move'){
                geometry.style.transform = `translate(${data.x}px,${data.y}px)`;
                geometry.geometryData.x = data.x/this.scale;
                geometry.geometryData.y = data.y/this.scale;
                this.checkedArrowUpdate(geometry);
            }

        },
        positionToScene(x, y) {
            var bbox = this.scene.getBoundingClientRect();
            return { x: x - bbox.left, y: y - bbox.top }
        },

        resetWholeScene(){
            //重置整个场景大小
            //1.重置画布
            this.designerCanvasWidth = this.scale*this.sceneOrginWidth;
            this.designerCanvasHeight = this.scale*this.sceneOrginHeight;
            this.scene.style.width = this.designerCanvasWidth + 'px';
            this.scene.style.height  = this.designerCanvasHeight + 'px';
            let grid = this.scene.querySelector("#grid");
            updateCanvasGrid(grid, this.designerCanvasWidth - 20,this.designerCanvasHeight - 20, 15*this.scale, 4);
            //重置元素
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                let geometry = geometryGroupsInCanvas[i]
                this.updateGeometryData(geometry,null,'scale');
            }
            //重置箭头
            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                let arrowEl = arrows[i];
                this.updateArrow(arrowEl);
            }
        },

        mouseToolClick(item){
            if(item.type == "delete"){
                //检查关联线
                this.removeConnectLine(this.activeElement);
                this.activeElement.remove();
                this.clearActiveGeometryInCanvas();
            }else if(item.type == "connect"){
                //新建箭头连线
                this.connectLineMode = true;
                let start = this.queryStartPoint();
                console.log(start,"start");
                this.buildConnectLine(start,{x: this.mouseToolConfig.left/this.scale,y: this.mouseToolConfig.top/this.scale});
            }else if(item.type == "edit"){
                console.log(this.activeElement.geometryData,"geometryData---- ")
                this.$emit("editChild",this.activeElement.geometryData);
            }

        },
        removeConnectLine(el){
            //if(el.getAttribute("geometry_type") == "circle"){
                let elements = this.scene.querySelectorAll(".arrow");
                let gid = el.getAttribute("gid");
                let arrowRemoves = [];
                for(let i=0;i<elements.length;i++){
                    if(elements[i].geometryData.startGid == gid || elements[i].geometryData.endGid == gid){
                        arrowRemoves.push(elements[i])
                    }
                }
                arrowRemoves.map(item=>{item.remove()});
            //}
        },
        buildConnectLine(start,end){
            let gid = this.eidCount++;
            // add
            let ename = 'E' + this.stateLevel;
            if (this.stateLevel !== 1){
                ename = ename + this.stateName.substr(this.stateName.indexOf('_')) + gid
            } else {
                ename = ename + '_' + gid;
            }
            this.buildConnectLineByData({
                gid: gid,
                start: start,
                end: end,
                startGid: this.activeElement.getAttribute("gid"),
                type: "arrow",
                state: {
                   name: ename,
                   type: ""
                }
            });

            // let p0 = {x: start.x*this.scale, y: start.y*this.scale},
            //     p1 = {x: end.x*this.scale, y: end.y*this.scale};

            // let div = document.createElement("div");
            // let canvas = creatArrowLine(p0,p1,2);
            // div.style.transform = `translate(${canvas.left}px,${canvas.top}px)`;
            // div.setAttribute("class","arrow");
            // div.setAttribute("geometry_type", "arrow");
            // div.setAttribute("connect", "on");
            // let gid = this.idCount++;
            // div.setAttribute("gid", gid);
            // div.geometryData = {
            //     start: start,
            //     end: end,
            //     startGid: this.activeElement.getAttribute("gid"),
            //     type: "arrow",
            //     state: {
            //        name: 'L'+gid,
            //        type: ""
            //     }

            // }
            // let p = document.createElement("p");
            // p.setAttribute("class","g_text");
            // p.innerHTML = `<span>L${gid}</span>`;

            // div.appendChild(p);

            // div.appendChild(canvas.canvas);
            // this.scene.appendChild(div);

        },
        buildConnectLineByData(data){
            let p0 = {x: data.start.x*this.scale, y: data.start.y*this.scale},
                p1 = {x: data.end.x*this.scale, y: data.end.y*this.scale};

            let div = document.createElement("div");
            let canvas = creatArrowLine(p0,p1,2);
            div.style.transform = `translate(${canvas.left}px,${canvas.top}px)`;
            div.setAttribute("class","arrow");
            div.setAttribute("geometry_type", "arrow");
            div.setAttribute("connect", "on");
            let gid = data.gid;
            div.setAttribute("gid", gid);
            div.geometryData = data;
            let p = document.createElement("p");
            p.setAttribute("class","g_text");
            p.innerHTML = `<span>${data.state.name}</span>`;

            this.curEventArr.push(this.selectSateIndex + '#' + data.state.name);
            console.log('*************' + this.curEventArr);

            div.appendChild(p);

            div.appendChild(canvas.canvas);
            this.scene.appendChild(div);
        },
        checkedArrowUpdate(geometry){
            //移动放大处理
            let gid = geometry.getAttribute("gid");
            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                let arrowEl = arrows[i];
                if(arrowEl.geometryData.startGid == gid){
                    let start = this.getGeometryVertex(geometry)[arrowEl.geometryData.start.index];
                    arrowEl.geometryData.start.x = start.x;
                    arrowEl.geometryData.start.y = start.y;
                    this.updateArrow(arrowEl);
                }else if(arrowEl.geometryData.endGid == gid){
                    let end = this.getGeometryVertex(geometry)[arrowEl.geometryData.end.index];
                    arrowEl.geometryData.end.x = end.x;
                    arrowEl.geometryData.end.y = end.y;
                    this.updateArrow(arrowEl);
                }

            }

        },
        updateArrow(el,color){
            let canvas = el.querySelector("canvas");
            let start = el.geometryData.start;
            let end = el.geometryData.end;
            let p0 = {x: start.x*this.scale, y: start.y*this.scale},
                p1 = {x: end.x*this.scale, y: end.y*this.scale};
            let result = updateArrowLine(canvas,p0,p1,2,color);
            el.style.transform = `translate(${result.left}px,${result.top}px)`;
        },
        updateSceneArrowLineInDrawing(position,el){
            let canvas = el.querySelector("canvas");
            let start = el.geometryData.start;
            let p0 = {x: start.x*this.scale, y: start.y*this.scale},
                p1 = position;
            let result = updateArrowLine(canvas,p0,p1,2);
            el.style.transform = `translate(${result.left}px,${result.top}px)`;
        },
        queryStartPoint(){
            let geometry_type = this.activeElement.getAttribute("geometry_type");
            //if(geometry_type == "circle"){
                //暂时只可操作圆形
                //找出圆形的四个顶点查询到离右击点最近的点
                return getMinPoint({x: this.mouseToolConfig.left/this.scale,y: this.mouseToolConfig.top/this.scale},this.getGeometryVertex(this.activeElement));
            //}
        },
        getGeometryVertex(element){
            let geometry_type = element.getAttribute("geometry_type");
            //if(geometry_type == "circle"){
                //console.log(element.geometryData);
                let x0 = element.geometryData.x,y0 = element.geometryData.y;
                let w = element.geometryData.width,h = element.geometryData.height;
                return [
                    {x: x0 + w/2, y: y0},
                    {x: x0 + w, y: y0 + h/2},
                    {x: x0 + w/2, y: y0 + h},
                    {x: x0, y: y0 + h/2},
                ]
            //}
        },
        connectLineMousedown(e){
            if(this.connectLineMode){ //连线模式
                this.connectLineMode = false;
                let element = e.target.parentNode;
                let el = this.getArrowElementon();
                if(element&&el&&element.getAttribute("gid")&&el.geometryData.startGid!=element.getAttribute("gid")){
                    //检查重复

                    if(this.checkedArrowRepeat(el.geometryData.startGid,element.getAttribute("gid"))){
                        el.remove();
                        this.$message.warning("连线已存在！");
                        return
                    }
                    let position = this.positionToScene(e.clientX,e.clientY);
                    let end = getMinPoint({x: position.x/this.scale,y: position.y/this.scale},this.getGeometryVertex(element));
                    el.geometryData.end = end;
                    el.geometryData.endGid = element.getAttribute("gid");
                    el.setAttribute("connect", "off");
                    this.updateSceneArrowLineInDrawing({x: end.x*this.scale, y: end.y*this.scale},el);
                }else{
                    el.remove();
                }
            }
        },
        checkedArrowRepeat(startGid,endGid){
            let elements = this.scene.querySelectorAll(".arrow");
            for(let i=0;i<elements.length;i++){
                if(elements[i].geometryData.startGid == startGid && elements[i].geometryData.endGid == endGid){
                    //存在重复
                    return true;
                    break;
                }
            }
        },
        //获取正在绘制的箭头
        getArrowElementon(){
            let elements = this.scene.querySelectorAll(".arrow");
            let el = null;
            for(let i=0;i<elements.length;i++){
                if(elements[i].getAttribute("connect") == "on"){
                    el = elements[i];
                }
            }
            return el
        },
        mouseFollowEvent(e){
            if(this.connectLineMode){ //连线模式
                let el = this.getArrowElementon();
                if(el){
                    //鼠标跟随
                    let position = this.positionToScene(e.clientX,e.clientY);
                    this.updateSceneArrowLineInDrawing(position,el);
                }
            }else{
                //移动active元素

            }
        },
        //检查是否点到箭头
        checkedArrowClick(e){
            let position = this.positionToScene(e.clientX,e.clientY);
            let elements = this.scene.querySelectorAll(".arrow");
            for(let i=0;i<elements.length;i++){
                //计算距离
                let x1 = elements[i].geometryData.start.x*this.scale;
                let y1 = elements[i].geometryData.start.y*this.scale;
                let x2 = elements[i].geometryData.end.x*this.scale;
                let y2 = elements[i].geometryData.end.y*this.scale;
                let distance = getDistanceFromLinePoint(position,{x1: x1,y1: y1, x2: x2, y2: y2});

                //计算是否在矩形范围内
                let rectangle = [{x: x1, y: y1},{x: x2, y: y1},{x: x2, y: y2},{x: x1, y: y2}];
                let isIn = isInsidePolygon(position,rectangle);
                if(distance <= 8*this.scale&&isIn){
                    return elements[i];
                    break;
                }
            }
        },

        handleClose(tag) {
            this.eventList.splice(this.eventList.indexOf(tag), 1);
            dataMapWriteEvent(JSON.stringify({dataMap: this.eventList}));
        },

        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
          },

        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (inputValue) {
                this.eventList.push(inputValue);
            }
            this.inputVisible = false;
            this.inputValue = '';
            dataMapWriteEvent(JSON.stringify({dataMap: this.eventList}));
        },
        saveStateAttributes(param){
            if(!param.name){
                this.$message.warning("名称不可为空");
                return
            }
            //add
            console.log('================' + this.stateNameList)
            console.log('----------------' + this.eventNameList)
            console.log('----------------' + JSON.stringify(param))
            for (let i = 0; i < this.stateNameList.length; i++) {
              let tempState = this.stateNameList[i]
              let tempArr = tempState.split('#')
              if ((Number(tempArr[0]) !== this.selectSateIndex) && (tempArr[1] === param.name)) {
                this.$message.warning("状态名称【" + param.name + "】已存在，状态名不可重复");
                return
              }
            }
            for (let j = 0; j < this.eventNameList.length; j++) {
              console.log('----j--------' + this.eventNameList[j])
              let tempEvent = this.eventNameList[j]
              let tempArr2 = tempEvent.split('#')
              if ((Number(tempArr2[0]) !== this.selectSateIndex) && (tempArr2[1] === param.name)) {
                this.$message.warning("事件条件名称【" + param.name + "】已存在，事件条件名不可重复");
                return
              }
            }
            let geometry_type = this.activeElement.getAttribute("geometry_type");
            //校验名字不可重复
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                let geometry = geometryGroupsInCanvas[i];
                if(geometry.geometryData.state.name == param.name && geometry.getAttribute("gid")!=this.activeElement.getAttribute("gid")){
                    this.$message.warning("状态名称【" + param.name + "】已存在，状态名不可重复");
                    return
                }
            }
            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                let arrowEl = arrows[i];
                if(arrowEl.geometryData.state.name == param.name && arrowEl.getAttribute("gid")!=this.activeElement.getAttribute("gid")){
                    this.$message.warning("事件条件名称【" + param.name + "】已存在，事件条件名不可重复");
                    return
                }
            }
            this.activeElement.geometryData.state.name = param.name;
            this.activeElement.querySelector(".g_text").querySelector("span").textContent = param.name;
            if(geometry_type == "arrow"){
                this.activeElement.geometryData.state.type = param.type;
            }else{
                this.activeElement.geometryData.state.default = param.default;
            }
            //add
            console.log(this.curNameStr + '==========' + param.name)
            console.log('##########curNameStr:' + this.curNameStr);
            this.$emit('getStateAndEvent', {type: geometry_type, name: param.name, oldName: this.curNameStr});
            this.curNameStr = param.name;
        },

        clearWholeCanvas(){
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                geometryGroupsInCanvas[i].remove();
            }
            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                arrows[i].remove();
            }
        },

        resetParam(){
            this.scale = 1;
            this.activeElement = null;
            this.controlboxShow = false;
            this.mouseToolShow = false;
            this.connectLineMode = false;
            this.creatGeometryMode = false;
            this.inputVisible = false;
            this.sidCount = 0;
            this.eidCount = 0;
        },

        loadData(data){
            this.resetParam();
            this.clearWholeCanvas();
            this.analysisData(data);
        },

        analysisData(dataString){
            console.log(dataString,"--------")
            let data = JSON.parse(dataString);
            let gids = [];
            if(!isEmpty(data)){
                //分组
                let geometryGroups = [];
                let arrowGroups = [];
                for(let item of data){
                    let obj = item;
                    if(obj.type == "arrow"){
                        arrowGroups.push(obj);
                    }else{
                        geometryGroups.push(obj);
                    }
                    gids.push(item.gid);
                }

                //渲染
                geometryGroups.map(item=>{
                    this.creatGeometryOnSceneByData(item);
                })
                arrowGroups.map(item=>{
                    this.buildConnectLineByData(item);
                })
                //调整GID值
                this.sidCount = _.max(gids);
                this.eidCount = _.max(gids);
            }


        },

        buildJSON(){
            let stateInfo = [];
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                stateInfo.push(geometryGroupsInCanvas[i].geometryData)
            }

            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                stateInfo.push(arrows[i].geometryData)
            }
            // this.$alert(JSON.stringify({data: stateInfo}), 'JSON',{
            //     customClass: "customStyle"
            // });
            return JSON.stringify(stateInfo)
            // let json = {
            //     "stateName":"mainStationName",
            //     "stateLevel":1,
            //     "parentState":{
            //         "name":"parentStateName"
            //     },
            //     "stateInfo":[

            //     ]
            // }
            // let stateInfo = [];
            // let geometryGroupsInCanvas = this.getGeometryIn();
            // for(let i=0;i<geometryGroupsInCanvas.length;i++){
            //     let geometry = geometryGroupsInCanvas[i];
            //     let geometryData = geometry.geometryData;
            //     let info = {
            //         id: geometry.getAttribute("gid"),
            //         name: geometryData.state.name,
            //         default: geometryData.state.default,
            //         extras: JSON.stringify(geometryData)
            //     }
            //     info.conditionList = this.getConditionList(geometry);
            //     stateInfo.push(info);
            // }
            // json.stateInfo = stateInfo;
            // this.$alert(JSON.stringify(json), 'JSON',{
            //     customClass: "customStyle"
            // });
        },
        getConditionList(geometry){
            let list = [];
            let arrows = this.getArrowOnScene();
            for(let i=0;i<arrows.length;i++){
                let arrowEl = arrows[i];
                if(arrowEl.geometryData.startGid == geometry.getAttribute("gid")){
                    let nextState = this.getGeometryByGid(arrowEl.geometryData.endGid).geometryData.state.name;
                    list.push({
                        id: arrowEl.getAttribute("gid"),
                        name: arrowEl.geometryData.state.name,
                        type: arrowEl.geometryData.state.type,
                        extras: JSON.stringify(arrowEl.geometryData),
                        nextState: nextState
                    })
                }
            }
            return list
        },


    },
    computed: {

    },
    beforeDestroy(){
        document.removeEventListener("keydown",this.documentKeyDown);
        document.removeEventListener("keyup",this.documentKeyUp);
        document.removeEventListener("mouseup",this.documentMouseUp);
    },
    watch: {
        controlBoxStyle(val){
            this.updateGeometryInCanvas(val);
        },
        scale(val){
            console.log(val)
            this.resetWholeScene();
            let geometryGroupsInCanvas = this.getGeometryIn();
            for(let i=0;i<geometryGroupsInCanvas.length;i++){
                if(geometryGroupsInCanvas[i].getAttribute("active")=="true"){
                    this.setGeometryInActive(geometryGroupsInCanvas[i]);
                    break;
                }
            }

        },
        activeElement(val){
            if(!val){
                return
            }
            let attr = val.geometryData.state||{};
            let geometry_type = val.getAttribute("geometry_type");
            if(geometry_type == "arrow"){
                this.stateMode = "condition";
            }else{
                this.stateMode = "state";
            }
            //console.log(attr)
            this.curNameStr = attr.name
            console.log('##########curNameStr:' + this.curNameStr);
            this.stateAttributes = {
                name: attr.name,
                type: attr.type,
                default: attr.default
            };
        },
    }
}

</script>

<style lang="less">
.state-machine {
    width: 100%;
    height: calc(100vh - 80px);
    padding: 10px;
    position: relative;
    top: 0;
    left: 0;
    .menu-header{
        margin: 5px 0;
        width: 50%;
        height: 32px;
        overflow: hidden;
        padding: 2px;
        position: absolute;
        z-index: 9;
        top: 0;
        right: 20px;
        .design-info{
            float: right;
            line-height: 30px;
            padding-right: 10px;
        }

    }
    .designer-layout{
        overflow: scroll;
        position: relative;
        background-color: #ccc;
        z-index: 0;
        border: 1px solid #eee;
    }

    .work-bench{
        width: 1600px;
        height: 1000px;
        padding: 1000px;
        border: 1px solid #ddd;
        overflow: auto;
        box-sizing: initial;
        .designer-canvas{
            width: 100%;
            height: 100%;
            background: #fff;
            position: relative;
            box-shadow: 3px 3px 6px #888;
            padding: 10px;
            box-sizing: border-box;
            background: #e4e4e4;
            .geometry_in{
                position: absolute;
                top: 0;
                left: 0;
                z-index: 3;
            }
            .arrow{
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                pointer-events: none;
            }
            .g_text{
                position: absolute;
                width: 100%;
                height: 30px;
                text-align: center;
                color: #666666;
                font-size: 16px;
                line-height: 30px;
                top: 50%;
                margin-top: -15px;
                pointer-events: none;
                span{
                    background: #fff;
                    padding: 0 5px;
                }
            }
            .mouse-follow{
                position: absolute;
                top: 0;
                left: 0;
                width: 120px;
                height: 120px;
                z-index: 9;
            }
            .mouse-tool-wrap{
                position: absolute;
                width: 160px;
                padding: 5px;
                background: #FFF;
                border-radius: 4px;
                border: 1px solid rgb(180,180,180);
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.3);
                z-index: 9;
                li{
                    width: 100%;
                    height: 24px;
                    line-height: 24px;
                    cursor: pointer;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #ddd;
                    &:hover{
                        background: #eee;
                    }
                    img{
                        width: 20px;
                        height: 20px;
                        margin-right: 10px;
                        float: left;
                        margin-top: 2px;
                    }
                    span{
                        float: left;
                        font-size: 12px;
                    }
                }
            }
        }
    }
    .tool-box{
        position: absolute;
        width: 200px;
        top: 60px;
        left: 20px;
        height: 300px;
        border-radius: 3px;
        border: 1px solid #ddd;
        background: rgba(255,255,255,1);
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.3);
        h3{
            width: 100%;
            height: 30px;
            line-height: 30px;
            margin: 0;
            background: #ddd;
            border-radius: 3px 3px 0 0;
            text-align: center;
            font-size: 12px;

        }
        .tool-content{
            width: 100%;
            .tool-geometry{
                width: 100%;
                display: flex;
                flex-flow:row wrap;
                //overflow: hidden;
                margin-top: 1px;
                margin-left: 1px;
                li{
                    width: 100px;
                    height: 100px;
                    border: 1px solid #ddd;
                    border-image: initial;
                    padding: 5px;
                    box-sizing: border-box;
                    margin-top: -1px;
                    margin-left: -1px;
                    &:hover{
                        z-index: 1;
                        border-color: rgb(121, 186, 255);
                        border-width: 2px;
                    }
                }
            }
        }
    }
    .data-map{
        height: 300px;
        top: 380px;
        overflow: auto;
        .tool-content{
            padding: 5px;
        }
        .el-tag{
            margin-right: 5px;
            margin-top: 10px;
        }
        .button-new-tag{
            display: block;
            margin-top: 10px;
        }
        .input-new-tag{
            margin-top: 10px;
        }
    }

}

.customStyle{
        width: 1000px;
    }

</style>
