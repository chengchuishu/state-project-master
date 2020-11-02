import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app.js'
import robot from './modules/robot.js'
Vue.use(Vuex)


const getters = {
    dataMap: state => state.app.dataMap,

}


const store = new Vuex.Store({
    modules: {
        app,
        robot
    },
    getters
})

export default store