// Xử lý nút "Copy Email"
document.getElementById('copy-email').addEventListener('click', function () {
    const prefix = document.getElementById('email-prefix').value.trim();
    const domain = document.getElementById('domain-select').value;
    if (!prefix) {
        alert('Vui lòng nhập prefix email!');
        return;
    }
    const email = `${prefix}@${domain}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
            alert(`Đã sao chép email: ${email}`);
        }).catch(err => {
            console.error('Không thể sao chép: ', err);
            alert('Sao chép thất bại, vui lòng thử lại!');
        });
    } else {
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            alert(`Đã sao chép email: ${email}`);
        } catch (err) {
            console.error('Không thể sao chép: ', err);
            alert('Sao chép thất bại, vui lòng sao chép thủ công: ' + email);
        }
        document.body.removeChild(tempInput);
    }
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

    fetch(`http://51.79.192.91:3000/${email}`, {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const outputDiv = document.getElementById('email-output');
            outputDiv.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach((emailItem, index) => {
                    const emailBox = document.createElement('div');
                    emailBox.className = 'email-box';
                    emailBox.innerHTML = `
                        <h2>Email ${index + 1}</h2>
                        <p><strong>Tới:</strong> ${emailItem.to}</p>
                        <p><strong>Tiêu đề:</strong> ${emailItem.subject}</p>
                        <p><strong>Nội dung:</strong> ${emailItem.content}</p>
                    `;
                    outputDiv.appendChild(emailBox);
                });
            } else {
                outputDiv.innerHTML = '<p>Không có email nào được tìm thấy.</p>';
            }
        })
        .catch(error => {
            console.error('Chi tiết lỗi fetch:', error);
            document.getElementById('email-output').innerHTML = `<p>Lỗi: ${error.message}</p>`;
        });
});