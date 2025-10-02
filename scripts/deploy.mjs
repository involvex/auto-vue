#!/usr/bin/env zx

import { $, chalk, fs } from 'zx'
import { execSync, spawn } from 'child_process'
import { platform } from 'os'

const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
const isWindows = platform() === 'win32'

console.log(chalk.blue('🚀 Starting automated deployment...'))
console.log(chalk.blue(`🖥️  Platform: ${platform()}`))

// Helper function to run commands with proper shell
async function runCommand(command, options = {}) {
  if (isWindows) {
    // Use spawn with cmd for Windows
    return new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', command], {
        stdio: 'inherit',
        shell: true,
      })
      child.on('close', (code) => {
        if (code === 0) resolve({ stdout: '', stderr: '' })
        else reject(new Error(`Command failed with exit code ${code}`))
      })
    })
  } else {
    // Use zx for Unix-like systems
    return await $`${command}`
  }
}

try {
  // Step 1: Build and format
  console.log(chalk.yellow('📦 Building project...'))
  await runCommand('npm run build')
  await runCommand('npm run format')
  await runCommand('npm run lint:fix')

  // Step 1.5: Check formatting
  console.log(chalk.yellow('🎨 Checking formatting...'))
  await runCommand('npm run format:check')

  // Step 2: Check git status
  console.log(chalk.yellow('📋 Checking git status...'))
  const { stdout: gitStatus } = await runCommand('git status --porcelain')

  if (!gitStatus.trim()) {
    console.log(chalk.green('✅ No changes to commit'))
    process.exit(0)
  }

  // Step 3: Add all changes
  console.log(chalk.yellow('📝 Adding changes to git...'))
  await runCommand('git add .')

  // Step 4: Create commit
  const commitMessage = `chore: automated deployment ${timestamp}`
  console.log(chalk.yellow(`💾 Committing changes: ${commitMessage}`))
  await runCommand(`git commit -m "${commitMessage}"`)

  // Step 5: Get current version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const currentVersion = packageJson.version

  // Step 6: Create and push tag
  console.log(chalk.yellow(`🏷️  Creating tag v${currentVersion}...`))
  await runCommand(`git tag -a v${currentVersion} -m "Release v${currentVersion}"`)

  // Step 7: Push to GitHub
  console.log(chalk.yellow('🚀 Pushing to GitHub...'))
  await runCommand('git push origin main')
  await runCommand('git push origin --tags')

  // Step 8: Publish to npm (if not in CI)
  if (!process.env.CI) {
    console.log(chalk.yellow('📦 Publishing to npm...'))
    await runCommand('npm publish')
  }

  console.log(chalk.green('✅ Deployment completed successfully!'))
  console.log(chalk.green(`📦 Version: v${currentVersion}`))
  console.log(chalk.green(`🕒 Timestamp: ${timestamp}`))
} catch (error) {
  console.error(chalk.red('❌ Deployment failed:'), error.message)
  process.exit(1)
}
