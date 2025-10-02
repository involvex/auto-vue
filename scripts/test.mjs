#!/usr/bin/env zx
import 'zx/globals'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import { exec } from 'node:child_process'

process.env.SHELL = 'powershell.exe'

const playgroundDir = path.resolve(dirname(fileURLToPath(import.meta.url)), '../playground/')
let projects = fs
  .readdirSync(playgroundDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((name) => !name.startsWith('.') && name !== 'node_modules')

if (process.argv[3]) projects = projects.filter((project) => project.includes(process.argv[3]))

cd(playgroundDir)
console.log('Installing playground dependencies')
await new Promise((resolve, reject) => {
  exec('npm install', { cwd: playgroundDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return reject(error)
    }
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
    resolve()
  })
})

for (const projectName of projects) {
  cd(path.resolve(playgroundDir, projectName))
  const packageJSON = require(path.resolve(playgroundDir, projectName, 'package.json'))

  console.log(`
  
#####
Building ${projectName}
#####
  
  `)
  await new Promise((resolve, reject) => {
    exec(
      'npm run build',
      { cwd: path.resolve(playgroundDir, projectName) },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return reject(error)
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        resolve()
      },
    )
  })

  if ('@playwright/test' in packageJSON.devDependencies) {
    await new Promise((resolve, reject) => {
      exec(
        'npx playwright install --with-deps',
        { cwd: path.resolve(playgroundDir, projectName) },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return reject(error)
          }
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
          resolve()
        },
      )
    })
  }

  if ('test:e2e' in packageJSON.scripts) {
    console.log(`Running e2e tests in ${projectName}`)
    await new Promise((resolve, reject) => {
      exec(
        'npm run test:e2e',
        { cwd: path.resolve(playgroundDir, projectName) },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return reject(error)
          }
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
          resolve()
        },
      )
    })
  }

  if ('test:unit' in packageJSON.scripts) {
    console.log(`Running unit tests in ${projectName}`)
    if (projectName.includes('vitest') || projectName.includes('with-tests')) {
      // Vitest would otherwise enable watch mode by default.
      await new Promise((resolve, reject) => {
        exec(
          'CI=1 npm run test:unit',
          { cwd: path.resolve(playgroundDir, projectName) },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return reject(error)
            }
            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
            resolve()
          },
        )
      })
    } else {
      await new Promise((resolve, reject) => {
        exec(
          'npm run test:unit',
          { cwd: path.resolve(playgroundDir, projectName) },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return reject(error)
            }
            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
            resolve()
          },
        )
      })
    }
  }

  if ('type-check' in packageJSON.scripts) {
    console.log(`Running type-check in ${projectName}`)
    await new Promise((resolve, reject) => {
      exec(
        'npm run type-check',
        { cwd: path.resolve(playgroundDir, projectName) },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return reject(error)
          }
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
          resolve()
        },
      )
    })
  }
}
