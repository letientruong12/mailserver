const emailList = document.getElementById('email-list');
const domainSelect = document.getElementById('domain-select');
const emailPrefixInput = document.getElementById('email-prefix');
const generateEmailButton = document.getElementById('generate-email');
const emailContent = document.getElementById('email-content');

// Hàm để thêm email vào danh sách
function addEmailToList(email, content) {
    const emailItem = document.createElement('div');
    emailItem.className = 'email-item';
    emailItem.textContent = email;

    // Tạo nút sao chép
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.onclick = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click trên email item
        navigator.clipboard.writeText(email)
            .then(() => {
                alert('Email copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    // Khi click vào email item, hiển thị nội dung email
    emailItem.onclick = () => {
        emailContent.textContent = content; // Hiển thị nội dung email
    };

    emailItem.appendChild(copyButton);
    emailList.appendChild(emailItem);
}

// Hàm để tạo địa chỉ email
function generateEmail() {
    const selectedDomain = domainSelect.value;
    const emailPrefix = emailPrefixInput.value.trim();
    
    if (emailPrefix) {
        const email = `${emailPrefix}@${selectedDomain}`;
        const fakeContent = `This is a fake email content for ${email}.`; // Giả lập nội dung email
        addEmailToList(email, fakeContent);
    } else {
        alert('Please enter a valid email prefix.');
    }
}

// Thêm sự kiện cho nút tạo email
generateEmailButton.addEventListener('click', generateEmail);