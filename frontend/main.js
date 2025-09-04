document.getElementById('registerBtn').onclick = async () => {
    document.getElementById('output').textContent = 'Registering your IP...';
    try {
        const res = await fetch('http://localhost:3001/register-ip', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            document.getElementById('output').textContent = 'Registered IP: ' + data.ip;
        } else {
            document.getElementById('output').textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (err) {
        document.getElementById('output').textContent = 'Request failed: ' + err;
    }
};

document.getElementById('fetchBtn').onclick = async () => {
    document.getElementById('output').textContent = 'Fetching whitelist...';
    try {
        const res = await fetch('http://localhost:3001/whitelist');
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