@echo off
chcp 65001 > nul
cls
echo.
echo  ============================================
echo   INSYS Pay System - Installing...
echo  ============================================
echo.

set DEST=%USERPROFILE%\Downloads\insys_pay.exe

echo  [1/3] Copying to Downloads folder...
copy /Y "%~dp0insys_pay.exe" "%DEST%" > nul
if errorlevel 1 ( echo  [ERROR] Copy failed. & pause & exit /b )
echo        Done.

echo.
echo  [2/3] Creating Desktop shortcut...
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\insys_pay.lnk');$s.TargetPath='%DEST%';$s.Description='INSYS Pay System';$s.Save()"
echo        Done.

echo.
echo  [3/3] Starting program...
start "" "%DEST%"

echo.
echo  ============================================
echo   Install Complete!
echo   Saved : Downloads\insys_pay.exe
echo   Shortcut created on Desktop.
echo  ============================================
echo.
pause
