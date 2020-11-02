import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);
const home = require('@/pages/home.vue').default;
const design = require('@/pages/design.vue').default;
const player = require('@/pages/player.vue').default;

export default new Router({
    routes: [
        {
            path: '/',
            name: 'index',
            component: home,
        },
        {
            path: '/design',
            name: 'design',
            component: design,
        },
		{
            path: '/player',
            name: 'player',
            component: player,
        },
    ]
})
