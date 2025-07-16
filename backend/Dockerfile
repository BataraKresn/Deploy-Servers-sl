FROM python:3.9-slim

LABEL maintainer="sysadmin.app@sateknologi.id"
LABEL service="trigger-deploy"

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install SSH client, jq, ping, net-tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client jq bash iputils-ping net-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the content of the local src directory to the working directory
COPY . .

# Make the deploy script executable
# RUN chmod +x /app/deploy.sh

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run main.py when the container launches
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
