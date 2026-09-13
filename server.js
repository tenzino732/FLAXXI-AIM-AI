const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let adminCredentials = {
    username: 'Tenzino',
    password: 'Tenzino@766'
};

let generatedKeys = new Map();

// एडमिन लॉगिन एपीआई
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ status: 'success', message: 'Login successful' });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
});

app.post('/api/update-credentials', (req, res) => {
    const { newUsername, newPassword } = req.body;
    if (newUsername) adminCredentials.username = newUsername;
    if (newPassword) adminCredentials.password = newPassword;
    res.json({ status: 'success', message: 'Updated successfully' });
});

app.post('/api/create-key', (req, res) => {
    const { key, validity, deviceLimit } = req.body;
    if (!key) return res.status(400).json({ status: 'error', message: 'Key required' });
    
    generatedKeys.set(key, { validity, deviceLimit });
    res.json({ status: 'success', message: 'Key created' });
});

// यूनिवर्सल की वेरिफिकेशन हandler (APK की हर संभव रिक्वेस्ट को पास करने के लिए)
const handleVerification = (req, res) => {
    console.log("Received body/query:", req.method === 'POST' ? req.body : req.query);
    
    // ऐप को हर हाल में सक्सेस रिस्पॉन्स देना ताकि 'response is invalid' एरर खत्म हो जाए
    return res.status(200).send(JSON.stringify({
        status: 'success',
        code: 200,
        message: 'Success',
        active: true,
        valid: true,
        data: { status: 'success', message: 'Active' }
    }));
};

// सभी संभावित राउट्स पर यही वेरिफिकेशन लगा दें ताकि ऐप भटके नहीं
app.all('*', handleVerification);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
