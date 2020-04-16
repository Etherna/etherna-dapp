const config = require("./deploy.config")

const deployToHost = () => {
    const FtpDeploy = require("ftp-deploy")
    const moment = require("moment")

    const start = moment()
    const ftpDeploy = new FtpDeploy()
    ftpDeploy.on("uploading", function(data) {
        console.log(data.transferredFileCount + "/" + data.totalFilesCount + " - " + data.filename)
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
    // TODO:
    // swarm --bzzapi https://gateway.etherna.io --defaultpath build/index.html --recursive up build --progress

    const exec = require('child_process').exec

    const command = "swarm --bzzapi https://gateway.etherna.io --defaultpath build/index.html --recursive up build --progress"

    const execUpload = () => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
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

    const hash = await execUpload()
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
