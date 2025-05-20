FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]