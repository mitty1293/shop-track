FROM python:3.13.3-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN pip install --upgrade pip \
    && pip install uv \
    && pip install gunicorn

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.lock ./

# Install the dependencies
RUN uv pip install --no-cache --system -r requirements.lock

# Copy the entrypoint script into the container
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Copy the rest of the application code into the container
COPY . .

# Set the entrypoint
ENTRYPOINT ["./entrypoint.sh"]
