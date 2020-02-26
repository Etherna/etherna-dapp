import Box from "3box"

export const getProfile = async address => {
    try {
        let boxProfile = await Box.getProfile(address)
        boxProfile.address = address
        return boxProfile
    } catch (error) {
        console.error(error)
    }
}

export const getProfiles = async addresses => {
    try {
        // BUG: https://github.com/3box/3box-js/issues/649
        //const boxProfiles = await Box.getProfiles(addresses)

        let boxProfiles = []
        for (let address of addresses) {
            const profile = await getProfile(address)
            boxProfiles.push(profile)
        }
        return boxProfiles
    } catch (error) {
        console.error(error)
    }
}
