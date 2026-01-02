# Deployment Script for Vercel
# Run this script to deploy all platforms to Vercel

Write-Host "🚀 Starting Vercel Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
Write-Host ""

# Deploy HR Platform
Write-Host "📦 Deploying HR Platform..." -ForegroundColor Cyan
Set-Location hr-platform
vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ HR Platform deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ HR Platform deployed successfully!" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Deploy Employee Platform
Write-Host "📦 Deploying Employee Platform..." -ForegroundColor Cyan
Set-Location employee-platform
vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Employee Platform deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Employee Platform deployed successfully!" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Deploy Careers Platform (optional)
Write-Host "📦 Deploying Careers Platform..." -ForegroundColor Cyan
Set-Location careers-platform
vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Careers Platform deployment failed (this is optional)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Careers Platform deployed successfully!" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

Write-Host "🎉 All deployments completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run the backfill script to update Firestore URLs:" -ForegroundColor Yellow
Write-Host "      `$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\hris-admin.json\hris-system-baa22-firebase-adminsdk-fbsvc-81a3572f70.json'" -ForegroundColor Gray
Write-Host "      node scripts\backfillPlatformConfig.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Test the deployed applications using DEPLOYMENT_AND_TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

