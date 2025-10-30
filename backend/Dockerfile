# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev if needed)
RUN npm install


# Copy the rest of the backend code
COPY . .

# Expose backend port (change if needed)
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
