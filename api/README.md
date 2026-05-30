# Plant illness regression — API

FastAPI backend for the Plant illness regression demo. Provides `/health` and `/predict` endpoints.

Quick setup (Windows):

```powershell
cd api
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
# if you installed uv and synced, you can use uv to manage deps; otherwise install directly:
pip install fastapi "uvicorn[standard]" python-multipart pillow numpy pandas uv
uv run uvicorn main:app --host 0.0.0.0 --port 8080
```

Build with Podman:

```bash
podman build -t plant-illness-api:local -f api/Dockerfile api/
podman run --rm -p 8080:8080 -e MODEL_PATH=/app/model/notebook_feature_mlp_plant_model.npz -e ALLOWED_ORIGIN=http://localhost:5173 plant-illness-api:local
```

Notes:
- Copy the trained model `.npz` file into `api/model/` as `notebook_feature_mlp_plant_model.npz`.
- Add `reference_features.json` into `api/model/` for feature names and references used by `/predict`.
