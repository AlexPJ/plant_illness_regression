import numpy as np
from PIL import Image, ImageOps

AUGMENT_IMAGE_SIZE = 160

def compact_features_from_pil(img: Image.Image, image_size=AUGMENT_IMAGE_SIZE):
    img = ImageOps.fit(img.convert('RGB'), (image_size, image_size), method=Image.Resampling.BILINEAR)
    rgb = np.asarray(img, dtype=np.float32) / 255.0
    hsv = np.asarray(img.convert('HSV'), dtype=np.float32) / 255.0
    exg = np.clip(2 * rgb[..., 1] - rgb[..., 0] - rgb[..., 2], 0, 1)
    yellow_brown = ((rgb[..., 0] > rgb[..., 1] * 0.85) & (rgb[..., 1] > rgb[..., 2] * 1.15)).astype(np.float32)
    dark_spots = (rgb.mean(axis=-1) < 0.28).astype(np.float32)
    channels = [rgb[..., 0], rgb[..., 1], rgb[..., 2], hsv[..., 0], hsv[..., 1], hsv[..., 2], exg, yellow_brown, dark_spots]
    features = []
    for c in channels:
        features.extend([float(c.mean()), float(c.std()), float(np.quantile(c, 0.1)), float(np.quantile(c, 0.5)), float(np.quantile(c, 0.9))])
    hist, _ = np.histogram(hsv[..., 0], bins=12, range=(0, 1), density=True)
    features.extend([float(x) for x in hist.tolist()])
    return np.asarray(features, dtype=np.float32)

def disease_highlight_from_pil(img: Image.Image):
    rgb = np.asarray(img.convert('RGB'), dtype=np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    affected = (r > 0.35) & (g > 0.25) & (b < 0.45) & (r >= g * 0.85)
    overlay = rgb.copy()
    overlay[..., 0] = np.where(affected, 1.0, overlay[..., 0])
    overlay[..., 1] = np.where(affected, 0.2, overlay[..., 1])
    overlay[..., 2] = np.where(affected, 0.2, overlay[..., 2])
    pil_overlay = Image.fromarray((np.clip(overlay, 0, 1) * 255).astype('uint8'))
    return pil_overlay, affected
