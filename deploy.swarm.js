const fs = require("fs")
const glob = require("glob")
const mimetypes = require("mime-types")
const config = require("./deploy.config")
const { BzzNode } = require("@erebos/swarm-node")

/**
 * @returns {string[][]}
 */
const readFiles = () => new Promise((resolve, reject) => {
    glob(config.localRoot + "/**/*", (error, result) => {
        if (error) reject (error)

        let files = []
        result.forEach(path => {
            if (fs.lstatSync(path).isFile()) {
                let file = path.replace(config.localRoot, "")
                if (file.startsWith("/")) file = file.substr(1, file.length - 1)
                files.push([file, path])
            }
        })

        resolve(files)
    })
})

const deployToSwarm = async () => {
    try {
        // Upload build folder to swarm
        console.log("Uploading build folder to swarm...")

        const files = await readFiles()

        // Creating form data
        let data = {
            // default path
            "": {
                data: fs.readFileSync(`${config.localRoot}/index.html`),
                contentType: "text/html",
            },
        }

        files.forEach(fileInfo => {
            const [fileName, filePath] = fileInfo
            data[fileName] = {
                data: fs.readFileSync(filePath),
                contentType: mimetypes.lookup(filePath),
            }
        })

        // Upload
        const bzz = new BzzNode({ url: config.swarmGateway })
        const manifest = await bzz.uploadDirectory(data)

        console.log(`App deployed to ${manifest}`)

        // return hash for the feed
        return `0x${manifest}`
    } catch (error) {
        console.error(error)
    }
}

exports.deployToSwarm = deployToSwarm