import axios from "axios"
import web3 from "web3"

import { store } from "@state/store"
import { askToSignMessage } from "./walletFuncs"

/**
 * Fetch feed data
 * @param {string} topic Hash of the topic, default is 0x0... (use null for name only)
 * @param {string} name Name of the subtopic (use null for topic only)
 * @param {string} user Address of the user
 * @param {number} meta Specify 1 to get the feed metadata instead of the feed itself (optional)
 */
export const readFeed = async (topic, name, user, meta = undefined) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const api = `${SwarmGateway}/bzz-feed:/`
    const resp = await axios.get(api, {
        params: {
            topic,
            name,
            user,
            meta
        }
    })
    return resp.data
}

/**
 * Update a feed with new data
 * @param {string} topic Hash of the topic, default is 0x0... (use null for name only)
 * @param {string} name Name of the subtopic (use null for topic only)
 * @param {string} user Address of the user
 * @param {string} update String value to update
 */
export const updatedFeed = async (topic, name, user, update) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const data = (new TextEncoder()).encode(update)
    const userAddress = web3.utils.toChecksumAddress(user)

    if (data.length > 3963) {
        throw new Error("Data exceed max length of 3963 bytes")
    }

    const subtopic = parseSubTopic(topic, name)
    const feed = await readFeed(subtopic, undefined, userAddress, 1)
    const digest = feedDigest(feed, data)
    const sig = await askToSignMessage(digest, true)
    const signature = web3.utils.toHex(sig)

    const resp = await axios.post(`${SwarmGateway}/bzz-feed:/`, data, {
        params: {
            topic: feed.feed.topic,
            user: userAddress,
            level: feed.epoch.level,
            time: feed.epoch.time,
            protocolVersion: feed.protocolVersion,
            signature
        }
    })

    return resp.data
}

/**
 * Return the hex value of a subtopic, composed by a topic hash and a name string
 * @param {string} topic Hash of the topic
 * @param {string} name Name of the subtopic (use null for topic only)
 */
export const parseSubTopic = (topic, name) => {
    const nameHash = web3.utils.fromAscii(name || '')
    const topicBytes = web3.utils.hexToBytes(topic)
    const nameBytes = web3.utils.hexToBytes(nameHash)

    const maxLenght = Math.max(topicBytes.length, nameBytes.length)
    let subtopicBytes = (new Array(maxLenght)).fill(0).map((_, i) => {
        const tb = topicBytes.length > i ? topicBytes[i] : 0
        const nb = nameBytes.length > i ? nameBytes[i] : 0
        const mtnb = tb ^ nb
        return mtnb
    })

    const subtopic = web3.utils.bytesToHex(subtopicBytes)
    return subtopic
}

/**
 * Get the digest hash used to update a feed
 * @param {object} feed Json object containing the current feed information
 * @param {string} update String value of the new update
 */
export const feedDigest = (feed, update) => {
    const data = typeof update === "string"
        ? (new TextEncoder()).encode(update)
        : update
    const topicBytes = web3.utils.hexToBytes(feed.feed.topic)
    const userBytes = web3.utils.hexToBytes(feed.feed.user)
    const protocolVersion = feed.protocolVersion

    // signature length
    const topicLength = 32
    const userLength = 20
    const timeLength = 7
    const levelLength = 1
    const headerLength = 8
    const updateMinLength = topicLength + userLength + timeLength + levelLength + headerLength

    const buffer = new ArrayBuffer(updateMinLength + data.length)
    const view = new DataView(buffer)
    var cursor = 0

    view.setUint8(cursor, protocolVersion) // first byte is protocol version.
    cursor += headerLength // leave the next 7 bytes (padding) set to zero

    topicBytes.forEach(function(v) {
        view.setUint8(cursor, v)
        cursor += 1
    })
    userBytes.forEach(function(v) {
        view.setUint8(cursor, v)
        cursor += 1
    })

    // time is little-endian
    view.setUint32(cursor, feed.epoch.time, true)
    cursor += 7

    view.setUint8(cursor, feed.epoch.level)
    cursor += 1

    data.forEach(function(v) {
        view.setUint8(cursor, v)
        cursor += 1
    })

    return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buffer)))
}
