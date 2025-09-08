console.log('Starting IP Whitelist backend...');
const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
// Enable trust proxy to get real IP from Nginx
app.set('trust proxy', true);

// Configure CORS to allow requests from any origin
app.use(cors({
    origin: '*', // In production, you might want to restrict this
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = redis.createClient({ url: redisUrl });

redisClient.connect()
    .then(() => {
        console.log('Connected to Redis successfully.');
        app.listen(3001, () => {
            console.log('Backend running on http://localhost:3001');
        });
    })
    .catch((err) => {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    });

// Validate if a string is a valid IP address
function isValidIP(ip) {
    if (!ip) return false;
    return /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(ip);
}

// Save IP to whitelist with 8-hour expiry
app.post('/register-ip', async (req, res) => {
    try {
        // Use Express's built-in IP detection with trust proxy
        let ip = req.ip || 
                 req.headers['x-real-ip'] || 
                 req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 '0.0.0.0';  // Fallback
        
        console.log('DEBUGGING - Full headers:', JSON.stringify(req.headers));
        console.log('DEBUGGING - Raw IP value:', ip);
        
        // Handle multiple IPs in x-forwarded-for (take the first one)
        if (ip && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        // Convert from IPv6 format if needed
        if (ip && ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }
        
        // Detect and log Docker network IPs
        if (ip === '172.18.0.1' || ip.startsWith('172.') || ip === '127.0.0.1') {
            console.log('WARNING: Detected Docker network or local IP:', ip);
            console.log('This may not be the actual client IP.');
            console.log('When deployed to a public server, the real client IP will be captured.');
        }
        
        console.log('REGISTERING CLIENT IP:', ip);
        if (ip) {
            await redisClient.setEx(ip, 8 * 60 * 60, 'whitelisted');
            
            // Fetch current whitelist for debugging
            const keys = await redisClient.keys('*');
            console.log('CURRENT WHITELIST:', keys);
            
            res.json({ 
                success: true, 
                ip: ip,
                message: 'Your IP has been registered successfully',
                expiresIn: '8 hours'
            });
        } else {
            res.json({ success: false, error: 'Could not determine your IP address', ip });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all whitelisted IPs
app.get('/whitelist', async (req, res) => {
    try {
        console.log('Whitelist request received');
        
        // Get all keys from Redis
        const keys = await redisClient.keys('*');
        console.log('Current Redis keys (whitelist):', keys);
        
        // Return ALL IPs - we don't filter by office range anymore
        res.json({ whitelist: keys });
        
        console.log(`Returned ${keys.length} whitelisted IPs`);
    } catch (err) {
        console.error('Error fetching whitelist:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Manual IP registration endpoint
app.post('/register-manual-ip', async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({ success: false, error: 'IP address is required' });
        }
        
        await redisClient.setEx(ip, 8 * 60 * 60, 'whitelisted');
        res.json({ success: true, ip });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});