const app = {
    state: {
        appWidth: 0,
        appHeight: 0,
        dataMap: []
    },
    mutations: {
        SET_APP_WIDTH: (state, width) => {
            state.appWidth = width
        },
        SET_APP_HEIGHT: (state, height) => {
            state.appHeight = height
        },
        SET_DATA_MAP: (state, data) => {
            state.dataMap = data
        },
    },
    actions: {
        setAppWidth({ commit }, width) {
            commit( 'SET_APP_WIDTH', width)
        },
        setAppHeight({ commit }, height) {
            commit( 'SET_APP_HEIGHT', height)
        },
        setDataMap({ commit }, data) {
            commit( 'SET_DATA_MAP', data)
        },
    }
}

export default app
