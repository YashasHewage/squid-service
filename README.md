# Proxy Webservice

A containerized proxy webservice using Squid with IP whitelisting and authentication.

## Components

- **Squid Proxy**: Provides HTTP proxy services with authentication and IP whitelisting
- **Backend API**: Node.js Express server for IP registration and whitelist management
- **Redis**: Stores whitelisted IP addresses
- **Client Service**: Updates the whitelist.txt file based on Redis data
- **Frontend**: Simple web interface for IP registration

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Running the Service

```bash
docker compose up -d
```

### Accessing the Proxy

- Proxy URL: http://localhost:3128
- Authentication required (see passwd file)
- IP must be whitelisted (either through authentication or by being in whitelist.txt)

## Configuration Files

- `squid.conf`: Squid proxy configuration
- `passwd`: Authentication credentials for the proxy
- `whitelist.txt`: List of IPs allowed to access the proxy
- `docker-compose.yml`: Container orchestration

## Architecture

- Backend API registers IPs in Redis with 8-hour expiration
- Client service polls the backend every minute to update whitelist.txt
- Squid proxy uses whitelist.txt for IP-based access control
