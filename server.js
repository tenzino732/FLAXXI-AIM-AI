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

// ऐप वेरिफिकेशन फंक्शन (प्लेन टेक्स्ट "success")
const handleAppVerification = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send("success");
};

// ऐप के लिए वेरिफिकेशन रूट्स
app.post(['/', '/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access', '/api/auth'], handleAppVerification);
app.get(['/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access', '/api/auth'], handleAppVerification);

// सबसे महत्वपूर्ण: ब्राउज़र के लिए एडमिन पैनल स्टैटिक फाइलें (ताकि लिंक खोलने पर वेबसाइट दिखे)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
