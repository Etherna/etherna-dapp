const profileReducer = (state = {}, action) => {
    switch (action.type) {
        case "MY_BOX_UPDATE":
            return {
                ...state,
                box: action.box,
                ens: action.ens,
                threeId: action.threeId,
            }

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

        case "MY_NAME_UPDATE":
            return {
                ...state,
                name: action.name,
            }

        case "MY_VERIFIED_TWITTER_UPDATE":
            return {
                ...state,
                verifiedTwitter: action.verifiedTwitter,
            }

        case "MY_VERIFIED_EMAIL_UPDATE":
            return {
                ...state,
                verifiedEmail: action.verifiedEmail,
            }

        case "MY_DESCRIPTION_UPDATE":
            return {
                ...state,
                description: action.description,
            }

        case "MY_LOCATION_UPDATE":
            return {
                ...state,
                location: action.location,
            }

        case "MY_WEBSITE_UPDATE":
            return {
                ...state,
                website: action.website,
            }

        case "MY_IMAGE_UPDATE":
            return {
                ...state,
                image: action.image,
            }

        case "MY_COVERPHOTO_UPDATE":
            return {
                ...state,
                coverPhoto: action.coverPhoto,
            }

        case "MY_BIRTHDAY_UPDATE":
            return {
                ...state,
                birthday: action.birthday,
            }

        case "MY_DID_UPDATE":
            return {
                ...state,
                did: action.did,
            }

        case "MY_FOLLOWING_SPACE_OPEN":
            return {
                ...state,
                followingSpace: action.followingSpace,
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
