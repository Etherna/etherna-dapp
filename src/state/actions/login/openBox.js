import Box from "3box"

import { store } from "../../store"
import { startPollFlag, pollNetworkAndAddress } from "./addressPoll"
import getProfile from "../user/getProfile"
import getChannel from "../channel/getChannel"
import { fetchEns } from "../../../utils/ensFuncs"

const openBox = (fromSignIn, fromFollowButton) => async dispatch => {
    const { currentAddress, web3Obj, hasSignedOut } = store.getState().user

    dispatch({
        type: "UI_HANDLE_CONSENT_MODAL",
        provideConsent: true,
        showSignInBanner: false,
    })

    const consentCallback = () => {
        startPollFlag()
        pollNetworkAndAddress() // Start polling for address change
        getProfile(currentAddress)
        getChannel(currentAddress)

        dispatch({
            type: "UI_3BOX_LOADING",
            provideConsent: false,
            isFetchingThreeBox: true,
        })
        dispatch({
            type: "UI_PROFILE_LOADING",
            isFetchingChannel: true,
        })
    }

    // onSyncDone only happens on first openBox so only run
    // this when a user hasn't signed out and signed back in again
    if (!hasSignedOut) {
        // initialize onSyncDone process
        dispatch({
            type: "UI_APP_SYNC",
            onSyncFinished: false,
            isSyncing: false,
        })
    }

    try {
        const box = await Box.create(web3Obj.currentProvider)
        const spaces = ["ETHERNA"]
        await box.auth(spaces, {
            address: currentAddress,
        })
        await box.syncDone
        consentCallback()

        const ens = await fetchEns(web3Obj, currentAddress, web3Obj)

        dispatch({
            type: "USER_LOGIN_UPDATE",
            isLoggedIn: true,
        })
        dispatch({
            type: "MY_BOX_UPDATE",
            box,
            ens,
            threeId: box._3id.DID,
        })
        dispatch({
            type: "UI_3BOX_FETCHING",
            isFetchingThreeBox: false,
            // onOtherProfilePage: false,
        })

        // onSyncDone only happens on first openBox so only run
        // this when a user hasn't signed out and signed back in again
        if (!hasSignedOut) {
            // start onSyncDone loading animation
            dispatch({
                type: "UI_APP_SYNC",
                onSyncFinished: false,
                isSyncing: true,
            })
        }

        box.onSyncDone(() => {
            dispatch({
                type: "USER_LOGIN_UPDATE",
                isLoggedIn: true,
            })
            dispatch({
                type: "UI_3BOX_FETCHING",
                isFetchingThreeBox: false,
            })
            dispatch({
                type: "UI_APP_SYNC",
                onSyncFinished: true,
                isSyncing: true,
            })
        })
    } catch (err) {
        dispatch({
            type: "UI_3BOX_FAILED",
            errorMessage: err,
            showErrorModal: true,
            provideConsent: false,
        })
    }
}

export default openBox
