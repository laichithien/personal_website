FROM python:3.11-slim AS base
WORKDIR /app

# Cài đặt thư viện hệ thống tối thiểu
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Bước 1: Copy và cài đặt thư viện (Tận dụng cache)
COPY apps/ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bước 2: Copy mã nguồn
FROM base AS production
COPY apps/ai-service/src/ ./src/
# Copy scripts từ gốc repo vào đúng chỗ
COPY scripts/ ./scripts/ 

ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
