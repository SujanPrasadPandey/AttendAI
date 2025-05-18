FROM python:3.13.2

ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY requirements.txt .

# Install build dependencies and libraries for OpenCV and FFmpeg
RUN apt-get update && \
    apt-get install -y \
    gcc \
    libpq-dev \
    graphviz \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]