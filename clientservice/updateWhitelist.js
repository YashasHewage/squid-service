const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const WHITELIST_API = process.env.WHITELIST_API || 'http://backend:3001/whitelist';
const OUTPUT_FILE = '/data/whitelist.txt';
const INTERVAL = 15 * 1000; // 15 seconds for quicker updates
const DEBUG = true; // Set to true for verbose logging

// Allow any valid IP address
function isValidIP(ip) {
    if (!ip) return false;
    return /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(ip);
}

// Make sure the output directory exists
function ensureDirectoryExists(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
    return fs.existsSync(dirname);
}

// Function to update the whitelist.txt file
async function fetchAndWriteWhitelist() {
    try {
        console.log(`[${new Date().toISOString()}] Fetching whitelist from backend...`);
        
        // Make the request with retry logic
        let retries = 3;
        let res;
        
        while (retries > 0) {
            try {
                res = await axios.get(WHITELIST_API, { timeout: 5000 });
                break;
            } catch (error) {
                retries--;
                if (retries === 0) throw error;
                console.log(`Request failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Get all valid IPs from the whitelist
        const allIPs = res.data.whitelist || [];
        console.log('All IPs from backend:', JSON.stringify(allIPs));
        
        // Filter for valid IP addresses only
        const validIPs = allIPs.filter(ip => isValidIP(ip));
        
        // Handle empty whitelist case
        if (validIPs.length === 0) {
            console.warn('No valid IPs found in whitelist from backend.');
        }
        
        console.log('Valid IPs for whitelist:', validIPs);
        
        // Ensure the directory exists before writing
        ensureDirectoryExists(OUTPUT_FILE);
        
        // Write the whitelist file
        if (validIPs.length > 0) {
            console.log(`Writing ${validIPs.length} IPs to ${OUTPUT_FILE}`);
            
            // Write the file with sync to ensure it completes
            fs.writeFileSync(OUTPUT_FILE, validIPs.join('\n'));
            
            // Verify the file was written
            const writtenContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
            console.log('File written with content:', writtenContent);
            
            // Check if the content matches what we expected
            const writtenIPs = writtenContent.split('\n').filter(line => line.trim() !== '');
            if (writtenIPs.length !== validIPs.length) {
                console.error('ERROR: File content mismatch! Expected', validIPs.length, 'IPs but found', writtenIPs.length);
            } else {
                console.log('SUCCESS: Whitelist file updated with', validIPs.length, 'IPs');
            }
        } else {
            // Handle empty whitelist
            console.warn('No valid IPs found in whitelist. Writing placeholder content.');
            
            // Write a comment line to avoid empty file issues with Squid
            fs.writeFileSync(OUTPUT_FILE, '# No whitelisted IPs at ' + new Date().toISOString());
            console.log('Wrote empty whitelist placeholder');
        }
        
        // Verify file exists and has content
        if (fs.existsSync(OUTPUT_FILE)) {
            const stats = fs.statSync(OUTPUT_FILE);
            console.log('Whitelist file size:', stats.size, 'bytes');
            
            if (DEBUG) {
                const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
                console.log('Whitelist file content:', content);
            }
        } else {
            console.error('ERROR: File does not exist after write operation!');
        }
    } catch (err) {
        console.error('Error in fetchAndWriteWhitelist:', err.message);
        if (err.response) {
            console.error('API error:', err.response.status, err.response.data);
        }
        
        // Try to read the current file to debug
        try {
            if (fs.existsSync(OUTPUT_FILE)) {
                const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
                console.log('Current whitelist file content:', content);
            } else {
                console.log('Whitelist file does not exist');
            }
        } catch (readErr) {
            console.error('Error reading whitelist file:', readErr.message);
        }
    }
}

// Run immediately and then at intervals
fetchAndWriteWhitelist();
setInterval(fetchAndWriteWhitelist, INTERVAL);