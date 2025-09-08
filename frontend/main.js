document.getElementById('registerBtn').onclick = async () => {
    document.getElementById('output').textContent = 'Registering your IP address...';
    
    try {
        // Use relative URL to work with Nginx reverse proxy
        const res = await fetch('/api/register-ip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('output').textContent = `Successfully registered your IP: ${data.ip}\n\nYour device can now access the proxy for the next 8 hours.`;
        } else {
            document.getElementById('output').textContent = `Failed to register your IP\nError: ${data.error || 'Unknown error'}`;
        }
    } catch (err) {
        document.getElementById('output').textContent = 'Request failed: ' + err;
    }
};

document.getElementById('fetchBtn').onclick = async () => {
    document.getElementById('output').textContent = 'Fetching whitelist...';
    try {
        const res = await fetch('/api/whitelist');
        const data = await res.json();
        if (data.whitelist) {
            document.getElementById('output').textContent = 'Whitelist:\n' + JSON.stringify(data.whitelist, null, 2);
        } else {
            document.getElementById('output').textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (err) {
        document.getElementById('output').textContent = 'Request failed: ' + err;
    }
};

// No manual IP registration - removed