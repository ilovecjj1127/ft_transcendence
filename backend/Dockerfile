FROM python:3.10

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd \
	vim \
	&& apt-get clean

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

