import Box from "3box"

import { store } from "../../store"

const getProfile = async address => {
    try {
        const generalProfile = await Box.getProfile(address)

        store.dispatch({
            type: "MY_GENERAL_PROFILE_UPDATE",
            name: generalProfile.name,
            description: generalProfile.description,
            image: generalProfile.image,
            coverPhoto: generalProfile.coverPhoto,
            location: generalProfile.location,
            website: generalProfile.website,
            birthday: generalProfile.birthday,
        })

        const updatedFetchedProfiles = {}
        updatedFetchedProfiles[address] = generalProfile

        store.dispatch({
            type: "MY_FETCHED_PROFILES_UPDATE",
            fetchedProfiles: updatedFetchedProfiles,
        })
    } catch (error) {
        console.error(error)
    }
}

export default getProfile
