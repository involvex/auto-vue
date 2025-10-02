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

    # Step 2: Check git status
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

    # Step 5: Get current version
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version

    # Step 6: Create and push tag (if it doesn't exist)
    $tagName = "v$currentVersion"
    Write-Host "Checking if tag $tagName exists..." -ForegroundColor Yellow
    
    try {
        git rev-parse --verify $tagName | Out-Null
        Write-Host "Tag $tagName already exists, skipping creation" -ForegroundColor Blue
    } catch {
        Write-Host "Creating tag $tagName..." -ForegroundColor Yellow
        git tag -a $tagName -m "Release $tagName"
    }

    # Step 7: Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    git push origin --tags

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Version: v$currentVersion" -ForegroundColor Green
    Write-Host "Timestamp: $timestamp" -ForegroundColor Green
} catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
