const config = require("./deploy.config")

const deployToHost = () => {
    const FtpDeploy = require("ftp-deploy")
    const moment = require("moment")

    const start = moment()
    const ftpDeploy = new FtpDeploy()
    ftpDeploy.on("uploading", function(data) {
        console.log(
            data.transferredFileCount +
                "/" +
                data.totalFilesCount +
                " - " +
                data.filename
        )
    })
    ftpDeploy.on("upload-error", function(data) {
        console.log(data.err)
    })

    ftpDeploy
        .deploy(config)
        .then(data => {
            const end = moment()
            const timespan = end.diff(start, "seconds")
            const minutes = Math.floor(timespan / 60)
            const seconds = timespan - minutes * 60
            console.log(`Deploy completed in ${minutes}m and ${seconds}s`)
        })
        .catch(error => {
            console.error(error)
        })
}

const deployToSwarm = async () => {
    const { exec } = require("child_process")
    const execCommand = cmd => {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`)
                    reject(error)
                } else if (stderr) {
                    console.log(`stderr: ${stderr}`)
                    reject(stderr)
                } else {
                    console.log(`stdout: ${stdout}`)
                    resolve(stdout)
                }
            })
        })
    }
    const promptPassphrase = () => {
        return new Promise(resolve => {
            const readline = require("readline")
            const Writable = require("stream").Writable
            const mutableStdout = new Writable({
                write: function(chunk, encoding, callback) {
                    if (!this.muted) process.stdout.write(chunk, encoding)
                    callback()
                },
            })
            mutableStdout.muted = false

            const rl = readline.createInterface({
                input: process.stdin,
                output: mutableStdout,
                terminal: true,
            })
            rl.write(
                `Unlock account ${config.swarmAccount} to update the feed...\n`
            )
            rl.question("Passphrase: ", password => {
                rl.close()
                resolve(password)
            })

            mutableStdout.muted = true
        })
    }

    try {
        var attempts = 1
        var decryptedAccount = null
        while (!decryptedAccount && attempts <= 3) {
            const password = await promptPassphrase()
            decryptedAccount = unlockAccount(
                config.swarmAccountKeystore,
                password
            )

            if (!decryptedAccount) {
                console.log(`\nWrong passphrase. Attempt ${attempts}/3\n`)
            }

            attempts++
        }

        if (!decryptedAccount) {
            throw new Error("cannot unlock account. Retry.")
        }

        // Upload build folder to swarm
        console.log("Uploading build folder to swarm...")
        const command = `swarm --bzzapi ${config.swarmGateway} --defaultpath build/index.html --recursive up build`
        const manifest = await execCommand(command)
        const hash = "0x" + manifest

        // Update etherna feed
        const axios = require("axios")
        const feed = (
            await axios.get("https://swarm-gateways.net/bzz-feed:/", {
                params: {
                    name: config.feedName,
                    user: config.swarmAccount,
                    meta: "1",
                },
            })
        ).data
        const data = Buffer.from(hash.slice(2), "hex")
        const digest = feedDigest(feed, data)
        const signature = signData(decryptedAccount, digest)

        const resp = await axios.post(
            "https://swarm-gateways.net/bzz-feed:/",
            data,
            {
                params: {
                    topic: feed.feed.topic,
                    user: config.swarmAccount,
                    level: feed.epoch.level,
                    time: feed.epoch.time,
                    protocolVersion: feed.protocolVersion,
                    signature,
                },
            }
        )
        console.log(resp.data)
    } catch (error) {
        console.error(error)
    }
}

const unlockAccount = (keystore, password) => {
    try {
        const fs = require("fs")
        const Web3 = require("web3")
        const web3 = new Web3()
        const decryptedAccount = web3.eth.accounts.decrypt(
            fs.readFileSync(keystore, { encoding: "utf-8" }),
            password
        )
        return decryptedAccount
    } catch (error) {
        return false
    }
}

const signData = (decryptedAccount, data) => {
    const web3 = require("web3")

    const { makeSigner, recover } = require("eth-lib").account
    const sig = makeSigner(0)(data, decryptedAccount.privateKey)
    // Fix signature lenght
    const signature =
        sig.length === 131
            ? sig.slice(0, sig.length - 1) + "0" + sig.slice(sig.length - 1)
            : sig + "00"

    if (recover(data, signature) !== decryptedAccount.address) {
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
    const updateMinLength =
        topicLength + userLength + timeLength + levelLength + headerLength

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

const deploy = () => {
    const args = process.argv
    const isSwarm = args.length > 2 && args[2] === "--swarm"

    if (isSwarm) {
        deployToSwarm()
    } else {
        deployToHost()
    }
}

deploy()
