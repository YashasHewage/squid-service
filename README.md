# Squid Proxy with IP Whitelist

A refined, containerized proxy webservice using Squid with automatic IP whitelisting and authentication.

## Features

- **Squid Proxy**: Authenticated access to web resources
- **Automatic IP Whitelisting**: Register client IPs via web UI
- **Redis Backend**: Store registered IPs with 8-hour TTL
- **Nginx Reverse Proxy**: For proper client IP detection and routing

## Architecture

The system consists of several interconnected services:

- **Frontend**: Simple web UI for IP registration (port 80 via Nginx)
- **Backend API**: Express.js server for IP registration
- **Redis**: Database for storing whitelisted IPs
- **Client Service**: Updates the whitelist.txt file used by Squid
- **Squid Proxy**: The actual proxy server with IP-based access control (port 3128)
- **Nginx**: Reverse proxy that correctly forwards client IPs

## Setup and Usage

### Prerequisites

- Docker and Docker Compose
- Basic understanding of proxy servers and networking

### Running the Service

1. Ensure you have a `passwd` file with Squid credentials:
   ```
   htpasswd -c passwd superproxy
   ```
2. Start the service:
   ```
   docker compose up -d
   ```

### Accessing the Proxy

1. Open the web UI at http://localhost
2. Click "Register My IP" to add your IP to the whitelist
3. Configure your browser to use the proxy at `localhost:3128` with the credentials you created
4. Your IP will remain whitelisted for 8 hours

## Configuration Files

- `squid.conf`: Squid proxy configuration
- `passwd`: Authentication credentials for the proxy
- `whitelist.txt`: List of IPs allowed to access the proxy
- `docker-compose.yml`: Container orchestration
- `nginx/nginx.conf`: Nginx reverse proxy configuration

## Security Model

This setup provides two layers of security:

1. **IP Whitelisting**: Only registered IPs can connect to the proxy
2. **Authentication**: Valid credentials are required for proxy access

## Development and Customization

- Backend API code is in `server.js`
- Frontend code is in the `frontend` directory
- Whitelist update logic is in `clientservice/updateWhitelist.js`
- Proxy configuration is in `squid.conf`

## Technical Notes

- Redis stores IPs with an 8-hour TTL (time to live)
- Client service updates whitelist.txt every 15 seconds
- Nginx properly forwards client IPs via X-Forwarded-For headers
