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

import fs from "fs"
import path from "path"
import waitOn from "wait-on"
import chalk from "chalk"
import url from "url"
import { exec } from "child_process"
import DotEnv from "dotenv"
import { createPostageBatch } from "./create-postage-batch.mjs"
import { loadSeed } from "./swarm-seed.mjs"

DotEnv.config({
  path: fs.existsSync(path.resolve(`.env.development`))
    ? `.env.development`
    : ".env",
})

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
  const execCms = `bee dev --cors-allowed-origins=*`
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
        timeout: 30000,
        validateStatus: function (status) {
          // if returns any status code then server is up
          return true
        }
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
  console.log(chalk.gray("Starting services..."))

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
  const shouldRunProxy = args.length === 0 || args.includes("--proxy")
  const shouldRunBeeNode = process.env.BEE_LOCAL_INSTANCE === "true" && (args.length === 0 || args.includes("--bee"))

  if (shouldRunBeeNode) {
    const beeProcess = execBee()
    processes.push(beeProcess)
    await waitService(process.env.BEE_ENDPOINT, "Bee Node")
    const batchId = await createPostageBatch()
    await loadSeed(batchId)
  }

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
    const validatorProcess = execProject(process.env.ETHERNA_GATEWAY_PROJECT_PATH)
    processes.push(validatorProcess)
  }

  if (shouldRunProxy) {
    const validatorProcess = exec(
      "npm run start",
      {
        cwd: path.resolve("proxy")
      },
      execCallback
    )
    const beeDebugProcess = exec(
      "npm run start:bee-debug",
      {
        cwd: path.resolve("proxy")
      },
      execCallback
    )
    processes.push(validatorProcess)
    processes.push(beeDebugProcess)
  }

  // await services async
  shouldRunEthernaIndex &&
    await waitService(process.env.ETHERNA_INDEX_PROJECT_PATH, "Etherna Index")
  shouldRunEthernaCredit &&
    await waitService(process.env.ETHERNA_CREDIT_PROJECT_PATH, "Etherna Credit")
  shouldRunEthernaValidator &&
    await waitService(process.env.ETHERNA_GATEWAY_PROJECT_PATH, "Etherna Gateway Validator")
  shouldRunProxy &&
    await waitService(`https://localhost:${process.env.BEE_DEBUG_PORT}`, "Bee Debug Https Proxy")
  shouldRunProxy &&
    await waitService(`https://localhost:${process.env.GATEWAY_PORT}`, "Etherna Gateway Proxy")

  console.log(`✅ All done!`)
}

run()
