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
server.listen(0, () => {
    console.log(`SMTP Server is running on port ${server.server.address().port}`);
});

onData(stream, session, callback) {
    simpleParser(stream, (err, mail) => {
        if (err) {
            console.error('Error parsing email:', err);
            return callback(new Error('Failed to parse email'));
        }
        if (!session.envelope.rcptTo || session.envelope.rcptTo.length === 0) {
            return callback(new Error('No recipient found'));
        }
        console.log('Email received:', mail.subject);
        emails.push({
            to: session.envelope.rcptTo[0],
            subject: mail.subject || 'No subject',
            content: mail.text || mail.html || 'No content'
        });
        callback(null, 'Message accepted');
    });
}


app.get('/:email', (req, res) => {
    const email = req.params.email?.toLowerCase(); // Chuyển email về chữ thường

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email format' }); // Kiểm tra định dạng email
    }

    // Tìm email trong danh sách
    const emailData = emails.find(e => e.to.toLowerCase() === email);
    if (emailData) {
        res.json(emailData);
    } else {
        res.status(404).json({ error: 'Email not found' });
    }
});

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Chạy server Express
app.listen(PORT, () => {
    console.log(`Web server is running on port ${PORT}`);
});