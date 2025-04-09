document.addEventListener('DOMContentLoaded', () => {
    const emailListElement = document.getElementById('email-list');
    const emailContentElement = document.getElementById('email-content');
    const generateEmailButton = document.getElementById('generate-email');
    const emailPrefixInput = document.getElementById('email-prefix');
    const domainSelect = document.getElementById('domain-select');

    // Fetch email list from the server
    async function fetchEmailList() {
        try {
            const response = await fetch('/emails');
            const emails = await response.json();

            // Clear the email list
            emailListElement.innerHTML = '';

            // Check if the email list is empty
            if (emails.length === 0) {
                emailListElement.innerHTML = '<li>No emails found</li>';
                return;
            }

            // Populate the email list
            emails.forEach(email => {
                const listItem = document.createElement('li');
                listItem.textContent = `${email.to} - ${email.subject}`;
                listItem.dataset.email = email.to;
                listItem.addEventListener('click', () => fetchEmailContent(email.to));
                emailListElement.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching email list:', error);
        }
    }

    // Fetch email content from the server
    async function fetchEmailContent(email) {
        console.log('Fetching email content for:', email);
        try {
            const response = await fetch(`/${encodeURIComponent(email)}`);
            if (response.ok) {
                const emailData = await response.json();
                emailContentElement.innerHTML = `
                    <p><strong>To:</strong> ${emailData.to}</p>
                    <p><strong>Subject:</strong> ${emailData.subject}</p>
                    <p><strong>Content:</strong></p>
                    <p>${emailData.content}</p>
                `;
            } else {
                emailContentElement.innerHTML = `<p>Error: ${response.statusText}</p>`;
            }
        } catch (error) {
            console.error('Error fetching email content:', error);
            emailContentElement.innerHTML = `<p>Error fetching email content</p>`;
        }
    }

    // Generate email address
    generateEmailButton.addEventListener('click', async () => {
        const prefix = emailPrefixInput.value.trim();
        const domain = domainSelect.value;

        if (prefix) {
            const email = `${prefix}@${domain}`;
            alert(`Generated email: ${email}`);

            // Optional: Send email to server
            try {
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (response.ok) {
                    alert('Email sent successfully!');
                } else {
                    alert('Failed to send email.');
                }
            } catch (error) {
                console.error('Error sending email:', error);
            }
        } else {
            alert('Please enter an email prefix.');
        }
    });

    // Initial fetch of email list
    fetchEmailList();
});