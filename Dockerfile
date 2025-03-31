# Use an official Python base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy only requirements first for layer caching
COPY marriage_hall_booking/backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY marriage_hall_booking/backend .

# Expose the port Flask runs on
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]
