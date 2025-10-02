#!/usr/bin/env zx

import { $, chalk, fs } from 'zx'

const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]

console.log(chalk.blue('🚀 Starting automated deployment...'))

try {
  // Step 1: Build and format
  console.log(chalk.yellow('📦 Building project...'))
  await $`npm run build`
  await $`npm run format`
  await $`npm run lint:fix`

  // Step 2: Run tests
  console.log(chalk.yellow('🧪 Running tests...'))
  await $`npm run test`

  // Step 3: Check git status
  console.log(chalk.yellow('📋 Checking git status...'))
  const { stdout: gitStatus } = await $`git status --porcelain`

  if (!gitStatus.trim()) {
    console.log(chalk.green('✅ No changes to commit'))
    process.exit(0)
  }

  // Step 4: Add all changes
  console.log(chalk.yellow('📝 Adding changes to git...'))
  await $`git add .`

  // Step 5: Create commit
  const commitMessage = `chore: automated deployment ${timestamp}`
  console.log(chalk.yellow(`💾 Committing changes: ${commitMessage}`))
  await $`git commit -m "${commitMessage}"`

  // Step 6: Get current version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const currentVersion = packageJson.version

  // Step 7: Create and push tag
  console.log(chalk.yellow(`🏷️  Creating tag v${currentVersion}...`))
  await $`git tag -a v${currentVersion} -m "Release v${currentVersion}"`

  // Step 8: Push to GitHub
  console.log(chalk.yellow('🚀 Pushing to GitHub...'))
  await $`git push origin main`
  await $`git push origin --tags`

  // Step 9: Publish to npm (if not in CI)
  if (!process.env.CI) {
    console.log(chalk.yellow('📦 Publishing to npm...'))
    await $`npm publish`
  }

  console.log(chalk.green('✅ Deployment completed successfully!'))
  console.log(chalk.green(`📦 Version: v${currentVersion}`))
  console.log(chalk.green(`🕒 Timestamp: ${timestamp}`))
} catch (error) {
  console.error(chalk.red('❌ Deployment failed:'), error.message)
  process.exit(1)
}
