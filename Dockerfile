# Use the official Python image from the Docker Hub
FROM python:3.12


# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port that the Flask app runs on
EXPOSE 8080

# Set environment variables

# Define the command to run the Flask app
CMD ["python", "cps.py"]
