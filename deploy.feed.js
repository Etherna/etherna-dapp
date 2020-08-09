const signData = (address, privateKey, data) => {
  const web3 = require("web3")
  const { sign, recover } = require("eth-lib").account
  let signature = sign(data, privateKey)

  // Fix signature recover version
  let sigBytes = web3.utils.hexToBytes(signature)
  sigBytes[64] -= 27
  signature = web3.utils.bytesToHex(sigBytes)

  if (recover(data, signature) !== address) {
    throw new Error("Invalid signature")
  }

  return web3.utils.toHex(signature)
}

const feedDigest = (request, data) => {
  const web3 = require("web3")
  const topicBytes = web3.utils.hexToBytes(request.feed.topic)
  const userBytes = web3.utils.hexToBytes(request.feed.user)
  const protocolVersion = request.protocolVersion

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
  view.setUint32(cursor, request.epoch.time, true)
  cursor += 7

  view.setUint8(cursor, request.epoch.level)
  cursor += 1

  data.forEach(function(v) {
    view.setUint8(cursor, v)
    cursor += 1
  })

  return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buffer)))
}

/**
 * @param {string|null} hash App hash on Swarm
 */
const updateFeed = async hash => {
  if (!hash || hash === "") {
    throw new Error("Invalid hash")
  }

  const axios = require("axios")
  const config = require("./deploy.config")

  try {
    const feed = (
      await axios.get(`${config.swarmGateway}/bzz-feed:/`, {
        params: {
          name: config.feedName,
          user: config.swarmAccount,
          meta: "1",
        },
      })
    ).data
    const data = Buffer.from(hash.slice(2), "hex")
    const digest = feedDigest(feed, data)
    const signature = signData(config.swarmAccount, config.swarmAccountPrivateKey, digest)

    const resp = await axios.post(`${config.swarmGateway}/bzz-feed:/`, data, {
      params: {
        topic: feed.feed.topic,
        user: config.swarmAccount,
        level: feed.epoch.level,
        time: feed.epoch.time,
        protocolVersion: feed.protocolVersion,
        signature,
      },
    })
    console.log(`Feed updated: ${resp.data}`)
  } catch (error) {
    console.error(error)
  }
}

exports.updateFeed = updateFeed
