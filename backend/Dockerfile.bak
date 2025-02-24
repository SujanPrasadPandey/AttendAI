FROM python:3.13.1-bookworm

ENV PYTHONUNBUFFERED 1

WORKDIR /app/backend

COPY requirements.txt /app/backend/

RUN apt update && apt install -y libpq-dev gcc python3-dev

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]


# docker exec -it attendai-backend bash
# to run the commands like manage.py migrate