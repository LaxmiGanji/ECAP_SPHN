FROM node:18-slim

# Install system dependencies for compilers
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    build-essential \
    gcc \
    g++ \
    make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./


# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create media directory if it doesn't exist
RUN mkdir -p media

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]
