#!/bin/bash
set -e

# Create a temporary whitelist file
touch /tmp/whitelist.txt

# Copy the initial whitelist if it exists
if [ -f /data/whitelist.txt ]; then
  cp /data/whitelist.txt /tmp/whitelist.txt
fi

# Start Squid in the background
/usr/sbin/squid -f /etc/squid/squid.conf -N &
SQUID_PID=$!

echo "Squid started with PID: $SQUID_PID"
echo "Monitoring /data/whitelist.txt for changes..."

# Monitor the whitelist file for changes
while true; do
  if [ -f /data/whitelist.txt ]; then
    # Check if the whitelist has changed
    if ! cmp -s /data/whitelist.txt /tmp/whitelist.txt; then
      echo "Whitelist changed! Reloading Squid..."
      cp /data/whitelist.txt /tmp/whitelist.txt
      # Send a reload signal to Squid
      kill -HUP $SQUID_PID
      echo "Squid reloaded at $(date)"
    fi
  fi
  sleep 5
done
