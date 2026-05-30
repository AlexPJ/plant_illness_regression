#!/usr/bin/env pwsh
Write-Host "Setting up .venv and uv in api/"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install uv
pip install -e . || pip install fastapi "uvicorn[standard]" python-multipart pillow numpy pandas
Write-Host "Done. Use 'uv run uvicorn main:app --host 0.0.0.0 --port 8080' to run the app."
