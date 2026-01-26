# apps/ai-service/Dockerfile
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements từ thư mục gốc của project
COPY apps/ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Production stage ---
FROM base AS production
# Copy mã nguồn từ đúng thư mục app vào container
COPY apps/ai-service/src/ ./src/
# Copy scripts nếu có
COPY apps/ai-service/scripts/ ./scripts/ 

ENV PYTHONPATH=/app
EXPOSE 8000

# Chạy uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
