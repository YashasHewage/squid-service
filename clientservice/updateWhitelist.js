const fs = require('fs');
const path = require('path');
const axios = require('axios');

const WHITELIST_API = process.env.WHITELIST_API || 'http://backend:3001/whitelist';
const OUTPUT_FILE = '/data/whitelist.txt';
const INTERVAL = 60 * 1000; // 1 minute

async function fetchAndWriteWhitelist() {
    try {
        const res = await axios.get(WHITELIST_API);
        const whitelist = res.data.whitelist || [];
        if (whitelist.length > 0) {
            fs.writeFileSync(OUTPUT_FILE, whitelist.join('\n'));
        } else {
            // If whitelist is empty, keep the previous file contents
            console.warn('Whitelist is empty, not updating whitelist.txt to avoid Squid crash.');
        }
        console.log('Whitelist updated:', whitelist);
    } catch (err) {
        console.error('Error fetching or writing whitelist:', err.message);
    }
}

setInterval(fetchAndWriteWhitelist, INTERVAL);
fetchAndWriteWhitelist();