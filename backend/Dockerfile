FROM python:3.13.2

ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY requirements.txt .

# Install build dependencies using apt-get
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
