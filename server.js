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
    generatedKeys.set(key, { validity, deviceLimit });
    res.json({ status: 'success', message: `Key '${key}' created successfully!` });
});

// यूनिवर्सल की वेरिफिकेशन एपीआई (APK के लिए)
const handleVerification = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
        status: 'success',
        success: true,
        code: 200,
        message: 'Key is valid',
        expiry: '30 Days',
        data: { valid: true }
    });
};

app.post(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], handleVerification);
app.get(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], handleVerification);

// एडमिन पैनल वेबसाइट (इसे एपीआई के बाद रखा गया है ताकि यह रूट को डिस्टर्ब न करे)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
