FROM python:3.9-slim

LABEL maintainer="sysadmin.app@sateknologi.id"
LABEL service="trigger-deploy"

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client jq bash iputils-ping net-tools curl dnsutils procps \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Optional: chmod if needed
# RUN chmod +x /app/deploy.sh
# RUN chmod 600 /root/.ssh/id_rsa

EXPOSE 5000

# ✅ Use either uvicorn OR gunicorn + uvicorn worker (choose one)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
CMD ["gunicorn", "main:app", "--workers=4", "--worker-class=uvicorn.workers.UvicornWorker", "--bind=0.0.0.0:5000"]
