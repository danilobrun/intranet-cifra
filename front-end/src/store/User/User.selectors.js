export const selectUser = state => {
    return state.userData
}

export const selectIsUserLoggedIn = state => !! state.userData