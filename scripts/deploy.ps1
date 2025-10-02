# PowerShell deployment script for Windows
param(
    [string]$Version = "patch"
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$ErrorActionPreference = "Stop"

Write-Host "Starting automated deployment..." -ForegroundColor Blue
Write-Host "Platform: Windows PowerShell" -ForegroundColor Blue

try {
    # Step 1: Build and format
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
    npm run format
    npm run lint:fix
    
    # Step 1.5: Check formatting
    Write-Host "Checking formatting..." -ForegroundColor Yellow
    npm run format:check

    # Step 2: Pull latest changes from remote
    Write-Host "Pulling latest changes from remote..." -ForegroundColor Yellow
    try {
        git fetch origin main
        $localCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse origin/main
        if ($localCommit -ne $remoteCommit) {
            Write-Host "Remote has new changes, pulling..." -ForegroundColor Yellow
            git pull origin main
        } else {
            Write-Host "Local is up to date with remote" -ForegroundColor Blue
        }
    } catch {
        Write-Host "No remote changes to pull" -ForegroundColor Blue
    }

    # Step 3: Check git status
    Write-Host "Checking git status..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "No changes to commit" -ForegroundColor Green
        exit 0
    }

    # Step 3: Add all changes
    Write-Host "Adding changes to git..." -ForegroundColor Yellow
    git add .

    # Step 4: Create commit
    $commitMessage = "chore: automated deployment $timestamp"
    Write-Host "Committing changes: $commitMessage" -ForegroundColor Yellow
    git commit -m $commitMessage

    # Step 5: Create new release (bump version)
    Write-Host "Creating new release..." -ForegroundColor Yellow
    npm run release

    # Step 6: Get current version after release
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version

    # Step 7: Create and push tag (if it doesn't exist)
    $tagName = "v$currentVersion"
    Write-Host "Checking if tag $tagName exists..." -ForegroundColor Yellow
    
    try {
        git rev-parse --verify $tagName | Out-Null
        Write-Host "Tag $tagName already exists, skipping creation" -ForegroundColor Blue
    } catch {
        Write-Host "Creating tag $tagName..." -ForegroundColor Yellow
        git tag -a $tagName -m "Release $tagName"
    }

    # Step 8: Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    try {
        git push origin main
    } catch {
        Write-Host "Failed to push main branch, trying to pull and merge..." -ForegroundColor Red
        git pull origin main
        git push origin main
    }

    # Push tags, skip if they already exist remotely
    try {
        git push origin --tags
    } catch {
        Write-Host "Some tags already exist remotely, continuing..." -ForegroundColor Blue
    }

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Version: v$currentVersion" -ForegroundColor Green
    Write-Host "Timestamp: $timestamp" -ForegroundColor Green
} catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
