# Commit and push Vercel build fix
Write-Host "🔧 Committing Vercel build fixes..." -ForegroundColor Cyan

git add -A
git commit -m "Fix: Use npx vite build and ensure proper Vercel configuration"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin clean-main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Configure Root Directory in Vercel Dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Go to Vercel Dashboard → hr-platform project" -ForegroundColor Gray
        Write-Host "   2. Settings → General → Root Directory" -ForegroundColor Gray
        Write-Host "   3. Set to: hr-platform" -ForegroundColor Gray
        Write-Host "   4. Save and redeploy" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
}

