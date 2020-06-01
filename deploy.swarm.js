const config = require("./deploy.config")

const execCommand = cmd => {
    const { exec } = require("child_process")
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            } else if (stderr) {
                reject(stderr)
            } else {
                resolve(stdout)
            }
        })
    })
}

const deployToSwarm = async () => {
    try {
        // Upload build folder to swarm
        console.log("Uploading build folder to swarm...")
        const command = `swarm --bzzapi ${config.swarmGateway} --defaultpath build/index.html --recursive up build`
        const manifest = await execCommand(command)
        const hash = "0x" + manifest

        console.log(`App deployed to ${manifest}`)

        // return hash for the feed
        return hash
    } catch (error) {
        console.error(error)
    }
}

exports.deployToSwarm = deployToSwarm