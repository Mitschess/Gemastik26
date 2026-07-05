Set-Location $PSScriptRoot\..

Write-Host "=== EduLAN + AI ===" -ForegroundColor Cyan
docker compose up -d --build

Write-Host "Menunggu Ollama siap..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Download model Qwen 1.5B (sekali saja, ~1 GB)..." -ForegroundColor Yellow
docker compose exec ollama ollama pull qwen2.5:1.5b

Write-Host ""
Write-Host "Server:  http://localhost:5000" -ForegroundColor Green
Write-Host "Guru:    http://localhost:5000/teacher.html" -ForegroundColor Green
Write-Host "Ollama:  http://localhost:11434" -ForegroundColor Green
