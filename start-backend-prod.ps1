$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$env:APP_CONFIG_FILE = 'config.prod.ini'
& .\.venv\Scripts\python.exe .\backend\main.py
