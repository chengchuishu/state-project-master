<template>
    <div class="move-box" ref="moving-box" elementtype="controlbox" controlhandle="move" :style="{width: controlBoxStyle.width + 'px', height: controlBoxStyle.height + 'px', transform: `translate(${controlBoxStyle.left}px,${controlBoxStyle.top}px)`}">
        <!-- <div style="line-height: 30px; border: 1px solid red; position: absolute; top: 0; left: 0; width: 100%; z-index: 99;" contenteditable="true"></div> -->
        <div class="dot tl" controlhandle="tl" elementtype="controlbox"></div>
        <div class="dot tm" controlhandle="tm" elementtype="controlbox"></div>
        <div class="dot tr" controlhandle="tr" elementtype="controlbox"></div>
        <div class="dot ml" controlhandle="ml" elementtype="controlbox"></div>
        <div class="dot mr" controlhandle="mr" elementtype="controlbox"></div>
        <div class="dot bl" controlhandle="bl" elementtype="controlbox"></div>
        <div class="dot bm" controlhandle="bm" elementtype="controlbox"></div>
        <div class="dot br" controlhandle="br" elementtype="controlbox"></div>
    </div>
</template>
<script>

export default {
    name: "moveBox",
    model: {
        prop: 'controlBoxStyle',
        event: 'change'
    },
    props: {
        controlBoxStyle: Object
    },
    data() {
        return {
            controlBox: null,
            controlhandle: null,
            parentEl: null,

        }
    },
    mounted(){
        this.controlBox = this.$refs["moving-box"];
        this.parentEl = this.$el.parentNode;
    },
    methods: {
        mouseDownEvent(e,type){
            this.controlhandle = e.target.getAttribute("controlhandle");
            if(type == "force"){
                this.controlhandle = "move";
            }
            //console.log(this.controlhandle)
            this.controlBox.isMouseDown = true;
            this.controlBox.mouseDownX = e.clientX;
            this.controlBox.mouseDownY = e.clientY;
            this.controlBox.preMoveX = this.controlBoxStyle.left;
            this.controlBox.preMoveY = this.controlBoxStyle.top;
            if(this.controlhandle != "move"){
                this.controlBox.preWidth = this.controlBoxStyle.width;
                this.controlBox.preHeight = this.controlBoxStyle.height;
            }
        },
        mouseMoveEvent(e){
            if(this.controlBox.isMouseDown){
                let diffx = e.clientX - this.controlBox.mouseDownX,
                    diffy = e.clientY - this.controlBox.mouseDownY;
                if(this.controlhandle == "move"){
                    //移动
                    this.controlBoxStyle.left = this.controlBox.preMoveX + diffx;
                    this.controlBoxStyle.top = this.controlBox.preMoveY + diffy;
                }else{
                    if(this.controlhandle == "tl"){
                        this.controlBoxStyle.width = this.controlBox.preWidth - diffx;
                        this.controlBoxStyle.height = this.controlBox.preHeight - diffy;
                        this.controlBoxStyle.left = this.controlBox.preMoveX + diffx;
                        this.controlBoxStyle.top = this.controlBox.preMoveY + diffy;
                    }else if(this.controlhandle == "tr"){
                        this.controlBoxStyle.width = this.controlBox.preWidth + diffx;
                        this.controlBoxStyle.height = this.controlBox.preHeight - diffy;
                        this.controlBoxStyle.top = this.controlBox.preMoveY + diffy;
                    }else if(this.controlhandle == "bl"){
                        this.controlBoxStyle.width = this.controlBox.preWidth - diffx;
                        this.controlBoxStyle.height = this.controlBox.preHeight + diffy;
                        this.controlBoxStyle.left = this.controlBox.preMoveX + diffx;
                    }else if(this.controlhandle == "br"){
                        this.controlBoxStyle.width = this.controlBox.preWidth + diffx;
                        this.controlBoxStyle.height = this.controlBox.preHeight + diffy;
                    }
                }

                this.$emit("change",JSON.parse(JSON.stringify(this.controlBoxStyle)));
            }
        },
        mouseUpEvent(){
            this.controlBox.isMouseDown  = false;
        },
    },
    computed: {

    },
    watch: {
        // controlBoxStyle(val){
        //     console.log("变化")
        //     for(let key in this.boxStyle){
        //         this.boxStyle[key] = val[key] || 0;
        //     }
        // }
    }
}

</script>

<style lang="less" scoped>

.move-box {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
    border: 1px solid #298df8;
    box-sizing: border-box;
    //cursor: move;
    .dot{
        width: 8px;
        height: 8px;
        border-radius: 50% 50%;
        border: 1px solid #298df8;
        background: #fff;
        position: absolute;
        &.tl{
            top: -4px;
            left: -4px;
            cursor: nw-resize;
        }
        &.tm{
            top: -4px;
            left: 50%;
            margin-left: -2px;
        }
        &.tr{
            top: -4px;
            right: -4px;
            cursor: ne-resize;
        }
        &.ml{
            top: 50%;
            margin-top: -2px;
            left: -4px;
        }
        &.mr{
            top: 50%;
            margin-top: -2px;
            right: -4px;
        }
        &.bl{
            left: -4px;
            bottom: -4px;
            cursor: sw-resize;
        }
        &.bm{
            bottom: -4px;
            left: 50%;
            margin-left: -2px;
        }
        &.br{
            bottom: -4px;
            right: -4px;
            cursor: se-resize;
        }
    }
}

</style>
