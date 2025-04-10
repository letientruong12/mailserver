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
            let recipient = session.envelope.rcptTo[0].address; // Lấy địa chỉ email
            console.log('Email received for:', recipient);
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
        // Kiểm tra thông tin xác thực
        const validUser = 'admin'; // Tên người dùng hợp lệ
        const validPass = '121299vnN@'; // Mật khẩu hợp lệ

        if (auth.username === validUser && auth.password === validPass) {
            callback(null, { user: auth.username });
        } else {
            callback(new Error('Invalid username or password'));
        }
    }
});

// Chạy server SMTP
server.listen(25, () => {
    console.log('SMTP Server is running on port 25');
});

// Đường dẫn để lấy email theo địa chỉ
app.get('/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    const emailData = emails.find(e => e.to.toLowerCase() === email);
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