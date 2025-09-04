console.log('Starting IP Whitelist backend...');
const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
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

// Save IP to whitelist with 8-hour expiry
app.post('/register-ip', async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
        if (ip && ip.includes(',')) {
            ip = ip.split(',').map(s => s.trim()).find(addr => addr !== '::1' && addr !== '127.0.0.1');
        }
        if (ip && ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }
        if (ip) {
            await redisClient.setEx(ip, 8 * 60 * 60, 'whitelisted');
            res.json({ success: true, ip });
        } else {
            res.json({ success: false, error: 'Could not determine IP', ip });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all whitelisted IPs
app.get('/whitelist', async (req, res) => {
    try {
        const keys = await redisClient.keys('*');
        res.json({ whitelist: keys });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});