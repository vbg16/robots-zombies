$ErrorActionPreference = 'Stop'
$publicPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'Jogo-publico'
if (-not (Test-Path -LiteralPath (Join-Path $publicPath 'index.html'))) { throw 'Versão pública local não encontrada em Jogo-publico.' }
Write-Host 'Canal público local — consulte version.json para o estado de aprovação.'
Set-Location -LiteralPath $publicPath
python -m http.server 8002 --bind 127.0.0.1
