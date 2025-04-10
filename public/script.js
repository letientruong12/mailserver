document.getElementById('check-email').addEventListener('click', function() {
    const prefix = document.getElementById('email-prefix').value.trim();
    const domain = document.getElementById('domain-select').value;
    const email = `${prefix}@${domain}`;

    fetch(`/${email}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Email not found');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('email-output').innerHTML = `
                <h2>Email Details:</h2>
                <p><strong>To:</strong> ${data.to}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Content:</strong> ${data.content}</p>
                <button id="copy-email">Copy Email</button>
            `;
            // Thêm chức năng sao chép
            document.getElementById('copy-email').onclick = () => {
                navigator.clipboard.writeText(data.to).then(() => {
                    alert('Email copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            };
        })
        .catch(error => {
            document.getElementById('email-output').innerHTML = `<p>${error.message}</p>`;
        });
});