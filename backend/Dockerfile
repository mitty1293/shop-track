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

# Copy the rest of the application code into the container
COPY . .

# Migrations
RUN python manage.py migrate

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "shoptrack.wsgi:application"]
