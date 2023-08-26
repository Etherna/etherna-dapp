/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { exec } from "child_process"
import fs from "fs"
import path from "path"
import url from "url"
import { hashSync } from "bcrypt-ts"
import chalk from "chalk"
import waitOn from "wait-on"

import "./env.mjs"

import proxyBeeOverHttps from "./bee-https-proxy.mjs"
import { createPostageBatch } from "./create-postage-batch.mjs"
import { loadSeed } from "./swarm-seed.mjs"

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
    if (ingoreKeys.includes(key)) continue

    if (key === keySearch) {
      return json[key]
    }

    const deepValue = jsonDeepValue(json[key], keySearch, ingoreKeys)
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
  if (content.charCodeAt(0) === 0xfeff) {
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
    const applicationUrl = jsonDeepValue(json, "applicationUrl", ["iisSettings", "http"])
    if (typeof applicationUrl === "string") {
      const urls = applicationUrl
        .split(";")
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
const execProject = projectPath => {
  const basePath = path.dirname(projectPath)
  const appSettingsPath = path.join(basePath, "Properties/launchSettings.json")

  const params = []

  if (fs.existsSync(appSettingsPath)) {
    const launchSettings = JSON.parse(stripBOM(fs.readFileSync(appSettingsPath).toString("utf8")))
    const profiles = launchSettings.profiles ?? {}
    if ("https" in profiles) {
      params.push("--launch-profile", "https")
    }
  }

  const execCms = `dotnet run -p ${projectPath} ${params.join(" ")}`
  return exec(execCms, execCallback)
}

/**
 * Run the bee instance
 */
const execBee = () => {
  const adminPassword = hashSync(process.env.BEE_ADMIN_PASSWORD)
  const testnetParams = [
    `--mainnet=false`,
    `--password='${process.env.BEE_PASSWORD}'`,
    `--full-node=true`,
    `--swap-endpoint='${process.env.BEE_SWAP_ENDPOINT}'`,
    `--debug-api-enable=true`,
  ]
  const params = [
    process.env.BEE_MODE === "dev" ? "dev" : "start",
    `--admin-password='${adminPassword}'`,
    `--restricted`,
    `--cors-allowed-origins='*'`,
    ...(process.env.BEE_MODE === "testnet" ? testnetParams : []),
  ]
  const execCms = `bee ${params.join(" ")}`
  const childProcess = exec(execCms, execCallback)
  if (Boolean(process.env.BEE_HTTPS)) {
    proxyBeeOverHttps()
  }
  return childProcess
}

/**
 * Start mongod service
 */
const execMongo = async () => {
  const platform = process.platform
  const arch = process.arch

  let configPath = ""

  if (platform === "darwin" && arch === "x64") {
    configPath = "/usr/local/etc/mongod.conf"
  } else if (platform === "darwin" && arch === "arm64") {
    configPath = "/opt/homebrew/etc/mongod.conf"
  } else if (platform === "linux") {
    configPath = "/etc/mongod.conf"
  } else if (platform === "win32") {
    configPath = "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.cfg"
  }

  const execCms = `mongod --config ${configPath} --fork`
  return exec(execCms, execCallback)
}

/**
 * Wait for the service to run
 * @param {string} projectPath The service project path / or the actual url
 * @param {string} name The service project name (used to log)
 * @returns {Promise<void>} Waiting promise
 */
const waitService = (projectPath, name) => {
  return new Promise(resolve => {
    const host = url.parse(projectPath).hostname ? projectPath : serviceHost(projectPath)
    if (host) {
      waitOn({
        resources: [host],
        delay: 50,
        timeout: 30000,
        validateStatus: function (status) {
          // if returns any status code then server is up
          return true
        },
      })
        .then(() => {
          console.log(chalk.green(`${name} connected!`) + chalk.reset(` Host --> ${host}`))
          resolve()
        })
        .catch(() => {
          console.log(chalk.red(`Cannot reach ${name} at ${host}`))
          resolve()
        })
    } else {
      console.log(chalk.yellow(`${name} host not found`))
      resolve()
    }
  })
}

/**
 * Show logs of errors
 * @param {string} service
 * @param {string} errorData
 */
const logServiceError = (service, errorData) => {
  if (/[15:26:18 ERR]/.test(errorData)) {
    console.log(chalk.red(`${service} Error:`))
    console.log(chalk.red(errorData))
  }
}

/** @type {import("child_process").ChildProcess[]} */
let processes = []

/**
 * Run the project services
 */
const run = async () => {
  console.log(chalk.gray("Starting services..."))

  process.on("SIGINT", () => {
    console.log(chalk.yellow("Killing services..."))
    processes.forEach(process => {
      process.kill()
    })
    process.exit()
  })

  const args = process.argv.slice(2, process.argv.length)

  const verbose = args.includes("--verbose")
  const runAllServices = args.filter(arg => arg !== "--verbose").length === 0

  const shouldRunBeeNode =
    process.env.BEE_LOCAL_INSTANCE === "true" && (runAllServices || args.includes("--bee"))
  const shouldRunEthernaSSO = runAllServices || args.includes("--sso")
  const shouldRunEthernaIndex = runAllServices || args.includes("--index")
  const shouldRunEthernaCredit = runAllServices || args.includes("--credit")
  const shouldRunEthernaGateway = runAllServices || args.includes("--gateway")
  const shouldRunEthernaBeehive = runAllServices || args.includes("--beehive")
  const shouldRunProxy = runAllServices || args.includes("--proxy")
  const shouldRunMongo = args.includes("--mongo")

  if (shouldRunMongo) {
    await execMongo()
  }

  if (shouldRunBeeNode) {
    const beeProcess = execBee()
    processes.push(beeProcess)
    await waitService(process.env.BEE_ENDPOINT, "Bee Node")

    if (process.env.BEE_MODE === "dev") {
      const batchId = await createPostageBatch()
      await loadSeed(batchId)
    }
  }

  if (shouldRunEthernaSSO) {
    const ssoProcess = execProject(process.env.ETHERNA_SSO_PROJECT_PATH)
    processes.push(ssoProcess)
    await waitService(process.env.ETHERNA_SSO_PROJECT_PATH, "Etherna SSO")
  }

  if (shouldRunEthernaIndex) {
    const indexProcess = execProject(process.env.ETHERNA_INDEX_PROJECT_PATH)
    verbose && indexProcess.stdout.on("data", data => logServiceError("Index: ", data))
    processes.push(indexProcess)

    await waitService(process.env.ETHERNA_INDEX_PROJECT_PATH, "Etherna Index")
  }

  if (shouldRunEthernaCredit) {
    const creditProcess = execProject(process.env.ETHERNA_CREDIT_PROJECT_PATH)
    verbose && creditProcess.stdout.on("data", data => logServiceError("Credit: ", data))
    processes.push(creditProcess)

    await waitService(process.env.ETHERNA_CREDIT_PROJECT_PATH, "Etherna Credit")
  }

  if (shouldRunEthernaBeehive) {
    const beehiveProcess = execProject(process.env.ETHERNA_BEEHIVE_PROJECT_PATH)
    verbose && beehiveProcess.stdout.on("data", data => logServiceError("Beehive: ", data))
    processes.push(beehiveProcess)

    await waitService(process.env.ETHERNA_BEEHIVE_PROJECT_PATH, "Etherna Beehive")
  }

  if (shouldRunEthernaGateway) {
    const gatewayProcess = execProject(process.env.ETHERNA_GATEWAY_PROJECT_PATH)
    verbose && gatewayProcess.stdout.on("data", data => logServiceError("Gateway: ", data))
    processes.push(gatewayProcess)

    await waitService(process.env.ETHERNA_GATEWAY_PROJECT_PATH, "Etherna Gateway")
  }

  if (shouldRunProxy) {
    const validatorProcess = exec(
      "npm run start",
      {
        cwd: path.resolve("proxy"),
      },
      execCallback
    )
    verbose && validatorProcess.stdout.on("data", data => logServiceError("Proxy: ", data))
    processes.push(validatorProcess)

    await waitService(`https://localhost:${process.env.GATEWAY_PORT}`, "Etherna Gateway Proxy")
  }

  console.log(`✅ All done!`)
}

run()
