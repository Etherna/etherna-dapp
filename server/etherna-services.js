const fs = require("fs")
const path = require("path")
const waitOn = require("wait-on")
const chalk = require("chalk")
const url = require("url")
const { exec, } = require("child_process")

require("./utils/env")

/**
 * exec function callback
 */
const execCallback = (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    return
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`)
    return
  }
  console.log(`stdout: ${stdout}`)
}

/**
 * Search for deep value in a json object
 * @param {object} json The json to search
 * @param {string} keySearch The key to search
 * @param {string[]} ingoreKeys The keys to ignore
 * @returns {any|null} If found, the value, otherwise null
 */
const jsonDeepValue = (json, keySearch, ingoreKeys = []) => {
  if (typeof json !== "object") return null

  for (const key in json) {
    if (ingoreKeys.indexOf(key) >= 0) continue

    if (key === keySearch) {
      return json[key]
    }

    const deepValue = jsonDeepValue(json[key], keySearch)
    if (deepValue) return deepValue
  }

  return null
}

/**
 * Strip BOM from json string
 * @param {string} content The json string value
 * @returns The stripped json string value
 */
const stripBOM = content => {
  content = content.toString()
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}

/**
 * Get the service host url
 * @param {string} projectPath The service project path
 * @returns {string|null} If found, the host url
 */
const serviceHost = projectPath => {
  const basePath = path.dirname(projectPath)
  const appSettingsPath = path.join(basePath, "Properties/launchSettings.json")
  if (fs.existsSync(appSettingsPath)) {
    const data = fs.readFileSync(appSettingsPath).toString("utf8")
    const json = JSON.parse(stripBOM(data))
    const applicationUrl = jsonDeepValue(json, "applicationUrl", ["iisSettings"])
    if (typeof applicationUrl === "string") {
      const urls = applicationUrl.split(";")
        .map(url => url.trim())
        .sort((a, b) => {
          const aProtocol = url.parse(a).protocol
          const bProtocol = url.parse(b).protocol

          if (aProtocol === "https") return 1
          if (bProtocol === "https") return -1
          return 0
        })
      return urls.length > 0 ? urls[0] : null
    }
  }
  return null
}

/**
 * Run the service
 * @param {string} projectPath The service project path
 */
const execProject = (projectPath) => {
  const execCms = `dotnet watch -p ${projectPath} run`
  return exec(execCms, execCallback)
}

/**
 * Run the bee instance
 */
const execBee = () => {
  const boolVal = (val) => val === "true" || val === "1"
  const pwd = process.env.BEE_PWD ? `--password=${process.env.BEE_PWD}` : ``
  const endpoint = process.env.BEE_PORT ? `--api-addr=:${process.env.BEE_PORT}` : ``
  const pinning = boolVal(process.env.BEE_ENABLE_PIN) ? `--global-pinning-enable=true` : ``
  const dbCapacity = process.env.BEE_DB_CAPACITY ? `--cache-capacity=${process.env.BEE_DB_CAPACITY}` : ``
  const otherArgs = [
    `--cors-allowed-origins=*`,
    `--swap-enable=false`,
    `--standalone=true`,
    `--gateway-mode=true`
  ]
  const execCms = `bee start ${pwd} ${endpoint} ${pinning} ${dbCapacity} ${otherArgs.join(" ")}`.trim()
  return exec(execCms, execCallback)
}

/**
 * Wait for the service to run
 * @param {string} projectPath The service project path / or the actual url
 * @param {string} name The service project name (used to log)
 * @returns {Promise<void>} Waiting promise
 */
const waitService = (projectPath, name) => {
  return new Promise((resolve) => {
    const host = url.parse(projectPath).hostname ? projectPath : serviceHost(projectPath)
    if (host) {
      waitOn({
        resources: [host],
        delay: 100,
        timeout: 60000
      }).then(() => {
        console.log(chalk.green(`${name} connected!`) + chalk.reset(` Host --> ${host}`))
        resolve()
      }).catch(() => {
        console.log(chalk.red(`Cannot reach ${name} at ${host}`))
        resolve()
      })
    } else {
      console.log(chalk.yellow(`${name} host not found`))
      resolve()
    }
  })
}

/** @type {import("child_process").ChildProcess[]} */
let processes = []

/**
 * Run the project services
 */
const run = async () => {
  process.on("exit", () => {
    processes.forEach(process => {
      process.kill()
    })
  })

  const args = process.argv.slice(2, process.argv.length)

  const shouldRunEthernaSSO = args.length === 0 || args.includes("--sso")
  const shouldRunEthernaIndex = args.length === 0 || args.includes("--index")
  const shouldRunEthernaCredit = args.length === 0 || args.includes("--credit")
  const shouldRunEthernaValidator = args.length === 0 || args.includes("--val")
  const shouldRunBeeNode = process.env.BEE_LOCAL_INSTANCE === "true" && (args.length === 0 || args.includes("--bee"))

  if (shouldRunEthernaSSO) {
    const ssoProcess = execProject(process.env.ETHERNA_SSO_PROJECT_PATH)
    processes.push(ssoProcess)
    await waitService(process.env.ETHERNA_SSO_PROJECT_PATH, "Etherna SSO")
  }

  if (shouldRunEthernaIndex) {
    const indexProcess = execProject(process.env.ETHERNA_INDEX_PROJECT_PATH)
    processes.push(indexProcess)
  }

  if (shouldRunEthernaCredit) {
    const creditProcess = execProject(process.env.ETHERNA_CREDIT_PROJECT_PATH)
    processes.push(creditProcess)
  }

  if (shouldRunEthernaValidator) {
    const validatorProcess = execProject(process.env.ETHERNA_GATEWAY_VALIDATOR_PROJECT_PATH)
    processes.push(validatorProcess)
  }

  // await services async
  shouldRunEthernaIndex && await waitService(process.env.ETHERNA_INDEX_PROJECT_PATH, "Etherna Index")
  shouldRunEthernaCredit && await waitService(process.env.ETHERNA_CREDIT_PROJECT_PATH, "Etherna Credit")
  shouldRunEthernaValidator && await waitService(process.env.ETHERNA_GATEWAY_VALIDATOR_PROJECT_PATH, "Etherna Gateway Validator")

  if (shouldRunBeeNode) {
    const beeProcess = execBee()
    processes.push(beeProcess)
    await waitService(process.env.BEE_ENDPOINT, "Bee Node")
  }

  console.log(`✅ All done!`)
}

run()
