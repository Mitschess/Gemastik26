Set-Location $PSScriptRoot\..

Write-Host "=== Stop server lama ===" -ForegroundColor Yellow
& "$PSScriptRoot\stop-server.ps1"

Write-Host "`n=== Start EduLAN ===" -ForegroundColor Cyan
Set-Location server
npm run dev
