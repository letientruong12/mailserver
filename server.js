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
                content: mail.text || mail.html || 'No content' // Lưu nội dung email
            });
            callback(null, 'Message accepted');
        });
    },
    onAuth(auth, session, callback) {
        callback(null, { user: auth.username });
    }
});

// Chạy server SMTP
// Thay đổi cổng ở đây
server.listen(0, () => { // Có thể sử dụng cổng bất kỳ cho SMTP
    console.log('SMTP Server is running');
});

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chạy server Express
app.listen(PORT, () => {
    console.log(`Web server is running on port ${PORT}`);
});