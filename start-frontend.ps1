param(
    [string]$ApiBase = "http://localhost:5000"
)

$env:VITE_API_BASE = $ApiBase

Write-Host "Starting frontend with VITE_API_BASE=$ApiBase"

Push-Location frontend
try {
    npm run dev
}
finally {
    Pop-Location
}
