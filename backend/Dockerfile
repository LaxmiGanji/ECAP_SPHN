FROM node:18

# Install system dependencies for compilers
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-11-jdk \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]
