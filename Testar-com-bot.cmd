@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS e abra este arquivo novamente.
  pause
  exit /b 1
)
echo SCREWVIVORS - BOT DE TESTES
echo.
echo O bot usa um navegador isolado. Seu progresso pessoal nao sera alterado.
echo 1. Inteligente - combate, coleta e escolhas da build
echo 2. Simples - foge dos inimigos e atira
echo.
choice /c 12 /n /m "Escolha 1 ou 2: "
if errorlevel 2 (
  node tools/playtest-bot.cjs --headed --mode dumb --minutes 20
) else (
  node tools/playtest-bot.cjs --headed --mode smart --minutes 20
)
echo.
echo Os relatorios ficam na pasta outputs\bot.
echo Se faltar Playwright, execute: npm install --prefix tools/bot-runtime playwright
pause
endlocal
