const deployToHost = () => {
  const FtpDeploy = require("ftp-deploy")
  const moment = require("moment")
  const config = require("./deploy.config")

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

exports.deployToHost = deployToHost
