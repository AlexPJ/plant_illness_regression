import os
import time
import io
import base64
import json
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import numpy as np
from PIL import Image
from utils import compact_features_from_pil, disease_highlight_from_pil

MODEL_PATH = os.environ.get("MODEL_PATH", "./model/notebook_feature_mlp_plant_model.npz")
REF_JSON = os.environ.get("REF_JSON", "./model/reference_features.json")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")
MAX_UPLOAD_MB = float(os.environ.get("MAX_UPLOAD_MB", "6"))

if not os.path.exists(MODEL_PATH):
    model_dir = os.path.dirname(MODEL_PATH) or "./model"
    candidates = [f for f in os.listdir(model_dir) if f.endswith(".npz")]
    if candidates:
        MODEL_PATH = os.path.join(model_dir, candidates[0])
        print(f"Warning: default model path not found. Falling back to {MODEL_PATH}")
    else:
        print(f"Warning: no .npz model found in {model_dir}. Model will not be loaded.")

app = FastAPI(title="Plant illness regression API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Load model & references at startup if available; otherwise defer until predict
model_params: Optional[dict] = None
W1 = b1 = W2 = b2 = feature_mean = feature_std = None
references = {}

if os.path.exists(MODEL_PATH):
    try:
        params = np.load(MODEL_PATH, allow_pickle=True)
        W1 = params.get("W1")
        b1 = params.get("b1")
        W2 = params.get("W2")
        b2 = params.get("b2")
        feature_mean = params.get("feature_mean")
        feature_std = params.get("feature_std")
        model_params = {
            "loaded": True,
            "path": MODEL_PATH,
        }
    except Exception as e:
        print("Warning: failed loading model:", e)
        model_params = None
else:
    print(f"Warning: model file not found at {MODEL_PATH}; API will start but /predict will return 503 until model is provided.")

healthy_ref_b64 = ""
very_sick_ref_b64 = ""

if os.path.exists(REF_JSON):
    try:
        with open(REF_JSON, "r", encoding="utf-8") as f:
            references = json.load(f)
    except Exception as e:
        print("Warning: failed loading reference JSON:", e)

# Load reference images into memory once
for parent_dir in ("../data", "./data", "data", "./model", "model"):
    h_path = os.path.join(parent_dir, "637425158625793493.png")
    s_path = os.path.join(parent_dir, "637425207837208424.png")
    if os.path.exists(h_path) and os.path.exists(s_path):
        try:
            with open(h_path, "rb") as img_f:
                healthy_ref_b64 = base64.b64encode(img_f.read()).decode("ascii")
            with open(s_path, "rb") as img_f:
                very_sick_ref_b64 = base64.b64encode(img_f.read()).decode("ascii")
            print("Successfully loaded healthy and sick reference images into base64")
            break
        except Exception as e:
            print("Warning: failed encoding reference images:", e)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": bool(model_params)}

def _predict_from_features(x: np.ndarray) -> float:
    h = np.maximum(x @ W1 + b1, 0)
    pred = float((h @ W2 + b2).reshape(-1)[0] * 100.0)
    return float(np.clip(pred, 0, 100))

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model_params is None or W1 is None:
        raise HTTPException(status_code=503, detail="Model not available on server")

    if image.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images accepted")
    contents = await image.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(status_code=413, detail=f"File too large (> {MAX_UPLOAD_MB} MB)")

    start_ts = time.time()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot open image")

    x_raw = compact_features_from_pil(img).reshape(1, -1)
    x = (x_raw - feature_mean) / feature_std
    pred = _predict_from_features(x)

    overlay_img, affected_mask = disease_highlight_from_pil(img)
    buf = io.BytesIO(); overlay_img.save(buf, format="PNG")
    overlay_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

    top_features = references.get("top_features", [])
    feature_names = references.get("feature_names", [])
    healthy = np.array(references.get("healthy_reference", []), dtype=float) if references.get("healthy_reference") is not None else np.array([])
    very_sick = np.array(references.get("very_sick_reference", []), dtype=float) if references.get("very_sick_reference") is not None else np.array([])
    global_mins = np.array(references.get("feature_mins", []), dtype=float) if references.get("feature_mins") is not None else np.array([])
    global_maxs = np.array(references.get("feature_maxs", []), dtype=float) if references.get("feature_maxs") is not None else np.array([])

    feature_comparison = {}
    valid_features = []
    if len(top_features) and len(feature_names):
        idxs = [feature_names.index(f) for f in top_features if f in feature_names]
        current = x_raw.reshape(-1)[idxs].astype(float)
        healthy_vals = healthy[idxs] if healthy.size else np.zeros(len(idxs))
        sick_vals = very_sick[idxs] if very_sick.size else np.zeros(len(idxs))

        mins = global_mins[idxs] if global_mins.size else np.zeros(len(idxs))
        maxs = global_maxs[idxs] if global_maxs.size else np.ones(len(idxs))

        # Enforce range limits to also contain current specimen value (like notebook concat)
        mins = np.minimum(mins, current)
        maxs = np.maximum(maxs, current)

        for f, h, s, c, minv, maxv in zip([feature_names[i] for i in idxs], healthy_vals, sick_vals, current, mins, maxs):
            div = (maxv - minv) if abs(maxv - minv) > 1e-6 else 1.0
            healthy_pct = float((h - minv) / div * 100.0)
            sick_pct = float((s - minv) / div * 100.0)
            current_pct = float((c - minv) / div * 100.0)

            valid_features.append(f)

            feature_comparison[f] = {
                "healthy_val": float(h),
                "sick_val": float(s),
                "current_val": float(c),
                "healthy_pct": healthy_pct,
                "sick_pct": sick_pct,
                "current_pct": current_pct,
            }

    resp = {
        "predicted_disease_rating": float(pred),
        "affected_area_pct": float(float(affected_mask.mean()) * 100.0),
        "overlay_image_base64": overlay_b64,
        "healthy_ref_image_base64": healthy_ref_b64,
        "very_sick_ref_image_base64": very_sick_ref_b64,
        "feature_comparison": feature_comparison,
        "top_features_compared": valid_features[:6]
    }

    elapsed = time.time() - start_ts
    print(json.dumps({
        "event": "predict",
        "file_name": image.filename,
        "size_bytes": len(contents),
        "predicted": pred,
        "latency_s": elapsed
    }))
    return JSONResponse(content=resp)
