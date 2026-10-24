Set-Location $PSScriptRoot

if (-not (Test-Path "dist\server.cjs")) {
    Write-Host "Building app (first run)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$env:NODE_ENV = "production"
$url = "http://127.0.0.1:3000"

Write-Host ""
Write-Host " Image Style Analyzer" -ForegroundColor Cyan
Write-Host " $url" -ForegroundColor Green
Write-Host ""
Write-Host " Keep this window open while using the app." -ForegroundColor DarkGray
Write-Host " Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

Start-Process $url
node dist\server.cjs