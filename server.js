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

// की को परमानेंट मेमोरी में स्टोर रखने के लिए
let generatedKeys = new Map();
// कुछ डिफ़ॉल्ट की पहले से जोड़ देते हैं ताकि टेस्टिंग में दिक्कत न हो
generatedKeys.set('TENZINO-PRO-2026', { validity: '30 Days' });
generatedKeys.set('TENZINO-PRO-2029', { validity: '30 Days' });

// एडमिन लॉगिन एपीआई
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ status: 'success', code: 200, message: 'Login successful' });
    } else {
        res.status(401).json({ status: 'error', code: 401, message: 'Invalid credentials' });
    }
});

// पैनल से की बनाने की एपीआई
app.post('/api/create-key', (req, res) => {
    const { key, validity, deviceLimit } = req.body;
    if (!key) {
        return res.status(400).json({ status: 'error', message: 'Key cannot be empty' });
    }
    generatedKeys.set(key, { validity: validity || '30 Days', deviceLimit: deviceLimit || '1 Device' });
    console.log("Key Created:", key);
    res.json({ status: 'success', message: `Key '${key}' created successfully!` });
});

// ऐप की वेरिफिकेशन एपीआई (जो ऐप द्वारा भेजी गई की को चेक करेगी)
const verifyKeyLogic = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    // ऐप अलग-अलग पैरामीटर नाम से की भेज सकता है (key, username, code, license)
    const userKey = req.body.key || req.body.username || req.body.code || req.body.license || req.query.key;

    console.log("Verification Attempt for Key:", userKey);

    // जाँच करें कि क्या की हमारे डेटाबेस में मौजूद है या 'TENZINO' से शुरू होती है
    if (userKey && (generatedKeys.has(userKey) || userKey.startsWith('TENZINO'))) {
        return res.status(200).json({
            status: 'success',
            success: true,
            code: 200,
            message: 'Key is valid',
            valid: true,
            expiry: '30 Days',
            data: { valid: true }
        });
    } else {
        return res.status(200).json({
            status: 'success',
            success: false,
            code: 400,
            message: 'Invalid License Key',
            valid: false,
            data: { valid: false }
        });
    }
};

// सभी संभावित वेरिफिकेशन रूट्स को हैंडल करना
app.post(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], verifyKeyLogic);
app.get(['/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], verifyKeyLogic);

// एडमिन पैनल वेबसाइट स्टैटिक फाइल्स
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
