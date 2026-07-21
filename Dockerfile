# Use slim Python base image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . /app/

# Install python dependencies from PyPI
RUN pip install --no-cache-dir --index-url https://pypi.org/simple \
    fastapi \
    uvicorn \
    google-genai \
    google-adk \
    pytest \
    python-dotenv

# Expose server port
EXPOSE 8080

# Start server using uvicorn
CMD ["python", "server.py"]
