FROM node:20-alpine

WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Create the data directory with proper permissions
RUN mkdir -p /data && chmod 777 /data

# Create an empty whitelist file if it doesn't exist
RUN touch /data/whitelist.txt && chmod 666 /data/whitelist.txt

# Run the whitelist updater
CMD ["node", "updateWhitelist.js"]
