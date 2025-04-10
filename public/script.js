// Xử lý nút "Copy Email"
document.getElementById('copy-email').addEventListener('click', function () {
    const prefix = document.getElementById('email-prefix').value.trim();
    const domain = document.getElementById('domain-select').value;
    if (!prefix) {
        alert('Vui lòng nhập prefix email!');
        return;
    }
    const email = `${prefix}@${domain}`;
    navigator.clipboard.writeText(email).then(() => {
        alert(`Đã sao chép email: ${email}`);
    }).catch(err => {
        console.error('Không thể sao chép: ', err);
    });
});

// Xử lý nút "Check Email"
document.getElementById('check-email').addEventListener('click', function () {
    const prefix = document.getElementById('email-prefix').value.trim();
    const domain = document.getElementById('domain-select').value;
    if (!prefix) {
        document.getElementById('email-output').innerHTML = '<p>Vui lòng nhập prefix email!</p>';
        return;
    }
    const email = `${prefix}@${domain}`;
    document.getElementById('email-output').innerHTML = '<p>Đang kiểm tra...</p>';

    fetch(`http://localhost:3000/${email}`) // URL đầy đủ
        .then(response => {
            if (!response.ok) {
                throw new Error('Không tìm thấy email');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('email-output').innerHTML = `
                <h2>Thông tin email:</h2>
                <p><strong>Tới:</strong> ${data.to}</p>
                <p><strong>Tiêu đề:</strong> ${data.subject}</p>
                <p><strong>Nội dung:</strong> ${data.content}</p>
            `;
        })
        .catch(error => {
            document.getElementById('email-output').innerHTML = `<p>${error.message}</p>`;
        });
});