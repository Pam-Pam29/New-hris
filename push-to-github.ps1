# Push to GitHub Script
# This script will push your changes to GitHub

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $status
    Write-Host ""
    $commit = Read-Host "Would you like to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $message = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = "Update: Merged meeting features, added configurable late threshold, and improved performance management"
        }
        git add -A
        git commit -m $message
        Write-Host "✅ Changes committed!" -ForegroundColor Green
        Write-Host ""
    }
}

# Check if branch is ahead
$statusOutput = git status
if ($statusOutput -match "Your branch is ahead") {
    Write-Host "📤 Pushing to origin/$currentBranch..." -ForegroundColor Cyan
    git push origin $currentBranch
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Check your git credentials and remote URL." -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  No commits to push. Everything is up to date." -ForegroundColor Yellow
}

Write-Host ""

