const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// डिफ़ॉल्ट एडमिन क्रेडेंशियल्स (इसे आप बदल भी सकते हैं)
let adminCredentials = {
    username: 'admin',
    password: 'password123'
};

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
    const { currentPassword, newUsername, newPassword } = req.body;
    
    if (currentPassword !== adminCredentials.password) {
        return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });
    }

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
        validity: validity || '1 Day',
        deviceLimit: deviceLimit || '1 Device',
        createdAt: new Date()
    });

    res.json({ status: 'success', message: 'Key created successfully' });
});

// ऐप द्वारा की वेरिफाई करने का एपीआई एंडपॉइंट
app.post('/api/verify-key', (req, res) => {
    const { key } = req.body;
    
    if (generatedKeys.has(key)) {
        res.json({ status: 'success', message: 'Key is valid' });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid or expired key' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
