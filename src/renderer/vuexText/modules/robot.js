const robot = {
    state: {
        robotNavcationStatus: 0
    },
    mutations: {
        SET_ROBOT_NAVCATION_STATUS: (state, status) => {
            state.robotNavcationStatus = status
        }
    },
    actions: {
        setRobotNavcationStatus({ commit }, status) {
            commit( 'SET_ROBOT_NAVCATION_STATUS', status)
        },

    }
}

export default robot