const express = require('express');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Sử dụng PORT từ biến môi trường

// Giả lập dữ liệu email
let emails = [];

// Middleware để phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));

const server = new SMTPServer({
    onData(stream, session, callback) {
        console.log('Receiving email...');
        simpleParser(stream, (err, mail) => {
            if (err) {
                console.error('Error parsing email:', err);
                return callback(new Error('Failed to parse email'));
            }
            if (!session.envelope.rcptTo || session.envelope.rcptTo.length === 0) {
                console.error('No recipient found');
                return callback(new Error('No recipient found'));
            }
            let recipient = 'unknown'; // Mặc định là 'unknown'
            if (session.envelope.rcptTo && session.envelope.rcptTo.length > 0) {
                recipient = session.envelope.rcptTo[0].address; // Sửa ở đây
            }
            console.log('Email received:', mail.subject);
            emails.push({
                to: recipient,
                subject: mail.subject || 'No subject',
                content: mail.text || mail.html || 'No content'
            });
            console.log('Email saved:', emails[emails.length - 1]);
            callback(null, 'Message accepted');
        });
    },
    onAuth(auth, session, callback) {
        callback(null, { user: auth.username });
    }
});

// Chạy server SMTP
// Thay đổi cổng ở đây
server.listen(25, () => {
    console.log(`SMTP Server is running on port 2525`);
});



app.get('/:email', (req, res) => {
    const email = req.params.email ? req.params.email.toLowerCase() : null; // Sửa ở đây
    if (!email) {
        return res.status(400).json({ error: 'Email parameter is missing' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Email must contain @' });
    }

    const emailData = emails.find(e => e.to.toLowerCase() === email);
    if (emailData) {
        res.json(emailData);
    } else {
        res.status(404).json({ error: 'Email not found' });
    }
});

app.get('/:email', (req, res) => {
    const email = req.params.email ? req.params.email.toLowerCase() : null; // Sửa ở đây
    if (!email) {
        return res.status(400).json({ error: 'Email parameter is missing' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Email must contain @' });
    }

    const emailData = emails.find(e => e.to.toLowerCase() === email);
    if (emailData) {
        res.json(emailData);
    } else {
        res.status(404).json({ error: 'Email not found' });
    }
});

app.get('/emails', (req, res) => {
    res.json(emails);
});

// Chạy server Express
app.listen(PORT, () => {
    console.log(`Web server is running on port ${PORT}`);
});

// Endpoint để nhận email từ client
app.post('/send-email', express.json(), (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Giả lập việc lưu email vào danh sách
    emails.push({
        to: email,
        subject: 'Generated Email',
        content: 'This is a generated email content.'
    });

    console.log('Email added:', email);
    res.status(200).json({ message: 'Email added successfully' });
});