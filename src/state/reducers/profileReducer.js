const profileReducer = (state = {}, action) => {
    switch (action.type) {
        case "MY_GENERAL_PROFILE_UPDATE":
            return {
                ...state,
                name: action.name,
                description: action.description,
                image: action.image,
                coverPhoto: action.coverPhoto,
                location: action.location,
                website: action.website,
                birthday: action.birthday,
            }

        case "MY_FETCHED_PROFILES_UPDATE":
            return {
                ...state,
                fetchedProfiles: action.fetchedProfiles,
            }

        case "MY_DATA_SIGNOUT":
            return {}

        default:
            return state
    }
}

export default profileReducer
