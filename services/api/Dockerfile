FROM python:3.12-slim
WORKDIR /app
COPY requirements.lock.txt ./
RUN pip install --no-cache-dir -r requirements.lock.txt
COPY app ./app
COPY data ./data
RUN useradd --create-home linea && mkdir -p .local && chown -R linea:linea /app
USER linea
EXPOSE 8000
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
