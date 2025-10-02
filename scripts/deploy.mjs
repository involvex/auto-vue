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

  // Step 2: Pull latest changes from remote
  console.log(chalk.yellow('🔄 Pulling latest changes from remote...'))
  try {
    await runCommand('git pull origin main')
  } catch (error) {
    console.log(chalk.blue('ℹ️  No remote changes to pull'))
  }

  // Step 3: Check git status
  console.log(chalk.yellow('📋 Checking git status...'))
  const { stdout: gitStatus } = await runCommand('git status --porcelain')

  if (!gitStatus.trim()) {
    console.log(chalk.green('✅ No changes to commit'))
    process.exit(0)
  }

  // Step 4: Add all changes
  console.log(chalk.yellow('📝 Adding changes to git...'))
  await runCommand('git add .')

  // Step 5: Create commit
  const commitMessage = `chore: automated deployment ${timestamp}`
  console.log(chalk.yellow(`💾 Committing changes: ${commitMessage}`))
  await runCommand(`git commit -m "${commitMessage}"`)

  // Step 6: Create new release (bump version)
  console.log(chalk.yellow('📦 Creating new release...'))
  await runCommand('npm run release')

  // Step 7: Get current version after release
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const currentVersion = packageJson.version

  // Step 8: Create and push tag (if it doesn't exist)
  const tagName = `v${currentVersion}`
  console.log(chalk.yellow(`🏷️  Checking if tag ${tagName} exists...`))

  try {
    await runCommand(`git rev-parse --verify ${tagName}`)
    console.log(chalk.blue(`✅ Tag ${tagName} already exists locally, skipping creation`))
  } catch {
    console.log(chalk.yellow(`🏷️  Creating tag ${tagName}...`))
    await runCommand(`git tag -a ${tagName} -m "Release ${tagName}"`)
  }

  // Step 9: Push to GitHub with force for tags
  console.log(chalk.yellow('🚀 Pushing to GitHub...'))
  try {
    await runCommand('git push origin main')
  } catch (error) {
    console.log(chalk.red('❌ Failed to push main branch, trying to pull and merge...'))
    await runCommand('git pull origin main --rebase')
    await runCommand('git push origin main')
  }

  // Push tags, skip if they already exist remotely
  try {
    await runCommand('git push origin --tags')
  } catch (error) {
    console.log(chalk.blue('ℹ️  Some tags already exist remotely, continuing...'))
  }

  console.log(chalk.green('✅ Deployment completed successfully!'))
  console.log(chalk.green(`📦 Version: v${currentVersion}`))
  console.log(chalk.green(`🕒 Timestamp: ${timestamp}`))
} catch (error) {
  console.error(chalk.red('❌ Deployment failed:'), error.message)
  process.exit(1)
}
