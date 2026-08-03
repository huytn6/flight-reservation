$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

docker compose -f docker-compose.dev.yml up -d mysql
docker compose -f docker-compose.dev.yml run --rm flyway

$env:APP_CONFIG_FILE = 'config.local.ini'
& .\.venv\Scripts\python.exe .\backend\main.py
