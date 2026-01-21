/**
 * Client-side validation and security for the contact form.
 * 
 * Purposes:
 * 1. Validate required fields, email format, and minimum length.
 * 2. Prevent basic XSS by sanitizing user input before any client-side display.
 * 3. Disable submission if validation fails.
 * 4. Show user-friendly error messages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const responseMessage = document.getElementById('responseMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous messages
            responseMessage.innerHTML = '';
            responseMessage.className = '';

            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();

            const errors = [];

            // 1. Required fields and length validation
            if (name.length < 2) {
                errors.push("Name must be at least 2 characters long.");
            }

            if (!validateEmail(email)) {
                errors.push("Please enter a valid email address.");
            }

            if (message.length < 10) {
                errors.push("Message must be at least 10 characters long.");
            }

            // 2. Simple security check: No script tags allowed
            if (name.includes('<script') || email.includes('<script') || message.includes('<script')) {
                errors.push("Script tags are not allowed for security reasons.");
            }

            // 3. Disable submission and show errors if validation fails
            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // 4. Sanitize data before sending (Optional, but good practice for client-side echoes)
            const sanitizedName = sanitizeHTML(name);

            try {
                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    responseMessage.textContent = result.message;
                    responseMessage.className = 'success-message';
                    contactForm.reset();
                } else {
                    showErrors(result.errors || [result.message]);
                }
            } catch (error) {
                showErrors(["An error occurred. Please try again later."]);
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function showErrors(errors) {
        const errorList = document.createElement('ul');
        errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            errorList.appendChild(li);
        });
        responseMessage.appendChild(errorList);
        responseMessage.className = 'error-message';
    }
});
