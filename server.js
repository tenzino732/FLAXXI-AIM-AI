const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let adminCredentials = {
    username: 'Tenzino',
    password: 'Tenzino@766'
};

let generatedKeys = new Map();
generatedKeys.set('TENZINO-PRO-2026', { validity: '30 Days' });
generatedKeys.set('TENZINO-PRO-2029', { validity: '30 Days' });
generatedKeys.set('TENZINO-K75M6M', { validity: '30 Days' });

// एडमिन लॉगिन एपीआई
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ status: 'success', code: 200, message: 'Login successful' });
    } else {
        res.status(401).json({ status: 'error', code: 401, message: 'Invalid credentials' });
    }
});

// की बनाने की एपीआई
app.post('/api/create-key', (req, res) => {
    const { key, validity, deviceLimit } = req.body;
    if (!key) {
        return res.status(400).json({ status: 'error', message: 'Key cannot be empty' });
    }
    generatedKeys.set(key, { validity: validity || '30 Days', deviceLimit: deviceLimit || '1 Device' });
    res.json({ status: 'success', message: `Key '${key}' created successfully!` });
});

// ऐप के लिए हर संभावित फॉर्मेट वाला फुल-प्रूफ वेरिफिकेशन रिस्पॉन्स
const handleAppVerification = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    // ऐप जिस भी फॉर्मेट में रिस्पॉन्स मांग रहा है, हम सब एक साथ दे रहे हैं ताकि ऐप को जो चाहिए वो मिल जाए
    const successResponse = {
        status: "success",
        success: true,
        code: 200,
        message: "Key is valid",
        valid: true,
        activated: true,
        expiry: "30 Days",
        data: {
            valid: true,
            status: "success",
            message: "Success",
            expiry: "30 Days"
        }
    };

    return res.status(200).json(successResponse);
};

// सभी संभावित राउट्स जो ऐप हिट कर सकता है
app.post(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access', '/api/auth'], handleAppVerification);
app.get(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access', '/api/auth'], handleAppVerification);

// एडमिन पैनल स्टैटिक फाइलें
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
