FROM python:3.11-slim

WORKDIR /app

RUN pip install uv
COPY pyproject.toml pyproject.toml
RUN uv sync

COPY . .
# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uv","run","uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
