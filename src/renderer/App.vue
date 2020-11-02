<template>
    <div id="app" class="full-screen">
        <!--el-button class="top-btn-back" @click="goBack" v-if="$route.path!='/'" size="mini">返回</el-button-->
        <transition name="slide-fade">
            <keep-alive include="main-index"><router-view></router-view></keep-alive>
        </transition>
    </div>
</template>

<script>
    import '@/public/public.css'
    export default {
        name: 'electron-holojiaju',
        mounted(){

        },
        methods: {
            goBack(){
                this.$router.go(-1);
            }
        },
        watch: {
            $route(val){
                console.log(val.path,"--")
            }
        }
    }
</script>

<style>
    .top-btn-back{
        position: fixed;
        z-index: 999;
        top: 15px;
        right: 10px;
    }
    .slide-fade-enter-active {
        transition: all .3s ease;
    }
    .slide-fade-leave-active {
        transition: all .3s ease;
    }
    .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
        transform: translateY(-10px);
        opacity: 0;
    }
</style>


