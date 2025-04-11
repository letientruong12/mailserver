const express = require('express');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const path = require('path');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs'); // Đã có trong mã


// Dữ liệu giả lập
let emails = [];
let domains = ['glts.vn']; // Domain mặc định

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({
    origin: 'http://51.79.192.91:3000', // Origin của giao diện
    methods: ['GET', 'POST'],          // Cho phép cả GET và POST
    allowedHeaders: ['Content-Type']   // Hỗ trợ header cho POST JSON
}));

async function loadEmails() {
    try {
        if (await fs.access('emails.json').then(() => true).catch(() => false)) {
            const data = await fs.readFile('emails.json', 'utf8');
            emails = JSON.parse(data);
            console.log('Đã tải emails từ file:', emails);
        } else {
            console.log('File emails.json không tồn tại, khởi tạo danh sách rỗng.');
        }
    } catch (err) {
        console.error('Lỗi khi tải emails từ file:', err);
    }
}



loadEmails().then(() => {
    // Middleware
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());
    app.use(cors({
        origin: 'http://51.79.192.91:3000', // Origin của giao diện
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }));

    // Tạo server SMTP
    const server = new SMTPServer({
        onData(stream, session, callback) {
            console.log('Đang nhận email...');
            simpleParser(stream, async (err, mail) => {
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
                const newEmail = {
                    to: recipient,
                    subject: mail.subject || 'Không có tiêu đề',
                    content: mail.text || mail.html || 'Không có nội dung'
                };
                emails.push(newEmail);
                console.log('Email vừa lưu:', newEmail);
                console.log('Tổng số email hiện tại:', emails.length);

                // Lưu bất đồng bộ vào file
                try {
                    await fs.writeFile('emails.json', JSON.stringify(emails, null, 2));
                    console.log('Đã lưu emails vào file');
                } catch (err) {
                    console.error('Lỗi khi lưu emails vào file:', err);
                }

                callback(null, 'Tin nhắn được chấp nhận');
            });
        },
        authOptional: true
    });


    server.on('error', (err) => {
        console.error('Lỗi SMTP Server:', err.message, 'từ IP:', err.remote);
        // Không cần làm gì thêm, server sẽ tiếp tục chạy
    });


    // Chạy server SMTP trên cổng 25
    server.listen(25, () => {
        console.log('SMTP Server đang chạy trên cổng 25');
    });

    app.get('/domains', (req, res) => {
        res.json(domains);
    });


    // Đường dẫn để lấy email theo địa chỉ
    app.get('/:email', (req, res) => {
        const email = req.params.email.toLowerCase();
        console.log('Yêu cầu kiểm tra email:', email);
        console.log('Danh sách emails hiện tại:', JSON.stringify(emails));
        const emailData = emails.filter(e => e.to.toLowerCase() === email);
        console.log('Kết quả lọc:', JSON.stringify(emailData));
        if (emailData.length > 0) {
            res.json(emailData);
        } else {
            res.status(404).json({ error: 'Không tìm thấy email' });
        }
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

});
