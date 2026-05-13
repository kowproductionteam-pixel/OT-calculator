@echo off
echo ================================================
echo   OT Calculator — EXE Builder
echo   Developed by Mainul Islam
echo ================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo Please install Python from https://python.org/downloads
    pause
    exit /b 1
)

echo [1/3] Installing PyInstaller...
pip install pyinstaller --quiet

echo [2/3] Building .exe ...
pyinstaller --onefile --noconsole ^
  --add-data "index.html;." ^
  --add-data "assets;assets" ^
  --add-data "src;src" ^
  --name "OT_Calculator" ^
  launcher.py

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Done!
echo.
echo   Your .exe is ready at:
echo   dist\OT_Calculator.exe
echo.
echo   Just double-click OT_Calculator.exe to run!
echo ================================================
pause
