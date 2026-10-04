FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (OCR, OpenCV, video)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hin \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better build caching)
COPY requirements.txt .

# Old packages need pkg_resources, which was removed in setuptools>=81.
# PIP_CONSTRAINT also applies inside pip's isolated build environments (pip 24.x).
RUN echo "setuptools<81" > /tmp/constraints.txt
ENV PIP_CONSTRAINT=/tmp/constraints.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

RUN mkdir -p uploads

EXPOSE 8000

# Render provides $PORT; falls back to 8000 locally
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]