# Hentikan server EduLAN yang masih jalan di background
$ports = 5000, 5443, 5001
$pids = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
    $pids | ForEach-Object {
        $name = (Get-Process -Id $_ -ErrorAction SilentlyContinue).ProcessName
        Write-Host "Menghentikan $name (PID $_)..." -ForegroundColor Yellow
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    Write-Host "Server dihentikan." -ForegroundColor Green
} else {
    Write-Host "Tidak ada server yang jalan di port 5000/5443." -ForegroundColor Gray
}
