@echo off
rem Serve this folder locally and open the park (needs Python).
cd /d "%~dp0"
start "" http://localhost:8003/index.html
python -m http.server 8003
