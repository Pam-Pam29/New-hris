# Quick commit and push script for Vercel build fix
# This script commits the build fix and pushes to GitHub

Write-Host "🔧 Committing Vercel build fix..." -ForegroundColor Cyan

# Stage all changes
git add -A

# Commit with message
git commit -m "Fix: Remove requirements.txt and update Vercel config to prevent Python dependency installation"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin clean-main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🚀 Vercel will automatically redeploy..." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Please check your git credentials." -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No changes to commit or commit failed." -ForegroundColor Yellow
}

