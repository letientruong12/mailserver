const express = require('express');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Giả lập dữ liệu email
let emails = [];

// Middleware để phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));

const server = new SMTPServer({
    onData(stream, session, callback) {
        simpleParser(stream, (err, mail) => {
            if (err) {
                console.error(err);
                return callback(err);
            }
            console.log('Email received:', mail.subject);
            // Lưu email vào danh sách
            emails.push({
                to: session.envelope.rcptTo[0],
                subject: mail.subject,
                content: mail.text || mail.html || 'No content'
            });
            callback(null, 'Message accepted');
        });
    },
    onAuth(auth, session, callback) {
        callback(null, { user: auth.username });
    }
});

// Chạy server SMTP
server.listen(25, () => {
    console.log('SMTP Server is running on port 25');
});

// Đường dẫn để lấy email theo địa chỉ
app.get('/:email', (req, res) => {
    const email = req.params.email;

    // Tìm email trong danh sách
    const emailData = emails.find(e => e.to === email);
    if (emailData) {
        res.json(emailData);
    } else {
        res.status(404).json({ error: 'Email not found' });
    }
});

// Chạy server Express
app.listen(PORT, () => {
    console.log(`Web server is running on port ${PORT}`);
});