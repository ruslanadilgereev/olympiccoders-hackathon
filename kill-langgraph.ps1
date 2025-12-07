# Force kill all LangGraph processes
Write-Host "🔪 Killing all LangGraph processes..." -ForegroundColor Red

# Kill Python processes
taskkill /F /IM python.exe /T 2>$null
taskkill /F /IM pythonw.exe /T 2>$null

# Kill processes on LangGraph port
$ports = @(2024, 3000, 8000)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        taskkill /F /PID $conn.OwningProcess /T 2>$null
        Write-Host "  ✓ Killed process on port $port" -ForegroundColor Yellow
    }
}

# Kill uv processes
Get-Process uv* -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "`n✓ Done! All processes killed." -ForegroundColor Green
Write-Host "You can now restart with: langgraph dev" -ForegroundColor Cyan
