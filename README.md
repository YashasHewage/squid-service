# Squid Proxy with IP Whitelist

A containerized proxy service with automatic IP whitelisting through a web interface. This solution provides a Squid proxy that only allows access from IPs that have been registered through a simple web UI.

## Features

- **Squid Proxy**: Access to web resources with IP-based access control
- **Automatic IP Whitelisting**: Register client IPs via easy-to-use web UI
- **Redis Backend**: Stores registered IPs with 8-hour TTL
- **Nginx Reverse Proxy**: For proper client IP detection and routing

## Step-by-Step Setup Guide

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)
- A terminal or command prompt
- Chrome with Proxy SwitchyOmega extension (recommended for easy proxy switching)

### 1. Clone the Repository

```bash
git clone https://github.com/YashasHewage/squid-service.git
cd squid-service
```

### 2. Build and Start the Services

```bash
# Build and start all containers
docker compose up --build -d
```

If you're on Linux, you may need to set execute permissions for the script:

```bash
chmod +x squid-entrypoint.sh
```

### 3. Verify Services are Running

```bash
# Check that all containers are running
docker ps
```

You should see the following containers running:
- `redis` - Redis database
- `ip-whitelist-nginx` - Nginx reverse proxy
- `ip-whitelist-backend` - Node.js backend API
- `ip-whitelist-frontend` - Web UI
- `ip-whitelist-clientservice` - Whitelist updater service
- `squid-proxy` - Squid proxy server

### 4. Access the Web Interface

**IMPORTANT**: When accessing the frontend initially, you must use a direct connection (not through the proxy).

1. Open your web browser and navigate to: **http://localhost/frontend/**
2. You should see the IP registration interface

### 5. Register Your IP

1. Click the "Register My IP" button
2. You should see a confirmation message with your IP address
3. Your IP is now whitelisted for 8 hours

### 6. Configure Your Browser to Use the Proxy

#### Using Chrome with Proxy SwitchyOmega (Recommended)

1. Install the [Proxy SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif) extension from Chrome Web Store
2. Configure a new profile in SwitchyOmega:
   - Name: "Squid Proxy"
   - Protocol: HTTP
   - Server: localhost
   - Port: 3128
   - No authentication
3. Save the profile
4. **Important workflow**:
   - Use "Direct" connection mode when accessing the registration page
   - Switch to "Squid Proxy" mode after registration when browsing other sites

#### Manual Configuration (Alternative)

1. Go to your browser's proxy settings
2. Set HTTP Proxy to: `localhost`
3. Set Port to: `3128`
4. No authentication is required (IP-based access only)

For Chrome:
- Go to Settings → Advanced → System → Open your computer's proxy settings
- Add localhost:3128 as HTTP proxy

For Firefox:
- Go to Options → Network Settings → Configure Proxy Access
- Select "Manual proxy configuration"
- Set HTTP Proxy to "localhost" and Port to "3128"

## Testing the Proxy

1. After registering your IP, switch your connection to use the proxy:
   - If using SwitchyOmega, click the extension icon and select "Squid Proxy"
   - If using browser settings, make sure proxy is enabled

2. Visit [whatismyip.com](http://whatismyip.com) to check if the proxy is working correctly
   - It should show your proxy server's IP instead of your actual IP

3. To test that IP whitelisting works:
   - Try connecting from a different machine (should be denied)
   - Or wait for your IP's 8-hour TTL to expire (should be denied after)

## System Flow Overview

Here's how the system works together:

1. **User Registration Flow**:
   - User connects directly to frontend → http://localhost/frontend/
   - Clicks "Register My IP" → Backend detects and stores IP in Redis
   - Clientservice updates whitelist.txt → Squid reloads configuration
   - User can now connect through the proxy

2. **Proxy Usage Flow**:
   - User switches connection to proxy (SwitchyOmega → "Squid Proxy")
   - Browser requests go through Squid proxy (localhost:3128)
   - Squid checks client IP against whitelist.txt
   - If IP is whitelisted → request proceeds
   - If IP is not whitelisted → 403 Forbidden response

## Troubleshooting

### IP Registration Not Working

Check the backend logs:
```bash
docker logs ip-whitelist-backend
```

### Whitelist Not Updating

Check the clientservice logs:
```bash
docker logs ip-whitelist-clientservice
```

### Proxy Access Denied

Check the Squid logs:
```bash
docker logs squid-proxy
```

Check your whitelist.txt file content:
```bash
docker exec squid-proxy cat /data/whitelist.txt
```

### Nginx Issues

Check the Nginx logs:
```bash
docker logs ip-whitelist-nginx
```

## Project Structure

```
/
├── docker-compose.yml      # Container orchestration
├── squid.conf              # Squid proxy configuration
├── whitelist.txt           # List of allowed IPs
├── squid-entrypoint.sh     # Script to reload Squid when whitelist changes
├── server.js               # Backend API for IP registration
├── frontend/               # Web UI files
│   ├── index.html          # Main page
│   ├── main.js             # Frontend logic
│   └── ip-service.js       # IP detection service
├── clientservice/          # Service that updates whitelist.txt
│   ├── Dockerfile
│   ├── package.json
│   └── updateWhitelist.js  # Main logic for updating whitelist
└── nginx/                  # Nginx configuration
    └── nginx.conf          # Reverse proxy config
├── frontend/               # Web UI files
│   ├── index.html          # Main page
│   ├── main.js             # Frontend logic
│   └── ip-service.js       # IP detection service
├── clientservice/          # Service that updates whitelist.txt
│   ├── Dockerfile
│   ├── package.json
│   └── updateWhitelist.js  # Main logic for updating whitelist
└── nginx/                  # Nginx configuration
    └── nginx.conf          # Reverse proxy config
```

## Configuration Options

### Environment Variables

- `REDIS_URL`: Redis connection URL (default: redis://redis:6379)
- `UPDATE_INTERVAL`: How often to check for whitelist changes (default: 15000ms)

### IP Expiration

By default, registered IPs expire after 8 hours. To change this, modify the TTL in `server.js`:

```javascript
await redisClient.setEx(ip, 8 * 60 * 60, 'whitelisted'); // 8 hours
```

## Production Deployment Considerations

When deploying to production:

1. Use proper volume mounts for data persistence
2. Consider adding HTTPS with Let's Encrypt certificates
3. Restrict access to the administration UI
4. Set up monitoring for the services

## Security Considerations

- The system uses IP-based whitelisting only
- For higher security, consider adding authentication
- All connections between containers use Docker's internal network

## License

[Your License]

## Acknowledgements

- Squid Proxy project
- Node.js and Express
- Redis
- Docker and Docker Compose
