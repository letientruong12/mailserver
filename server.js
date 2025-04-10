const express = require('express');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const path = require('path');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Dữ liệu giả lập
let emails = [];
let domains = ['glts.vn', 'notepad.online', 'anotherdomain.com']; // Domain mặc định

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({
    origin: 'http://51.79.192.91:3000', // Origin của giao diện
    methods: ['GET', 'POST'],          // Cho phép cả GET và POST
    allowedHeaders: ['Content-Type']   // Hỗ trợ header cho POST JSON
}));



// Tạo server SMTP
const server = new SMTPServer({
    onData(stream, session, callback) {
        console.log('Đang nhận email...');
        simpleParser(stream, (err, mail) => {
            if (err) {
                console.error('Lỗi khi phân tích email:', err);
                return callback(new Error('Không thể phân tích email'));
            }
            if (!session.envelope.rcptTo || session.envelope.rcptTo.length === 0) {
                console.error('Không tìm thấy người nhận');
                return callback(new Error('Không tìm thấy người nhận'));
            }
            let recipient = session.envelope.rcptTo[0].address;
            console.log('Email nhận được cho:', recipient);
            emails.push({
                to: recipient,
                subject: mail.subject || 'Không có tiêu đề',
                content: mail.text || mail.html || 'Không có nội dung'
            });
            console.log('Email đã lưu:', emails[emails.length - 1]);
            callback(null, 'Tin nhắn được chấp nhận');
        });
    },
    authOptional: true
});

// Chạy server SMTP trên cổng 25
server.listen(25, () => {
    console.log('SMTP Server đang chạy trên cổng 25');
});

// Đường dẫn để lấy email theo địa chỉ
app.get('/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    const emailData = emails.find(e => e.to.toLowerCase() === email);
    if (emailData) {
        res.json(emailData);
    } else {
        res.status(404).json({ error: 'Không tìm thấy email' });
    }
});


app.get('/domains', (req, res) => {
    res.json(domains);
});

// Thêm domain mới
app.post('/add-domain', (req, res) => {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string' || domains.includes(domain)) {
        return res.status(400).json({ message: 'Domain không hợp lệ hoặc đã tồn tại' });
    }
    domains.push(domain);
    res.json({ message: `Đã thêm domain: ${domain}` });
});

app.listen(PORT, () => {
    console.log(`Web server đang chạy trên cổng ${PORT}`);
});
