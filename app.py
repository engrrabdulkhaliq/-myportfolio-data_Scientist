from flask import Flask, render_template, request, jsonify, redirect, url_for
import re
import html

# Flask directory structure:
# templates/ -> HTML files
# static/css/ -> CSS files
# static/js/ -> JS files

app = Flask(__name__)

# Security: Set a secret key for session security (though not used here, it's a best practice)
app.config['SECRET_KEY'] = 'your-secret-key-for-dev'

def sanitize_input(text):
    """
    Prevents basic XSS by escaping HTML characters and removing potential script tags.
    """
    if not text:
        return ""
    # Remove script tags and similar patterns
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    # Escape HTML characters (e.g., < becomes &lt;)
    return html.escape(text.strip())

def validate_email(email):
    """
    Validates email format using a standard regex.
    """
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    """
    Backend validation and processing of contact form.
    Never trust client-side validation as it can be bypassed.
    """
    data = request.form
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    errors = []

    # Backend Validation (Security Best Practice)
    if not name or len(name) < 2:
        errors.append("Name must be at least 2 characters long.")
    
    if not email or not validate_email(email):
        errors.append("Please provide a valid email address.")
    
    if not message or len(message) < 10:
        errors.append("Message must be at least 10 characters long.")

    # Check for script tags (simple security check)
    if any("<script" in str(val).lower() for val in [name, email, message]):
        errors.append("Script tags are not allowed for security reasons.")

    if errors:
        return jsonify({"status": "error", "errors": errors}), 400

    # Sanitization before storage or further processing
    safe_name = sanitize_input(name)
    safe_email = sanitize_input(email)
    safe_message = sanitize_input(message)

    # In a real app, you would save this to a database here
    print(f"Received secure contact: {safe_name}, {safe_email}")

    return jsonify({"status": "success", "message": f"Thank you, {safe_name}! Your message has been received."})

if __name__ == '__main__':
    # debug=True should only be used in development
    app.run(port=3000, debug=True)
