export const ProfileActionTypes = {
    PROFILE_UPDATE: "PROFILE_UPDATE",
    PROFILE_SIGNOUT: "PROFILE_SIGNOUT",
}

const profileReducer = (state = {}, action) => {
    switch (action.type) {
        case ProfileActionTypes.PROFILE_UPDATE:
            return {
                ...state,
                name: action.name,
                description: action.description,
                avatar: action.avatar,
                cover: action.cover,
                location: action.location,
                website: action.website,
                birthday: action.birthday,
            }

        case ProfileActionTypes.PROFILE_SIGNOUT:
            return {}

        default:
            return state
    }
}

export default profileReducer
