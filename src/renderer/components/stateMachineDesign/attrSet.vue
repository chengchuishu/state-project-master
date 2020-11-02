<template>
    <div class="attr-set">
        <h3>属性设置</h3>
        <div class="content">
            <p><span class="name">name：</span><span class="input"><el-input v-model="form.name" size="mini" /></span></p>
            <p v-if="mode=='state'">
                <span class="name">default：</span>
                <span class="input">
                    <el-switch
                        size="mini"
                        v-model="form.default"
                        active-color="#13ce66"
                        inactive-color="#ff4949">
                    </el-switch>
                </span>
            </p>
            <p v-if="mode=='condition'">
                <span class="name">service：</span>
                <span class="input">
                    <el-select v-model="form.type" size="mini" placeholder="请选择eventtype">
                        <el-option v-for="(item, index) in serviceList" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </span>
            </p>
            <div style="text-align: center; margin-top:20px;"><el-button @click="save" size="mini">保存</el-button></div>
        </div>
    </div>
</template>
<script>

export default {
    name: "attrSet",

    props: {
        attributes: Object,
        serviceList: Array,
        mode: {
            type: String,
            default: 'state'
        }
    },
    data() {
        return {
            form: {
                name: "",
                type: "",
                default: false
            }

        }
    },
    mounted(){
        for(let key in this.form){
            this.form[key] = this.attributes[key];
        }
    },
    methods: {
        save(){
            console.log(this.attributes);
            console.log('--------------');
            console.log(this.form);
            console.log('--------------');
            this.$emit("save",this.form);
        },
    },
    computed: {

    },
    watch: {
        attributes(val){
            for(let key in this.form){
                this.form[key] = val[key];
            }
        }
    }
}

</script>

<style lang="less" scoped>
.attr-set {
    position: absolute;
    top: 60px;
    right: 50px;
    width: 300px;
    min-height: 300px;
    z-index: 9;
    border-radius: 3px;
    border: 1px solid #e4e4e4;
    box-sizing: border-box;
    background: #fff;
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
    .content{
        width: 100%;
        padding: 0 10px;
        p{
            width: 100%;
            height: 30px;
            line-height: 30px;
            margin: 10px 0;
            .name{
                width: 80px;
                float: left;
            }
            .input{
                float: right;
                width: 180px;
            }
        }
    }
}

</style>
