# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Build the app
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:prod"]