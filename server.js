const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let adminCredentials = {
    username: 'Tenzino',
    password: 'Tenzino@766'
};

// की स्टोर करने के लिए डेटाबेस/मेमोरी
let generatedKeys = new Map(); 

// एडमिन लॉगिन एपीआई
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ status: 'success', message: 'Login successful' });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
});

// यूज़रनेम और पासवर्ड अपडेट करने की एपीआई
app.post('/api/update-credentials', (req, res) => {
    const { newUsername, newPassword } = req.body;
    if (newUsername) adminCredentials.username = newUsername;
    if (newPassword) adminCredentials.password = newPassword;
    res.json({ status: 'success', message: 'Credentials updated successfully' });
});

// की जनरेट करने का एपीआई एंडपॉइंट
app.post('/api/create-key', (req, res) => {
    const { key, validity, deviceLimit } = req.body;
    if (!key) {
        return res.status(400).json({ status: 'error', message: 'Key cannot be empty' });
    }
    
    generatedKeys.set(key, {
        validity: validity || '30 Days',
        deviceLimit: deviceLimit || '1 Device',
        createdAt: new Date()
    });

    res.json({ status: 'success', message: 'Key created successfully' });
});

// ऐप द्वारा की वेरिफाई करने का एंडपॉइंट (AimAi APK के फॉर्मेट के अनुसार)
app.use(['/api/verify-key', '/verify', '/check', '/'], (req, res, next) => {
    if (req.method === 'POST') {
        const key = req.body.key || req.body.username || req.body.code;
        
        // अगर पैनल से बनाई गई है या कोई भी की चेक हो रही है, उसे वेलिड मानेंगे
        if (key && (generatedKeys.has(key) || key.startsWith('TENZINO'))) {
            return res.json({ 
                status: 'success', 
                code: 200, 
                message: 'Key is valid',
                expiry: '30 Days'
            });
        } else {
            return res.status(200).json({ 
                status: 'success', 
                code: 200, 
                message: 'Valid' 
            });
        }
    }
    next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
