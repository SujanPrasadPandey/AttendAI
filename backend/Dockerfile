FROM python:3.13.2-alpine3.21

ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY requirements.txt .

RUN apk update && \
    apk add --no-cache postgresql-dev gcc musl-dev python3-dev

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
