$deadline = (Get-Date).AddMinutes(3)
$ok = $false
while ((Get-Date) -lt $deadline) {
    try {
        $html = (Invoke-WebRequest -Uri "https://dnsjohfn.github.io/shengong-game-v2/index.html" -UseBasicParsing -TimeoutSec 15).Content
        if ($html -match 'portrait-rotate #root_canvas' -and $html -notmatch 'orientation: portrait') {
            Write-Output ("NEW_VERSION_READY at " + (Get-Date -Format "HH:mm:ss"))
            $ok = $true
            break
        }
    } catch { }
    Start-Sleep -Seconds 12
}
if (-not $ok) { Write-Output "TIMEOUT_NOT_READY" }
