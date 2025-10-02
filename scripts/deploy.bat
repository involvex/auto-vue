@echo off
echo Starting automated deployment...
echo Platform: Windows Batch

REM Step 1: Build and format
echo Building project...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run format
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run lint:fix
if %errorlevel% neq 0 exit /b %errorlevel%

REM Step 1.5: Check formatting
echo Checking formatting...
call npm run format:check
if %errorlevel% neq 0 exit /b %errorlevel%

REM Step 2: Check git status
echo Checking git status...
for /f %%i in ('git status --porcelain') do set GIT_STATUS=%%i
if "%GIT_STATUS%"=="" (
    echo No changes to commit
    exit /b 0
)

REM Step 3: Add all changes
echo Adding changes to git...
git add .

REM Step 4: Create commit
for /f "tokens=1-3 delims= " %%a in ('date /t') do set DATE=%%a
for /f "tokens=1-2 delims=:" %%a in ('time /t') do set TIME=%%a:%%b
set COMMIT_MSG=chore: automated deployment %DATE% %TIME%
echo Committing changes: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

REM Step 5: Get current version
for /f "tokens=2 delims=:" %%a in ('findstr "version" package.json') do set VERSION=%%a
set VERSION=%VERSION: =%
set VERSION=%VERSION:,=%

REM Step 6: Create and push tag (if it doesn't exist)
set TAG_NAME=v%VERSION%
echo Checking if tag %TAG_NAME% exists...
git rev-parse --verify %TAG_NAME% >nul 2>&1
if %errorlevel% equ 0 (
    echo Tag %TAG_NAME% already exists, skipping creation
) else (
    echo Creating tag %TAG_NAME%...
    git tag -a %TAG_NAME% -m "Release %TAG_NAME%"
)

REM Step 7: Push to GitHub
echo Pushing to GitHub...
git push origin main
git push origin --tags

echo Deployment completed successfully!
echo Version: v%VERSION%
echo Timestamp: %DATE% %TIME%
