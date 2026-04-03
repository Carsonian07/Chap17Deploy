param(
    [string]$ProjectRef = "cnpkqgwgalgftfgbjnvv",
    [string]$PoolerHost = "aws-1-us-west-2.pooler.supabase.com",
    [int]$Port = 5432,
    [string]$Database = "postgres",
    [string]$UsernamePrefix = "postgres",
    [string]$DbPassword
)

if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    $secure = Read-Host "Enter Supabase DB password" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    throw "DB password is required."
}

$username = "$UsernamePrefix.$ProjectRef"
$env:ASPNETCORE_URLS = "http://localhost:5000"
$env:SUPABASE_DB_URL = "Host=$PoolerHost;Port=$Port;Database=$Database;Username=$username;Password=$DbPassword;SSL Mode=Require"

Write-Host "Starting backend with Supabase (project ref: $ProjectRef)..."

dotnet run --project backend
