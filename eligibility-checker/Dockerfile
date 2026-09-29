FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml README.md ./
COPY eligibility_checker ./eligibility_checker
RUN pip install --no-cache-dir .
ENV HOST=0.0.0.0 PORT=8001
EXPOSE 8001
CMD ["sh", "-c", "uvicorn eligibility_checker.app:app --host ${HOST} --port ${PORT}"]
