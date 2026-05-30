FROM python:3.12-slim

WORKDIR /app

# system deps (minimal) and pip upgrade
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY main.py .
COPY utils.py .
COPY model ./model

# Install runtime dependencies (use pip for deterministic Docker build)
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" python-multipart pillow numpy pandas uv

ENV PORT=8080
EXPOSE 8080

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
