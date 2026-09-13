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

// एडमिन लॉगिन एपीआई
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ status: 'success', code: 200, message: 'Login successful' });
    } else {
        res.status(401).json({ status: 'error', code: 401, message: 'Invalid credentials' });
    }
});

// की बनाने की एपीआई (एडमिन पैनल के लिए)
app.post('/api/create-key', (req, res) => {
    const { key, validity, deviceLimit } = req.body;
    if (!key) {
        return res.status(400).json({ status: 'error', message: 'Key cannot be empty' });
    }
    generatedKeys.set(key, { validity: validity || '30 Days', deviceLimit: deviceLimit || '1 Device' });
    res.json({ status: 'success', message: `Key '${key}' created successfully!` });
});

// सबसे महत्वपूर्ण: ऐप की वेरिफिकेशन का यूनिवर्सल फंक्शन (जो हमेशा JSON ही देगा)
const handleAppVerification = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const userKey = req.body.key || req.body.username || req.body.code || req.body.license || req.query.key;

    // अगर की खाली नहीं है तो हमेशा सक्सेस JSON भेजें ताकि ऐप तुरंत एक्टिवेट हो जाए
    if (userKey) {
        return res.status(200).send(JSON.stringify({
            status: 'success',
            success: true,
            code: 200,
            message: 'Key is valid',
            valid: true,
            expiry: '30 Days',
            data: { valid: true }
        }));
    } else {
        return res.status(200).send(JSON.stringify({
            status: 'success',
            success: false,
            code: 400,
            message: 'Key is required',
            valid: false
        }));
    }
};

// ऐप के लिए सभी संभावित पोस्ट/गेट राउट्स जिन पर वह चेक करता है
app.post('/', handleAppVerification);
app.get('/', (req, res, next) => {
    // अगर ब्राउज़र से खोल रहे हैं तो एडमिन पैनल दिखाओ, वरना अगर ऐप है तो JSON दो
    if (req.headers['user-agent'] && (req.headers['user-agent'].includes('Dalvik') || req.headers['user-agent'].includes('okhttp'))) {
        return handleAppVerification(req, res);
    }
    next();
});

app.post(['/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], handleAppVerification);
app.get(['/verify', '/check', '/api/verify', '/api/check', '/api/verify-key', '/access'], handleAppVerification);

// अंत में एडमिन पैनल की स्टैटिक फाइलें लोड होंगी
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
