# CareConnect launcher:  .\run.cmd   (start)   |   .\run.cmd -RebuildUI   |   .\run.cmd -Stop
param([switch]$RebuildUI, [switch]$Stop)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = $PSScriptRoot
Set-Location $root

# Stops only the embedded test database started from this project's dev-data folder
function Stop-DevDb {
  Get-CimInstance Win32_Process -Filter "Name='mariadbd.exe' OR Name='mysqld.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*dev-data*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
if ($Stop) { Stop-DevDb; Write-Host 'CareConnect database stopped.'; return }

# --- 1. Java ---
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Java not found. Install JDK 17, then reopen the terminal.' }

# --- 2. Maven: use the installed one, else download a private copy into .tools (once) ---
$mvn = (Get-Command mvn.cmd -ErrorAction SilentlyContinue).Source
if (-not $mvn) {
  $dir = Join-Path $root '.tools\apache-maven-3.9.9'
  if (-not (Test-Path $dir)) {
    Write-Host 'Downloading Maven (one time)...'
    New-Item -ItemType Directory -Force (Join-Path $root '.tools') | Out-Null
    $zip = Join-Path $root '.tools\maven.zip'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest 'https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile $zip
    Expand-Archive $zip (Join-Path $root '.tools') -Force
    Remove-Item $zip
  }
  $mvn = Join-Path $dir 'bin\mvn.cmd'
}

# --- 3. React UI: build if missing (or when -RebuildUI) ---
if ($RebuildUI -or -not (Test-Path 'backend\src\main\webapp\ui\index.html')) {
  Write-Host 'Building React UI...'
  Push-Location frontend
  try {
    npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }
  } finally { Pop-Location }
}

# --- 4. Embedded DB + Tomcat (Ctrl+C to stop) ---
Stop-DevDb
Write-Host 'Starting CareConnect (first run downloads libraries - a few minutes)...'
Push-Location backend
try { & $mvn test-compile exec:exec } finally { Pop-Location; Stop-DevDb }
