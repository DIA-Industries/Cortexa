FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
RUN pip install uv
COPY pyproject.toml .
RUN uv sync

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
